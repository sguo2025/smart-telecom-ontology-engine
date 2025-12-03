import React, {useEffect, useState} from 'react'

export default function App(){
  const [msg, setMsg] = useState('...')

  useEffect(()=>{
    fetch('/api/persons/hello')
      .then(r=>r.text())
      .then(t=>setMsg(t))
      .catch(e=>setMsg('无法连接后端'))
  },[])

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>Smart Telecom Frontend</h1>
      <p>后端响应: <strong>{msg}</strong></p>
      <p>开发服务器端口: 8888。后端 API 代理到 `/api`。</p>
    </div>
  )
}
