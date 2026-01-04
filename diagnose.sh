#!/bin/bash

echo "🔍 手机访问故障诊断工具"
echo "================================"
echo ""

# 1. 检查服务器是否运行
echo "1️⃣ 检查开发服务器状态..."
if lsof -i :8080 > /dev/null 2>&1; then
    echo "   ✅ 服务器正在运行 (端口 8080)"
    lsof -i :8080 | grep LISTEN
else
    echo "   ❌ 服务器未运行！请先执行: npm run dev"
    exit 1
fi
echo ""

# 2. 获取本机 IP
echo "2️⃣ 获取本机 IP 地址..."
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "   📍 本机 IP: $LOCAL_IP"
echo "   📱 手机访问地址: http://$LOCAL_IP:8080/"
echo ""

# 3. 检查防火墙状态
echo "3️⃣ 检查防火墙状态..."
FIREWALL_STATUS=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)
echo "   $FIREWALL_STATUS"
if [[ $FIREWALL_STATUS == *"enabled"* ]]; then
    echo "   ⚠️  防火墙已启用，可能阻止手机访问"
    echo "   💡 建议：临时关闭防火墙测试，或添加 Node.js 到允许列表"
else
    echo "   ✅ 防火墙已关闭"
fi
echo ""

# 4. 检查网络接口
echo "4️⃣ 检查网络连接..."
WIFI_INTERFACE=$(networksetup -listallhardwareports | grep -A 1 "Wi-Fi" | grep "Device:" | awk '{print $2}')
if [ ! -z "$WIFI_INTERFACE" ]; then
    WIFI_STATUS=$(ifconfig $WIFI_INTERFACE | grep "status:" | awk '{print $2}')
    echo "   WiFi 接口: $WIFI_INTERFACE"
    echo "   WiFi 状态: $WIFI_STATUS"
    
    if [ "$WIFI_STATUS" = "active" ]; then
        echo "   ✅ WiFi 已连接"
    else
        echo "   ❌ WiFi 未连接"
    fi
else
    echo "   ⚠️  未找到 WiFi 接口"
fi
echo ""

# 5. 测试本地访问
echo "5️⃣ 测试本地访问..."
if curl -s http://localhost:8080/ > /dev/null; then
    echo "   ✅ 本地访问正常 (http://localhost:8080/)"
else
    echo "   ❌ 本地访问失败"
fi
echo ""

# 6. 测试网络访问
echo "6️⃣ 测试网络访问..."
if curl -s http://$LOCAL_IP:8080/ > /dev/null; then
    echo "   ✅ 网络访问正常 (http://$LOCAL_IP:8080/)"
else
    echo "   ❌ 网络访问失败"
fi
echo ""

# 7. 检查环境变量
echo "7️⃣ 检查环境变量..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local 文件存在"
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" .env.local; then
        echo "   ✅ Supabase 配置存在"
    else
        echo "   ⚠️  Supabase 配置可能不完整"
    fi
else
    echo "   ⚠️  .env.local 文件不存在"
fi
echo ""

# 8. 生成二维码（如果安装了 qrencode）
echo "8️⃣ 生成访问二维码..."
if command -v qrencode &> /dev/null; then
    qrencode -t ANSIUTF8 "http://$LOCAL_IP:8080/"
    echo "   📱 扫描上方二维码快速访问"
else
    echo "   💡 提示：安装 qrencode 可生成二维码"
    echo "      brew install qrencode"
fi
echo ""

# 总结
echo "================================"
echo "📋 诊断总结"
echo "================================"
echo ""
echo "✅ 如果所有检查都通过，但手机仍无法访问，请检查："
echo "   1. 手机和电脑是否连接同一个 WiFi"
echo "   2. WiFi 是否有设备隔离功能（企业/公共 WiFi 常见）"
echo "   3. 手机浏览器是否显示错误信息"
echo ""
echo "🔧 快速修复命令："
echo "   临时关闭防火墙: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off"
echo "   重新开启防火墙: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on"
echo ""
echo "📱 手机访问地址: http://$LOCAL_IP:8080/"
echo ""




