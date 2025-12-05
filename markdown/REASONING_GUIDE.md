# 逻辑推理功能说明

## 功能概述

本系统实现了基于 Apache Jena 的 RDF 逻辑推理引擎,支持多种推理器类型和自定义规则。

## 推理器类型

### 1. RDFS 推理器
- **用途**: 实现 RDFS (RDF Schema) 语义推理
- **支持规则**: 
  - 类的继承传递性 (`rdfs:subClassOf`)
  - 属性的继承传递性 (`rdfs:subPropertyOf`)
  - 域和值域推理 (`rdfs:domain`, `rdfs:range`)

**示例**:
```turtle
@prefix : <http://example.org/ont#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:Employee rdfs:subClassOf :Person .
:Manager rdfs:subClassOf :Employee .
:John a :Manager .

# 推理结果: :John 也是 :Employee 和 :Person
```

### 2. OWL 推理器
- **用途**: 完整的 OWL DL 推理
- **支持规则**: 
  - 对称属性 (`owl:SymmetricProperty`)
  - 传递属性 (`owl:TransitiveProperty`)
  - 逆属性 (`owl:inverseOf`)
  - 等价类和属性
  - 属性函数特性 (functional, inverse-functional)

**示例 - 对称属性**:
```turtle
@prefix : <http://example.org/ont#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

:friendOf a owl:SymmetricProperty .
:Alice :friendOf :Bob .

# 推理结果: :Bob :friendOf :Alice
```

**示例 - 传递属性**:
```turtle
:ancestorOf a owl:TransitiveProperty .
:Alice :ancestorOf :Bob .
:Bob :ancestorOf :Charlie .

# 推理结果: :Alice :ancestorOf :Charlie
```

### 3. OWL Mini 推理器
- **用途**: 轻量级 OWL 推理 (性能优化版本)
- **特点**: 更快的推理速度,适合大规模数据

### 4. OWL Micro 推理器
- **用途**: 最小化 OWL 推理
- **特点**: 最轻量,最快速度

### 5. 自定义规则推理器
- **用途**: 使用 Jena 规则语言自定义推理规则
- **特点**: 灵活强大,可以实现业务特定的推理逻辑

**规则语法**:
```
[ruleName: (?x property ?y) ... -> (?x newProperty ?z)]
```

**示例 - 家庭关系推理**:
```
[grandparent: (?x :hasParent ?y) (?y :hasParent ?z) -> (?x :hasGrandparent ?z)]
[sibling: (?x :hasParent ?y) (?z :hasParent ?y) -> (?x :hasSibling ?z)]
[inlaw: (?x :hasSpouse ?y) (?y :hasParent ?z) -> (?x :hasInLaw ?z)]
```

**示例 - 电信业务规则**:
```
[highValueCustomer: 
  (?c rdf:type :Customer) 
  (?c :monthlySpend ?s) 
  greaterThan(?s, 500) 
  -> 
  (?c rdf:type :HighValueCustomer)
]

[requiresApproval: 
  (?r rdf:type :TransferRequest) 
  (?r :sourceCustomer ?c) 
  (?c rdf:type :HighValueCustomer) 
  -> 
  (?r :requiresManagerApproval 'true')
]
```

## API 端点

### 1. 执行推理
**POST** `/api/reasoning/execute`

**请求体**:
```json
{
  "rdfData": "RDF数据 (Turtle/RDF-XML/JSON-LD)",
  "reasonerType": "RDFS|OWL|OWL_MINI|OWL_MICRO|CUSTOM",
  "customRules": "自定义规则 (仅当 reasonerType=CUSTOM 时需要)",
  "saveToNeo4j": true/false
}
```

**响应**:
```json
{
  "success": true,
  "reasonerType": "RDFS",
  "originalTriples": 5,
  "inferredTriples": 10,
  "newTriples": 5,
  "executionTime": 120,
  "resultData": "推理后的完整 RDF 数据 (Turtle 格式)",
  "savedToNeo4j": true
}
```

### 2. 获取仅新增的三元组
**POST** `/api/reasoning/inferred-only`

返回推理产生的新三元组 (不包括原始数据)

### 3. 验证规则
**POST** `/api/reasoning/validate-rules`

验证自定义规则的语法是否正确

### 4. 获取示例
**GET** `/api/reasoning/examples`

获取各种推理场景的示例数据

### 5. 获取推理器类型
**GET** `/api/reasoning/reasoner-types`

获取支持的推理器类型及说明

## 前端使用

访问应用后,点击顶部导航的 **"🧠 推理引擎"** 标签页:

1. **选择推理器类型**: 从下拉菜单选择 (RDFS、OWL、CUSTOM 等)
2. **输入 RDF 数据**: 粘贴或输入 RDF 数据
3. **自定义规则** (可选): 如果选择 CUSTOM,输入 Jena 规则
4. **保存选项**: 勾选是否将推理结果保存到 Neo4j
5. **执行推理**: 点击 "🚀 执行推理" 按钮
6. **查看结果**: 
   - **统计**: 查看推理统计信息 (原始三元组数、新增三元组数等)
   - **完整结果**: 查看推理后的完整 RDF 数据

## 使用场景

### 1. 类层次推理
自动推导实例的所有父类关系

### 2. 关系推理
根据对称性、传递性等属性推导新关系

### 3. 业务规则推理
- 客户分级 (根据消费金额自动分类)
- 审批流程 (根据业务规则自动判断是否需要审批)
- 风险评估 (根据多个因素推导风险等级)

### 4. 数据完整性
- 自动补全缺失的类型信息
- 推导隐含的关系
- 验证数据一致性

## 性能建议

1. **小数据集** (< 1000 三元组): 使用 OWL 推理器
2. **中等数据集** (1000 - 10000): 使用 OWL_MINI 或 RDFS
3. **大数据集** (> 10000): 使用 OWL_MICRO 或自定义规则
4. **复杂业务逻辑**: 使用自定义规则推理器

## 示例测试

可以在前端界面点击以下示例按钮快速测试:
- `rdfs_subclass` - RDFS 子类推理
- `owl_symmetric` - OWL 对称属性
- `owl_transitive` - OWL 传递属性
- `custom_family` - 自定义家庭关系规则
- `telecom_transfer` - 电信转网业务规则

## 技术实现

- **推理引擎**: Apache Jena Reasoner
- **支持格式**: Turtle, RDF/XML, JSON-LD
- **存储**: Neo4j 图数据库
- **前端**: React + Vite
- **后端**: Spring Boot + Jena

## 注意事项

1. 推理计算可能耗时,大数据集建议使用轻量级推理器
2. 自定义规则语法错误会导致推理失败,建议先验证规则
3. 推理结果包含原始数据和推导数据,可使用 `/inferred-only` 仅获取新增部分
4. 保存到 Neo4j 会覆盖同名节点,请注意数据备份
