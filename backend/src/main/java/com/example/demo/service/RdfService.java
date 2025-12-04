package com.example.demo.service;

import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.Lang;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class RdfService {
    @Autowired
    private Neo4jClient neo4jClient;

    // Helper: get local name from URI
    private String localName(String uri) {
        if (uri == null) return null;
        int idx = Math.max(uri.lastIndexOf('#'), uri.lastIndexOf('/'));
        if (idx >= 0 && idx + 1 < uri.length()) return uri.substring(idx + 1);
        return uri;
    }

    // Helper: detect RDF format from content-type or content
    private Lang detectRdfFormat(String rdfContent, String contentType) {
        // First, try to determine from content-type
        if (contentType != null) {
            contentType = contentType.toLowerCase();
            if (contentType.contains("rdf+xml") || contentType.contains("application/xml")) {
                return Lang.RDFXML;
            } else if (contentType.contains("turtle") || contentType.contains("text/turtle")) {
                return Lang.TURTLE;
            } else if (contentType.contains("ld+json") || contentType.contains("application/ld+json")) {
                return Lang.JSONLD;
            } else if (contentType.contains("n-triples")) {
                return Lang.NTRIPLES;
            } else if (contentType.contains("n3")) {
                return Lang.N3;
            }
        }

        // Auto-detect based on content
        String trimmed = rdfContent.trim();
        if (trimmed.startsWith("<?xml") || trimmed.startsWith("<rdf:RDF")) {
            return Lang.RDFXML;
        } else if (trimmed.startsWith("{")) {
            return Lang.JSONLD;
        } else if (trimmed.contains("@prefix") || trimmed.contains("@base")) {
            return Lang.TURTLE;
        }

        // Default to Turtle for backward compatibility
        return Lang.TURTLE;
    }

    // Legacy method for backward compatibility
    public void importTurtle(String turtle) {
        importRdf(turtle, "text/turtle");
    }

    // Import RDF data into Neo4j: create nodes with property `iri`, set labels from rdf:type,
    // set literal properties for literal objects and relationships for resource objects.
    // Supports multiple formats: Turtle, RDF/XML, JSON-LD, etc.
    public void importRdf(String rdfContent, String contentType) {
        Model model = ModelFactory.createDefaultModel();
        ByteArrayInputStream in = new ByteArrayInputStream(rdfContent.getBytes(StandardCharsets.UTF_8));
        
        // Determine RDF format based on content-type or auto-detection
        Lang lang = detectRdfFormat(rdfContent, contentType);
        RDFDataMgr.read(model, in, lang);

        // First pass: ensure nodes for all resources (subjects and resource objects)
        Set<String> resourceUris = new HashSet<>();
        Map<String, List<String>> typeMap = new HashMap<>();

        StmtIterator sit = model.listStatements();
        while (sit.hasNext()) {
            Statement s = sit.next();
            Resource subj = s.getSubject();
            RDFNode obj = s.getObject();
            if (subj.isURIResource()) resourceUris.add(subj.getURI());
            else resourceUris.add("_bnode_" + subj.getId().getLabelString());

            if (obj.isURIResource()) resourceUris.add(obj.asResource().getURI());

            // collect rdf:type
            if (s.getPredicate().getURI().equals("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) {
                String subjId = subj.isURIResource() ? subj.getURI() : ("_bnode_" + subj.getId().getLabelString());
                String typeUri = obj.isURIResource() ? obj.asResource().getURI() : obj.toString();
                typeMap.computeIfAbsent(subjId, k -> new ArrayList<>()).add(typeUri);
            }
        }

        // MERGE nodes
        for (String uri : resourceUris) {
            // Use `iri` property to store original identifier; for blank nodes use special string
            neo4jClient.query("MERGE (n {iri: $iri}) RETURN n")
                    .bind(uri).to("iri")
                    .run();
        }

        // Apply types as labels
        for (Map.Entry<String, List<String>> e : typeMap.entrySet()) {
            String subj = e.getKey();
            for (String typeUri : e.getValue()) {
                String label = localName(typeUri).replaceAll("[^A-Za-z0-9_]", "_");
                // Add label to node (Neo4j labels cannot be set as properties)
                String cy = String.format("MATCH (n {iri:$iri}) SET n:`%s`", label);
                neo4jClient.query(cy).bind(subj).to("iri").run();
            }
        }

        // Second pass: handle properties and relationships
        sit = model.listStatements();
        while (sit.hasNext()) {
            Statement s = sit.next();
            Resource subj = s.getSubject();
            RDFNode obj = s.getObject();
            String subjId = subj.isURIResource() ? subj.getURI() : ("_bnode_" + subj.getId().getLabelString());
            String predLocal = localName(s.getPredicate().getURI());

            if (obj.isLiteral()) {
                String lit = obj.asLiteral().getString();
                // set property on subject
                String cy = "MATCH (n {iri:$iri}) SET n[$p] = $v";
                neo4jClient.query(cy).bind(subjId).to("iri").bind(predLocal).to("p").bind(lit).to("v").run();
            } else if (obj.isURIResource() || obj.isResource()) {
                String objId = obj.isURIResource() ? obj.asResource().getURI() : ("_bnode_" + obj.asResource().getId().getLabelString());
                String relType = predLocal.toUpperCase();
                String cy = "MATCH (a {iri:$a}), (b {iri:$b}) MERGE (a)-[r:`" + relType + "`]->(b)";
                neo4jClient.query(cy).bind(subjId).to("a").bind(objId).to("b").run();
            }
        }
    }

    // Export Neo4j data to Turtle (simple mapping)
    public String exportToTurtle() {
        Model model = ModelFactory.createDefaultModel();
        String base = "http://example.org/ont#";

        // Fetch nodes
        Collection<Map<String, Object>> nodes = neo4jClient.query("MATCH (n) RETURN n.iri as iri, labels(n) as labels, properties(n) as props")
            .fetch().all();

        Map<String, org.apache.jena.rdf.model.Resource> nodeMap = new HashMap<>();

        for (Map<String, Object> row : nodes) {
            Object iriObj = row.get("iri");
            if (iriObj == null) continue;
            String iri = iriObj.toString();
            org.apache.jena.rdf.model.Resource subj = iri.startsWith("_bnode_") ? model.createResource() : model.createResource(iri);
            nodeMap.put(iri, subj);

            // types: labels
            Object labelsObj = row.get("labels");
            if (labelsObj instanceof Collection) {
                for (Object lab : (Collection<?>) labelsObj) {
                    String label = lab.toString();
                    // create rdf:type triple using base + label
                    org.apache.jena.rdf.model.Resource typeRes = model.createResource(base + label);
                    model.add(subj, model.createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), typeRes);
                }
            }

            // properties
            Object propsObj = row.get("props");
            if (propsObj instanceof Map) {
                Map<?,?> props = (Map<?,?>) propsObj;
                for (Map.Entry<?,?> pe : props.entrySet()) {
                    String key = pe.getKey().toString();
                    if (key.equals("iri")) continue;
                    Object val = pe.getValue();
                    if (val == null) continue;
                    model.add(subj, model.createProperty(base + key), model.createLiteral(val.toString()));
                }
            }
        }

        // Fetch relationships
        Collection<Map<String, Object>> rels = neo4jClient.query("MATCH (a)-[r]->(b) RETURN a.iri as a, type(r) as t, b.iri as b")
            .fetch().all();

        for (Map<String, Object> row : rels) {
            Object aobj = row.get("a");
            Object bobj = row.get("b");
            Object tobj = row.get("t");
            if (aobj == null || bobj == null || tobj == null) continue;
            String a = aobj.toString();
            String b = bobj.toString();
            String t = tobj.toString();
            org.apache.jena.rdf.model.Resource sa = nodeMap.get(a);
            org.apache.jena.rdf.model.Resource sb = nodeMap.get(b);
            if (sa == null) sa = a.startsWith("_bnode_") ? model.createResource() : model.createResource(a);
            if (sb == null) sb = b.startsWith("_bnode_") ? model.createResource() : model.createResource(b);
            model.add(sa, model.createProperty(base + t), sb);
        }

        // Serialize to Turtle
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        RDFDataMgr.write(out, model, Lang.TURTLE);
        return out.toString(StandardCharsets.UTF_8);
    }

    // Get graph data for visualization
    public Map<String, Object> getGraphData() {
        Map<String, Object> result = new HashMap<>();
        
        // Fetch nodes with their properties and labels
        List<Map<String, Object>> nodes = new ArrayList<>();
        Collection<Map<String, Object>> nodeRows = neo4jClient.query(
            "MATCH (n) RETURN id(n) as id, n.iri as iri, labels(n) as labels, properties(n) as properties LIMIT 500"
        ).fetch().all();
        
        for (Map<String, Object> row : nodeRows) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", row.get("iri") != null ? row.get("iri").toString() : "node_" + row.get("id"));
            node.put("labels", row.get("labels"));
            node.put("properties", row.get("properties"));
            nodes.add(node);
        }
        
        // Fetch relationships
        List<Map<String, Object>> relationships = new ArrayList<>();
        Collection<Map<String, Object>> relRows = neo4jClient.query(
            "MATCH (a)-[r]->(b) RETURN a.iri as source, b.iri as target, type(r) as type, id(a) as sourceId, id(b) as targetId LIMIT 1000"
        ).fetch().all();
        
        for (Map<String, Object> row : relRows) {
            Map<String, Object> rel = new HashMap<>();
            String source = row.get("source") != null ? row.get("source").toString() : "node_" + row.get("sourceId");
            String target = row.get("target") != null ? row.get("target").toString() : "node_" + row.get("targetId");
            rel.put("source", source);
            rel.put("target", target);
            rel.put("type", row.get("type"));
            relationships.add(rel);
        }
        
        result.put("nodes", nodes);
        result.put("relationships", relationships);
        
        return result;
    }
}
