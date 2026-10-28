const CURRENCIES = [
 ["AED","UAE dirham","🇦🇪","د.إ"],["ARS","Argentine peso","🇦🇷","$"],["AUD","Australian dollar","🇦🇺","A$"],["BDT","Bangladeshi taka","🇧🇩","৳"],["BGN","Bulgarian lev","🇧🇬","лв"],["BHD","Bahraini dinar","🇧🇭","د.ب"],["BRL","Brazilian real","🇧🇷","R$"],["CAD","Canadian dollar","🇨🇦","$"],["CHF","Swiss franc","🇨🇭","CHF"],["CLP","Chilean peso","🇨🇱","$"],["CNY","Chinese yuan","🇨🇳","¥"],["COP","Colombian peso","🇨🇴","$"],["CZK","Czech koruna","🇨🇿","Kč"],["DKK","Danish krone","🇩🇰","kr"],["EGP","Egyptian pound","🇪🇬","E£"],["EUR","Euro","🇪🇺","€"],["GBP","British pound","🇬🇧","£"],["GEL","Georgian lari","🇬🇪","₾"],["HKD","Hong Kong dollar","🇭🇰","HK$"],["HUF","Hungarian forint","🇭🇺","Ft"],["IDR","Indonesian rupiah","🇮🇩","Rp"],["ILS","Israeli new shekel","🇮🇱","₪"],["INR","Indian rupee","🇮🇳","₹"],["ISK","Icelandic króna","🇮🇸","kr"],["JPY","Japanese yen","🇯🇵","¥"],["KES","Kenyan shilling","🇰🇪","KSh"],["KRW","South Korean won","🇰🇷","₩"],["KWD","Kuwaiti dinar","🇰🇼","د.ك"],["LKR","Sri Lankan rupee","🇱🇰","Rs"],["MAD","Moroccan dirham","🇲🇦","د.م."],["MXN","Mexican peso","🇲🇽","$"],["MYR","Malaysian ringgit","🇲🇾","RM"],["NGN","Nigerian naira","🇳🇬","₦"],["NOK","Norwegian krone","🇳🇴","kr"],["NPR","Nepalese rupee","🇳🇵","रू"],["NZD","New Zealand dollar","🇳🇿","NZ$"],["OMR","Omani rial","🇴🇲","ر.ع."],["PEN","Peruvian sol","🇵🇪","S/"],["PHP","Philippine peso","🇵🇭","₱"],["PKR","Pakistani rupee","🇵🇰","₨"],["PLN","Polish złoty","🇵🇱","zł"],["QAR","Qatari riyal","🇶🇦","ر.ق"],["RON","Romanian leu","🇷🇴","lei"],["RSD","Serbian dinar","🇷🇸","дин."],["SAR","Saudi riyal","🇸🇦","ر.س"],["SEK","Swedish krona","🇸🇪","kr"],["SGD","Singapore dollar","🇸🇬","S$"],["THB","Thai baht","🇹🇭","฿"],["TRY","Turkish lira","🇹🇷","₺"],["TWD","New Taiwan dollar","🇹🇼","NT$"],["TZS","Tanzanian shilling","🇹🇿","TSh"],["UAH","Ukrainian hryvnia","🇺🇦","₴"],["UGX","Ugandan shilling","🇺🇬","USh"],["USD","US dollar","🇺🇸","$"],["UYU","Uruguayan peso","🇺🇾","$U"],["VND","Vietnamese đồng","🇻🇳","₫"],["XAF","Central African CFA franc","🌍","FCFA"],["XOF","West African CFA franc","🌍","CFA"],["ZAR","South African rand","🇿🇦","R"],["ZMW","Zambian kwacha","🇿🇲","ZK"],["ZWL","Zimbabwean dollar","🇿🇼","Z$"]
].map(([code,name,flag,symbol])=>({code,name,flag,symbol}));

const DEFAULT_CODES = ["CAD","EUR","USD","GBP"];
const API_URL = "https://open.er-api.com/v6/latest/";
const STORAGE = { currencies:"cc_currencies", base:"cc_base", amount:"cc_amount", rates:"cc_rates", settings:"cc_settings" };
const $ = id => document.getElementById(id);
let selected = loadJSON(STORAGE.currencies, DEFAULT_CODES);
let base = localStorage.getItem(STORAGE.base) || "CAD";
let amount = localStorage.getItem(STORAGE.amount) || "100";
let ratesCache = loadJSON(STORAGE.rates, null);
let settings = Object.assign({wifiOnly:true,autoRefresh:true}, loadJSON(STORAGE.settings, {}));
let pickerMode = "add";
let pickerTarget = null;

function loadJSON(key, fallback){ try { const x=localStorage.getItem(key); return x ? JSON.parse(x) : fallback; } catch { return fallback; } }
function saveState(){ localStorage.setItem(STORAGE.currencies,JSON.stringify(selected));localStorage.setItem(STORAGE.base,base);localStorage.setItem(STORAGE.amount,amount);localStorage.setItem(STORAGE.settings,JSON.stringify(settings)); }
function currency(code){ return CURRENCIES.find(c=>c.code===code) || {code,name:code,flag:"🌐",symbol:code}; }
function fmt(value, code){ if(!Number.isFinite(value)) return "—"; const digits = Math.abs(value)>=1000 ? 2 : Math.abs(value)>=1 ? 2 : 4; return new Intl.NumberFormat(undefined,{minimumFractionDigits:2,maximumFractionDigits:digits}).format(value); }
function rateFor(code){ if(code===base) return 1; if(!ratesCache || !ratesCache.rates) return null; const sourceRate=ratesCache.rates[code]; const baseRate=ratesCache.rates[base]; if(!sourceRate || !baseRate) return null; return sourceRate/baseRate; }
function formatDate(date){ if(!date) return "date unavailable"; return new Date(date).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}); }
function canAutoFetch(){ if(!navigator.onLine) return false; if(!settings.wifiOnly) return true; const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection; if(!conn || !conn.type) return false; return conn.type==="wifi" || conn.type==="ethernet"; }
function setStatus(message,kind=""){ $("rateStatus").textContent=message; $("statusDot").className="status-dot"+(kind?" "+kind:""); }
function renderBaseSelect(){ const select=$("baseCurrency");select.innerHTML=""; CURRENCIES.forEach(c=>{const o=document.createElement("option");o.value=c.code;o.textContent=`${c.code} — ${c.name}`;select.append(o)});select.value=base;$("baseFlag").textContent=currency(base).flag;$("baseSymbol").textContent=currency(base).symbol; }
function renderList(){
 const host=$("currencyList");host.innerHTML="";const n=Number(amount);const valid=amount!==""&&Number.isFinite(n);
 const others=selected.filter(code=>code!==base);
 if(!others.length){host.innerHTML='<div class="empty-state">No other currencies selected yet. Use “Add currency” to choose one.</div>';return;}
 others.forEach(code=>{
   const c=currency(code), rate=rateFor(code), value=rate===null||!valid?null:n*rate;
   const card=document.createElement("article");card.className="currency-card";
   const flag=document.createElement("div");flag.className="currency-flag";flag.textContent=c.flag;
   const meta=document.createElement("div");meta.className="currency-meta";
   const codeLine=document.createElement("div");codeLine.className="currency-code";codeLine.textContent=c.code;
   const name=document.createElement("div");name.className="currency-name";name.textContent=c.name;
   meta.append(codeLine,name);
   const right=document.createElement("div");right.style.minWidth="0";
   const val=document.createElement("div");val.className="currency-value";val.textContent=value===null?"—":`${c.symbol} ${fmt(value,c.code)}`;
   const sub=document.createElement("div");sub.className="currency-subvalue";sub.textContent=rate===null?"Rate unavailable":`1 ${base} = ${fmt(rate,c.code)} ${c.code}`;
   right.append(val,sub);
   const remove=document.createElement("button");remove.className="remove-btn";remove.title=`Remove ${c.code}`;remove.setAttribute("aria-label",`Remove ${c.code}`);remove.textContent="×";remove.addEventListener("click",()=>{selected=selected.filter(x=>x!==code);saveState();renderList();});
   card.append(flag,meta,right,remove);host.append(card);
 });
}
function render(){renderBaseSelect();renderList();if(ratesCache){setStatus(`Rates updated ${formatDate(ratesCache.time_last_update_utc || ratesCache.time_last_update_unix*1000)} · ${ratesCache.base_code||"USD"} reference`,"good");}}
async function refreshRates(manual=false){
 if(!navigator.onLine){setStatus("Offline · using saved rates",ratesCache?"":"bad");return;}
 if(!manual && settings.wifiOnly && !canAutoFetch()){setStatus("Auto-refresh paused · Wi-Fi not confirmed",ratesCache?"":"");return;}
 setStatus("Updating exchange rates…");
 try{
   // Fetch one reference table; cross-rates are computed from this table.
   const res=await fetch(API_URL+"USD",{cache:"no-store"});
   if(!res.ok) throw new Error("Rate service returned "+res.status);
   const data=await res.json();
   if(data.result!=="success"||!data.rates) throw new Error("Unexpected rate response");
   ratesCache=data;localStorage.setItem(STORAGE.rates,JSON.stringify(ratesCache));renderList();
   const date=data.time_last_update_utc ? new Date(data.time_last_update_utc).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}) : "just now";
   setStatus(`Rates updated ${date} · source: USD reference`,"good");
 }catch(err){setStatus(ratesCache?`Could not refresh · saved rates from ${formatDate(ratesCache.time_last_update_utc)}`:"Could not load rates · check your connection","bad");}
}
function openPicker(mode,target=null){pickerMode=mode;pickerTarget=target;$("dialogTitle").textContent=mode==="add"?"Add a currency":"Change source currency";$("currencySearch").value="";renderChoices("");$("currencyDialog").showModal();$("currencySearch").focus();}
function renderChoices(query){
 const host=$("currencyChoices");host.innerHTML="";const q=query.trim().toLowerCase();
 const filtered=CURRENCIES.filter(c=>(!q||c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q))&&(pickerMode!=="add"||!selected.includes(c.code)));
 filtered.slice(0,70).forEach(c=>{const b=document.createElement("button");b.type="button";b.className="choice-btn";b.innerHTML=`<span class="flag">${c.flag}</span><span class="choice-name"><span class="choice-code">${c.code}</span><small>${c.name}</small></span><span>${c.symbol}</span>`;b.addEventListener("click",()=>{if(pickerMode==="add"){if(!selected.includes(c.code))selected.push(c.code);}else{base=c.code;$("baseAmount").value=amount;localStorage.setItem(STORAGE.base,base);}saveState();$("currencyDialog").close();render();});host.append(b);});
 if(!filtered.length)host.innerHTML='<div class="empty-state">No matching currencies found.</div>';
}
$("baseCurrency").addEventListener("change",e=>{base=e.target.value;saveState();render();});
$("baseAmount").addEventListener("input",e=>{amount=e.target.value;localStorage.setItem(STORAGE.amount,amount);renderList();});
$("addBtn").addEventListener("click",()=>openPicker("add"));
$("manageBtn").addEventListener("click",()=>openPicker("add"));
$("currencySearch").addEventListener("input",e=>renderChoices(e.target.value));
$("refreshBtn").addEventListener("click",()=>refreshRates(true));
$("settingsBtn").addEventListener("click",()=>{$("wifiOnly").checked=settings.wifiOnly;$("autoRefresh").checked=settings.autoRefresh;$("settingsDialog").showModal();});
$("wifiOnly").addEventListener("change",e=>{settings.wifiOnly=e.target.checked;saveState();if(settings.autoRefresh)refreshRates(false);});
$("autoRefresh").addEventListener("change",e=>{settings.autoRefresh=e.target.checked;saveState();});
window.addEventListener("online",()=>{if(settings.autoRefresh)refreshRates(false);});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&settings.autoRefresh){const last=ratesCache?.time_last_update_unix?ratesCache.time_last_update_unix*1000:0;if(Date.now()-last>6*60*60*1000)refreshRates(false);}});
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
if(!ratesCache){setStatus("Loading exchange rates…");refreshRates(false);}else{setStatus(`Saved rates · last updated ${formatDate(ratesCache.time_last_update_utc)}`,"good");if(settings.autoRefresh)refreshRates(false);}
