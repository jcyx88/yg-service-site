const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MAX_BODY_BYTES = 8 * 1024;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;
const rateBuckets = new Map();
const COMPLETE_GROUP = "1080034594";
const EXPERIENCE_GROUP = "769014453";
const COMPLETE_PACKAGE_SUMMARY = "39 元完整包包含 20000多款游戏、资料整理、持续更新、快速检索、人工服务和 1 年售后。";
const EXPERIENCE_PACKAGE_SUMMARY = `基础体验包 18 元包含 30 款经典游戏体验内容，一次性提取，不包含售后，QQ群 ${EXPERIENCE_GROUP}。`;

const contentTypes = {
  ".html":"text/html; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".ico":"image/x-icon",
  ".txt":"text/plain; charset=utf-8"
};

function send(res, status, body, type = "application/json; charset=utf-8"){
  res.writeHead(status, {
    "Content-Type":type,
    "X-Content-Type-Options":"nosniff",
    "Referrer-Policy":"strict-origin-when-cross-origin",
    "X-Frame-Options":"SAMEORIGIN",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()"
  });
  res.end(body);
}

function sendJson(res, status, payload){
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

function clientKey(req){
  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(req){
  const key = clientKey(req);
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count:0, resetAt:now + WINDOW_MS };

  if(now > bucket.resetAt){
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count > MAX_REQUESTS;
}

function readJsonBody(req){
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";

    req.on("data", (chunk) => {
      size += chunk.length;
      if(size > MAX_BODY_BYTES){
        reject(new Error("BODY_TOO_LARGE"));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", () => {
      try{
        resolve(body ? JSON.parse(body) : {});
      }catch(_error){
        reject(new Error("INVALID_JSON"));
      }
    });

    req.on("error", reject);
  });
}

function safeText(value, max = 300){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function consultReply(message, selectedGame){
  const text = message.toLowerCase();
  const gameLine = selectedGame ? `你当前选择的是「${selectedGame}」。` : "";
  const isExperienceInquiry = text.includes("基础") || text.includes("体验包") || text.includes("18") || text.includes(EXPERIENCE_GROUP);

  if(isExperienceInquiry){
    return `${EXPERIENCE_PACKAGE_SUMMARY}完成后请申请 QQ 群 ${EXPERIENCE_GROUP} 领取。`;
  }

  if(text.includes("微信") || text.includes("失败") || text.includes("付款") || text.includes("支付") || text.includes("支付宝") || text.includes("银行卡") || text.includes("备用")){
    return `请截图保存到相册扫码付款，第一张图支持微信和支付宝，建议优先使用支付宝/微信中的银行卡；如第一张图微信方付款失败，请使用第二张微信备用支付图。完成后请申请 QQ 群 ${COMPLETE_GROUP} 领取。`;
  }

  if(text.includes("群") || text.includes("领取") || text.includes("qq")){
    return `购买完整包后请申请 QQ 群 ${COMPLETE_GROUP}，群内人工核验后提供完整资料、下载说明、安装教程和持续更新提醒，并享受 1 年售后服务。`;
  }

  if(text.includes("购买") || text.includes("位置") || text.includes("扫码") || text.includes("哪里")){
    return `完整包价格为 39 元。请截图保存到相册扫码付款，第一张图支持微信和支付宝，建议优先使用支付宝/微信中的银行卡；如第一张图微信方付款失败，请使用第二张微信备用支付图。完成后请申请 QQ 群 ${COMPLETE_GROUP} 领取。`;
  }

  if(text.includes("内容") || text.includes("包含") || text.includes("资料")){
    return `${COMPLETE_PACKAGE_SUMMARY}${EXPERIENCE_PACKAGE_SUMMARY}`;
  }

  if(text.includes("价格") || text.includes("多少钱") || text.includes("39") || text.includes("18")){
    return `${COMPLETE_PACKAGE_SUMMARY}${EXPERIENCE_PACKAGE_SUMMARY}`;
  }

  if(selectedGame){
    return `${gameLine}可以继续询问该游戏的版本、资料内容、更新情况和领取方式。`;
  }

  return `可以咨询完整包内容、完整包QQ群${COMPLETE_GROUP}、基础体验包QQ群${EXPERIENCE_GROUP}、备用图，以及具体游戏资料版本和更新情况。`;
}

async function handleConsult(req, res){
  if(isRateLimited(req)){
    sendJson(res, 429, { error:"请求过于频繁，请稍后再试。" });
    return;
  }

  try{
    const body = await readJsonBody(req);
    const message = safeText(body.message);
    const selectedGame = safeText(body.selectedGame, 80);

    if(message.length < 1){
      sendJson(res, 422, { error:"请输入咨询内容。" });
      return;
    }

    sendJson(res, 200, {
      reply:consultReply(message, selectedGame),
      contact:{
        qqGroup:COMPLETE_GROUP,
        completeQqGroup:COMPLETE_GROUP,
        experienceQqGroup:EXPERIENCE_GROUP,
        packageName:"完整包",
        price:"39 元",
        secondaryPackage:`基础体验包 18 元，包含 30 款经典游戏体验内容，一次性提取，不包含售后，QQ群 ${EXPERIENCE_GROUP}`,
        completePackage:COMPLETE_PACKAGE_SUMMARY,
        experiencePackage:EXPERIENCE_PACKAGE_SUMMARY,
        paymentAdvice:"请截图保存到相册扫码付款，第一张图支持微信和支付宝，建议优先使用支付宝/微信中的银行卡；如第一张图微信方付款失败，请使用第二张微信备用支付图。完成后请申请 QQ 群 1080034594 领取。"
      }
    });
  }catch(error){
    const code = error.message === "BODY_TOO_LARGE" ? 413 : 400;
    sendJson(res, code, { error:"咨询内容格式有误，请重新输入。" });
  }
}

function serveStatic(req, res){
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const requestedPath = path.normalize(path.join(ROOT, pathname));

  if(!requestedPath.startsWith(ROOT)){
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(requestedPath, (error, data) => {
    if(error){
      send(res, 404, "Not Found", "text/plain; charset=utf-8");
      return;
    }

    const type = contentTypes[path.extname(requestedPath).toLowerCase()] || "application/octet-stream";
    send(res, 200, data, type);
  });
}

const server = http.createServer(async (req, res) => {
  if(req.method === "POST" && req.url === "/api/consult"){
    await handleConsult(req, res);
    return;
  }

  if(req.method === "GET" || req.method === "HEAD"){
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error:"Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`YG site running at http://localhost:${PORT}`);
});
