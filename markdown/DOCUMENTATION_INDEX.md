# 📑 文档索引

## 核心文档

### 1. [README_FULL.md](README_FULL.md) 📘
**完整项目说明**
- 功能概述 (RDF 管理、推理引擎、图数据库)
- 快速开始指南
- API 示例
- 技术栈说明
- 项目结构

### 2. [REASONING_GUIDE.md](REASONING_GUIDE.md) 🧠
**推理功能详细指南**
- 推理器类型详解 (RDFS, OWL, CUSTOM 等)
- 规则语法说明
- API 端点文档
- 使用场景
- 性能建议
- 注意事项

### 3. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) ⚡
**快速参考卡片**
- 推理器速查表
- 常用推理规则
- API 快速参考
- 命名空间前缀
- 性能优化表
- 故障排除
- 业务场景模板

### 4. [DEMO_SCRIPT.md](DEMO_SCRIPT.md) 🎬
**演示脚本**
- 7 个完整演示场景
- 详细操作步骤
- API 测试命令
- 性能对比演示
- 集成工作流
- 常见问题演示

### 5. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) 📊
**实现总结**
- 功能清单
- 代码结构
- 测试验证
- 性能数据
- 技术栈
- 创新点
- 扩展方向

## 测试与工具

### 6. [test_reasoning.sh](test_reasoning.sh) 🧪
**自动化测试脚本**
- 5 个推理测试用例
- curl 命令示例
- JSON 输出验证

### 7. [crm-transfer-ontology.rdf](crm-transfer-ontology.rdf) 📄
**示例本体文件**
- 电信转网本体示例
- RDF/XML 格式

## 配置文件

### 8. [docker-compose.yml](docker-compose.yml) 🐳
**容器编排配置**
- Neo4j 数据库
- Spring Boot 后端
- React 前端
- 网络配置

### 9. [README.md](README.md) 📖
**原始 README**
- 快速开始
- 本地开发
- Codespaces 支持

## 使用指南

### 🚀 快速开始
1. 阅读 [README_FULL.md](README_FULL.md) 了解项目
2. 运行 `docker-compose up` 启动服务
3. 访问 http://localhost:8888 使用应用

### 📚 学习推理功能
1. 阅读 [REASONING_GUIDE.md](REASONING_GUIDE.md) 了解原理
2. 参考 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 查询语法
3. 跟随 [DEMO_SCRIPT.md](DEMO_SCRIPT.md) 实践

### 🧪 测试验证
1. 运行 `./test_reasoning.sh` 自动化测试
2. 参考 [DEMO_SCRIPT.md](DEMO_SCRIPT.md) 手动测试

### 🔧 开发扩展
1. 查看 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) 了解架构
2. 修改后端: `backend/src/main/java/com/example/demo/`
3. 修改前端: `frontend/src/`

## 目录结构

```
smart-telecom-ontology-engine/
├── 📘 README_FULL.md              # 完整说明
├── 📖 README.md                   # 快速开始
├── 🧠 REASONING_GUIDE.md          # 推理指南
├── ⚡ QUICK_REFERENCE.md           # 快速参考
├── 🎬 DEMO_SCRIPT.md              # 演示脚本
├── 📊 IMPLEMENTATION_SUMMARY.md   # 实现总结
├── 📑 DOCUMENTATION_INDEX.md      # 本文件
├── 🧪 test_reasoning.sh           # 测试脚本
├── 🐳 docker-compose.yml          # 容器配置
├── 📄 crm-transfer-ontology.rdf   # 示例本体
│
├── backend/                       # Spring Boot 后端
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/
│   │   │   ├── RdfController.java          # RDF API
│   │   │   └── ReasoningController.java    # 推理 API
│   │   ├── service/
│   │   │   ├── RdfService.java             # RDF 服务
│   │   │   └── ReasoningService.java       # 推理服务
│   │   └── ...
│   └── pom.xml
│
└── frontend/                      # React 前端
    ├── src/
    │   ├── App.jsx                       # 主应用
    │   ├── RdfManager.jsx                # RDF 管理
    │   ├── ReasoningManager.jsx          # 推理引擎
    │   └── ...
    └── package.json
```

## 按需查找

### 我想...

#### 快速上手
→ 阅读 [README_FULL.md](README_FULL.md)

#### 了解推理功能
→ 阅读 [REASONING_GUIDE.md](REASONING_GUIDE.md)

#### 查询语法和 API
→ 查看 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

#### 看演示示例
→ 跟随 [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

#### 了解实现细节
→ 查看 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

#### 运行测试
→ 执行 `./test_reasoning.sh`

#### 修改代码
→ 查看项目结构,编辑对应文件

#### 部署应用
→ 运行 `docker-compose up`

## 文档统计

| 文档 | 行数 | 用途 |
|------|------|------|
| README_FULL.md | ~200 | 完整说明 |
| REASONING_GUIDE.md | ~300 | 推理指南 |
| QUICK_REFERENCE.md | ~500 | 快速参考 |
| DEMO_SCRIPT.md | ~400 | 演示脚本 |
| IMPLEMENTATION_SUMMARY.md | ~400 | 实现总结 |
| test_reasoning.sh | ~60 | 测试脚本 |
| **总计** | **~1860** | **6 个文档** |

## 文档特色

✅ **完整性**: 覆盖从入门到精通的所有内容  
✅ **实用性**: 大量示例和命令可直接使用  
✅ **层次性**: 从概述到细节,逐层深入  
✅ **可操作**: 每个场景都有详细步骤  
✅ **可维护**: 结构清晰,易于更新  

## 获取帮助

1. **文档**: 查看本索引找到对应文档
2. **示例**: 使用 `GET /api/reasoning/examples` 获取示例
3. **API**: 访问 http://localhost:8080/swagger-ui/index.html
4. **日志**: `docker logs smart-backend`

## 更新日志

- **2025-12-04**: 初始版本,完成所有核心功能和文档

---

**提示**: 建议按照 README_FULL → REASONING_GUIDE → QUICK_REFERENCE → DEMO_SCRIPT 的顺序阅读文档。
