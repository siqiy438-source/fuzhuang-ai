# 部署新的销售话术功能

## 已完成的修改

✅ 已更新 `supabase/functions/generate-sales-intro/index.ts` 文件
- 新的 prompt 更加真实、口语化
- 禁止使用空洞的形容词
- 强制要求具体的导购建议
- 低压力的结尾方式

## 部署步骤

### 方式 1：通过 Supabase Dashboard（推荐）

1. 访问 https://supabase.com/dashboard
2. 登录你的账号
3. 选择项目：`qbblaukbjvrgkoyeukou`
4. 在左侧菜单找到 **Edge Functions**
5. 找到 `generate-sales-intro` 函数
6. 点击 **Deploy** 或 **Update**
7. 上传 `supabase/functions/generate-sales-intro/index.ts` 文件

### 方式 2：通过命令行部署

1. 获取 Supabase Access Token：
   - 访问 https://supabase.com/dashboard/account/tokens
   - 生成新的 Access Token
   - 复制 token

2. 设置环境变量并部署：
```bash
export SUPABASE_ACCESS_TOKEN="你的token"
cd /Users/yuansiqi/Desktop/个人/编程/fuzhuang-ai
npx supabase functions deploy generate-sales-intro --no-verify-jwt
```

### 方式 3：使用 Supabase CLI 登录

```bash
cd /Users/yuansiqi/Desktop/个人/编程/fuzhuang-ai
npx supabase login
npx supabase functions deploy generate-sales-intro --no-verify-jwt
```

## 测试步骤

部署完成后：

1. 打开应用：http://localhost:8080/
2. 登录你的账号
3. 进入 **穿搭分析** 页面
4. 上传一张穿搭照片
5. 点击 **分析穿搭**
6. 等待分析完成后，点击 **生成销售话术**
7. 查看新生成的销售话术

## 预期效果

### 之前的话术风格：
```
哇哦，亲爱的顾客！您真是太有眼光了，这件外套真是太有眼光了！
这外套质感很高级，穿上很显气质，整体搭配非常时尚...
```

### 现在的话术风格：
```
这件外套的肩线是立住的，人看着不松垮。

上半身一挺，整个人就精神了。

我一般会建议你里面配浅色，看着更干净。
裤子不用太紧，直一点反而显腿长。

你先穿出来看一眼，合不合适我们再说。
```

## 注意事项

- 部署后可能需要等待 1-2 分钟才能生效
- 如果遇到缓存问题，可以清除浏览器缓存后重试
- 确保 ZENMUX_API_KEY 环境变量已在 Supabase 项目中配置






