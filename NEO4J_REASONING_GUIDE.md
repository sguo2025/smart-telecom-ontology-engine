# 📥 从 Neo4j 加载数据进行推理

## 功能说明

现在推理引擎支持直接从 Neo4j 图数据库读取已导入的 RDF 数据进行推理，无需重复输入数据。

## 使用步骤

### 方式 1: 通过 Web UI（推荐）

1. **导入数据到 Neo4j**
   - 访问 http://localhost:8888
   - 切换到「📊 RDF 管理」标签
   - 输入或加载示例 RDF 数据
   - 点击「导入」保存到 Neo4j

2. **从 Neo4j 加载并推理**
   - 切换到「🧠 推理引擎」标签
   - 点击「📥 从 Neo4j 加载数据」按钮
   - 系统会自动加载 Neo4j 中的所有数据
   - 选择推理器类型（RDFS/OWL/CUSTOM）
   - 点击「🚀 执行推理」

3. **查看结果**
   - 切换到「📊 统计」标签查看推理统计
   - 切换到「📄 完整结果」查看推理后的 RDF 数据

### 方式 2: 通过 API

```bash
# 执行推理，使用 Neo4j 中的数据
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "",
    "reasonerType": "RDFS",
    "useNeo4jData": true,
    "saveToNeo4j": false
  }' | jq .
```

**参数说明**:
- `useNeo4jData`: `true` 表示从 Neo4j 读取数据
- `rdfData`: 当 `useNeo4jData=true` 时可以为空
- `saveToNeo4j`: 推理后是否保存回 Neo4j

## 完整工作流示例

### 场景：对已导入的本体进行推理

```bash
# 1. 导入 RDF 数据到 Neo4j
curl -X POST http://localhost:8080/api/rdf/import \
  -H "Content-Type: text/turtle" \
  -d '@prefix : <http://example.org/ont#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:Employee rdfs:subClassOf :Person .
:Manager rdfs:subClassOf :Employee .
:Alice a :Manager .
:Bob a :Employee .'

# 2. 使用 Neo4j 数据进行推理
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "reasonerType": "RDFS",
    "useNeo4jData": true,
    "saveToNeo4j": true
  }' | jq .

# 3. 查看 Neo4j 中的推理结果
curl http://localhost:8080/api/rdf/export
```

## UI 功能详解

### 📥 从 Neo4j 加载数据按钮

**位置**: 推理引擎 → 输入配置 → RDF 数据文本框下方

**功能**:
- 从 Neo4j 导出所有数据为 Turtle 格式
- 自动填充到 RDF 数据输入框
- 标记为"使用 Neo4j 数据"状态

**状态指示**:
- ✓ 使用 Neo4j 数据（绿色）- 表示当前使用的是从 Neo4j 加载的数据
- 手动编辑数据后，状态自动清除

### 推理选项

**推理器类型**:
- RDFS - 适合类继承推理
- OWL - 完整本体推理
- OWL_MINI - 性能优化
- OWL_MICRO - 最轻量
- CUSTOM - 自定义规则

**保存选项**:
- ☑ 推理后保存到 Neo4j - 将推理结果写回图数据库

## 使用场景

### 场景 1: 增量推理

```
1. 导入基础本体到 Neo4j
2. 从 Neo4j 加载进行 RDFS 推理
3. 保存推理结果回 Neo4j
4. 再次加载进行 OWL 推理
5. 不断增量推理，丰富知识图谱
```

### 场景 2: 对比推理

```
1. 从 Neo4j 加载数据
2. 使用 RDFS 推理，查看结果
3. 再次加载相同数据
4. 使用 OWL 推理，对比结果
5. 分析不同推理器的差异
```

### 场景 3: 业务规则应用

```
1. 导入客户数据到 Neo4j
2. 从 Neo4j 加载
3. 应用自定义业务规则推理
4. 保存分类结果回 Neo4j
5. 在 Neo4j Browser 中查询结果
```

## 优势

### ✅ 避免重复输入
- 数据已在 Neo4j 中，无需重新输入
- 推理器可以直接使用图数据库数据

### ✅ 支持大数据集
- Neo4j 可存储大量三元组
- 推理引擎按需读取

### ✅ 持久化存储
- 推理结果可保存回 Neo4j
- 便于后续查询和可视化

### ✅ 工作流集成
- RDF 管理 → Neo4j → 推理引擎
- 无缝的数据流转

## 注意事项

### ⚠️ 数据量

- Neo4j 中数据过大时，推理可能耗时较长
- 建议先测试小数据集
- 可使用轻量级推理器（OWL_MICRO）

### ⚠️ 数据格式

- 从 Neo4j 导出的数据为 Turtle 格式
- 推理引擎会自动检测格式
- 无需手动指定

### ⚠️ 保存覆盖

- 推理后保存会覆盖同 IRI 的节点
- 建议先在测试环境验证
- 可先不保存，查看结果后再决定

### ⚠️ 性能优化

- 大数据集使用 OWL_MICRO
- 避免复杂递归规则
- 可分批处理

## 错误处理

### 错误: "Neo4j 中没有数据"

**原因**: Neo4j 数据库为空

**解决**:
1. 切换到「RDF 管理」
2. 导入示例数据或自定义数据
3. 确认导入成功
4. 返回推理引擎重新加载

### 错误: "从 Neo4j 读取数据失败"

**原因**: Neo4j 连接问题

**解决**:
1. 检查 Neo4j 服务: `docker ps | grep neo4j`
2. 测试连接: `curl http://localhost:7474`
3. 重启 Neo4j: `docker-compose restart neo4j`

### 错误: 推理超时

**原因**: 数据量太大

**解决**:
1. 使用更轻量的推理器
2. 减少数据量
3. 增加服务器资源

## API 参考

### 从 Neo4j 加载并推理

**端点**: `POST /api/reasoning/execute`

**请求体**:
```json
{
  "rdfData": "",
  "reasonerType": "RDFS",
  "customRules": "",
  "saveToNeo4j": true,
  "useNeo4jData": true
}
```

**响应**:
```json
{
  "success": true,
  "reasonerType": "RDFS",
  "originalTriples": 150,
  "inferredTriples": 320,
  "newTriples": 170,
  "executionTime": 2500,
  "resultData": "推理后的 Turtle 数据",
  "savedToNeo4j": true
}
```

### 直接导出 Neo4j 数据

**端点**: `GET /api/rdf/export`

**响应**: Turtle 格式的 RDF 数据

```bash
curl http://localhost:8080/api/rdf/export
```

## 测试示例

### 完整测试流程

```bash
#!/bin/bash

echo "1. 导入测试数据到 Neo4j..."
curl -X POST http://localhost:8080/api/rdf/import \
  -H "Content-Type: text/turtle" \
  -d '@prefix : <http://example.org/> .
:Manager rdfs:subClassOf :Employee .
:John a :Manager .'

echo -e "\n2. 从 Neo4j 加载并执行 RDFS 推理..."
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "reasonerType": "RDFS",
    "useNeo4jData": true,
    "saveToNeo4j": false
  }' | jq '{reasonerType, originalTriples, inferredTriples, newTriples}'

echo -e "\n3. 查看 Neo4j 中的数据..."
curl http://localhost:8080/api/rdf/export | head -20

echo -e "\n✓ 测试完成!"
```

## 最佳实践

### 1. 数据准备
- 先在「RDF 管理」中导入和验证数据
- 确保数据格式正确
- 使用 Neo4j Browser 查看导入结果

### 2. 推理策略
- 小数据测试: 使用 OWL 完整推理
- 大数据生产: 使用 OWL_MICRO
- 业务规则: 使用 CUSTOM

### 3. 结果验证
- 查看统计数据评估推理效果
- 在 Neo4j Browser 中验证推理结果
- 对比推理前后的三元组数量

### 4. 性能优化
- 定期清理 Neo4j 中的冗余数据
- 使用合适的推理器
- 避免在生产环境频繁推理

---

**提示**: 这个功能极大地简化了推理流程，特别适合对已导入的知识图谱进行增量推理和规则应用！
