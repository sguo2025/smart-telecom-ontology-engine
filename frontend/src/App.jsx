import React, { useEffect, useState } from 'react'
import RdfManager from './RdfManager'
import './App.css'

export default function App() {
  const [msg, setMsg] = useState('...')

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
        <div className="nav-item active">📊 RDF 管理</div>
        <div className="nav-item">🔗 知识图谱</div>
        <div className="nav-item">⚙️ 推理引擎</div>
      </nav>

      <main className="app-main">
        <RdfManager />
      </main>

      <footer className="app-footer">
        <p>Smart Telecom Ontology Engine © 2025 | 基于 Apache Jena + Neo4j</p>
      </footer>
    </div>
  )
}
