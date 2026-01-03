import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 全局错误处理，捕获未处理的错误
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
});

// 确保 root 元素存在
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('找不到 root 元素');
}
