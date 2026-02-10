# KSI360 腾讯云开发部署指南

## 方案概述

使用 **腾讯云开发 TCB (CloudBase)** 部署 KSI360 评价系统，实现：
- 数据云端存储（多端同步）
- 无需服务器运维
- 免费额度足够小团队使用

---

## 部署步骤

### 第 1 步：开通云开发环境

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索 **"云开发"** 或 **"CloudBase"**
3. 点击 **"新建环境"**
4. 选择 **"免费版"**（免费额度：5GB 存储 + 50万次云函数调用/月）
5. 等待环境创建完成（约 1-2 分钟）

### 第 2 步：获取环境 ID

1. 进入刚创建的云开发环境
2. 在右上角找到 **环境 ID**（格式如：`ksi360-xxx`）
3. 复制保存，下一步需要用到

### 第 3 步：配置数据库

1. 在左侧菜单点击 **"数据库"**
2. 点击 **"创建集合"**
3. 集合名称填写：`evaluations`
4. 点击 **"权限设置"**
5. 选择 **"所有用户可读"**（因为是内部评价系统）
6. 保存

### 第 4 步：配置项目

1. 在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的环境 ID：

```
VITE_TCB_ENV_ID=ksi360-xxx  # 替换为你的实际环境 ID
```

### 第 5 步：修改代码使用云服务

编辑 `App.tsx`，将导入从 `storageService` 改为 `cloudStorageService`：

```typescript
// 修改前：
import { saveEvaluation, getEvaluationStats, downloadCSV, clearAllEvaluations, getEvaluations } from './services/storageService';

// 修改后：
import { saveEvaluation, getEvaluationStats, downloadCSV, clearAllEvaluations, getEvaluations } from './services/cloudStorageService';
```

### 第 6 步：部署前端

#### 方式 A：静态网站托管（推荐）

1. 在云开发控制台左侧点击 **"静态网站托管"**
2. 开启静态网站托管服务
3. 安装 CloudBase CLI：

```bash
npm install -g @cloudbase/cli
```

4. 登录 CLI：

```bash
tcb login
```

5. 构建项目：

```bash
npm run build
```

6. 部署到云开发：

```bash
tcb hosting deploy dist -e ksi360-xxx  # 替换为你的环境 ID
```

7. 在 **"静态网站托管"** 页面找到访问链接，即可使用

#### 方式 B：使用云开发 Web 应用托管

1. 在云开发控制台点击 **"应用"** → **"Web 应用托管"**
2. 选择 **"从代码库导入"** 或 **"本地上传"**
3. 按向导完成部署

---

## 数据迁移（可选）

如果你已有 localStorage 数据需要迁移到云端：

1. 在当前浏览器打开应用（使用旧的 storageService）
2. 在浏览器控制台执行：

```javascript
const data = localStorage.getItem('ksi360_evaluations_v2');
console.log(data); // 复制这段 JSON 数据
```

3. 切换到 cloudStorageService 后，创建一个迁移脚本导入数据

---

## 费用说明

| 资源 | 免费额度 | 超出后价格 |
|------|----------|------------|
| 数据库存储 | 5GB | ¥0.15/GB/月 |
| 数据库读操作 | 500万次/月 | ¥0.05/万次 |
| 数据库写操作 | 300万次/月 | ¥0.15/万次 |
| 静态网站托管 | 50GB/月 | ¥0.15/GB/月 |
| 云函数调用 | 500万次/月 | ¥0.05/万次 |

**对于 10-20 人的团队，免费额度完全够用。**

---

## 常见问题

**Q: 数据安全吗？**  
A: 腾讯云开发提供企业级安全保障，数据存储在腾讯云，支持 HTTPS 加密传输。

**Q: 可以同时多人填写吗？**  
A: 可以！使用云数据库后，多人可以同时填写，数据实时同步。

**Q: 需要备案吗？**  
A: 如果使用云开发的默认域名，不需要备案。如果使用自定义域名，需要备案。

---

## 技术支持

- 云开发文档：https://docs.cloudbase.net/
- 控制台地址：https://console.cloud.tencent.com/tcb
