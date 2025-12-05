# 📝 Jena 自定义推理规则编写指南

## 规则语法概述

Apache Jena 使用自己的规则语法，**不同于 Turtle 格式**。这是导致 "Unrecognized qname prefix" 错误的主要原因。

### ❌ 常见错误

```
[rule1: (?x :hasParent ?y) -> (?x :hasChild ?y)]
```

**错误原因**: 使用了 `:` 前缀但没有定义，Jena 规则不支持 `@prefix` 声明。

### ✅ 正确格式

```
[rule1: (?x <http://example.org/ont#hasParent> ?y) -> (?x <http://example.org/ont#hasChild> ?y)]
```

**关键点**: 必须使用完整的 URI，用尖括号 `< >` 包围。

## 基本语法规则

### 1. 规则结构

```
[规则名称: 前提部分 -> 结论部分]
```

- **规则名称**: 可选，用于标识规则
- **前提部分**: 一个或多个三元组模式
- **->**: 箭头分隔前提和结论
- **结论部分**: 推导出的新三元组

### 2. 变量

- 以 `?` 开头，例如 `?x`, `?person`, `?value`
- 变量名可以包含字母、数字、下划线

### 3. URI 表示

必须使用完整 URI，用尖括号包围：

```
<http://example.org/ont#PropertyName>
<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
<http://www.w3.org/2000/01/rdf-schema#subClassOf>
```

### 4. 字面量

- 字符串: `'text'` 或 `"text"`
- 数字: `123`, `45.67`
- 布尔值: `'true'`, `'false'`

### 5. 内置函数

Jena 提供了多种内置函数：

#### 数值比较
- `greaterThan(?x, ?y)` - 大于
- `lessThan(?x, ?y)` - 小于
- `ge(?x, ?y)` - 大于等于
- `le(?x, ?y)` - 小于等于
- `equal(?x, ?y)` - 等于
- `notEqual(?x, ?y)` - 不等于

#### 数值运算
- `sum(?x, ?y, ?result)` - 加法
- `difference(?x, ?y, ?result)` - 减法
- `product(?x, ?y, ?result)` - 乘法
- `quotient(?x, ?y, ?result)` - 除法

#### 字符串操作
- `strConcat(?x, ?y, ?result)` - 字符串拼接
- `regex(?string, ?pattern)` - 正则匹配

#### 其他
- `now(?time)` - 当前时间
- `isBound(?var)` - 变量是否已绑定
- `notBound(?var)` - 变量是否未绑定

## 示例规则

### 示例 1: 简单推理规则

**场景**: 祖父母关系推理

```
[grandparent: 
  (?person <http://example.org/ont#hasParent> ?parent)
  (?parent <http://example.org/ont#hasParent> ?grandparent)
  ->
  (?person <http://example.org/ont#hasGrandparent> ?grandparent)
]
```

**解释**:
- 如果 person 有父母 parent
- 并且 parent 有父母 grandparent
- 则推导出 person 有祖父母 grandparent

### 示例 2: 兄弟姐妹关系

```
[sibling:
  (?x <http://example.org/ont#hasParent> ?parent)
  (?y <http://example.org/ont#hasParent> ?parent)
  notEqual(?x, ?y)
  ->
  (?x <http://example.org/ont#hasSibling> ?y)
]
```

**解释**:
- 如果 x 和 y 有相同的父母
- 并且 x 不等于 y（避免自己是自己的兄弟）
- 则 x 和 y 是兄弟姐妹

### 示例 3: 高价值客户识别

```
[highValueCustomer:
  (?customer <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#Customer>)
  (?customer <http://example.org/ont#monthlySpend> ?amount)
  greaterThan(?amount, 500)
  ->
  (?customer <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#HighValueCustomer>)
]
```

**解释**:
- 如果客户的月消费金额大于 500
- 则将该客户标记为高价值客户

### 示例 4: 业务审批规则

```
[requiresApproval:
  (?request <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#TransferRequest>)
  (?request <http://example.org/ont#amount> ?amt)
  greaterThan(?amt, 1000)
  ->
  (?request <http://example.org/ont#requiresApproval> 'true')
  (?request <http://example.org/ont#approvalLevel> 'manager')
]
```

**解释**:
- 如果转网申请金额大于 1000
- 则设置需要审批标志
- 并指定审批级别为经理

### 示例 5: 多条件规则

```
[vipDiscount:
  (?customer <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#Customer>)
  (?customer <http://example.org/ont#loyaltyYears> ?years)
  (?customer <http://example.org/ont#monthlySpend> ?spend)
  greaterThan(?years, 5)
  greaterThan(?spend, 300)
  ->
  (?customer <http://example.org/ont#discount> '0.2')
  (?customer <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#VIPCustomer>)
]
```

**解释**:
- 如果客户忠诚度超过 5 年
- 并且月消费超过 300
- 则给予 20% 折扣并标记为 VIP

## 复杂示例

### 传递闭包计算

```
# 祖先关系的传递闭包
[ancestor1: (?x <http://example.org/ont#hasParent> ?y) -> (?x <http://example.org/ont#hasAncestor> ?y)]
[ancestor2: (?x <http://example.org/ont#hasAncestor> ?y) (?y <http://example.org/ont#hasAncestor> ?z) -> (?x <http://example.org/ont#hasAncestor> ?z)]
```

### 对称关系

```
# 同事关系是对称的
[colleague:
  (?x <http://example.org/ont#colleagueOf> ?y)
  ->
  (?y <http://example.org/ont#colleagueOf> ?x)
]
```

### 条件分类

```
# 根据年龄分类客户
[youngCustomer:
  (?c <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#Customer>)
  (?c <http://example.org/ont#age> ?age)
  lessThan(?age, 30)
  ->
  (?c <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#YoungCustomer>)
]

[seniorCustomer:
  (?c <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#Customer>)
  (?c <http://example.org/ont#age> ?age)
  greaterThan(?age, 60)
  ->
  (?c <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/ont#SeniorCustomer>)
]
```

## 电信业务规则示例

### 过户业务规则

```
# 规则 1: 检测欠费客户
[hasArrears:
  (?customer <http://example.com/crm/transfer#hasArrearsStatus> 'true')
  (?request <http://example.com/crm/transfer#relatesOriginalCustomer> ?customer)
  ->
  (?request <http://example.com/crm/transfer#blocked> 'true')
  (?request <http://example.com/crm/transfer#blockReason> 'ARREARS')
]

# 规则 2: 检测在途单
[hasPendingOrder:
  (?customer <http://example.com/crm/transfer#hasPendingOrderStatus> 'true')
  (?request <http://example.com/crm/transfer#relatesOriginalCustomer> ?customer)
  ->
  (?request <http://example.com/crm/transfer#requiresReview> 'true')
  (?request <http://example.com/crm/transfer#reviewReason> 'PENDING_ORDER')
]

# 规则 3: 快速通道（无障碍客户）
[fastTrack:
  (?customer <http://example.com/crm/transfer#hasArrearsStatus> 'false')
  (?customer <http://example.com/crm/transfer#hasPendingOrderStatus> 'false')
  (?request <http://example.com/crm/transfer#relatesOriginalCustomer> ?customer)
  ->
  (?request <http://example.com/crm/transfer#fastTrackEligible> 'true')
]
```

## 最佳实践

### 1. URI 管理

**定义常用 URI 常量**（在代码中，不在规则中）：
```java
String RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
String RDFS_SUBCLASS = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
String ONT = "http://example.org/ont#";
```

**在规则中使用完整 URI**：
```
[rule: (?x <http://example.org/ont#hasProperty> ?y) -> ...]
```

### 2. 规则命名

使用描述性的规则名称：
```
✅ [grandparentRelation: ...]
✅ [highValueCustomerIdentification: ...]
❌ [rule1: ...]
❌ [r: ...]
```

### 3. 变量命名

使用有意义的变量名：
```
✅ (?customer <...> ?parent)
✅ (?request <...> ?amount)
❌ (?x <...> ?y)
❌ (?a <...> ?b)
```

### 4. 注释

在规则前添加注释说明：
```
# 检测高价值客户：月消费超过 500 的客户
[highValueCustomer: ...]

# 自动审批小额转网申请：金额小于 100
[autoApprove: ...]
```

### 5. 测试策略

**步骤 1**: 先验证规则语法
```bash
curl -X POST http://localhost:8080/api/reasoning/validate-rules \
  -H "Content-Type: text/plain" \
  -d '[yourRule: ...]'
```

**步骤 2**: 用简单数据测试
```turtle
@prefix : <http://example.org/ont#> .
:Alice :hasParent :Bob .
:Bob :hasParent :Charlie .
```

**步骤 3**: 检查推理结果
```bash
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{"rdfData":"...","reasonerType":"CUSTOM","customRules":"..."}'
```

**步骤 4**: 验证新三元组
```bash
curl -X POST http://localhost:8080/api/reasoning/inferred-only \
  -H "Content-Type: application/json" \
  -d '{"rdfData":"...","reasonerType":"CUSTOM","customRules":"..."}'
```

## 常见错误及解决方案

### 错误 1: Unrecognized qname prefix

**错误示例**:
```
[rule: (?x :property ?y) -> (?x :result ?z)]
```

**原因**: 使用了未定义的前缀 `:`

**解决**:
```
[rule: (?x <http://example.org/ont#property> ?y) -> (?x <http://example.org/ont#result> ?z)]
```

### 错误 2: 变量未定义

**错误示例**:
```
[rule: (?x <http://example.org/ont#p> ?y) -> (?x <http://example.org/ont#q> ?z)]
```

**原因**: 结论中使用的 `?z` 在前提中未定义

**解决**: 确保结论中的变量都在前提中出现过，或使用内置函数生成

### 错误 3: 类型不匹配

**错误示例**:
```
[rule: (?x <http://example.org/ont#age> ?age) greaterThan(?age, 'thirty') -> ...]
```

**原因**: 字符串 'thirty' 不能与数字比较

**解决**:
```
[rule: (?x <http://example.org/ont#age> ?age) greaterThan(?age, 30) -> ...]
```

### 错误 4: 循环引用

**错误示例**:
```
[rule1: (?x :p ?y) -> (?x :q ?y)]
[rule2: (?x :q ?y) -> (?x :p ?y)]
```

**原因**: 两条规则相互推导，可能导致无限循环

**解决**: 仔细设计规则逻辑，避免循环依赖

## 调试技巧

### 1. 分步验证

先验证单个简单规则，再组合复杂规则：

```
# 第一步：验证这个规则
[simple: (?x <http://example.org/ont#hasParent> ?y) -> (?x <http://example.org/ont#hasAncestor> ?y)]

# 第二步：添加更多规则
[simple: ...]
[transitive: (?x <http://example.org/ont#hasAncestor> ?y) (?y <http://example.org/ont#hasAncestor> ?z) -> (?x <http://example.org/ont#hasAncestor> ?z)]
```

### 2. 使用 inferred-only 端点

查看推理产生的新三元组：
```bash
curl -X POST http://localhost:8080/api/reasoning/inferred-only \
  -H "Content-Type: application/json" \
  -d '{...}' | grep "新增的三元组"
```

### 3. 检查统计信息

查看原始三元组数和推理后的三元组数：
```json
{
  "originalTriples": 10,
  "inferredTriples": 25,
  "newTriples": 15
}
```

## 参考资源

- [Apache Jena 规则语法官方文档](https://jena.apache.org/documentation/inference/#RULEsyntax)
- [内置函数列表](https://jena.apache.org/documentation/inference/#RULEbuiltins)
- 系统内置示例：点击推理引擎的「加载示例」按钮

## 快速参考

### 完整规则模板

```
[ruleName:
  # 前提 1: 主语-谓词-宾语
  (?subject <http://example.org/ont#predicate1> ?object1)
  
  # 前提 2: 带条件
  (?subject <http://example.org/ont#predicate2> ?value)
  greaterThan(?value, 100)
  
  # 箭头分隔前提和结论
  ->
  
  # 结论 1: 新的三元组
  (?subject <http://example.org/ont#resultPredicate> ?object1)
  
  # 结论 2: 新的属性
  (?subject <http://example.org/ont#status> 'active')
]
```

### 常用 URI

```
# RDF
http://www.w3.org/1999/02/22-rdf-syntax-ns#type

# RDFS
http://www.w3.org/2000/01/rdf-schema#subClassOf
http://www.w3.org/2000/01/rdf-schema#subPropertyOf
http://www.w3.org/2000/01/rdf-schema#domain
http://www.w3.org/2000/01/rdf-schema#range

# OWL
http://www.w3.org/2002/07/owl#Class
http://www.w3.org/2002/07/owl#ObjectProperty
http://www.w3.org/2002/07/owl#DatatypeProperty
```

---

**提示**: 在推理引擎界面中，点击「📚 加载示例」按钮可以快速加载预定义的规则示例！
