import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // react中的路由
import App from './App'
import 'antd/dist/reset.css'

const container = document.getElementById('app');
const root = ReactDOM.createRoot(container)
root.render(
  // 包裹在BrowserRouter
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
