#!/usr/bin/env python3
"""
Neo4j 数据导出脚本 - 生成可执行的 Cypher 语句
"""
import subprocess
import json
import os

EXPORT_DIR = "/workspaces/smart-telecom-ontology-engine/neo4j_export"
NEO4J_USER = "neo4j"
NEO4J_PASS = "neo4j_test_pass"

os.makedirs(EXPORT_DIR, exist_ok=True)

def run_cypher(query):
    """执行 Cypher 查询并返回结果"""
    cmd = [
        "docker", "exec", "neo4j", "cypher-shell",
        "-u", NEO4J_USER, "-p", NEO4J_PASS,
        "--format", "plain",
        query
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def escape_string(s):
    """转义字符串中的特殊字符"""
    if s is None:
        return ""
    return str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

def format_property_value(value):
    """格式化属性值"""
    if isinstance(value, bool):
        return str(value).lower()
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, str):
        return f'"{escape_string(value)}"'
    else:
        return f'"{escape_string(str(value))}"'

def export_nodes():
    """导出所有节点为 CREATE 语句"""
    print("📦 正在导出节点...")
    
    # 获取所有节点
    query = "MATCH (n) RETURN labels(n) as labels, properties(n) as props"
    output = run_cypher(query)
    
    nodes_file = os.path.join(EXPORT_DIR, "01_nodes.cypher")
    with open(nodes_file, 'w', encoding='utf-8') as f:
        f.write("// 节点创建语句\n")
        f.write("// 执行此脚本前请确保数据库为空\n\n")
        
        lines = output.strip().split('\n')[1:]  # 跳过表头
        for line in lines:
            if not line.strip():
                continue
            
            try:
                # 解析标签和属性
                parts = line.split(', {', 1)
                if len(parts) < 2:
                    continue
                
                # 提取标签
                labels_str = parts[0].strip('[]" ')
                labels = [l.strip('" ') for l in labels_str.split(',') if l.strip()]
                label_part = ':' + ':'.join(labels) if labels else ''
                
                # 提取属性
                props_str = '{' + parts[1]
                props_dict = {}
                
                # 简单解析属性 (假设属性格式为 key: value)
                import re
                prop_matches = re.findall(r'(\w+):\s*([^,}]+)', props_str)
                for key, value in prop_matches:
                    value = value.strip()
                    # 移除引号
                    if value.startswith('"') and value.endswith('"'):
                        props_dict[key] = value[1:-1]
                    else:
                        props_dict[key] = value
                
                # 生成 CREATE 语句
                if props_dict:
                    props_list = [f'{k}: {format_property_value(v)}' for k, v in props_dict.items()]
                    props_part = ' {' + ', '.join(props_list) + '}'
                else:
                    props_part = ''
                
                create_stmt = f"CREATE ({label_part}{props_part});\n"
                f.write(create_stmt)
                
            except Exception as e:
                print(f"⚠️  解析节点失败: {line[:50]}... - {e}")
                continue
    
    print(f"✅ 节点导出完成: {nodes_file}")

def export_relationships():
    """导出所有关系为 MATCH...CREATE 语句"""
    print("📦 正在导出关系...")
    
    # 获取所有关系
    query = """
    MATCH (a)-[r]->(b)
    WHERE a.iri IS NOT NULL AND b.iri IS NOT NULL
    RETURN a.iri as from_iri, type(r) as rel_type, properties(r) as props, b.iri as to_iri
    """
    output = run_cypher(query)
    
    rels_file = os.path.join(EXPORT_DIR, "02_relationships.cypher")
    with open(rels_file, 'w', encoding='utf-8') as f:
        f.write("// 关系创建语句\n")
        f.write("// 请先执行 01_nodes.cypher\n\n")
        
        lines = output.strip().split('\n')[1:]  # 跳过表头
        for line in lines:
            if not line.strip():
                continue
            
            try:
                # 解析: from_iri, rel_type, props, to_iri
                parts = line.split(', ')
                if len(parts) < 3:
                    continue
                
                from_iri = parts[0].strip('" ')
                rel_type = parts[1].strip('" ')
                
                # 提取 to_iri (最后一个逗号后的内容)
                to_iri = parts[-1].strip('" ')
                
                # 提取属性 (如果有)
                props_part = ''
                if len(parts) > 3:
                    props_str = ', '.join(parts[2:-1])
                    if props_str and props_str != '{}':
                        props_part = f' {props_str}'
                
                # 生成 MATCH...CREATE 语句
                match_stmt = f'MATCH (a {{iri: "{from_iri}"}}), (b {{iri: "{to_iri}"}})\n'
                create_stmt = f'CREATE (a)-[:{rel_type}{props_part}]->(b);\n\n'
                
                f.write(match_stmt + create_stmt)
                
            except Exception as e:
                print(f"⚠️  解析关系失败: {line[:50]}... - {e}")
                continue
    
    print(f"✅ 关系导出完成: {rels_file}")

if __name__ == "__main__":
    print("=" * 50)
    print("Neo4j 数据导出工具 (Python 版)")
    print("=" * 50)
    print()
    
    # 统计
    node_count = run_cypher("MATCH (n) RETURN count(n)").strip().split('\n')[-1]
    rel_count = run_cypher("MATCH ()-[r]->() RETURN count(r)").strip().split('\n')[-1]
    
    print(f"📊 统计数据:")
    print(f"   节点数量: {node_count}")
    print(f"   关系数量: {rel_count}")
    print()
    
    export_nodes()
    export_relationships()
    
    print()
    print("=" * 50)
    print("📖 导入到新 Neo4j 的方法:")
    print("=" * 50)
    print()
    print("方法 1: 使用 cypher-shell (推荐)")
    print(f"  cat {EXPORT_DIR}/01_nodes.cypher | docker exec -i <新容器名> cypher-shell -u neo4j -p <密码>")
    print(f"  cat {EXPORT_DIR}/02_relationships.cypher | docker exec -i <新容器名> cypher-shell -u neo4j -p <密码>")
    print()
    print("方法 2: 使用 Neo4j Browser")
    print("  1. 访问 http://localhost:7474")
    print("  2. 依次复制粘贴两个文件的内容执行")
    print()
