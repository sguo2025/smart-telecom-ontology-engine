import React, { useState, useEffect, useRef } from 'react'
import './GraphVisualization.css'

export default function GraphVisualization() {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [stats, setStats] = useState({ nodes: 0, relationships: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('force') // force, tree, circular
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // 加载图数据
  const loadGraphData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rdf/graph-data')
      if (response.ok) {
        const data = await response.json()
        setGraphData(data)
        setStats({
          nodes: data.nodes.length,
          relationships: data.relationships.length
        })
      } else {
        setError('加载图数据失败')
      }
    } catch (err) {
      setError(`网络错误: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGraphData()
  }, [])

  // 简化的力导向图渲染
  useEffect(() => {
    if (!graphData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // 初始化节点位置
    const nodes = graphData.nodes.map((node, i) => ({
      ...node,
      x: width / 2 + Math.random() * 200 - 100,
      y: height / 2 + Math.random() * 200 - 100,
      vx: 0,
      vy: 0,
      radius: 20
    }))

    const links = graphData.relationships.map(rel => ({
      source: nodes.find(n => n.id === rel.source),
      target: nodes.find(n => n.id === rel.target),
      type: rel.type
    })).filter(l => l.source && l.target)

    let isDragging = false
    let draggedNode = null

    // 力导向布局
    const simulate = () => {
      // 排斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 1000 / (dist * dist)
          
          nodes[i].vx -= (dx / dist) * force
          nodes[i].vy -= (dy / dist) * force
          nodes[j].vx += (dx / dist) * force
          nodes[j].vy += (dy / dist) * force
        }
      }

      // 引力（链接）
      links.forEach(link => {
        const dx = link.target.x - link.source.x
        const dy = link.target.y - link.source.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 100) * 0.01

        link.source.vx += (dx / dist) * force
        link.source.vy += (dy / dist) * force
        link.target.vx -= (dx / dist) * force
        link.target.vy -= (dy / dist) * force
      })

      // 中心引力
      nodes.forEach(node => {
        const dx = width / 2 - node.x
        const dy = height / 2 - node.y
        node.vx += dx * 0.001
        node.vy += dy * 0.001
      })

      // 更新位置
      nodes.forEach(node => {
        if (!isDragging || node !== draggedNode) {
          node.x += node.vx
          node.y += node.vy
          node.vx *= 0.85
          node.vy *= 0.85

          // 边界检测
          if (node.x < node.radius) node.x = node.radius
          if (node.x > width - node.radius) node.x = width - node.radius
          if (node.y < node.radius) node.y = node.radius
          if (node.y > height - node.radius) node.y = height - node.radius
        }
      })
    }

    // 渲染
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 绘制链接
      ctx.strokeStyle = '#95a5a6'
      ctx.lineWidth = 2
      links.forEach(link => {
        ctx.beginPath()
        ctx.moveTo(link.source.x, link.source.y)
        ctx.lineTo(link.target.x, link.target.y)
        ctx.stroke()

        // 绘制关系类型标签
        const mx = (link.source.x + link.target.x) / 2
        const my = (link.source.y + link.target.y) / 2
        ctx.fillStyle = '#7f8c8d'
        ctx.font = '10px Arial'
        ctx.fillText(link.type.split('#').pop(), mx, my - 5)
      })

      // 绘制节点
      nodes.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id
        const nodeColor = getNodeColor(node.labels)

        // 节点圆圈
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI)
        ctx.fillStyle = nodeColor
        ctx.fill()
        ctx.strokeStyle = isSelected ? '#e74c3c' : '#2c3e50'
        ctx.lineWidth = isSelected ? 3 : 1
        ctx.stroke()

        // 节点标签
        ctx.fillStyle = '#2c3e50'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        const label = node.properties?.label || node.labels?.[0] || node.id
        ctx.fillText(label.substring(0, 15), node.x, node.y + node.radius + 15)
      })

      simulate()
      animationRef.current = requestAnimationFrame(render)
    }

    // 鼠标事件
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const node = nodes.find(n => {
        const dx = x - n.x
        const dy = y - n.y
        return Math.sqrt(dx * dx + dy * dy) < n.radius
      })

      if (node) {
        isDragging = true
        draggedNode = node
        setSelectedNode(node)
      } else {
        setSelectedNode(null)
      }
    }

    const handleMouseMove = (e) => {
      if (isDragging && draggedNode) {
        const rect = canvas.getBoundingClientRect()
        draggedNode.x = e.clientX - rect.left
        draggedNode.y = e.clientY - rect.top
        draggedNode.vx = 0
        draggedNode.vy = 0
      }
    }

    const handleMouseUp = () => {
      isDragging = false
      draggedNode = null
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [graphData, selectedNode, viewMode])

  // 节点颜色映射
  const getNodeColor = (labels) => {
    if (!labels || labels.length === 0) return '#95a5a6'
    const label = labels[0].toLowerCase()
    
    if (label.includes('class')) return '#3498db'
    if (label.includes('property')) return '#2ecc71'
    if (label.includes('individual') || label.includes('instance')) return '#e74c3c'
    if (label.includes('ontology')) return '#9b59b6'
    return '#f39c12'
  }

  // 搜索节点
  const handleSearch = () => {
    if (!searchQuery.trim() || !graphData) return

    const found = graphData.nodes.find(node => 
      JSON.stringify(node).toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (found) {
      setSelectedNode(found)
    } else {
      alert('未找到匹配的节点')
    }
  }

  return (
    <div className="graph-visualization">
      <div className="graph-header">
        <h2>🔗 知识图谱可视化</h2>
        <div className="graph-controls">
          <button onClick={loadGraphData} disabled={loading} className="btn-primary">
            {loading ? '⏳ 加载中...' : '🔄 刷新'}
          </button>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索节点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>🔍</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="graph-body">
        <div className="graph-sidebar">
          <div className="stats-panel">
            <h3>📊 图统计</h3>
            <div className="stat-item">
              <span>节点数:</span>
              <strong>{stats.nodes}</strong>
            </div>
            <div className="stat-item">
              <span>关系数:</span>
              <strong>{stats.relationships}</strong>
            </div>
          </div>

          <div className="legend-panel">
            <h3>🎨 图例</h3>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#3498db' }}></div>
              <span>类 (Class)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#2ecc71' }}></div>
              <span>属性 (Property)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#e74c3c' }}></div>
              <span>实例 (Individual)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#9b59b6' }}></div>
              <span>本体 (Ontology)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#f39c12' }}></div>
              <span>其他</span>
            </div>
          </div>

          {selectedNode && (
            <div className="node-details">
              <h3>📋 节点详情</h3>
              <div className="detail-item">
                <strong>ID:</strong>
                <span>{selectedNode.id}</span>
              </div>
              <div className="detail-item">
                <strong>标签:</strong>
                <span>{selectedNode.labels?.join(', ') || 'N/A'}</span>
              </div>
              {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                <div className="detail-item">
                  <strong>属性:</strong>
                  <div className="properties-list">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="property-item">
                        <span className="prop-key">{key}:</span>
                        <span className="prop-value">{String(value).substring(0, 50)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="graph-canvas-container">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>加载图数据中...</p>
            </div>
          ) : graphData ? (
            <>
              <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                className="graph-canvas"
              />
              <div className="graph-hint">
                💡 提示: 拖动节点可以调整位置，点击节点查看详情
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>📭 暂无图数据</h3>
              <p>请先导入 RDF 数据到 Neo4j</p>
              <button onClick={() => window.location.hash = 'rdf'} className="btn-secondary">
                前往 RDF 管理
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="graph-footer">
        <p>
          提示: 您也可以访问 
          <a href="http://localhost:7474" target="_blank" rel="noopener noreferrer">
            Neo4j Browser
          </a>
          查看完整图谱
        </p>
      </div>
    </div>
  )
}
