package com.example.demo.service;

import org.apache.jena.rdf.model.*;
import org.apache.jena.reasoner.*;
import org.apache.jena.reasoner.rulesys.*;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.Lang;
import org.apache.jena.vocabulary.RDFS;
import org.apache.jena.vocabulary.OWL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 逻辑推理服务
 * 提供基于 Jena 的 RDFS、OWL 和自定义规则推理功能
 */
@Service
public class ReasoningService {
    
    @Autowired
    private RdfService rdfService;
    
    @Autowired
    private Neo4jClient neo4jClient;
    
    /**
     * 推理类型枚举
     */
    public enum ReasonerType {
        RDFS,      // RDFS 推理器
        OWL,       // OWL 推理器
        OWL_MINI,  // OWL Mini 推理器（性能优化）
        OWL_MICRO, // OWL Micro 推理器（最小化）
        CUSTOM     // 自定义规则推理器
    }
    
    /**
     * 执行推理
     * 
     * @param rdfData RDF 数据
     * @param reasonerType 推理器类型
     * @param customRules 自定义规则（仅当 reasonerType 为 CUSTOM 时使用）
     * @return 推理后的 RDF 模型（Turtle 格式）
     */
    public String performReasoning(String rdfData, ReasonerType reasonerType, String customRules) {
        // 1. 加载 RDF 数据到模型
        Model model = ModelFactory.createDefaultModel();
        ByteArrayInputStream in = new ByteArrayInputStream(rdfData.getBytes(StandardCharsets.UTF_8));
        
        // 自动检测格式
        Lang lang = detectRdfFormat(rdfData);
        RDFDataMgr.read(model, in, lang);
        
        // 2. 选择推理器
        Reasoner reasoner = createReasoner(reasonerType, customRules);
        
        // 3. 创建推理模型
        InfModel infModel = ModelFactory.createInfModel(reasoner, model);
        
        // 4. 执行推理（触发推理计算）
        infModel.prepare();
        
        // 5. 获取推理结果（包括原始数据和推理出的新三元组）
        Model resultModel = ModelFactory.createDefaultModel();
        StmtIterator it = infModel.listStatements();
        while (it.hasNext()) {
            resultModel.add(it.next());
        }
        
        // 6. 序列化为 Turtle
        return serializeToTurtle(resultModel);
    }
    
    /**
     * 执行推理并保存到 Neo4j
     */
    public Map<String, Object> performReasoningAndSave(String rdfData, ReasonerType reasonerType, String customRules, boolean saveToNeo4j) {
        long startTime = System.currentTimeMillis();
        
        // 执行推理
        String resultTurtle = performReasoning(rdfData, reasonerType, customRules);
        
        // 统计信息
        Model originalModel = parseRdfData(rdfData);
        Model inferredModel = parseRdfData(resultTurtle);
        
        long originalTriples = originalModel.size();
        long inferredTriples = inferredModel.size();
        long newTriples = inferredTriples - originalTriples;
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("reasonerType", reasonerType.name());
        result.put("originalTriples", originalTriples);
        result.put("inferredTriples", inferredTriples);
        result.put("newTriples", newTriples);
        result.put("executionTime", System.currentTimeMillis() - startTime);
        result.put("resultData", resultTurtle);
        
        // 保存到 Neo4j（如果需要）
        if (saveToNeo4j) {
            try {
                rdfService.importRdf(resultTurtle, "text/turtle");
                result.put("savedToNeo4j", true);
            } catch (Exception e) {
                result.put("savedToNeo4j", false);
                result.put("saveError", e.getMessage());
            }
        }
        
        return result;
    }
    
    /**
     * 获取推理产生的新三元组
     */
    public String getInferredTriplesOnly(String rdfData, ReasonerType reasonerType, String customRules) {
        // 原始模型
        Model originalModel = parseRdfData(rdfData);
        
        // 推理后模型
        String resultTurtle = performReasoning(rdfData, reasonerType, customRules);
        Model inferredModel = parseRdfData(resultTurtle);
        
        // 计算差异（推理产生的新三元组）
        Model diffModel = inferredModel.difference(originalModel);
        
        return serializeToTurtle(diffModel);
    }
    
    /**
     * 验证推理规则
     */
    public Map<String, Object> validateRules(String rules) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Rule> ruleList = Rule.parseRules(rules);
            result.put("valid", true);
            result.put("ruleCount", ruleList.size());
            
            // 提取规则信息
            List<Map<String, String>> ruleInfo = new ArrayList<>();
            for (Rule rule : ruleList) {
                Map<String, String> info = new HashMap<>();
                info.put("name", rule.getName() != null ? rule.getName() : "unnamed");
                info.put("body", rule.getBody() != null ? rule.getBody().toString() : "");
                info.put("head", rule.getHead() != null ? rule.getHead().toString() : "");
                ruleInfo.add(info);
            }
            result.put("rules", ruleInfo);
        } catch (Exception e) {
            result.put("valid", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    /**
     * 获取预定义推理规则示例
     */
    public Map<String, String> getReasoningExamples() {
        Map<String, String> examples = new LinkedHashMap<>();
        
        // RDFS 子类传递性示例
        examples.put("rdfs_subclass", 
            "# RDFS 子类传递性\n" +
            "@prefix : <http://example.org/ont#> .\n" +
            "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n" +
            ":Employee rdfs:subClassOf :Person .\n" +
            ":Manager rdfs:subClassOf :Employee .\n" +
            ":John a :Manager .\n\n" +
            "# 推理结果: :John 也是 :Employee 和 :Person");
        
        // OWL 对称属性示例
        examples.put("owl_symmetric",
            "# OWL 对称属性\n" +
            "@prefix : <http://example.org/ont#> .\n" +
            "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n\n" +
            ":friendOf a owl:SymmetricProperty .\n" +
            ":Alice :friendOf :Bob .\n\n" +
            "# 推理结果: :Bob :friendOf :Alice");
        
        // OWL 传递属性示例
        examples.put("owl_transitive",
            "# OWL 传递属性\n" +
            "@prefix : <http://example.org/ont#> .\n" +
            "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n\n" +
            ":ancestorOf a owl:TransitiveProperty .\n" +
            ":Alice :ancestorOf :Bob .\n" +
            ":Bob :ancestorOf :Charlie .\n\n" +
            "# 推理结果: :Alice :ancestorOf :Charlie");
        
        // 自定义规则示例
        examples.put("custom_family",
            "# 自定义家庭关系规则\n" +
            "[rule1: (?x :hasParent ?y) (?y :hasParent ?z) -> (?x :hasGrandparent ?z)]\n" +
            "[rule2: (?x :hasParent ?y) (?z :hasParent ?y) -> (?x :hasSibling ?z)]\n" +
            "[rule3: (?x :hasSpouse ?y) (?y :hasParent ?z) -> (?x :hasInLaw ?z)]");
        
        // 电信领域示例
        examples.put("telecom_transfer",
            "# 电信转网规则\n" +
            "[highValueCustomer: (?c rdf:type :Customer) (?c :monthlySpend ?s) greaterThan(?s, 500) -> (?c rdf:type :HighValueCustomer)]\n" +
            "[requiresApproval: (?r rdf:type :TransferRequest) (?r :sourceCustomer ?c) (?c rdf:type :HighValueCustomer) -> (?r :requiresManagerApproval 'true')]\n" +
            "[autoApprove: (?r rdf:type :TransferRequest) (?r :amount ?a) lessThan(?a, 100) -> (?r :autoApproved 'true')]");
        
        return examples;
    }
    
    // ========== 私有辅助方法 ==========
    
    /**
     * 创建推理器
     */
    private Reasoner createReasoner(ReasonerType type, String customRules) {
        switch (type) {
            case RDFS:
                return ReasonerRegistry.getRDFSReasoner();
            case OWL:
                return ReasonerRegistry.getOWLReasoner();
            case OWL_MINI:
                return ReasonerRegistry.getOWLMiniReasoner();
            case OWL_MICRO:
                return ReasonerRegistry.getOWLMicroReasoner();
            case CUSTOM:
                if (customRules == null || customRules.trim().isEmpty()) {
                    throw new IllegalArgumentException("Custom rules are required for CUSTOM reasoner type");
                }
                List<Rule> rules = Rule.parseRules(customRules);
                return new GenericRuleReasoner(rules);
            default:
                throw new IllegalArgumentException("Unknown reasoner type: " + type);
        }
    }
    
    /**
     * 检测 RDF 格式
     */
    private Lang detectRdfFormat(String rdfContent) {
        String trimmed = rdfContent.trim();
        if (trimmed.startsWith("<?xml") || trimmed.startsWith("<rdf:RDF")) {
            return Lang.RDFXML;
        } else if (trimmed.startsWith("{")) {
            return Lang.JSONLD;
        } else if (trimmed.contains("@prefix") || trimmed.contains("@base")) {
            return Lang.TURTLE;
        }
        return Lang.TURTLE; // 默认
    }
    
    /**
     * 解析 RDF 数据为模型
     */
    private Model parseRdfData(String rdfData) {
        Model model = ModelFactory.createDefaultModel();
        ByteArrayInputStream in = new ByteArrayInputStream(rdfData.getBytes(StandardCharsets.UTF_8));
        Lang lang = detectRdfFormat(rdfData);
        RDFDataMgr.read(model, in, lang);
        return model;
    }
    
    /**
     * 序列化模型为 Turtle
     */
    private String serializeToTurtle(Model model) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        RDFDataMgr.write(out, model, Lang.TURTLE);
        return out.toString(StandardCharsets.UTF_8);
    }
}
