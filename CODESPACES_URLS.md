# GitHub Codespaces 公网访问 URLs

## 你的 Codespace 信息

- **Codespace 名称**: `glowing-engine-x5xrgjj799jg26wvj`
- **公网域名**: `app.github.dev`

## 公网访问地址

### Neo4j 数据库

- **Neo4j Browser** (Web 可视化工具)  
  https://glowing-engine-x5xrgjj799jg26wvj-7474.app.github.dev/

- **Neo4j REST API**  
  https://glowing-engine-x5xrgjj799jg26wvj-7474.app.github.dev/db/neo4j/query/v2

- **认证信息**  
  用户名: `neo4j`  
  密码: `neo4j_test_pass`

### Spring Boot 后端

- **API 基础 URL**  
  https://glowing-engine-x5xrgjj799jg26wvj-8080.app.github.dev/api

- **Swagger UI (API 文档)**  
  https://glowing-engine-x5xrgjj799jg26wvj-8080.app.github.dev/swagger-ui.html

- **示例接口**  
  https://glowing-engine-x5xrgjj799jg26wvj-8080.app.github.dev/api/persons/hello

### React 前端

- **开发服务器**  
  https://glowing-engine-x5xrgjj799jg26wvj-8888.app.github.dev/

## 如何使用

1. **直接在浏览器访问上述 URL**（无需额外配置）
2. **API 调用示例**:
   ```bash
   # 获取所有 Person 数据
   curl https://glowing-engine-x5xrgjj799jg26wvj-8080.app.github.dev/api/persons
   
   # 创建新 Person
   curl -X POST https://glowing-engine-x5xrgjj799jg26wvj-8080.app.github.dev/api/persons \
     -H "Content-Type: application/json" \
     -d '{"id":"p1","name":"Alice"}'
   ```

3. **Neo4j 查询示例**:
   ```bash
   curl -u neo4j:neo4j_test_pass \
     -X POST https://glowing-engine-x5xrgjj799jg26wvj-7474.app.github.dev/db/neo4j/query/v2 \
     -H "Content-Type: application/json" \
     -d '{"statements":[{"statement":"MATCH (n) RETURN count(n)"}]}'
   ```

## 注意

- 这些 URL 仅在 Codespace 运行时有效
- 关闭或删除 Codespace 后 URL 将失效
- GitHub Codespaces 自动为所有暴露的端口创建 HTTPS URL（无需手动配置 SSL）
