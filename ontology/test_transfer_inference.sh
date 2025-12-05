#!/bin/bash

# =============================================================================
# CRM过户流程推理测试脚本
# 测试从最小输入推理出完整流程步骤的能力
# =============================================================================

echo "========================================"
echo "CRM过户流程推理测试"
echo "========================================"
echo ""

# 后端API地址
API_URL="http://localhost:8080/api/reasoning"

# 测试文件路径
TEST_FILE="/workspaces/smart-telecom-ontology-engine/ontology/test-minimal-input.ttl"

# 检查测试文件是否存在
if [ ! -f "$TEST_FILE" ]; then
    echo "❌ 错误: 测试文件不存在: $TEST_FILE"
    exit 1
fi

echo "📁 测试文件: $TEST_FILE"
echo ""

# 读取测试数据
TEST_DATA=$(cat "$TEST_FILE")

echo "========================================"
echo "测试1: 验证推理规则文件"
echo "========================================"
RULES=$(cat /workspaces/smart-telecom-ontology-engine/ontology/transfer-process-rules.rules)
echo "✅ 推理规则文件加载成功"
echo "规则行数: $(echo "$RULES" | wc -l)"
echo ""

echo "========================================"
echo "测试2: 执行推理（从最小输入推理完整流程）"
echo "========================================"
echo "输入数据："
echo "$TEST_DATA" | head -20
echo "..."
echo ""

# 调用推理API
echo "正在调用推理API..."
RESPONSE=$(curl -s -X POST "$API_URL/infer-transfer-process" \
  -H "Content-Type: text/plain" \
  --data-binary "@$TEST_FILE")

echo ""
echo "推理结果："
echo "$RESPONSE" | jq '.'

# 提取关键信息
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
ORIGINAL_TRIPLES=$(echo "$RESPONSE" | jq -r '.originalTriples')
INFERRED_TRIPLES=$(echo "$RESPONSE" | jq -r '.inferredTriples')
NEW_TRIPLES=$(echo "$RESPONSE" | jq -r '.newTriples')
INFERRED_STEP_COUNT=$(echo "$RESPONSE" | jq -r '.inferredStepCount')
INFERRED_STEPS=$(echo "$RESPONSE" | jq -r '.inferredSteps[]')
HAS_VIOLATIONS=$(echo "$RESPONSE" | jq -r '.hasViolations')
EXECUTION_TIME=$(echo "$RESPONSE" | jq -r '.executionTime')

echo ""
echo "========================================"
echo "推理统计"
echo "========================================"
echo "✅ 推理成功: $SUCCESS"
echo "📊 原始三元组数: $ORIGINAL_TRIPLES"
echo "📊 推理后三元组数: $INFERRED_TRIPLES"
echo "🆕 新增三元组数: $NEW_TRIPLES"
echo "⏱️  执行时间: ${EXECUTION_TIME}ms"
echo ""

echo "========================================"
echo "推理出的流程步骤"
echo "========================================"
echo "步骤数量: $INFERRED_STEP_COUNT"
echo "步骤列表:"
echo "$INFERRED_STEPS" | while read step; do
    echo "  - $step"
done
echo ""

echo "========================================"
echo "业务规则违规检测"
echo "========================================"
if [ "$HAS_VIOLATIONS" == "true" ]; then
    echo "⚠️  检测到业务规则违规:"
    VIOLATIONS=$(echo "$RESPONSE" | jq -r '.ruleViolations[]')
    echo "$VIOLATIONS" | while read violation; do
        echo "  - $violation"
    done
else
    echo "✅ 无业务规则违规"
fi
echo ""

echo "========================================"
echo "验证推理结果"
echo "========================================"

# 检查是否推理出4个步骤
if [ "$INFERRED_STEP_COUNT" == "4" ]; then
    echo "✅ 成功推理出4个流程步骤"
else
    echo "❌ 推理步骤数量不正确，预期4个，实际${INFERRED_STEP_COUNT}个"
fi

# 检查是否推理出新三元组
if [ "$NEW_TRIPLES" -gt "0" ]; then
    echo "✅ 成功推理出${NEW_TRIPLES}个新三元组"
else
    echo "❌ 未推理出新三元组"
fi

# 保存推理结果到文件（使用时间戳避免覆盖）
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_DIR="/tmp/ontology-test-results"
mkdir -p "$RESULT_DIR"
RESULT_FILE="$RESULT_DIR/inference-result-${TIMESTAMP}.ttl"
echo "$RESPONSE" | jq -r '.resultData' > "$RESULT_FILE"
echo "💾 推理结果已保存到: $RESULT_FILE"

echo ""
echo "========================================"
echo "测试完成！"
echo "========================================"
