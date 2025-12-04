# 逻辑推理快速参考

## 推理器类型速查

| 推理器 | 用途 | 性能 | 推荐场景 |
|-------|------|------|---------|
| **RDFS** | RDFS 语义推理 | ⚡⚡⚡ | 类继承、属性域值域 |
| **OWL** | 完整 OWL DL | ⚡ | 复杂本体推理 |
| **OWL_MINI** | 轻量 OWL | ⚡⚡ | 中等数据集 |
| **OWL_MICRO** | 最小 OWL | ⚡⚡⚡ | 大数据集 |
| **CUSTOM** | 自定义规则 | ⚡⚡⚡ | 业务规则 |

## 常用推理规则

### RDFS 规则

```turtle
# 子类传递性
:Manager rdfs:subClassOf :Employee .
:Employee rdfs:subClassOf :Person .
# 推理: :Manager rdfs:subClassOf :Person

# 类型继承
:John a :Manager .
# 推理: :John a :Employee, :Person

# 属性域
:age rdfs:domain :Person .
:John :age "30" .
# 推理: :John a :Person

# 属性值域
:knows rdfs:range :Person .
:Alice :knows :Bob .
# 推理: :Bob a :Person
```

### OWL 规则

```turtle
# 对称属性
:friendOf a owl:SymmetricProperty .
:Alice :friendOf :Bob .
# 推理: :Bob :friendOf :Alice

# 传递属性
:ancestorOf a owl:TransitiveProperty .
:A :ancestorOf :B . :B :ancestorOf :C .
# 推理: :A :ancestorOf :C

# 逆属性
:hasParent owl:inverseOf :hasChild .
:John :hasParent :Mary .
# 推理: :Mary :hasChild :John

# 函数属性 (唯一值)
:hasFather a owl:FunctionalProperty .
:John :hasFather :Bob .
:John :hasFather :Charlie .
# 推理: :Bob owl:sameAs :Charlie

# 等价类
:Employee owl:equivalentClass :Worker .
:John a :Employee .
# 推理: :John a :Worker
```

### 自定义规则语法

```
[ruleName: 
  条件1 条件2 ... 
  -> 
  结论1 结论2 ...
]
```

**变量**: `?x ?y ?z`
**内置函数**: `greaterThan() lessThan() equal() notEqual()`

**示例**:
```
[grandparent: 
  (?x :hasParent ?y) (?y :hasParent ?z) 
  -> 
  (?x :hasGrandparent ?z)
]

[adult: 
  (?x :age ?a) greaterThan(?a, 18) 
  -> 
  (?x rdf:type :Adult)
]

[sibling: 
  (?x :hasParent ?p) (?y :hasParent ?p) notEqual(?x, ?y)
  -> 
  (?x :hasSibling ?y)
]
```

## API 快速参考

### 执行推理
```bash
POST /api/reasoning/execute
Content-Type: application/json

{
  "rdfData": "RDF数据",
  "reasonerType": "RDFS|OWL|CUSTOM",
  "customRules": "规则 (CUSTOM时需要)",
  "saveToNeo4j": true/false
}
```

### 获取推理器类型
```bash
GET /api/reasoning/reasoner-types
```

### 获取示例
```bash
GET /api/reasoning/examples
```

### 验证规则
```bash
POST /api/reasoning/validate-rules
Content-Type: text/plain

[规则内容]
```

### 获取仅新增三元组
```bash
POST /api/reasoning/inferred-only
Content-Type: application/json

{
  "rdfData": "...",
  "reasonerType": "..."
}
```

## 命名空间常用前缀

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <http://example.org/ont#> .
```

## 性能优化建议

| 数据量 | 推荐推理器 | 预期时间 |
|-------|-----------|---------|
| < 100 | OWL | < 1s |
| 100-1K | OWL_MINI | 1-5s |
| 1K-10K | RDFS / OWL_MICRO | 5-30s |
| > 10K | CUSTOM | 取决于规则 |

**优化技巧**:
1. 使用轻量推理器处理大数据
2. 自定义规则避免复杂递归
3. 分批处理超大数据集
4. 缓存推理结果

## 常见错误及解决

### 错误 1: 规则语法错误
```
Unrecognized qname prefix
```
**解决**: 在规则开头添加命名空间声明
```
@prefix : <http://example.org/ont#> .
[rule: (?x :prop ?y) -> (?x :newProp ?y)]
```

### 错误 2: 变量未绑定
```
Unbound variable in rule head
```
**解决**: 确保结论中的变量在条件中出现
```
# 错误
[rule: (?x :prop ?y) -> (?z :result "true")]

# 正确
[rule: (?x :prop ?y) -> (?x :result "true")]
```

### 错误 3: 数据类型不匹配
```
Type error in builtin
```
**解决**: 确保比较的值是数字类型
```turtle
:age "30"^^xsd:integer .
```

### 错误 4: 推理超时
**解决**: 
- 使用更轻量的推理器
- 减少数据量
- 简化规则

## 调试技巧

1. **查看原始数据**: 先不推理,直接查看数据
2. **使用验证工具**: 调用 `/validate-rules` 检查语法
3. **小数据测试**: 用小样本测试规则
4. **查看日志**: 检查后端日志 `docker logs smart-backend`
5. **分步推理**: 先用 RDFS,再用 OWL,最后自定义

## 业务场景模板

### 场景 1: 客户分级
```
[highValue: 
  (?c rdf:type :Customer) (?c :monthlySpend ?s) greaterThan(?s, 500)
  -> (?c rdf:type :HighValueCustomer)
]

[vip: 
  (?c rdf:type :Customer) (?c :memberYears ?y) greaterThan(?y, 5)
  -> (?c rdf:type :VIPCustomer)
]
```

### 场景 2: 风险评估
```
[highRisk: 
  (?t rdf:type :Transaction) (?t :amount ?a) greaterThan(?a, 10000)
  -> (?t :riskLevel "high")
]

[multipleFailures: 
  (?u rdf:type :User) (?u :failedAttempts ?f) greaterThan(?f, 3)
  -> (?u :status "locked")
]
```

### 场景 3: 权限推理
```
[managerPermission: 
  (?u rdf:type :Manager)
  -> (?u :hasPermission :ApproveExpenses)
]

[inheritPermission: 
  (?u :hasRole ?r) (?r :hasPermission ?p)
  -> (?u :hasPermission ?p)
]
```

## 快速测试命令

```bash
# 测试 RDFS
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{"rdfData":"@prefix : <http://ex.org/> . :A rdfs:subClassOf :B . :x a :A .","reasonerType":"RDFS","saveToNeo4j":false}' | jq .

# 测试 OWL
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{"rdfData":"@prefix : <http://ex.org/> . @prefix owl: <http://www.w3.org/2002/07/owl#> . :friendOf a owl:SymmetricProperty . :A :friendOf :B .","reasonerType":"OWL","saveToNeo4j":false}' | jq .

# 测试自定义规则
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{"rdfData":"@prefix : <http://ex.org/> . :A :hasParent :B .","reasonerType":"CUSTOM","customRules":"@prefix : <http://ex.org/> . [r: (?x :hasParent ?y) -> (?x :hasAncestor ?y)]","saveToNeo4j":false}' | jq .
```

## 资源链接

- [Apache Jena 文档](https://jena.apache.org/documentation/inference/)
- [W3C RDFS 规范](https://www.w3.org/TR/rdf-schema/)
- [W3C OWL 规范](https://www.w3.org/TR/owl2-overview/)
- [Jena 规则语法](https://jena.apache.org/documentation/inference/#rules)
