import React, { useEffect, useState } from 'react'
import RdfManager from './RdfManager'
import ReasoningManager from './ReasoningManager'
import './App.css'

export default function App() {
  const [msg, setMsg] = useState('...')
  const [activeView, setActiveView] = useState('rdf') // rdf, reasoning, graph

  useEffect(() => {
    fetch('/api/persons/hello')
      .then(r => r.text())
      .then(t => setMsg(t))
      .catch(e => setMsg('无法连接后端'))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Smart Telecom Ontology Engine</h1>
          <p className="subtitle">RDF 数据管理与推理平台</p>
        </div>
        <div className="header-status">
          <span className="status-item">后端: <strong>{msg}</strong></span>
          <span className="status-item">端口: 8888 (前端) / 8080 (后端)</span>
        </div>
      </header>

      <nav className="app-nav">
        <div 
          className={`nav-item ${activeView === 'rdf' ? 'active' : ''}`}
          onClick={() => setActiveView('rdf')}
        >
          📊 RDF 管理
        </div>
        <div 
          className={`nav-item ${activeView === 'reasoning' ? 'active' : ''}`}
          onClick={() => setActiveView('reasoning')}
        >
          🧠 推理引擎
        </div>
        <div 
          className={`nav-item ${activeView === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveView('graph')}
        >
          🔗 知识图谱
        </div>
      </nav>

      <main className="app-main">
        {activeView === 'rdf' && <RdfManager />}
        {activeView === 'reasoning' && <ReasoningManager />}
        {activeView === 'graph' && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#95a5a6' }}>
            <h2>🔗 知识图谱可视化</h2>
            <p>功能开发中...</p>
            <p style={{ marginTop: '20px', fontSize: '14px' }}>
              您可以访问 Neo4j Browser 查看图谱: 
              <a href="http://localhost:7474" target="_blank" rel="noopener noreferrer" 
                 style={{ color: '#3498db', marginLeft: '8px' }}>
                http://localhost:7474
              </a>
            </p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Smart Telecom Ontology Engine © 2025 | 基于 Apache Jena + Neo4j</p>
      </footer>
    </div>
  )
}
