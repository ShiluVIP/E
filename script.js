const REPO_URL = "https://fastsign.dev/repo.json?utm_source=chatgpt.com";
const grid = document.getElementById("appsGrid");
const statusEl = document.getElementById("status");
const search = document.getElementById("search");
document.getElementById("year").textContent = new Date().getFullYear();

let apps = [];

function esc(v=""){ return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatSize(n){
  if(!n) return "";
  if(n > 1024*1024*1024) return (n/1024/1024/1024).toFixed(1)+" GB";
  if(n > 1024*1024) return (n/1024/1024).toFixed(1)+" MB";
  return Math.round(n/1024)+" KB";
}
function normalize(data){
  const raw = Array.isArray(data) ? data : (data.apps || data.data || []);
  return raw.map(a => ({
    name:a.name || "تطبيق",
    version:a.version || "",
    desc:a.localizedDescription || a.subtitle || "تطبيق iPhone",
    icon:a.iconURL || a.icon || "",
    download:a.downloadURL || (a.versions && a.versions[0] && a.versions[0].downloadURL) || "",
    size:formatSize(a.size),
    developer:a.developerName || ""
  })).filter(a=>a.name && a.download);
}
function render(list){
  grid.innerHTML = list.slice(0,120).map(a => `
    <article class="app-card">
      <div class="app-top">
        <img class="app-icon" loading="lazy" src="${esc(a.icon)}" alt="" onerror="this.style.visibility='hidden'">
        <div style="min-width:0"><div class="app-name">${esc(a.name)}</div><div class="app-meta">v${esc(a.version)} ${a.size?`• ${esc(a.size)}`:""}</div></div>
      </div>
      <div class="app-desc">${esc(a.desc)}</div>
      <a class="download" href="${esc(a.download)}" target="_blank" rel="noopener">تحميل IPA</a>
    </article>`).join("");
  statusEl.textContent = list.length ? `عرض ${Math.min(list.length,120)} من ${list.length} تطبيق متاح` : "لم يتم العثور على نتائج.";
}
async function load(){
  statusEl.textContent = "جاري تحميل التطبيقات...";
  try{
    const r = await fetch(REPO_URL, {cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    const data = await r.json();
    apps = normalize(data);
    render(apps);
  }catch(e){
    statusEl.textContent = "تعذر جلب القائمة تلقائياً من المصدر. يمكنك فتح المصدر من الزر أدناه.";
    grid.innerHTML = `
      <article class="app-card" style="grid-column:1/-1;text-align:center;padding:30px">
        <div class="app-name">مصدر التطبيقات جاهز</div>
        <div class="app-desc" style="height:auto">بعض الاستضافات تمنع جلب ملف JSON خارجياً بسبب CORS. افتح المصدر ثم استخدم مستودع FastSign في تطبيق التوقيع الذي تستخدمه.</div>
        <a class="download" href="https://fastsign.dev/" target="_blank" rel="noopener">فتح FastSign</a>
      </article>`;
  }
}
search.addEventListener("input", ()=>{
  const q = search.value.trim().toLowerCase();
  render(apps.filter(a => `${a.name} ${a.desc} ${a.developer}`.toLowerCase().includes(q)));
});
document.getElementById("refresh").addEventListener("click", load);
load();
