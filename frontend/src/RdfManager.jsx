import React, { useState } from 'react'
import './RdfManager.css'

export default function RdfManager() {
  const [turtleData, setTurtleData] = useState('')
  const [importResult, setImportResult] = useState(null)
  const [exportData, setExportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 导入 RDF 数据 (自动检测格式)
  const handleImport = async () => {
    if (!turtleData.trim()) {
      setError('请输入 RDF 数据')
      return
    }

    setLoading(true)
    setError(null)
    setImportResult(null)

    try {
      // 自动检测内容格式
      const trimmed = turtleData.trim()
      let contentType = 'text/turtle' // 默认
      if (trimmed.startsWith('<?xml') || trimmed.startsWith('<rdf:RDF')) {
        contentType = 'application/rdf+xml'
      } else if (trimmed.startsWith('{')) {
        contentType = 'application/ld+json'
      }

      const response = await fetch('/api/rdf/import', {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: turtleData,
      })

      if (response.ok) {
        const result = await response.text()
        setImportResult({
          success: true,
          message: result || '导入成功',
        })
        setTurtleData('')
      } else {
        const errorMsg = await response.text()
        setError(`导入失败: ${errorMsg}`)
        setImportResult({
          success: false,
          message: errorMsg,
        })
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
      setImportResult({
        success: false,
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // 导出 Turtle 数据
  const handleExport = async () => {
    setLoading(true)
    setError(null)
    setExportData(null)

    try {
      const response = await fetch('/api/rdf/export', {
        method: 'GET',
        headers: {
          'Accept': 'text/turtle',
        },
      })

      if (response.ok) {
        const data = await response.text()
        setExportData(data)
      } else {
        const errorMsg = await response.text()
        setError(`导出失败: ${errorMsg}`)
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 下载导出的数据
  const handleDownload = () => {
    if (!exportData) return

    const element = document.createElement('a')
    element.setAttribute('href', `data:text/turtle;charset=utf-8,${encodeURIComponent(exportData)}`)
    element.setAttribute('download', `export_${new Date().getTime()}.ttl`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // 清空输入
  const handleClear = () => {
    setTurtleData('')
    setImportResult(null)
    setError(null)
  }

  // 加载示例数据
  const handleLoadSample = () => {
    const sample = `@prefix : <http://example.org/ont#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# 类（概念）
:User a rdf:Class .
:TransferRequest a rdf:Class .
:Order a rdf:Class .

# 属性
:identifier a rdf:Property .
:sourceIdentifier a rdf:Property .
:targetIdentifier a rdf:Property .
:userConfirmed a rdf:Property .

# 示例数据
:UserA a :User;
      :identifier "1001" .

:UserB a :User;
      :identifier "2002" .

:Req1 a :TransferRequest;
      :sourceIdentifier "1001";
      :targetIdentifier "2002";
      :userConfirmed "true"^^xsd:boolean .`
    setTurtleData(sample)
  }

  return (
    <div className="rdf-manager">
      <h2>RDF 数据管理</h2>

      <div className="container">
        {/* 左侧：导入面板 */}
        <div className="panel import-panel">
          <h3>导入 RDF 数据 (Turtle/RDF-XML/JSON-LD)</h3>

          <div className="textarea-wrapper">
            <textarea
              value={turtleData}
              onChange={(e) => setTurtleData(e.target.value)}
              placeholder="输入 RDF 数据 (支持 Turtle、RDF/XML、JSON-LD 格式)..."
              rows="15"
              className="turtle-input"
            />
          </div>

          <div className="button-group">
            <button
              onClick={handleImport}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '导入中...' : '导入'}
            </button>
            <button
              onClick={handleLoadSample}
              disabled={loading}
              className="btn btn-secondary"
            >
              加载示例
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="btn btn-outline"
            >
              清空
            </button>
          </div>

          {importResult && (
            <div className={`result ${importResult.success ? 'success' : 'error'}`}>
              <strong>{importResult.success ? '✓ 成功' : '✗ 失败'}:</strong>
              <p>{importResult.message}</p>
            </div>
          )}
        </div>

        {/* 右侧：导出面板 */}
        <div className="panel export-panel">
          <h3>导出 Turtle 数据</h3>

          <button
            onClick={handleExport}
            disabled={loading}
            className="btn btn-primary"
            style={{ marginBottom: '12px', width: '100%' }}
          >
            {loading ? '导出中...' : '从 Neo4j 导出'}
          </button>

          {exportData && (
            <div className="export-content">
              <div className="textarea-wrapper">
                <textarea
                  value={exportData}
                  readOnly
                  rows="15"
                  className="turtle-output"
                />
              </div>
              <div className="button-group">
                <button
                  onClick={handleDownload}
                  className="btn btn-success"
                >
                  下载文件
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportData)
                    alert('已复制到剪贴板')
                  }}
                  className="btn btn-secondary"
                >
                  复制
                </button>
              </div>
            </div>
          )}

          {!exportData && !loading && (
            <div className="empty-state">
              <p>点击上方按钮导出 Neo4j 中的数据</p>
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <strong>错误：</strong> {error}
        </div>
      )}
    </div>
  )
}
