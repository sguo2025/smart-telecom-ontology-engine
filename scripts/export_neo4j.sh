#!/bin/bash
# Neo4j 数据导出脚本
# 用途: 将当前 Neo4j 数据库导出为 Cypher 语句,可在其他 Neo4j 实例中执行

EXPORT_DIR="/workspaces/smart-telecom-ontology-engine/neo4j_export"
NODES_FILE="$EXPORT_DIR/01_nodes.cypher"
RELS_FILE="$EXPORT_DIR/02_relationships.cypher"

# 创建导出目录
mkdir -p "$EXPORT_DIR"
rm -f "$NODES_FILE" "$RELS_FILE"

echo "==================================="
echo "Neo4j 数据导出工具"
echo "==================================="
echo ""

# 统计数据
echo "📊 统计数据..."
NODE_COUNT=$(docker exec neo4j cypher-shell -u neo4j -p neo4j_test_pass \
"MATCH (n) RETURN count(n) as count" --format plain | tail -1)
REL_COUNT=$(docker exec neo4j cypher-shell -u neo4j -p neo4j_test_pass \
"MATCH ()-[r]->() RETURN count(r) as count" --format plain | tail -1)

echo "  节点数量: $NODE_COUNT"
echo "  关系数量: $REL_COUNT"
echo ""

# 导出节点为 CREATE 语句
echo "📦 正在导出所有数据..."

echo "// 节点创建语句" > "$NODES_FILE"
echo "// 执行此脚本前请确保数据库为空" >> "$NODES_FILE"
echo "" >> "$NODES_FILE"

# 使用 APOC 或原生 Cypher 生成 CREATE 语句
docker exec neo4j cypher-shell -u neo4j -p neo4j_test_pass --format plain << 'CYPHER' >> "$NODES_FILE"
MATCH (n)
WITH n, 
     labels(n) as lbls, 
     [key IN keys(n) | key + ': ' + 
       CASE 
         WHEN n[key] =~ '^http.*' THEN '"' + n[key] + '"'
         WHEN toString(n[key]) =~ '^[0-9]+$' THEN toString(n[key])
         WHEN toString(n[key]) IN ['true', 'false'] THEN toString(n[key])
         ELSE '"' + replace(replace(toString(n[key]), '\\', '\\\\'), '"', '\\"') + '"'
       END
     ] as propStrs
RETURN 'CREATE (' + 
       CASE WHEN size(lbls) > 0 THEN reduce(s = '', lbl IN lbls | s + ':' + lbl) ELSE '' END +
       CASE WHEN size(propStrs) > 0 THEN ' {' + reduce(s = '', i IN range(0, size(propStrs)-1) | 
         s + CASE WHEN i > 0 THEN ', ' ELSE '' END + propStrs[i]) + '}' ELSE '' END +
       ');' as statement;
CYPHER

# 导出关系为 MATCH...CREATE 语句
echo "// 关系创建语句" > "$RELS_FILE"
echo "// 请先执行 01_nodes.cypher" >> "$RELS_FILE"
echo "" >> "$RELS_FILE"

docker exec neo4j cypher-shell -u neo4j -p neo4j_test_pass --format plain << 'CYPHER' >> "$RELS_FILE"
MATCH (a)-[r]->(b)
WITH a, r, b, type(r) as relType,
     [key IN keys(r) | key + ': ' + 
       CASE 
         WHEN r[key] =~ '^http.*' THEN '"' + r[key] + '"'
         WHEN toString(r[key]) =~ '^[0-9]+$' THEN toString(r[key])
         WHEN toString(r[key]) IN ['true', 'false'] THEN toString(r[key])
         ELSE '"' + replace(replace(toString(r[key]), '\\', '\\\\'), '"', '\\"') + '"'
       END
     ] as propStrs
WHERE a.iri IS NOT NULL AND b.iri IS NOT NULL
RETURN 'MATCH (a {iri: "' + a.iri + '"}), (b {iri: "' + b.iri + '"}) ' +
       'CREATE (a)-[r:' + relType + 
       CASE WHEN size(propStrs) > 0 THEN ' {' + reduce(s = '', i IN range(0, size(propStrs)-1) | 
         s + CASE WHEN i > 0 THEN ', ' ELSE '' END + propStrs[i]) + '}' ELSE '' END +
       ']->(b);' as statement;
CYPHER

echo ""
echo "✅ 导出完成!"
echo "📁 导出文件:"
echo "   1. $NODES_FILE"
echo "   2. $RELS_FILE"
echo ""
echo "==================================="
echo "📖 导入到新 Neo4j 的方法:"
echo "==================================="
echo ""
echo "方法 1: 使用 API 接口 (推荐,已有导出功能)"
echo "  访问前端页面 http://localhost:8888"
echo "  点击'从 Neo4j 导出'按钮"
echo "  复制导出的 Turtle 数据"
echo "  在新的 Neo4j 中通过'导入'功能粘贴数据"
echo ""
echo "方法 2: 使用 cypher-shell"
echo "  # 导入节点"
echo "  cat $NODES_FILE | docker exec -i <新容器名> cypher-shell -u neo4j -p <密码>"
echo "  # 导入关系"  
echo "  cat $RELS_FILE | docker exec -i <新容器名> cypher-shell -u neo4j -p <密码>"
echo ""
echo "方法 3: 使用 Neo4j Browser"
echo "  1. 访问新 Neo4j 的 http://localhost:7474"
echo "  2. 依次复制粘贴两个文件的内容到查询框执行"
echo ""
echo "方法 4: 使用数据库备份 (生产环境推荐)"
echo "  docker exec neo4j neo4j-admin database dump neo4j --to-path=/backups"
echo "  # 在新服务器上:"
echo "  docker exec <新容器> neo4j-admin database load neo4j --from-path=/backups"
echo ""
