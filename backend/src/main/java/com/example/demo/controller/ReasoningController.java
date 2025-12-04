package com.example.demo.controller;

import com.example.demo.service.ReasoningService;
import com.example.demo.service.ReasoningService.ReasonerType;
import com.example.demo.service.RdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 逻辑推理控制器
 * 提供推理相关的 REST API
 */
@RestController
@RequestMapping("/api/reasoning")
@CrossOrigin(origins = "*")
public class ReasoningController {
    
    @Autowired
    private ReasoningService reasoningService;
    
    @Autowired
    private RdfService rdfService;
    
    /**
     * 执行推理
     * 
     * @param request 包含 rdfData, reasonerType, customRules, saveToNeo4j, useNeo4jData 的请求体
     * @return 推理结果
     */
    @PostMapping(value = "/execute", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> executeReasoning(@RequestBody Map<String, Object> request) {
        try {
            String rdfData = (String) request.get("rdfData");
            String reasonerTypeStr = (String) request.get("reasonerType");
            String customRules = (String) request.getOrDefault("customRules", "");
            Boolean saveToNeo4j = Boolean.TRUE.equals(request.get("saveToNeo4j"));
            Boolean useNeo4jData = Boolean.TRUE.equals(request.get("useNeo4jData"));
            
            // 如果选择从 Neo4j 读取数据
            if (Boolean.TRUE.equals(useNeo4jData)) {
                try {
                    rdfData = rdfService.exportToTurtle();
                    if (rdfData == null || rdfData.trim().isEmpty()) {
                        return ResponseEntity.badRequest().body(
                            createErrorResponse("Neo4j 中没有数据。请先导入 RDF 数据。")
                        );
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(500).body(
                        createErrorResponse("从 Neo4j 读取数据失败: " + e.getMessage())
                    );
                }
            } else {
                // 如果不是从 Neo4j 加载，则检查用户提供的 rdfData
                if (rdfData == null || rdfData.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(
                        createErrorResponse("RDF data is required")
                    );
                }
            }
            
            if (reasonerTypeStr == null || reasonerTypeStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    createErrorResponse("Reasoner type is required")
                );
            }
            
            // 解析推理器类型
            ReasonerType reasonerType;
            try {
                reasonerType = ReasonerType.valueOf(reasonerTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                    createErrorResponse("Invalid reasoner type: " + reasonerTypeStr)
                );
            }
            
            // 执行推理
            Map<String, Object> result = reasoningService.performReasoningAndSave(
                rdfData, reasonerType, customRules, saveToNeo4j
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                createErrorResponse("Reasoning failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * 仅获取推理产生的新三元组
     */
    @PostMapping(value = "/inferred-only", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "text/turtle")
    public ResponseEntity<String> getInferredTriplesOnly(@RequestBody Map<String, Object> request) {
        try {
            String rdfData = (String) request.get("rdfData");
            String reasonerTypeStr = (String) request.get("reasonerType");
            String customRules = (String) request.getOrDefault("customRules", "");
            
            if (rdfData == null || reasonerTypeStr == null) {
                return ResponseEntity.badRequest().body("RDF data and reasoner type are required");
            }
            
            ReasonerType reasonerType = ReasonerType.valueOf(reasonerTypeStr.toUpperCase());
            String result = reasoningService.getInferredTriplesOnly(rdfData, reasonerType, customRules);
            
            return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/turtle"))
                .body(result);
                
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    /**
     * 验证推理规则
     */
    @PostMapping(value = "/validate-rules", consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> validateRules(@RequestBody String rules) {
        try {
            Map<String, Object> result = reasoningService.validateRules(rules);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                createErrorResponse("Validation failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * 获取推理示例
     */
    @GetMapping(value = "/examples", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> getExamples() {
        try {
            Map<String, String> examples = reasoningService.getReasoningExamples();
            return ResponseEntity.ok(examples);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<>());
        }
    }
    
    /**
     * 获取支持的推理器类型
     */
    @GetMapping(value = "/reasoner-types", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getReasonerTypes() {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, String> types = new HashMap<>();
        types.put("RDFS", "RDFS 推理器 - 支持 RDFS 语义规则");
        types.put("OWL", "OWL 推理器 - 完整的 OWL DL 推理");
        types.put("OWL_MINI", "OWL Mini 推理器 - 轻量级 OWL 推理");
        types.put("OWL_MICRO", "OWL Micro 推理器 - 最小化 OWL 推理");
        types.put("CUSTOM", "自定义规则推理器 - 使用 Jena 规则语法");
        
        response.put("types", types);
        return ResponseEntity.ok(response);
    }
    
    // 辅助方法：创建错误响应
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        return error;
    }
}
