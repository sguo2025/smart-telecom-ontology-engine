#!/bin/bash
# 推理功能测试脚本

echo "========================================="
echo "逻辑推理引擎测试"
echo "========================================="
echo ""

# 测试 RDFS 推理
echo "1. 测试 RDFS 子类推理..."
curl -s -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n:Employee rdfs:subClassOf :Person .\n:Manager rdfs:subClassOf :Employee .\n:John a :Manager .",
    "reasonerType": "RDFS",
    "saveToNeo4j": false
  }' | jq '{reasonerType, originalTriples, inferredTriples, newTriples, executionTime}'

echo ""
echo ""

# 测试 OWL 对称属性
echo "2. 测试 OWL 对称属性推理..."
curl -s -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n\n:friendOf a owl:SymmetricProperty .\n:Alice :friendOf :Bob .",
    "reasonerType": "OWL",
    "saveToNeo4j": false
  }' | jq '{reasonerType, originalTriples, inferredTriples, newTriples, executionTime}'

echo ""
echo ""

# 测试 OWL 传递属性
echo "3. 测试 OWL 传递属性推理..."
curl -s -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n\n:ancestorOf a owl:TransitiveProperty .\n:Alice :ancestorOf :Bob .\n:Bob :ancestorOf :Charlie .",
    "reasonerType": "OWL",
    "saveToNeo4j": false
  }' | jq '{reasonerType, originalTriples, inferredTriples, newTriples, executionTime}'

echo ""
echo ""

# 测试自定义规则
echo "4. 测试自定义规则推理..."
curl -s -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n\n:Alice :hasParent :Bob .\n:Bob :hasParent :Charlie .",
    "reasonerType": "CUSTOM",
    "customRules": "[grandparent: (?x :hasParent ?y) (?y :hasParent ?z) -> (?x :hasGrandparent ?z)]",
    "saveToNeo4j": false
  }' | jq '{reasonerType, originalTriples, inferredTriples, newTriples, executionTime}'

echo ""
echo ""

# 测试规则验证
echo "5. 测试规则验证..."
curl -s -X POST http://localhost:8080/api/reasoning/validate-rules \
  -H "Content-Type: text/plain" \
  -d '[test: (?x :hasParent ?y) -> (?x :hasAncestor ?y)]' | jq .

echo ""
echo "========================================="
echo "测试完成!"
echo "========================================="
