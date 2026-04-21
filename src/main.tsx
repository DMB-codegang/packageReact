import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { env } from 'onnxruntime-web'
import './index.css'

// 配置 ONNX Runtime WASM 文件路径
// 必须在任何使用 onnxruntime-web 的模块导入之前设置
env.wasm.wasmPaths = '/wasm/'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
