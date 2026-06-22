# 杨过游戏目录（GitHub Pages 部署版）

## 目录结构
- `index.html`：主页
- `assets/style.css`：样式
- `assets/app.js`：交互逻辑（可改“精选10个游戏”）
- `assets/images/complete-package-payment.jpg`：完整包微信+支付宝付款图，咨询弹窗自动回复使用
- `assets/images/complete-package-backup-qr.jpg`：完整包微信备用支付图，咨询弹窗自动回复使用
- `assets/images/experience-package-qr.png`：18 元基础体验包付款图，咨询弹窗自动回复使用
- `data/games.json`：游戏目录
- `server.js`：本地/Node 托管时使用的咨询后端接口

首页不直接展示付款二维码。用户点击“咨询客服”后，前端会按问题自动回复对应付款图。

## 本地运行带咨询后端的版本

仓库不需要安装第三方依赖，电脑已安装 Node.js 后可直接运行：

```bash
npm start
```

默认访问：

```text
http://localhost:3000
```

前端咨询弹窗会请求 `POST /api/consult`。如果页面部署在 GitHub Pages 上，Pages 只能托管静态文件，不能运行 `server.js`；这种情况下咨询弹窗会自动使用前端兜底回复。要让真实后端生效，需要把这个仓库部署到支持 Node 的服务器或平台。

当前主推商品：

- 完整包：39 元，包含 6000+ 款游戏、资料整理、持续更新、快速检索、人工服务和 1 年售后
- 完整包购买后加入 QQ 群：`1080034594`
- 基础体验包：18 元，包含 30 款经典游戏体验内容，一次性提取，不包含售后
- 基础体验包购买后加入 QQ 群：`769014453`
- 完整包付款图支持微信和支付宝，建议优先使用支付宝；如微信方式不稳定，请使用微信备用支付图。

## 部署到 GitHub Pages（项目站点）
1. 新建仓库（或用现有仓库），把以上文件按目录上传到仓库根目录。
2. 打开仓库 **Settings → Pages**
3. **Build and deployment**
   - Source：选择 **Deploy from a branch**
   - Branch：选择 `main`（或 `master`）和 `/ (root)`
4. 保存后，Pages 会给你一个网址。

> 注意：页面里的资源全部使用相对路径（例如 `./assets/...`、`./data/...`），适配“项目站点 /repo/”这种路径。

## 新域名说明

这个仓库不再保留旧的 `CNAME`。买好新域名后，在 GitHub Pages 的 **Custom domain** 中填写新域名，确认 DNS 检查通过并等待证书签发完成，再开启 **Enforce HTTPS**。

## 你需要改的地方
- 精选展示的 10 个游戏：在 `assets/app.js` 里改 `FEATURED_GAMES` 数组即可。
- 完整包 QQ 群、基础体验包 QQ 群、价格和操作提示：在 `assets/app.js` 里改 `CONTACT_TEXT`、`COMPLETE_GROUP`、`EXPERIENCE_GROUP`、`PACKAGE_PRICE`、`BACKUP_PAYMENT_TEXT`。
- 咨询弹窗自动回复的付款图：在 `assets/app.js` 里改 `PAYMENT_CARDS`。
- 后端咨询回复规则：在 `server.js` 里改 `consultReply()`。
