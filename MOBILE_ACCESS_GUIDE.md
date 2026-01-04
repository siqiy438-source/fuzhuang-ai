# 手机访问网站故障排查指南

## 问题诊断

您的开发服务器已成功启动，可以通过以下地址访问：
- **本地访问**: http://localhost:8080/
- **手机访问**: http://192.168.3.50:8080/

## 已修复的问题

✅ **Vite 配置优化**
- 将 `host` 从 `"::"` (IPv6) 改为 `"0.0.0.0"` (IPv4)
- 添加了 CORS 支持
- 这样可以更好地支持移动设备访问

## 手机无法访问的常见原因及解决方案

### 1. 🔥 防火墙阻止 (最常见)

**检查方法：**
```bash
# 检查防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 检查端口是否被监听
lsof -i :8080
```

**解决方案：**
- 打开 **系统设置** → **网络** → **防火墙**
- 临时关闭防火墙测试，或者
- 添加 Node.js/Vite 到允许列表

### 2. 📱 手机和电脑不在同一网络

**检查方法：**
- 确认手机连接的 WiFi 名称
- 确认电脑连接的 WiFi 名称
- 两者必须相同

**您的电脑 IP：** `192.168.3.50`

**手机访问地址：** http://192.168.3.50:8080/

### 3. 🌐 网络隔离 (企业/公共 WiFi)

某些企业或公共 WiFi 会隔离设备间的通信。

**解决方案：**
- 使用个人热点
- 或使用家庭 WiFi

### 4. 🔒 HTTPS 混合内容问题

如果您的网站需要 HTTPS，但开发环境是 HTTP，可能导致某些功能无法使用。

**解决方案：**
```bash
# 安装 mkcert 创建本地 HTTPS 证书
brew install mkcert
mkcert -install
mkcert localhost 192.168.3.50
```

然后更新 `vite.config.ts`：
```typescript
server: {
  https: {
    key: './localhost+1-key.pem',
    cert: './localhost+1.pem',
  },
  host: "0.0.0.0",
  port: 8080,
}
```

### 5. 📦 环境变量缺失

检查 `.env.local` 文件是否包含必要的配置：

```bash
cat .env.local
```

应该包含：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 6. 🍎 iOS Safari 特殊问题

iOS Safari 可能有缓存或安全限制。

**解决方案：**
- 清除 Safari 缓存
- 使用无痕浏览模式
- 尝试使用 Chrome 浏览器

## 快速测试步骤

### 步骤 1：测试电脑本地访问
```bash
# 在电脑浏览器打开
open http://localhost:8080/
```
✅ 如果能打开，说明服务器正常运行

### 步骤 2：测试网络连接
```bash
# 在手机浏览器输入
http://192.168.3.50:8080/
```

### 步骤 3：如果还是打不开，检查防火墙
```bash
# 临时关闭防火墙测试（测试完记得开启）
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# 测试完后重新开启
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### 步骤 4：检查端口是否被正确监听
```bash
# 查看 8080 端口状态
netstat -an | grep 8080

# 或使用 lsof
lsof -i :8080
```

## 调试工具

### 在手机上查看控制台错误

**iOS (Safari):**
1. 在 Mac 上打开 Safari
2. Safari → 偏好设置 → 高级 → 勾选"在菜单栏中显示开发菜单"
3. 手机连接 Mac
4. 开发 → [您的 iPhone] → 选择网页

**Android (Chrome):**
1. 手机开启开发者选项和 USB 调试
2. 连接电脑
3. Chrome 访问 `chrome://inspect`
4. 查看设备上的页面

## 生产环境部署

如果开发环境问题太多，可以考虑部署到生产环境：

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

或者部署到 Lovable/Vercel/Netlify 等平台，通过公网访问。

## 当前服务器状态

✅ 开发服务器已启动
✅ 监听地址: 0.0.0.0:8080
✅ 本地访问: http://localhost:8080/
✅ 网络访问: http://192.168.3.50:8080/

## 需要帮助？

如果以上方法都无法解决，请提供以下信息：
1. 手机浏览器显示的错误信息（截图）
2. 手机连接的 WiFi 名称
3. 电脑连接的 WiFi 名称
4. 防火墙状态
5. 手机操作系统版本（iOS/Android）




