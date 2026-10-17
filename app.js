const $=s=>document.querySelector(s);
const state={trades:[]};
const cfg=()=>({url:localStorage.getItem('apiUrl')||'',key:localStorage.getItem('apiKey')||'',currency:localStorage.getItem('currency')||'USD'});
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:cfg().currency,maximumFractionDigits:2}).format(v||0);
const d0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const startWeek=d=>{const x=d0(d),day=x.getDay()||7;x.setDate(x.getDate()-day+1);return x};
const endWeek=d=>{const x=startWeek(d);x.setDate(x.getDate()+6);return x};
const norm=s=>String(s||'').replace(/[._-]?(c|vxc|pro|raw|ecn)$/i,'').toUpperCase();
const net=t=>(+t.profit||0)+(+t.commission||0)+(+t.swap||0);
const inRange=(t,a,b)=>{const x=new Date(t.time);return x>=a&&x<=b};
function paintVal(el,v){el.textContent=money(v);el.classList.remove('positive','negative');if(v>0)el.classList.add('positive');if(v<0)el.classList.add('negative')}
function render(){
  const now=new Date(), today=d0(now), tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
  const ws=startWeek(now), we=endWeek(now);we.setHours(23,59,59,999);
  const ms=new Date(now.getFullYear(),now.getMonth(),1), me=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999);
  const daily=state.trades.filter(t=>inRange(t,today,new Date(tomorrow-1)));
  const weekly=state.trades.filter(t=>inRange(t,ws,we));
  const monthly=state.trades.filter(t=>inRange(t,ms,me));
  const sum=a=>a.reduce((s,t)=>s+net(t),0);
  paintVal($('#todayPnL'),sum(daily));paintVal($('#weekPnL'),sum(weekly));paintVal($('#monthPnL'),sum(monthly));paintVal($('#totalPnL'),sum(state.trades));
  $('#todayTrades').textContent=`${daily.length} operaciones`;$('#weekTrades').textContent=`${weekly.length} operaciones`;$('#monthTrades').textContent=`${monthly.length} operaciones`;$('#totalTrades').textContent=`${state.trades.length} operaciones`;
  $('#todayDate').textContent=now.toLocaleDateString('es-BO',{day:'2-digit',month:'short'});
  $('#weekRange').textContent=`${ws.toLocaleDateString('es-BO',{day:'2-digit',month:'short'})} – ${we.toLocaleDateString('es-BO',{day:'2-digit',month:'short'})}`;
  $('#monthLabel').textContent=now.toLocaleDateString('es-BO',{month:'long',year:'numeric'});
  const byPair=(arr)=>{const m={};for(const t of arr){const p=norm(t.symbol);m[p]??={pnl:0,n:0};m[p].pnl+=net(t);m[p].n++}return m};
  const dp=byPair(daily);const dEntries=Object.entries(dp).sort((a,b)=>b[1].pnl-a[1].pnl);
  $('#pairsToday').classList.toggle('empty',!dEntries.length);$('#pairsToday').innerHTML=dEntries.length?dEntries.map(([p,v])=>`<div class="pair-row"><div><strong>${p}</strong><div class="meta">${v.n} operaciones</div></div><strong class="${v.pnl>=0?'positive':'negative'}">${money(v.pnl)}</strong></div>`).join(''):'Aún no hay operaciones para hoy.';
  const wp=byPair(weekly);const wEntries=Object.entries(wp).sort((a,b)=>b[1].pnl-a[1].pnl);
  if(wEntries.length){const best=wEntries[0],worst=wEntries[wEntries.length-1];$('#bestPair').textContent=best[0];paintVal($('#bestPairValue'),best[1].pnl);$('#worstPair').textContent=worst[0];paintVal($('#worstPairValue'),worst[1].pnl)}else{$('#bestPair').textContent='—';$('#worstPair').textContent='—';paintVal($('#bestPairValue'),0);paintVal($('#worstPairValue'),0)}
  $('#weeklyPairs').classList.toggle('empty',!wEntries.length);$('#weeklyPairs').innerHTML=wEntries.length?`<table class="stats-table"><thead><tr><th>Par</th><th>Operaciones</th><th>Resultado</th></tr></thead><tbody>${wEntries.map(([p,v])=>`<tr><td><strong>${p}</strong></td><td>${v.n}</td><td class="${v.pnl>=0?'positive':'negative'}"><strong>${money(v.pnl)}</strong></td></tr>`).join('')}</tbody></table>`:'Sin datos.';
  renderCalendar(monthly,now);
}
function renderCalendar(monthly,now){const c=$('#calendar');c.innerHTML='';['L','M','X','J','V','S','D'].forEach(x=>{const e=document.createElement('div');e.className='cal-head';e.textContent=x;c.appendChild(e)});const first=new Date(now.getFullYear(),now.getMonth(),1),last=new Date(now.getFullYear(),now.getMonth()+1,0),offset=(first.getDay()||7)-1;for(let i=0;i<offset;i++){const e=document.createElement('div');e.className='cal-day blank';c.appendChild(e)}for(let day=1;day<=last.getDate();day++){const a=new Date(now.getFullYear(),now.getMonth(),day),b=new Date(a);b.setDate(day+1);const pnl=monthly.filter(t=>inRange(t,a,new Date(b-1))).reduce((s,t)=>s+net(t),0);const e=document.createElement('div');e.className='cal-day';e.innerHTML=`<span class="n">${day}</span><span class="p ${pnl>0?'positive':pnl<0?'negative':''}">${pnl?money(pnl):''}</span>`;c.appendChild(e)}}
async function sync(){const {url,key}=cfg();if(!url||!key){$('#syncStatus').innerHTML='<span class="dot"></span> Configura servidor y clave';return}try{const r=await fetch(url.replace(/\/$/,'')+'/api/trades',{headers:{'X-API-Key':key}});if(!r.ok)throw new Error('HTTP '+r.status);state.trades=await r.json();localStorage.setItem('cachedTrades',JSON.stringify(state.trades));$('#syncStatus').innerHTML='<span class="dot" style="background:#31d07f"></span> Sincronizado '+new Date().toLocaleTimeString('es-BO',{hour:'2-digit',minute:'2-digit'});render()}catch(e){$('#syncStatus').innerHTML='<span class="dot"></span> No se pudo sincronizar';const cache=localStorage.getItem('cachedTrades');if(cache){state.trades=JSON.parse(cache);render()}}}
function demo(){const now=new Date();const mk=(days,symbol,p)=>({time:new Date(now.getFullYear(),now.getMonth(),now.getDate()-days,14,0).toISOString(),symbol,profit:p,commission:-1.2,swap:0});state.trades=[mk(0,'XAUUSD.c',42),mk(0,'EURUSD.vxc',18),mk(1,'US30',-22),mk(2,'XAUUSD.c',65),mk(3,'BTCUSD.c',12),mk(4,'EURUSD.vxc',31),mk(5,'US30',-10),mk(7,'XAUUSD.c',40),mk(12,'EURUSD',-8),mk(15,'BTCUSD',53)];render()}
$('#settingsBtn').onclick=()=>{const c=cfg();$('#apiUrl').value=c.url;$('#apiKey').value=c.key;$('#currency').value=c.currency;$('#settingsDialog').showModal()};$('#saveSettings').onclick=e=>{e.preventDefault();localStorage.setItem('apiUrl',$('#apiUrl').value.trim());localStorage.setItem('apiKey',$('#apiKey').value.trim());localStorage.setItem('currency',$('#currency').value);$('#settingsDialog').close();sync()};$('#syncNowBtn').onclick=sync;$('#demoBtn').onclick=demo;
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');const cache=localStorage.getItem('cachedTrades');if(cache){state.trades=JSON.parse(cache);render()}else render();sync();setInterval(sync,60000);
