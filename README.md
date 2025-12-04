# smart-telecom-ontology-engine

此仓库包含一个示例全栈项目：

- 后端：Spring Boot（运行在 8080），使用 Spring Data Neo4j，暴露 REST API，并通过 Swagger UI 提供 API 文档。
- 前端：React + Vite（开发服务器运行在 8888），通过代理将 `/api` 转发到后端。
- 数据库：Neo4j（在 docker-compose 中运行）。
- 支持使用 `docker-compose` 一键启动所有服务。

## 快速开始

### 在 GitHub Codespaces 中运行（推荐）

GitHub 会自动为你的容器端口创建公网转发 URL。所有服务都可在公网访问：

- 后端 API: `https://<codespace-name>-8080.app.github.dev/api`
- Swagger UI 文档: `https://<codespace-name>-8080.app.github.dev/swagger-ui.html`
- 前端开发服务器: `https://<codespace-name>-8888.app.github.dev/`
- Neo4j 浏览器: `https://<codespace-name>-7474.app.github.dev/`

你的 Codespace 名称在 Codespaces 页面或 VS Code 右下角可查看。

### 本地或其他环境运行

使用 Docker Compose 启动所有服务：

```bash
docker-compose up --build
```


或者如果你想保留其他容器只关闭backend：
```bash
docker stop smart-backend
``

本地访问（localhost）：

- 后端 API: http://localhost:8080/api
- Swagger UI 文档: http://localhost:8080/swagger-ui.html
- OpenAPI 规范: http://localhost:8080/v3/api-docs
- 前端开发服务器: http://localhost:8888
- Neo4j 浏览器: http://localhost:7474/browser

### 本地单独运行（开发用）

后端（需要 Java 17 + Maven）:
```bash
cd backend
mvn clean package -DskipTests
java -jar target/smart-telecom-backend-0.1.0.jar
```

前端（需要 Node 18+）:
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:8888
```


## 常见问题

### Q: 为什么我在 GitHub Codespaces 中看不到公网 URL？
**A**: GitHub Codespaces 会自动为所有暴露的端口创建公网 URL。检查：
1. VS Code 中的 "Ports" 面板（左侧活动栏或 Terminal > Run Task）
2. 或在浏览器访问 https://github.com/codespaces 查看 Codespace 详情
3. 确保容器已启动（`docker-compose up --build`）

### Q: Neo4j 默认账号密码是什么？
**A**: 用户名：`neo4j`，密码：`neo4j_test_pass`

### Q: 前端如何访问后端 API？
**A**: 
- 在 GitHub Codespaces 中，前端会通过 Vite 代理自动转发 `/api` 请求到后端（在 `vite.config.js` 中配置）
- 在容器网络中，前端容器将请求转发到 `http://backend:8080`

## 注意

- `backend` 使用环境变量连接 Neo4j（`NEO4J_URI`、`NEO4J_USER`、`NEO4J_PASSWORD`）。
- 默认 Neo4j 账号密码在 `docker-compose.yml` 中为 `neo4j/neo4j_test_pass`（密码至少 8 字符）。
- 依赖项：Docker + Docker Compose（用于容器化运行）。

> ⚠️ GitHub Codespaces 只能用 HTTP REST API 访问 Neo4j，不能用 Neo4j Browser 的 Bolt/WebSocket 协议远程连接数据库。后端 Spring Boot 访问 Neo4j 不受影响，因为容器网络内是直连，不走公网代理。
