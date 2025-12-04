# 逻辑推理功能演示脚本

## 准备工作

1. 确保所有服务已启动
```bash
docker-compose ps
```

2. 访问前端: http://localhost:8888

## 演示步骤

### 场景 1: RDFS 类继承推理

**目的**: 演示 RDFS 子类传递性推理

**步骤**:
1. 点击顶部导航 「🧠 推理引擎」
2. 推理器类型选择: `RDFS`
3. 点击示例按钮: `rdfs_subclass`
4. 点击 「🚀 执行推理」
5. 切换到 「📊 统计」标签查看结果
   - 原始三元组: 3
   - 推理后三元组: ~115
   - 新增三元组: ~112
6. 切换到 「📄 完整结果」查看推理数据

**说明**: 系统推导出 `:John` 不仅是 `:Manager`,还是 `:Employee` 和 `:Person`

---

### 场景 2: OWL 对称属性推理

**目的**: 演示 OWL 对称属性自动推导

**步骤**:
1. 推理器类型选择: `OWL`
2. 点击示例按钮: `owl_symmetric`
3. 观察输入数据:
   ```turtle
   :friendOf a owl:SymmetricProperty .
   :Alice :friendOf :Bob .
   ```
4. 点击 「🚀 执行推理」
5. 查看统计:
   - 原始: 2 个三元组
   - 推理后: ~650+ 个三元组 (包含 OWL 本体推理)
6. 在完整结果中搜索: `:Bob :friendOf :Alice`

**说明**: 系统自动推导出反向关系

---

### 场景 3: OWL 传递属性推理

**目的**: 演示传递关系自动推导

**步骤**:
1. 推理器类型选择: `OWL`
2. 点击示例按钮: `owl_transitive`
3. 观察输入数据:
   ```turtle
   :ancestorOf a owl:TransitiveProperty .
   :Alice :ancestorOf :Bob .
   :Bob :ancestorOf :Charlie .
   ```
4. 执行推理
5. 在结果中搜索: `:Alice :ancestorOf :Charlie`

**说明**: 系统根据传递性推导出隔代关系

---

### 场景 4: 自定义家庭关系规则

**目的**: 演示自定义规则推理

**步骤**:
1. 推理器类型选择: `CUSTOM`
2. 点击示例按钮: `custom_family`
3. 观察自动填充的规则:
   ```
   [rule1: (?x :hasParent ?y) (?y :hasParent ?z) -> (?x :hasGrandparent ?z)]
   [rule2: (?x :hasParent ?y) (?z :hasParent ?y) -> (?x :hasSibling ?z)]
   ```
4. 在 RDF 数据区输入测试数据:
   ```turtle
   @prefix : <http://example.org/ont#> .
   
   :Alice :hasParent :Bob .
   :Bob :hasParent :Charlie .
   :David :hasParent :Bob .
   ```
5. 执行推理
6. 查看结果:
   - `:Alice :hasGrandparent :Charlie` (祖父母关系)
   - `:Alice :hasSibling :David` (兄弟姐妹关系)

---

### 场景 5: 电信业务规则推理

**目的**: 演示业务规则自动推理

**步骤**:
1. 推理器类型: `CUSTOM`
2. 点击示例: `telecom_transfer`
3. 观察业务规则:
   ```
   [highValueCustomer: (?c rdf:type :Customer) (?c :monthlySpend ?s) 
    greaterThan(?s, 500) -> (?c rdf:type :HighValueCustomer)]
   ```
4. 输入测试数据:
   ```turtle
   @prefix : <http://example.org/ont#> .
   @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
   
   :Customer1 a :Customer ;
              :monthlySpend "600" .
   
   :Customer2 a :Customer ;
              :monthlySpend "50" .
   
   :Request1 a :TransferRequest ;
             :sourceCustomer :Customer1 .
   ```
5. 执行推理
6. 查看结果:
   - `:Customer1` 被分类为 `:HighValueCustomer`
   - `:Request1` 需要经理审批

---

### 场景 6: 保存推理结果到 Neo4j

**目的**: 演示推理结果持久化

**步骤**:
1. 使用任一推理场景
2. 勾选 「推理后保存到 Neo4j」
3. 执行推理
4. 查看统计中的 「保存到 Neo4j: ✓ 成功」
5. 打开 Neo4j Browser: http://localhost:7474
6. 运行 Cypher 查询查看推理结果:
   ```cypher
   MATCH (n) RETURN n LIMIT 25
   ```

---

### 场景 7: 规则验证

**目的**: 演示规则语法验证

**步骤**:
1. 推理器类型: `CUSTOM`
2. 在规则区输入:
   ```
   @prefix : <http://example.org/ont#> .
   [test: (?x :hasParent ?y) -> (?x :hasAncestor ?y)]
   ```
3. 点击 「验证规则」
4. 查看验证结果弹窗

---

## API 测试演示

### 使用 curl 测试推理 API

```bash
# 1. 获取推理器类型
curl http://localhost:8080/api/reasoning/reasoner-types | jq .

# 2. 获取示例数据
curl http://localhost:8080/api/reasoning/examples | jq keys

# 3. 执行 RDFS 推理
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n:Manager rdfs:subClassOf :Employee .\n:John a :Manager .",
    "reasonerType": "RDFS",
    "saveToNeo4j": false
  }' | jq .

# 4. 验证规则
curl -X POST http://localhost:8080/api/reasoning/validate-rules \
  -H "Content-Type: text/plain" \
  -d '@prefix : <http://example.org/ont#> .
[test: (?x :hasParent ?y) -> (?x :hasAncestor ?y)]' | jq .
```

---

## 性能对比演示

演示不同推理器的性能差异:

1. 准备较大的 RDF 数据集 (~1000 三元组)
2. 分别使用以下推理器:
   - OWL (完整推理)
   - OWL_MINI (优化版)
   - OWL_MICRO (最小化)
   - RDFS (基础推理)
3. 比较 「执行时间」指标

---

## RDF 格式兼容性演示

演示多种 RDF 格式支持:

### Turtle 格式
```turtle
@prefix : <http://example.org/> .
:Alice :knows :Bob .
```

### RDF/XML 格式
```xml
<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns="http://example.org/">
  <rdf:Description rdf:about="Alice">
    <knows rdf:resource="Bob"/>
  </rdf:Description>
</rdf:RDF>
```

### JSON-LD 格式
```json
{
  "@context": "http://example.org/",
  "@id": "Alice",
  "knows": {"@id": "Bob"}
}
```

分别导入并推理,展示格式无关性。

---

## 集成演示: RDF 管理 + 推理 + Neo4j

完整工作流:

1. 在 「RDF 管理」导入基础数据
2. 切换到 「推理引擎」
3. 导出数据,添加推理规则
4. 执行推理并保存到 Neo4j
5. 在 「知识图谱」(Neo4j Browser) 可视化查看
6. 使用 Cypher 查询推理结果

---

## 常见问题演示

### Q: 推理结果为什么这么多三元组?
A: OWL 推理器会推导 OWL 本体的所有隐含关系,包括类、属性的元信息

### Q: 如何只看新增的推理结果?
A: 使用 `/api/reasoning/inferred-only` 端点

### Q: 自定义规则语法错误怎么办?
A: 先使用 「验证规则」按钮检查语法

---

## 总结

本系统提供:
1. ✅ 5 种推理器类型
2. ✅ 多种 RDF 格式支持
3. ✅ 自定义规则引擎
4. ✅ Neo4j 集成
5. ✅ 完整的 Web UI
6. ✅ RESTful API
7. ✅ 性能优化选项

适用于知识图谱构建、本体推理、数据集成等场景。
