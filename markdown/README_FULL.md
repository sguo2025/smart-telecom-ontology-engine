# Smart Telecom Ontology Engine

🚀 **智能本体工程与逻辑推理平台**

基于 Spring Boot + React + Neo4j + Apache Jena 的完整 RDF/OWL 本体管理与推理系统。

## ✨ 核心功能

### 1. 📊 RDF 数据管理
- ✅ 多格式支持: Turtle、RDF/XML、JSON-LD
- ✅ 自动映射: RDF → Neo4j 图数据库
- ✅ 双向转换: 导入导出无缝切换
- ✅ 智能检测: 自动识别数据格式

### 2. 🧠 逻辑推理引擎
- ✅ **RDFS 推理**: 类继承、属性继承、域值域推理
- ✅ **OWL 推理**: 完整 OWL DL 支持
  - 对称属性 (SymmetricProperty)
  - 传递属性 (TransitiveProperty)  
  - 逆属性 (InverseOf)
  - 等价类和属性
- ✅ **自定义规则**: Jena 规则语言支持
- ✅ **性能优化**: OWL Mini/Micro 轻量级推理器
- ✅ **统计分析**: 实时显示推理效果

### 3. 🔗 图数据库存储
- ✅ Neo4j 集成
- ✅ Cypher 查询
- ✅ 知识图谱可视化
- ✅ 推理结果持久化

## 🎯 快速开始

### 1️⃣ 启动服务

```bash
docker-compose up
```

### 2️⃣ 访问应用

| 服务 | URL | 说明 |
|------|-----|------|
| 🌐 前端应用 | http://localhost:8888 | Web UI |
| 🗄️ Neo4j Browser | http://localhost:7474 | 图数据库 |
| 🔌 后端 API | http://localhost:8080 | REST API |
| 📚 API 文档 | http://localhost:8080/swagger-ui/index.html | Swagger |

**Neo4j 登录**: `neo4j` / `neo4j_test_pass`

### 3️⃣ 使用示例

#### 📊 RDF 数据管理
1. 访问前端 → 「RDF 管理」
2. 加载示例数据
3. 导入到 Neo4j
4. 导出查看结果

#### 🧠 逻辑推理
1. 访问前端 → 「推理引擎」
2. 选择推理器 (RDFS/OWL/CUSTOM)
3. 输入 RDF 数据
4. 执行推理
5. 查看统计和结果

## 📖 API 示例

### RDF 管理
```bash
# 导入 RDF
curl -X POST http://localhost:8080/api/rdf/import \
  -H "Content-Type: text/turtle" \
  --data-binary "@example.ttl"

# 导出 RDF
curl http://localhost:8080/api/rdf/export
```

### 推理引擎
```bash
# 执行推理
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://example.org/> . :A rdfs:subClassOf :B .",
    "reasonerType": "RDFS",
    "saveToNeo4j": false
  }'

# 获取推理器类型
curl http://localhost:8080/api/reasoning/reasoner-types

# 获取示例
curl http://localhost:8080/api/reasoning/examples
```

## 💡 推理示例

### RDFS 子类推理
```turtle
:Employee rdfs:subClassOf :Person .
:Manager rdfs:subClassOf :Employee .
:John a :Manager .

# 推理: :John 也是 :Employee 和 :Person
```

### OWL 传递属性
```turtle
:ancestorOf a owl:TransitiveProperty .
:Alice :ancestorOf :Bob .
:Bob :ancestorOf :Charlie .

# 推理: :Alice :ancestorOf :Charlie
```

### 自定义规则
```
[highValueCustomer: 
  (?c rdf:type :Customer) (?c :monthlySpend ?s) greaterThan(?s, 500) 
  -> (?c rdf:type :HighValueCustomer)
]
```

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Apache Jena | 4.9.0 | RDF 推理引擎 |
| Spring Boot | 2.7.12 | 后端框架 |
| Neo4j | 5.x | 图数据库 |
| React | 18.x | 前端框架 |
| Vite | 5.x | 构建工具 |
| Java | 17 | 后端语言 |

## 📂 项目结构

```
├── backend/                      Spring Boot 后端
│   ├── controller/
│   │   ├── RdfController.java       # RDF API
│   │   └── ReasoningController.java # 推理 API
│   └── service/
│       ├── RdfService.java          # RDF 服务
│       └── ReasoningService.java    # 推理服务
├── frontend/                     React 前端
│   ├── RdfManager.jsx               # RDF 管理组件
│   └── ReasoningManager.jsx         # 推理组件
├── docker-compose.yml            容器编排
├── REASONING_GUIDE.md            推理详细文档
└── test_reasoning.sh             自动化测试
```

## 🧪 测试

```bash
# 运行推理功能测试
./test_reasoning.sh
```

## 📚 文档

- [推理功能详细指南](REASONING_GUIDE.md)
- [API 文档](http://localhost:8080/swagger-ui/index.html)

## 🎯 使用场景

1. 知识图谱构建
2. 本体推理
3. 数据集成
4. 语义查询
5. 业务规则引擎

## ⚡ 性能建议

- **小数据** (< 1K 三元组): OWL 推理器
- **中等数据** (1K-10K): RDFS/OWL Mini
- **大数据** (> 10K): OWL Micro/自定义规则

## 🚀 GitHub Codespaces

完全支持在线开发,端口自动转发。

## 📝 License

MIT License

## 👨‍💻 作者

sguo2025

---

**技术支持**: Apache Jena + Neo4j + Spring Boot + React
