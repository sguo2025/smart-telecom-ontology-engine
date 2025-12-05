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
  const [viewMode, setViewMode] = useState('standard') // standard, transfer-process
  const [transferProcessResult, setTransferProcessResult] = useState(null)

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

  // 加载CRM过户流程测试数据
  const handleLoadTransferProcessTest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 加载测试数据
      const testData = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix crm: <http://example.com/crm/transfer#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# 原客户实例（无欠费、无在途单、提供身份证号）
crm:TestOriginalCustomer_001
    a crm:OriginalCustomer ;
    crm:hasIDCardNumber "110101199001011234"^^xsd:string ;
    crm:hasBusinessNumber "13800138000"^^xsd:string ;
    crm:hasArrearsStatus false ;
    crm:hasPendingOrderStatus false .

# 目标客户实例
crm:TestTargetCustomer_001
    a crm:TargetCustomer ;
    crm:hasIDCardNumber "110101199505055678"^^xsd:string ;
    crm:hasBusinessNumber "13900139000"^^xsd:string .

# 过户流程实例（仅关联两个客户，不手工定义步骤）
crm:TestTransferProcess_001
    a crm:TransferProcess ;
    crm:relatesOriginalCustomer crm:TestOriginalCustomer_001 ;
    crm:relatesTargetCustomer crm:TestTargetCustomer_001 .`
      
      setRdfData(testData)
      setViewMode('transfer-process')
      alert('✓ 已加载CRM过户流程测试数据（最小输入）')
    } catch (err) {
      setError(`加载失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 执行过户流程推理
  const handleInferTransferProcess = async () => {
    if (!rdfData.trim()) {
      setError('请输入最小RDF数据（过户流程+原客户+目标客户）')
      return
    }

    setLoading(true)
    setError(null)
    setTransferProcessResult(null)

    try {
      const response = await fetch('/api/reasoning/infer-transfer-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: rdfData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTransferProcessResult(data)
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
    setViewMode('standard')
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

      {/* 视图模式切换 */}
      <div className="view-mode-selector">
        <button
          className={`mode-btn ${viewMode === 'standard' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('standard')
            setTransferProcessResult(null)
          }}
        >
          📊 标准推理
        </button>
        <button
          className={`mode-btn ${viewMode === 'transfer-process' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('transfer-process')
            setResult(null)
          }}
        >
          🔄 CRM过户流程推理
        </button>
      </div>

      <div className="reasoning-container">
        {/* 左侧：输入面板 */}
        <div className="reasoning-panel input-panel">
          <h3>{viewMode === 'transfer-process' ? 'CRM过户流程推理' : '输入配置'}</h3>

          {viewMode === 'transfer-process' ? (
            // CRM过户流程推理模式
            <>
              <div className="info-box" style={{ marginBottom: '16px' }}>
                <strong>🎯 功能说明：</strong>
                <p>从最小输入（过户流程实例 + 原客户 + 目标客户）自动推理出：</p>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  <li>✅ 4个流程步骤（客户定位、目标客户核对、电子签名、订单展示）</li>
                  <li>✅ 验证方式（人证比对/短信验证）</li>
                  <li>✅ 业务规则约束（欠费、在途单）</li>
                  <li>✅ 规则违规检测</li>
                </ul>
              </div>

              <div className="form-group">
                <label>最小RDF输入数据 (Turtle格式):</label>
                <textarea
                  value={rdfData}
                  onChange={(e) => setRdfData(e.target.value)}
                  placeholder="输入最小RDF数据：过户流程实例 + 原客户 + 目标客户"
                  rows="12"
                  disabled={loading}
                  className="form-textarea"
                />
                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={handleLoadTransferProcessTest}
                    disabled={loading}
                    className="btn btn-secondary btn-sm"
                  >
                    📥 加载测试数据
                  </button>
                  <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '8px' }}>
                    加载预定义的最小测试用例
                  </span>
                </div>
              </div>

              <div className="button-group">
                <button
                  onClick={handleInferTransferProcess}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? '推理中...' : '🚀 推理完整流程'}
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  清空
                </button>
              </div>
            </>
          ) : (
            // 标准推理模式
            <>
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
            </>
          )}
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

          {!loading && !result && !transferProcessResult && !error && (
            <div className="empty-state">
              <p>{viewMode === 'transfer-process' ? '加载测试数据并点击"推理完整流程"' : '配置推理参数并点击"执行推理"'}</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>❌ 错误:</strong> {error}
            </div>
          )}

          {/* CRM过户流程推理结果 */}
          {transferProcessResult && viewMode === 'transfer-process' && (
            <div className="result-content">
              {/* 标签页 */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  📊 推理统计
                </button>
                <button
                  className={`tab ${activeTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setActiveTab('steps')}
                >
                  🔄 流程步骤
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
                    <div className="stat-value" style={{ fontSize: '12px' }}>
                      {transferProcessResult.reasonerType}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">原始三元组</div>
                    <div className="stat-value">{transferProcessResult.originalTriples}</div>
                  </div>
                  <div className="stat-card highlight">
                    <div className="stat-label">推理后三元组</div>
                    <div className="stat-value">{transferProcessResult.inferredTriples}</div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-label">新增三元组</div>
                    <div className="stat-value">+{transferProcessResult.newTriples}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">推理出的步骤数</div>
                    <div className="stat-value">{transferProcessResult.inferredStepCount}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">执行时间</div>
                    <div className="stat-value">{transferProcessResult.executionTime} ms</div>
                  </div>
                  <div className={`stat-card ${transferProcessResult.hasViolations ? 'error' : 'success'}`}>
                    <div className="stat-label">规则违规</div>
                    <div className="stat-value">
                      {transferProcessResult.hasViolations ? '⚠️ 有违规' : '✅ 无违规'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'steps' && (
                <div className="steps-view">
                  <h4>推理出的流程步骤</h4>
                  {transferProcessResult.inferredSteps && transferProcessResult.inferredSteps.length > 0 ? (
                    <div className="steps-list">
                      {transferProcessResult.inferredSteps.map((step, index) => (
                        <div key={index} className="step-item">
                          <div className="step-number">{index + 1}</div>
                          <div className="step-name">{step}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>未推理出任何步骤</p>
                  )}

                  {transferProcessResult.hasViolations && (
                    <div className="violations-section" style={{ marginTop: '24px' }}>
                      <h4 style={{ color: '#e74c3c' }}>⚠️ 业务规则违规</h4>
                      <div className="violations-list">
                        {transferProcessResult.ruleViolations.map((violation, index) => (
                          <div key={index} className="violation-item">
                            <span className="violation-icon">⚠️</span>
                            <span className="violation-name">{violation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!transferProcessResult.hasViolations && (
                    <div className="success-message" style={{ marginTop: '24px' }}>
                      <p>✅ 流程满足所有业务规则约束</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'result' && (
                <div className="data-view">
                  <textarea
                    value={transferProcessResult.resultData}
                    readOnly
                    rows="20"
                    className="form-textarea result-textarea"
                  />
                  <div className="button-group">
                    <button
                      onClick={() => handleDownload(transferProcessResult.resultData, `transfer_process_result_${Date.now()}.ttl`)}
                      className="btn btn-success btn-sm"
                    >
                      💾 下载
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transferProcessResult.resultData)
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

          {/* 标准推理结果 */}
          {result && viewMode === 'standard' && (
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
