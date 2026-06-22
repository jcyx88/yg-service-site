const FEATURED_GAMES = [
  "亚洲之子：东方之乡",
  "极品冒险郎",
  "特工17v25.9",
  "美德v17",
  "凤凰v15.2",
  "永恒世界0.95",
  "模特：爱的初篇",
  "隔壁的精美伴侣",
  "我的幸福人生ver1.7",
  "日不落帝国"
];

const CONTACT_TEXT = "完整包 QQ 群：1080034594";
const COMPLETE_GROUP = "1080034594";
const EXPERIENCE_GROUP = "769014453";
const PACKAGE_NAME = "完整包";
const PACKAGE_PRICE = "¥39.00";
const BACKUP_PAYMENT_TEXT = "主图支持微信和支付宝，建议优先使用支付宝；如微信方式不稳定，请使用备用图。";
const COMPLETE_PACKAGE_SUMMARY = "39 元完整包包含 6000+ 款游戏、资料整理、持续更新、快速检索、人工服务和 1 年售后。";
const EXPERIENCE_PACKAGE_SUMMARY = `基础体验包 18 元包含 30 款经典游戏体验内容，一次性提取，不包含售后，QQ群 ${EXPERIENCE_GROUP}。`;
const PAYMENT_CARDS = {
  complete:[
    {
      title:"微信+支付宝图",
      note:"完整包 39 元，推荐优先使用支付宝；付款后进 QQ 群 1080034594。",
      src:"./assets/images/complete-package-payment.jpg",
      alt:"完整包微信加支付宝付款二维码，推荐使用支付宝"
    },
    {
      title:"微信备用支付图",
      note:"如果微信方式提示失败，再扫这张备用图。",
      src:"./assets/images/complete-package-backup-qr.jpg",
      alt:"微信备用支付二维码"
    }
  ],
  backup:[
    {
      title:"微信备用支付图",
      note:"如果微信方式提示失败，再扫这张备用图。",
      src:"./assets/images/complete-package-backup-qr.jpg",
      alt:"微信备用支付二维码"
    }
  ],
  experience:[
    {
      title:"18 元体验包",
      note:`基础体验包 18 元，付款后进 QQ 群 ${EXPERIENCE_GROUP}。`,
      src:"./assets/images/experience-package-qr.png",
      alt:"18 元基础体验包付款二维码"
    }
  ]
};
const FALLBACK_GAMES = [
  "亚洲之子：东方之乡",
  "极品冒险郎",
  "特工17v25.9",
  "美德v17",
  "凤凰v15.2",
  "永恒世界0.95",
  "模特：爱的初篇",
  "隔壁的精美伴侣",
  "我的幸福人生ver1.7",
  "日不落帝国"
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

let ALL_GAMES = [];
let ALL_GAMES_SET = new Set();
let lastFocusedElement = null;

function normalize(value){
  return (value || "").toString().trim().toLowerCase();
}

function escapeHtml(str){
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));
}

function showToast(msg){
  const toast = $("#toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(_error){
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try{
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    }catch(error){
      document.body.removeChild(textarea);
      return false;
    }
  }
}

function selectedGameName(){
  return $("#gameSelect")?.value || "";
}

function renderFeatured(){
  const list = $("#gameList");
  list.innerHTML = "";

  FEATURED_GAMES.forEach((name, idx) => {
    const exists = ALL_GAMES_SET.has(name);
    const imgSrc = `assets/images/games/game${idx + 1}.jpg`;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="game-thumb-wrap mask-profile-${idx + 1}">
        <img class="game-thumb" src="${imgSrc}" alt="${escapeHtml(name)}游戏封面图，敏感区域已遮挡" loading="lazy" onerror="this.closest('.game-thumb-wrap').style.display='none'" />
        <span class="thumb-mask-label" aria-hidden="true">敏感区域已遮挡</span>
      </div>
      <div class="card-body">
        <span class="game-tag">${exists ? "目录内" : "可咨询"}</span>
        <h3>${escapeHtml(name)}</h3>
        <p>咨询资料版本、领取方式，以及完整包是否包含该游戏。</p>
        <div class="card-actions">
          <button class="btn secondary" type="button" data-copy-game="${escapeHtml(name)}">复制咨询</button>
          <button class="btn primary js-consult" type="button" data-topic="我想咨询 ${escapeHtml(name)} 的商品情况">咨询</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  $$("[data-copy-game]").forEach((button) => {
    button.addEventListener("click", async () => {
      const name = button.getAttribute("data-copy-game");
      const text = `${CONTACT_TEXT}\n基础体验包 QQ 群：${EXPERIENCE_GROUP}\n我想咨询游戏：${name}\n${COMPLETE_PACKAGE_SUMMARY}\n${EXPERIENCE_PACKAGE_SUMMARY}\n${BACKUP_PAYMENT_TEXT}`;
      const ok = await copyToClipboard(text);
      showToast(ok ? "已复制咨询信息" : "复制失败，请手动复制 QQ 群号");
    });
  });

  wireConsultButtons();
}

function populateSelect(games){
  const select = $("#gameSelect");
  select.innerHTML = `<option value="" selected>选择游戏进行搜索</option>`;
  const fragment = document.createDocumentFragment();

  games.forEach((game) => {
    const option = document.createElement("option");
    option.value = game;
    option.textContent = game;
    fragment.appendChild(option);
  });

  select.appendChild(fragment);
}

function applyKeywordFilter(){
  const keyword = normalize($("#keyword").value);
  if(!keyword){
    populateSelect(ALL_GAMES);
    return;
  }

  const filtered = ALL_GAMES.filter((game) => normalize(game).includes(keyword));
  populateSelect(filtered);
}

function fallbackConsultReply(message){
  const text = normalize(message);
  const isExperienceInquiry = text.includes("基础") || text.includes("体验包") || text.includes("18") || text.includes(EXPERIENCE_GROUP);

  if(isExperienceInquiry){
    return `${EXPERIENCE_PACKAGE_SUMMARY}下面附上 18 元体验包付款图，完成后请加入 QQ 群 ${EXPERIENCE_GROUP} 领取。`;
  }

  if(text.includes("微信") || text.includes("失败") || text.includes("付款") || text.includes("支付") || text.includes("支付宝") || text.includes("备用")){
    return `下面附上完整包付款图。主图支持微信和支付宝，建议优先使用支付宝；如微信方式不稳定，请使用微信备用支付图。完成后请加入 QQ 群 ${COMPLETE_GROUP} 领取。`;
  }

  if(text.includes("群") || text.includes("领取") || text.includes("qq")){
    return `购买完整包后请加入 QQ 群 ${COMPLETE_GROUP}，群内人工核验后提供完整资料、下载说明、安装教程和持续更新提醒，并享受 1 年售后服务。`;
  }

  if(text.includes("购买") || text.includes("位置") || text.includes("扫码") || text.includes("哪里")){
    return `完整包价格为 ${PACKAGE_PRICE}，下面附上付款图。建议优先使用支付宝；如微信方式不稳定，请使用微信备用支付图。完成后请加入 QQ 群 ${COMPLETE_GROUP}。`;
  }

  if(text.includes("内容") || text.includes("包含") || text.includes("资料")){
    return `${COMPLETE_PACKAGE_SUMMARY}${EXPERIENCE_PACKAGE_SUMMARY}`;
  }

  if(text.includes("价格") || text.includes("多少钱") || text.includes("39") || text.includes("18")){
    return `${COMPLETE_PACKAGE_SUMMARY}${EXPERIENCE_PACKAGE_SUMMARY}`;
  }

  const game = selectedGameName();
  return `可以咨询完整包内容、完整包QQ群${COMPLETE_GROUP}、基础体验包QQ群${EXPERIENCE_GROUP}、备用图，以及具体游戏的资料版本和更新情况。${game ? `你当前选择的是「${game}」，可以直接询问它的版本和领取方式。` : "也可以先在下拉框选择一个游戏再咨询。"}`;
}

function paymentCardsForMessage(message){
  const text = normalize(message);
  const isExperienceInquiry = text.includes("基础") || text.includes("体验包") || text.includes("18") || text.includes(EXPERIENCE_GROUP);
  const asksForBackup = text.includes("备用") || text.includes("失败");
  const asksForPayment = text.includes("付款") || text.includes("支付") || text.includes("支付宝") || text.includes("微信") || text.includes("扫码") || text.includes("二维码") || text.includes("购买") || text.includes("哪里");

  if(isExperienceInquiry) return PAYMENT_CARDS.experience;
  if(asksForBackup && !text.includes("完整包")) return PAYMENT_CARDS.backup;
  if(asksForPayment) return PAYMENT_CARDS.complete;
  return [];
}

function renderMessage(role, text){
  const messages = $("#chatMessages");
  const row = document.createElement("div");
  row.className = `message ${role}`;
  row.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function renderPaymentCards(cards){
  if(!cards.length) return;

  const messages = $("#chatMessages");
  const row = document.createElement("div");
  row.className = "message assistant";
  const bubble = document.createElement("div");
  bubble.className = "bubble qr-bubble";

  cards.forEach((card) => {
    const figure = document.createElement("figure");
    figure.className = "chat-qr-card";
    figure.innerHTML = `
      <img src="${card.src}" alt="${escapeHtml(card.alt)}" loading="lazy" />
      <figcaption>
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(card.note)}</span>
      </figcaption>
    `;
    bubble.appendChild(figure);
  });

  row.appendChild(bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function renderAssistantReply(reply, message){
  const text = typeof reply === "string" ? reply : reply.text;
  const cards = typeof reply === "string" ? paymentCardsForMessage(message) : (reply.cards || paymentCardsForMessage(message));
  renderMessage("assistant", text);
  renderPaymentCards(cards);
}

function setChatLoading(isLoading){
  const form = $("#chatForm");
  const button = form.querySelector("button[type='submit']");
  button.disabled = isLoading;
  button.textContent = isLoading ? "发送中" : "发送";
}

async function askBackend(message){
  const response = await fetch("/api/consult", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      message,
      selectedGame:selectedGameName(),
      packageName:PACKAGE_NAME,
      packagePrice:PACKAGE_PRICE
    })
  });

  if(!response.ok){
    throw new Error("consult request failed");
  }

  const data = await response.json();
  return {
    text:data.reply || fallbackConsultReply(message),
    cards:paymentCardsForMessage(message)
  };
}

async function sendConsultMessage(message){
  const clean = message.trim();
  if(!clean) return;

  renderMessage("user", clean);
  setChatLoading(true);

  try{
    const reply = await askBackend(clean);
    renderAssistantReply(reply, clean);
  }catch(_error){
    renderAssistantReply(fallbackConsultReply(clean), clean);
  }finally{
    setChatLoading(false);
  }
}

function openChat(prefill = ""){
  const modal = $("#chatModal");
  const input = $("#chatInput");
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("chat-open");

  if(!$("#chatMessages").children.length){
    renderMessage("assistant", `你好，我可以帮你了解${PACKAGE_NAME}内容、${PACKAGE_PRICE}领取方式、完整包QQ群${COMPLETE_GROUP}、基础体验包QQ群${EXPERIENCE_GROUP}。需要付款图时，请点上方快捷问题或输入“完整包付款二维码”“微信备用图”“18元体验包”。`);
  }

  if(prefill){
    input.value = prefill;
  }

  setTimeout(() => input.focus(), 0);
}

function closeChat(){
  $("#chatModal").hidden = true;
  document.body.classList.remove("chat-open");
  if(lastFocusedElement && typeof lastFocusedElement.focus === "function"){
    lastFocusedElement.focus();
  }
}

function wireConsultButtons(){
  $$(".js-consult").forEach((button) => {
    if(button.dataset.boundConsult === "true") return;
    button.dataset.boundConsult = "true";
    button.addEventListener("click", () => {
      openChat(button.getAttribute("data-topic") || "");
    });
  });
}

function wireChat(){
  $("#closeChatBtn").addEventListener("click", closeChat);
  $("[data-close-chat]").addEventListener("click", closeChat);

  $("#chatForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const message = input.value;
    input.value = "";
    await sendConsultMessage(message);
  });

  $$(".quick-replies button").forEach((button) => {
    button.addEventListener("click", () => {
      sendConsultMessage(button.getAttribute("data-question") || button.textContent);
    });
  });

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape" && !$("#chatModal").hidden){
      closeChat();
    }
  });
}

function wireEvents(){
  $("#keyword").addEventListener("input", () => {
    clearTimeout(wireEvents._timer);
    wireEvents._timer = setTimeout(applyKeywordFilter, 90);
  });

  $("#resetBtn").addEventListener("click", () => {
    $("#keyword").value = "";
    $("#gameSelect").value = "";
    populateSelect(ALL_GAMES);
    showToast("已重置筛选");
  });

  $("#gameSelect").addEventListener("change", async () => {
    const name = selectedGameName();
    if(!name) return;
    const ok = await copyToClipboard(`${CONTACT_TEXT}\n基础体验包 QQ 群：${EXPERIENCE_GROUP}\n我想咨询游戏：${name}\n${PACKAGE_NAME}：${PACKAGE_PRICE}\n${EXPERIENCE_PACKAGE_SUMMARY}\n${BACKUP_PAYMENT_TEXT}`);
    showToast(ok ? "已复制所选游戏咨询信息" : "复制失败，请手动复制 QQ 群号");
  });

  $("#copyGroupBtn").addEventListener("click", async () => {
    const ok = await copyToClipboard(COMPLETE_GROUP);
    showToast(ok ? "已复制 QQ 群号" : `复制失败，请手动复制 ${COMPLETE_GROUP}`);
  });

  wireConsultButtons();
  wireChat();
}

async function boot(){
  try{
    const response = await fetch("./data/games.json", { cache:"force-cache" });
    ALL_GAMES = await response.json();
    ALL_GAMES_SET = new Set(ALL_GAMES);
    $("#totalCount").textContent = String(ALL_GAMES.length);
    populateSelect(ALL_GAMES);
    renderFeatured();
    wireEvents();
  }catch(error){
    console.error(error);
    ALL_GAMES = FALLBACK_GAMES;
    ALL_GAMES_SET = new Set(ALL_GAMES);
    $("#totalCount").textContent = "基础目录";
    populateSelect(ALL_GAMES);
    renderFeatured();
    wireEvents();
    showToast("目录暂时没有完全加载，已显示基础内容");
  }
}

boot();
