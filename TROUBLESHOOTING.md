# 🔧 故障排除指南 - 推理引擎无响应

## 问题描述
点击「🧠 推理引擎」标签页没有反应或无法切换。

## 验证步骤

### 1️⃣ 检查服务状态
```bash
docker-compose ps
```
确保所有服务都在运行：
- ✅ neo4j (healthy)
- ✅ smart-backend (running)
- ✅ smart-frontend (running)

### 2️⃣ 检查前端文件是否存在
```bash
docker exec smart-frontend ls -la /app/src/ | grep Reasoning
```
应该看到：
- ReasoningManager.jsx
- ReasoningManager.css

### 3️⃣ 检查浏览器控制台

1. 打开浏览器访问: http://localhost:8888
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 查看是否有错误信息（红色）

**常见错误**:
- `Failed to fetch` → 后端API连接失败
- `Module not found` → 组件导入失败
- `Unexpected token` → 代码语法错误

### 4️⃣ 检查网络请求

在开发者工具中:
1. 切换到 Network 标签
2. 刷新页面 (Ctrl+R)
3. 查看是否有失败的请求（红色）

### 5️⃣ 强制刷新浏览器缓存

浏览器可能缓存了旧版本：
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- 或清除浏览器缓存

## 解决方案

### 方案 1: 重新构建前端容器（推荐）
```bash
cd /workspaces/smart-telecom-ontology-engine
docker-compose stop frontend
docker-compose up frontend -d --build
```

等待 10-15 秒后刷新浏览器。

### 方案 2: 重启所有服务
```bash
docker-compose down
docker-compose up -d
```

### 方案 3: 检查后端 API
```bash
# 测试推理器类型 API
curl http://localhost:8080/api/reasoning/reasoner-types

# 应该返回 JSON 数据
```

如果返回错误，重启后端：
```bash
docker-compose restart backend
```

### 方案 4: 查看详细日志

**前端日志**:
```bash
docker logs smart-frontend --tail 50
```

**后端日志**:
```bash
docker logs smart-backend --tail 50
```

查找错误信息（ERROR, Exception, Failed）。

## 验证功能是否正常

### 测试 1: 前端页面加载
访问 http://localhost:8888，应该看到：
- ✅ 页面标题: "Smart Telecom Ontology Engine"
- ✅ 三个导航标签: 📊 RDF 管理 | 🧠 推理引擎 | 🔗 知识图谱
- ✅ 顶部显示后端状态

### 测试 2: 点击推理引擎标签
点击「🧠 推理引擎」，应该看到：
- ✅ 左侧输入面板
- ✅ 推理器类型下拉菜单
- ✅ RDF 数据文本框
- ✅ 示例按钮
- ✅ 右侧结果面板

### 测试 3: 加载示例
1. 点击「rdfs_subclass」按钮
2. 应该在文本框中看到示例数据
3. 推理器自动选择 RDFS

### 测试 4: 执行推理
1. 保持示例数据
2. 点击「🚀 执行推理」
3. 应该看到加载动画
4. 几秒后显示统计结果

### 测试 5: 后端 API
```bash
# 测试推理 API
curl -X POST http://localhost:8080/api/reasoning/execute \
  -H "Content-Type: application/json" \
  -d '{
    "rdfData": "@prefix : <http://ex.org/> . :A rdfs:subClassOf :B . :x a :A .",
    "reasonerType": "RDFS",
    "saveToNeo4j": false
  }' | jq .
```

应该返回包含统计信息的 JSON。

## 常见问题

### Q1: 页面显示但点击标签没反应
**原因**: JavaScript 错误或事件监听器未绑定
**解决**: 
1. 打开浏览器控制台查看错误
2. 强制刷新 (Ctrl+Shift+R)
3. 清除浏览器缓存

### Q2: 点击后一片空白
**原因**: ReasoningManager 组件渲染失败
**解决**:
1. 检查浏览器控制台错误
2. 确认组件文件存在:
   ```bash
   docker exec smart-frontend cat /app/src/ReasoningManager.jsx | head -5
   ```

### Q3: 显示 "Failed to fetch" 错误
**原因**: 后端 API 不可用
**解决**:
1. 检查后端状态: `docker ps | grep backend`
2. 测试后端 API: `curl http://localhost:8080/api/reasoning/reasoner-types`
3. 重启后端: `docker-compose restart backend`

### Q4: 推理执行无响应
**原因**: 
- 后端推理计算中
- API 请求失败
- 超时

**解决**:
1. 查看网络请求状态 (F12 → Network)
2. 查看后端日志: `docker logs smart-backend --tail 30`
3. 尝试更小的数据集

### Q5: 样式错乱或缺失
**原因**: CSS 文件未加载
**解决**:
1. 检查 ReasoningManager.css 是否存在
2. 查看 Network 标签是否有 CSS 加载失败
3. 重新构建前端

## 调试技巧

### 1. 启用 React DevTools
安装 React Developer Tools 浏览器扩展，可以：
- 查看组件树
- 检查组件状态
- 追踪组件更新

### 2. 查看组件是否渲染
在浏览器控制台输入：
```javascript
// 查看 ReasoningManager 组件是否存在
document.querySelector('.reasoning-manager')
```

### 3. 手动测试状态切换
```javascript
// 在控制台手动切换视图
// (仅用于调试)
```

### 4. 监控网络请求
```bash
# 实时监控后端日志
docker logs -f smart-backend

# 在另一个终端测试 API
curl -X POST http://localhost:8080/api/reasoning/execute ...
```

## 完整重置流程

如果以上方法都不行，执行完整重置：

```bash
# 1. 停止所有容器
docker-compose down

# 2. 删除旧镜像（可选）
docker rmi smart-telecom-ontology-engine-frontend
docker rmi smart-telecom-ontology-engine-backend

# 3. 重新构建并启动
docker-compose up --build -d

# 4. 等待启动完成
sleep 10

# 5. 检查状态
docker-compose ps

# 6. 测试 API
curl http://localhost:8080/api/reasoning/reasoner-types

# 7. 访问前端
echo "访问: http://localhost:8888"
```

## 联系支持

如果问题仍未解决，请提供：
1. 浏览器控制台截图
2. `docker-compose ps` 输出
3. `docker logs smart-frontend --tail 50` 输出
4. `docker logs smart-backend --tail 50` 输出

---

**提示**: 99% 的情况下，重新构建前端容器并强制刷新浏览器即可解决问题。
