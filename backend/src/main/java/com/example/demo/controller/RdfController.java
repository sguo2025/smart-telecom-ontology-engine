package com.example.demo.controller;

import com.example.demo.service.RdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rdf")
public class RdfController {
    @Autowired
    private RdfService rdfService;

    // POST RDF data to import into Neo4j (supports Turtle, RDF/XML, JSON-LD, etc.)
    @PostMapping(value = "/import", consumes = {"text/turtle", "application/rdf+xml", "application/ld+json", MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<String> importRdf(@RequestBody String rdfContent, @RequestHeader(value = "Content-Type", required = false) String contentType) {
        try {
            rdfService.importRdf(rdfContent, contentType);
            return ResponseEntity.ok("RDF data imported successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Legacy endpoint for backward compatibility
    @PostMapping(value = "/import-text", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> importTurtleText(@RequestBody String rdfContent) {
        return importRdf(rdfContent, "text/turtle");
    }

    // GET export as turtle
    @GetMapping(value = "/export", produces = "text/turtle")
    public ResponseEntity<String> exportTurtle() {
        try {
            String turtle = rdfService.exportToTurtle();
            return ResponseEntity.ok().contentType(MediaType.valueOf("text/turtle")).body(turtle);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // GET graph data for visualization
    @GetMapping(value = "/graph-data", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getGraphData() {
        try {
            var graphData = rdfService.getGraphData();
            return ResponseEntity.ok(graphData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
