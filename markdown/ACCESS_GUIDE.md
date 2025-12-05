# 🚀 快速访问指南

## 服务地址

| 服务 | URL | 状态 |
|------|-----|------|
| 🌐 **前端应用** | http://localhost:8888 | ✅ 运行中 |
| 🔌 **后端 API** | http://localhost:8080 | ✅ 运行中 |
| 📚 **API 文档** | http://localhost:8080/swagger-ui/index.html | ✅ 可用 |
| 🗄️ **Neo4j Browser** | http://localhost:7474 | ✅ 运行中 |

**Neo4j 登录凭据**:
- 用户名: `neo4j`
- 密码: `neo4j_test_pass`

## 📱 前端功能导航

访问 http://localhost:8888 后:

### 1️⃣ RDF 数据管理
**位置**: 顶部导航 → 「📊 RDF 管理」

**功能**:
- 导入 RDF 数据 (Turtle/RDF-XML/JSON-LD)
- 导出 Neo4j 数据为 Turtle
- 加载示例数据
- 下载/复制功能

**快速操作**:
```
1. 点击「加载示例」
2. 点击「导入」
3. 点击「从 Neo4j 导出」
```

### 2️⃣ 逻辑推理引擎 ⭐ **新功能**
**位置**: 顶部导航 → 「🧠 推理引擎」

**功能**:
- 5 种推理器选择 (RDFS/OWL/OWL_MINI/OWL_MICRO/CUSTOM)
- RDF 数据输入
- 自定义规则编辑
- 推理执行
- 统计展示
- 结果查看
- 下载/复制

**快速操作**:
```
1. 选择推理器: RDFS
2. 点击示例: rdfs_subclass
3. 点击「🚀 执行推理」
4. 查看「📊 统计」标签
```

**推理器说明**:
- **RDFS**: 适合类继承推理
- **OWL**: 完整本体推理 (对称、传递等)
- **OWL_MINI**: 性能优化版本
- **OWL_MICRO**: 最轻量版本
- **CUSTOM**: 自定义业务规则

**示例数据**:
- `rdfs_subclass` - RDFS 子类推理
- `owl_symmetric` - OWL 对称属性
- `owl_transitive` - OWL 传递属性
- `custom_family` - 自定义家庭关系规则
- `telecom_transfer` - 电信业务规则

### 3️⃣ 知识图谱
**位置**: 顶部导航 → 「🔗 知识图谱」

**说明**: 引导访问 Neo4j Browser 进行可视化

## 🔌 API 快速测试

### 1. 推理器类型查询
```bash
curl http://localhost:8080/api/reasoning/reasoner-types | jq .
```

### 2. 获取示例数据
```bash
curl http://localhost:8080/api/reasoning/examples | jq keys
```

### 3. 执行 RDFS 推理
```bash
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/ont#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n:Manager rdfs:subClassOf :Employee .\n:John a :Manager .",
    "reasonerType": "RDFS",
    "saveToNeo4j": false
  }' | jq .
```

### 4. 导入 RDF 数据
```bash
curl -X POST http://localhost:8080/api/rdf/import \
  -H "Content-Type: text/turtle" \
  --data-binary "@ontology/crm-transfer-ontology.rdf"
```

### 5. 导出 RDF 数据
```bash
curl http://localhost:8080/api/rdf/export
```

## 🧪 自动化测试

运行完整的推理测试套件:

```bash
./ontology/test_reasoning.sh
```

预期输出:
```
=========================================
逻辑推理引擎测试
=========================================

1. 测试 RDFS 子类推理...
{
  "reasonerType": "RDFS",
  "originalTriples": 3,
  "inferredTriples": 115,
  "newTriples": 112,
  "executionTime": 1770
}

2. 测试 OWL 对称属性推理...
✓ 通过

3. 测试 OWL 传递属性推理...
✓ 通过

4. 测试自定义规则推理...
✓ 通过

5. 测试规则验证...
✓ 通过

=========================================
测试完成!
=========================================
```

## 📚 文档快速导航

| 文档 | 内容 | 适合 |
|------|------|------|
| [README_FULL.md](README_FULL.md) | 完整项目说明 | 新用户 |
| [REASONING_GUIDE.md](REASONING_GUIDE.md) | 推理详细指南 | 深入学习 |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | 快速参考卡片 | 日常查询 |
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | 演示脚本 | 功能展示 |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 实现总结 | 开发者 |

## 🎯 典型使用场景

### 场景 1: 快速体验推理功能
```
1. 访问 http://localhost:8888
2. 点击「🧠 推理引擎」
3. 保持默认 RDFS 推理器
4. 点击「rdfs_subclass」示例
5. 点击「🚀 执行推理」
6. 查看统计结果
```

### 场景 2: 测试自定义规则
```
1. 推理器选择: CUSTOM
2. 点击「custom_family」示例
3. 在 RDF 数据区输入:
   @prefix : <http://example.org/ont#> .
   :Alice :hasParent :Bob .
   :Bob :hasParent :Charlie .
4. 执行推理
5. 查看推导的祖父母关系
```

### 场景 3: 保存到 Neo4j
```
1. 执行任意推理
2. 勾选「推理后保存到 Neo4j」
3. 执行推理
4. 访问 http://localhost:7474
5. 运行 Cypher: MATCH (n) RETURN n LIMIT 25
6. 查看推理结果
```

### 场景 4: API 集成测试
```bash
# 获取示例
EXAMPLE=$(curl -s http://localhost:8080/api/reasoning/examples | jq -r '.rdfs_subclass')

# 执行推理
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d "{\"rdfData\":\"$EXAMPLE\",\"reasonerType\":\"RDFS\",\"saveToNeo4j\":false}"
```

## 🔍 故障排除

### 问题 1: 无法访问前端
**检查**:
```bash
docker ps | grep frontend
curl http://localhost:8888
```

**解决**:
```bash
docker-compose restart frontend
```

### 问题 2: 推理 API 报错
**检查后端日志**:
```bash
docker logs smart-backend --tail 50
```

**常见错误**:
- 规则语法错误 → 使用「验证规则」功能
- Neo4j 连接失败 → 检查 Neo4j 状态
- 格式解析错误 → 检查 RDF 数据格式

### 问题 3: Neo4j 无法连接
**检查状态**:
```bash
docker ps | grep neo4j
```

**重启服务**:
```bash
docker-compose restart neo4j
```

## 📊 性能参考

| 数据量 | 推荐推理器 | 预期时间 |
|--------|-----------|---------|
| < 100 三元组 | OWL | < 1s |
| 100-1K | OWL_MINI | 1-5s |
| 1K-10K | RDFS | 5-30s |
| > 10K | CUSTOM | 可变 |

## 🎓 学习路径

### 初学者
1. ✅ 阅读 [README_FULL.md](README_FULL.md)
2. ✅ 使用前端 UI 测试基本功能
3. ✅ 尝试预定义示例
4. ✅ 查看 [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

### 进阶用户
1. ✅ 阅读 [REASONING_GUIDE.md](REASONING_GUIDE.md)
2. ✅ 编写自定义规则
3. ✅ 使用 REST API
4. ✅ 查看 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### 开发者
1. ✅ 阅读 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
2. ✅ 查看源代码
3. ✅ 修改和扩展功能
4. ✅ 运行测试套件

## 💡 提示

### UI 使用技巧
- 💡 使用示例按钮快速加载数据
- 💡 切换标签页查看不同结果视图
- 💡 勾选保存选项将结果持久化
- 💡 使用下载按钮导出结果

### API 使用技巧
- 💡 使用 `jq` 格式化 JSON 输出
- 💡 先验证规则再执行推理
- 💡 使用 `/inferred-only` 获取纯推理结果
- 💡 查看 Swagger UI 了解完整 API

### 性能优化
- 💡 大数据集使用轻量推理器
- 💡 避免复杂递归规则
- 💡 分批处理超大数据
- 💡 缓存常用推理结果

## 🎬 视频演示脚本

跟随 [DEMO_SCRIPT.md](DEMO_SCRIPT.md) 进行完整功能演示:
- 7 个演示场景
- 详细操作步骤
- 预期结果说明

## 📞 获取帮助

1. **查看文档**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **查看 API 文档**: http://localhost:8080/swagger-ui/index.html
3. **查看日志**: `docker logs smart-backend`
4. **运行测试**: `./test_reasoning.sh`

---

**提示**: 建议先从前端 UI 开始,熟悉功能后再使用 API 进行集成。
