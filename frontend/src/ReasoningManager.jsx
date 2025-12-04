import React, { useState, useEffect } from 'react'
import './ReasoningManager.css'

export default function ReasoningManager() {
  const [rdfData, setRdfData] = useState('')
  const [reasonerType, setReasonerType] = useState('RDFS')
  const [customRules, setCustomRules] = useState('')
  const [saveToNeo4j, setSaveToNeo4j] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [reasonerTypes, setReasonerTypes] = useState({})
  const [examples, setExamples] = useState({})
  const [showRules, setShowRules] = useState(false)
  const [activeTab, setActiveTab] = useState('result') // result, inferred, stats
  const [useNeo4jData, setUseNeo4jData] = useState(false)

  useEffect(() => {
    // 加载推理器类型
    fetch('/api/reasoning/reasoner-types')
      .then(res => res.json())
      .then(data => setReasonerTypes(data.types || {}))
      .catch(err => console.error('加载推理器类型失败:', err))

    // 加载示例
    fetch('/api/reasoning/examples')
      .then(res => res.json())
      .then(data => setExamples(data))
      .catch(err => console.error('加载示例失败:', err))
  }, [])

  // 当推理器类型改变时,自动显示/隐藏自定义规则区域
  useEffect(() => {
    setShowRules(reasonerType === 'CUSTOM')
  }, [reasonerType])

  // 从 Neo4j 加载数据
  const handleLoadFromNeo4j = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rdf/export', {
        method: 'GET',
        headers: {
          'Accept': 'text/turtle',
        },
      })

      if (response.ok) {
        const data = await response.text()
        if (data && data.trim()) {
          setRdfData(data)
          setUseNeo4jData(true)
          alert('✓ 已从 Neo4j 加载数据')
        } else {
          setError('Neo4j 中没有数据，请先导入 RDF 数据')
        }
      } else {
        const errorMsg = await response.text()
        setError(`从 Neo4j 加载失败: ${errorMsg}`)
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 执行推理
  const handleExecuteReasoning = async () => {
    // 如果选择从 Neo4j 使用数据，允许空的 rdfData
    if (!useNeo4jData && !rdfData.trim()) {
      setError('请输入 RDF 数据或从 Neo4j 加载')
      return
    }

    if (reasonerType === 'CUSTOM' && !customRules.trim()) {
      setError('自定义推理器需要提供推理规则')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/reasoning/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rdfData: useNeo4jData ? '' : rdfData,
          reasonerType,
          customRules: reasonerType === 'CUSTOM' ? customRules : '',
          saveToNeo4j,
          useNeo4jData,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult(data)
        setActiveTab('stats')
      } else {
        setError(data.error || '推理执行失败')
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 验证规则
  const handleValidateRules = async () => {
    if (!customRules.trim()) {
      setError('请输入推理规则')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reasoning/validate-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: customRules,
      })

      const data = await response.json()

      if (data.valid) {
        alert(`✓ 规则验证成功!\n共 ${data.ruleCount} 条规则`)
      } else {
        setError(`规则验证失败: ${data.error}`)
      }
    } catch (err) {
      setError(`验证失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 加载示例
  const handleLoadExample = (exampleKey) => {
    const example = examples[exampleKey]
    if (!example) return

    setRdfData(example)
    
    // 自定义规则示例特殊处理
    if (exampleKey === 'custom_family' || exampleKey === 'telecom_transfer') {
      setReasonerType('CUSTOM')
      setCustomRules(example)
      setRdfData('') // 清空 RDF 数据区,让用户自己输入测试数据
    } else {
      setReasonerType('RDFS')
    }
  }

  // 清空
  const handleClear = () => {
    setRdfData('')
    setCustomRules('')
    setResult(null)
    setError(null)
  }

  // 下载结果
  const handleDownload = (data, filename) => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/turtle;charset=utf-8,${encodeURIComponent(data)}`)
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="reasoning-manager">
      <h2>🧠 逻辑推理引擎</h2>

      <div className="reasoning-container">
        {/* 左侧：输入面板 */}
        <div className="reasoning-panel input-panel">
          <h3>输入配置</h3>

          {/* 推理器类型选择 */}
          <div className="form-group">
            <label>推理器类型:</label>
            <select
              value={reasonerType}
              onChange={(e) => setReasonerType(e.target.value)}
              disabled={loading}
              className="form-select"
            >
              {Object.entries(reasonerTypes).map(([type, desc]) => (
                <option key={type} value={type}>
                  {type} - {desc}
                </option>
              ))}
            </select>
          </div>

          {/* RDF 数据输入 */}
          <div className="form-group">
            <label>
              RDF 数据 (Turtle/RDF-XML/JSON-LD):
              {useNeo4jData && <span style={{ color: '#27ae60', marginLeft: '8px', fontSize: '13px' }}>✓ 使用 Neo4j 数据</span>}
            </label>
            <textarea
              value={rdfData}
              onChange={(e) => {
                setRdfData(e.target.value)
                setUseNeo4jData(false)
              }}
              placeholder="输入 RDF 数据，或点击下方按钮从 Neo4j 加载..."
              rows="10"
              disabled={loading}
              className="form-textarea"
            />
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={handleLoadFromNeo4j}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ marginRight: '8px' }}
              >
                📥 从 Neo4j 加载数据
              </button>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                加载之前导入到图数据库的 RDF 数据
              </span>
            </div>
          </div>

          {/* 自定义规则输入 (仅当选择 CUSTOM 时显示) */}
          {showRules && (
            <div className="form-group">
              <label>自定义推理规则 (Jena Rules):</label>
              <textarea
                value={customRules}
                onChange={(e) => setCustomRules(e.target.value)}
                placeholder="[ruleName: (?x prop ?y) -> (?x newProp ?y)]"
                rows="6"
                disabled={loading}
                className="form-textarea rules-textarea"
              />
              <button
                onClick={handleValidateRules}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                验证规则
              </button>
            </div>
          )}

          {/* 选项 */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={saveToNeo4j}
                onChange={(e) => setSaveToNeo4j(e.target.checked)}
                disabled={loading}
              />
              推理后保存到 Neo4j
            </label>
          </div>

          {/* 操作按钮 */}
          <div className="button-group">
            <button
              onClick={handleExecuteReasoning}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '推理中...' : '🚀 执行推理'}
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="btn btn-outline"
            >
              清空
            </button>
          </div>

          {/* 示例加载 */}
          <div className="examples-section">
            <h4>示例数据</h4>
            <div className="example-buttons">
              {Object.keys(examples).map((key) => (
                <button
                  key={key}
                  onClick={() => handleLoadExample(key)}
                  disabled={loading}
                  className="btn btn-sm btn-secondary"
                >
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：结果面板 */}
        <div className="reasoning-panel result-panel">
          <h3>推理结果</h3>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>推理计算中...</p>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="empty-state">
              <p>配置推理参数并点击"执行推理"</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>❌ 错误:</strong> {error}
            </div>
          )}

          {result && (
            <div className="result-content">
              {/* 标签页 */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  📊 统计
                </button>
                <button
                  className={`tab ${activeTab === 'result' ? 'active' : ''}`}
                  onClick={() => setActiveTab('result')}
                >
                  📄 完整结果
                </button>
              </div>

              {/* 标签页内容 */}
              {activeTab === 'stats' && (
                <div className="stats-view">
                  <div className="stat-card">
                    <div className="stat-label">推理器类型</div>
                    <div className="stat-value">{result.reasonerType}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">原始三元组</div>
                    <div className="stat-value">{result.originalTriples}</div>
                  </div>
                  <div className="stat-card highlight">
                    <div className="stat-label">推理后三元组</div>
                    <div className="stat-value">{result.inferredTriples}</div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-label">新增三元组</div>
                    <div className="stat-value">+{result.newTriples}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">执行时间</div>
                    <div className="stat-value">{result.executionTime} ms</div>
                  </div>
                  {result.savedToNeo4j !== undefined && (
                    <div className="stat-card">
                      <div className="stat-label">保存到 Neo4j</div>
                      <div className="stat-value">
                        {result.savedToNeo4j ? '✓ 成功' : '✗ 失败'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'result' && (
                <div className="data-view">
                  <textarea
                    value={result.resultData}
                    readOnly
                    rows="20"
                    className="form-textarea result-textarea"
                  />
                  <div className="button-group">
                    <button
                      onClick={() => handleDownload(result.resultData, `reasoning_result_${Date.now()}.ttl`)}
                      className="btn btn-success btn-sm"
                    >
                      💾 下载
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.resultData)
                        alert('已复制到剪贴板')
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      📋 复制
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
