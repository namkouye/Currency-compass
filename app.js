const CURRENCIES = [
 ["AED","UAE dirham","🇦🇪","د.إ"],["ARS","Argentine peso","🇦🇷","$"],["AUD","Australian dollar","🇦🇺","A$"],["BDT","Bangladeshi taka","🇧🇩","৳"],["BGN","Bulgarian lev","🇧🇬","лв"],["BHD","Bahraini dinar","🇧🇭","د.ب"],["BRL","Brazilian real","🇧🇷","R$"],["CAD","Canadian dollar","🇨🇦","$"],["CHF","Swiss franc","🇨🇭","CHF"],["CLP","Chilean peso","🇨🇱","$"],["CNY","Chinese yuan","🇨🇳","¥"],["COP","Colombian peso","🇨🇴","$"],["CZK","Czech koruna","🇨🇿","Kč"],["DKK","Danish krone","🇩🇰","kr"],["EGP","Egyptian pound","🇪🇬","E£"],["EUR","Euro","🇪🇺","€"],["GBP","British pound","🇬🇧","£"],["GEL","Georgian lari","🇬🇪","₾"],["HKD","Hong Kong dollar","🇭🇰","HK$"],["HUF","Hungarian forint","🇭🇺","Ft"],["IDR","Indonesian rupiah","🇮🇩","Rp"],["ILS","Israeli new shekel","🇮🇱","₪"],["INR","Indian rupee","🇮🇳","₹"],["ISK","Icelandic króna","🇮🇸","kr"],["JPY","Japanese yen","🇯🇵","¥"],["KES","Kenyan shilling","🇰🇪","KSh"],["KRW","South Korean won","🇰🇷","₩"],["KWD","Kuwaiti dinar","🇰🇼","د.ك"],["LKR","Sri Lankan rupee","🇱🇰","Rs"],["MAD","Moroccan dirham","🇲🇦","د.م."],["MXN","Mexican peso","🇲🇽","$"],["MYR","Malaysian ringgit","🇲🇾","RM"],["NGN","Nigerian naira","🇳🇬","₦"],["NOK","Norwegian krone","🇳🇴","kr"],["NPR","Nepalese rupee","🇳🇵","रू"],["NZD","New Zealand dollar","🇳🇿","NZ$"],["OMR","Omani rial","🇴🇲","ر.ع."],["PEN","Peruvian sol","🇵🇪","S/"],["PHP","Philippine peso","🇵🇭","₱"],["PKR","Pakistani rupee","🇵🇰","₨"],["PLN","Polish złoty","🇵🇱","zł"],["QAR","Qatari riyal","🇶🇦","ر.ق"],["RON","Romanian leu","🇷🇴","lei"],["RSD","Serbian dinar","🇷🇸","дин."],["SAR","Saudi riyal","🇸🇦","ر.س"],["SEK","Swedish krona","🇸🇪","kr"],["SGD","Singapore dollar","🇸🇬","S$"],["THB","Thai baht","🇹🇭","฿"],["TRY","Turkish lira","🇹🇷","₺"],["TWD","New Taiwan dollar","🇹🇼","NT$"],["TZS","Tanzanian shilling","🇹🇿","TSh"],["UAH","Ukrainian hryvnia","🇺🇦","₴"],["UGX","Ugandan shilling","🇺🇬","USh"],["USD","US dollar","🇺🇸","$"],["UYU","Uruguayan peso","🇺🇾","$U"],["VND","Vietnamese đồng","🇻🇳","₫"],["XAF","Central African CFA franc","🌍","FCFA"],["XOF","West African CFA franc","🌍","CFA"],["ZAR","South African rand","🇿🇦","R"],["ZMW","Zambian kwacha","🇿🇲","ZK"],["ZWL","Zimbabwean dollar","🇿🇼","Z$"]
].map(([code,name,flag,symbol])=>({code,name,flag,symbol}));

const DEFAULT_CODES = ["CAD","EUR","USD","GBP"];
const API_URL = "https://open.er-api.com/v6/latest/USD";
const STORAGE = { currencies:"cc_currencies", anchor:"cc_anchor", amount:"cc_amount", rates:"cc_rates", settings:"cc_settings" };
const $ = id => document.getElementById(id);
let selected = loadJSON(STORAGE.currencies, DEFAULT_CODES);
let anchor = localStorage.getItem(STORAGE.anchor) || "CAD";
let amount = localStorage.getItem(STORAGE.amount) || "100";
let ratesCache = loadJSON(STORAGE.rates, null);
let settings = Object.assign({wifiOnly:true,autoRefresh:true}, loadJSON(STORAGE.settings, {}));

function loadJSON(key, fallback){ try { const x=localStorage.getItem(key); return x ? JSON.parse(x) : fallback; } catch { return fallback; } }
function saveState(){ localStorage.setItem(STORAGE.currencies,JSON.stringify(selected));localStorage.setItem(STORAGE.anchor,anchor);localStorage.setItem(STORAGE.amount,amount);localStorage.setItem(STORAGE.settings,JSON.stringify(settings)); }
function currency(code){ return CURRENCIES.find(c=>c.code===code) || {code,name:code,flag:"🌐",symbol:code}; }
function fmt(value){ if(!Number.isFinite(value)) return "—"; const digits = Math.abs(value)>=1000 ? 2 : Math.abs(value)>=1 ? 2 : 4; return new Intl.NumberFormat(undefined,{minimumFractionDigits:2,maximumFractionDigits:digits}).format(value); }
function usdRate(code){ if(code==="USD") return 1; return ratesCache?.rates?.[code] || null; }
function rateBetween(from,to){ if(from===to)return 1;const a=usdRate(from),b=usdRate(to);return a&&b?b/a:null; }
function formatDate(date){ if(!date) return "date unavailable"; return new Date(date).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}); }
function canAutoFetch(){ if(!navigator.onLine) return false; if(!settings.wifiOnly) return true; const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection; if(!conn || !conn.type) return false; return conn.type==="wifi" || conn.type==="ethernet"; }
function setStatus(message,kind=""){ $("rateStatus").textContent=message; $("statusDot").className="status-dot"+(kind?" "+kind:""); }

function renderList(keepCode=null, caret=null){
 const host=$("currencyList");host.innerHTML="";
 if(!selected.length){host.innerHTML='<div class="empty-state">Add a currency to get started.</div>';return;}
 selected.forEach(code=>{
   const c=currency(code), row=document.createElement("article");row.className="currency-card editable-currency";
   const flag=document.createElement("div");flag.className="currency-flag";flag.textContent=c.flag;
   const meta=document.createElement("div");meta.className="currency-meta";
   const codeLine=document.createElement("div");codeLine.className="currency-code";codeLine.textContent=c.code;
   const name=document.createElement("div");name.className="currency-name";name.textContent=c.name;meta.append(codeLine,name);
   const wrap=document.createElement("div");wrap.className="currency-input-wrap";
   const symbol=document.createElement("span");symbol.className="row-symbol";symbol.textContent=c.symbol;
   const input=document.createElement("input");input.className="currency-input";input.type="number";input.inputMode="decimal";input.min="0";input.step="any";input.setAttribute("aria-label",`Amount in ${c.code}`);
   const rate=rateBetween(anchor,code), n=Number(amount);
   input.value=code===anchor?amount:(rate&&amount!==""&&Number.isFinite(n)?(n*rate).toFixed(2):"");
   input.addEventListener("input",()=>{
     anchor=code;amount=input.value;saveState();
     const pos=input.selectionStart;
     renderList(code,pos);
   });
   wrap.append(symbol,input);
   const remove=document.createElement("button");remove.className="remove-btn";remove.title=`Remove ${c.code}`;remove.setAttribute("aria-label",`Remove ${c.code}`);remove.textContent="×";
   remove.addEventListener("click",()=>{selected=selected.filter(x=>x!==code);if(anchor===code)anchor=selected[0]||"CAD";saveState();renderList();});
   row.append(flag,meta,wrap,remove);host.append(row);
 });
 if(keepCode){const row=[...host.children].find(el=>el.querySelector(".currency-code")?.textContent===keepCode);const input=row?.querySelector("input");if(input){input.focus();try{input.setSelectionRange(caret,caret)}catch{}}}
}
async function refreshRates(manual=false){
 if(!navigator.onLine){setStatus("Offline · using saved rates",ratesCache?"":"bad");return;}
 if(!manual&&settings.wifiOnly&&!canAutoFetch()){setStatus("Auto-refresh paused · Wi-Fi not confirmed",ratesCache?"":"");return;}
 setStatus("Updating exchange rates…");
 try{
   const res=await fetch(API_URL,{cache:"no-store"});if(!res.ok)throw new Error("Rate service error");
   const data=await res.json();if(data.result!=="success"||!data.rates)throw new Error("Unexpected rate response");
   ratesCache=data;localStorage.setItem(STORAGE.rates,JSON.stringify(data));renderList();
   setStatus(`Rates updated ${formatDate(data.time_last_update_utc)} · USD reference`,"good");
 }catch(e){setStatus(ratesCache?`Could not refresh · saved rates from ${formatDate(ratesCache.time_last_update_utc)}`:"Could not load rates · check your connection","bad");}
}
function openPicker(){ $("dialogTitle").textContent="Add a currency";$("currencySearch").value="";renderChoices("");$("currencyDialog").showModal();$("currencySearch").focus(); }
function renderChoices(query){
 const host=$("currencyChoices");host.innerHTML="";const q=query.trim().toLowerCase();
 const filtered=CURRENCIES.filter(c=>(!q||c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q))&&!selected.includes(c.code));
 filtered.slice(0,70).forEach(c=>{const b=document.createElement("button");b.type="button";b.className="choice-btn";b.innerHTML=`<span class="flag">${c.flag}</span><span class="choice-name"><span class="choice-code">${c.code}</span><small>${c.name}</small></span><span>${c.symbol}</span>`;b.addEventListener("click",()=>{selected.push(c.code);saveState();$("currencyDialog").close();renderList();});host.append(b);});
 if(!filtered.length)host.innerHTML='<div class="empty-state">No matching currencies found.</div>';
}
$("addBtn").addEventListener("click",openPicker);$("manageBtn").addEventListener("click",openPicker);
$("currencySearch").addEventListener("input",e=>renderChoices(e.target.value));
$("refreshBtn").addEventListener("click",()=>refreshRates(true));
$("settingsBtn").addEventListener("click",()=>{$("wifiOnly").checked=settings.wifiOnly;$("autoRefresh").checked=settings.autoRefresh;$("settingsDialog").showModal();});
$("wifiOnly").addEventListener("change",e=>{settings.wifiOnly=e.target.checked;saveState();if(settings.autoRefresh)refreshRates(false);});
$("autoRefresh").addEventListener("change",e=>{settings.autoRefresh=e.target.checked;saveState();});
window.addEventListener("online",()=>{if(settings.autoRefresh)refreshRates(false);});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&settings.autoRefresh){const last=ratesCache?.time_last_update_unix?ratesCache.time_last_update_unix*1000:0;if(Date.now()-last>6*60*60*1000)refreshRates(false);}});
// PWA update flow: keep the installed home-screen app, and offer in-app updates.
let waitingWorker = null;
let refreshingForUpdate = false;
function showUpdateAvailable(worker){
  waitingWorker = worker;
  $("updateBanner").hidden = false;
}
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
  window.addEventListener("load",async()=>{
    try{
      const registration=await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});
      if(registration.waiting && navigator.serviceWorker.controller) showUpdateAvailable(registration.waiting);
      registration.addEventListener("updatefound",()=>{
        const installing=registration.installing;
        if(!installing)return;
        installing.addEventListener("statechange",()=>{
          if(installing.state==="installed" && navigator.serviceWorker.controller) showUpdateAvailable(installing);
        });
      });
      // Ask the host for a new worker when the app is opened or revisited.
      registration.update().catch(()=>{});
      document.addEventListener("visibilitychange",()=>{
        if(!document.hidden) registration.update().catch(()=>{});
      });
    }catch(error){console.warn("Service worker registration failed",error);}
  });
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(refreshingForUpdate)return;
    refreshingForUpdate=true;
    window.location.reload();
  });
}
$("updateBtn").addEventListener("click",()=>{
  if(waitingWorker) waitingWorker.postMessage({type:"SKIP_WAITING"});
});
$("dismissUpdateBtn").addEventListener("click",()=>{$("updateBanner").hidden=true;});
renderList();
if(!ratesCache){setStatus("Loading exchange rates…");refreshRates(false);}else{setStatus(`Saved rates · last updated ${formatDate(ratesCache.time_last_update_utc)}`,"good");if(settings.autoRefresh)refreshRates(false);}
