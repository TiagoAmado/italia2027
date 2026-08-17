function dateForDay(day){
  const [dd, mm] = day.d.split('/').map(Number);
  return new Date(TRIP_YEAR, mm-1, dd);
}

function findTodayIndex(){
  const now = new Date();
  for(let i=0;i<DAYS.length;i++){
    const dd = dateForDay(DAYS[i]);
    if(dd.getFullYear()===now.getFullYear() && dd.getMonth()===now.getMonth() && dd.getDate()===now.getDate()) return i;
  }
  return -1;
}

let active = 0;
let mode = 'byday'; // 'byday' | 'summary'

const STORAGE_KEY = 'roteiroItalia.state';

function loadState(){
  const hash = location.hash.replace('#','');
  if(hash === 'resumo'){ mode = 'summary'; return; }
  const hm = hash.match(/^dia-(\d+)$/);
  if(hm){
    const idx = parseInt(hm[1],10) - 1;
    if(idx>=0 && idx<DAYS.length){ active = idx; mode = 'byday'; return; }
  }
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const st = JSON.parse(raw);
      if(typeof st.active === 'number' && st.active>=0 && st.active<DAYS.length) active = st.active;
      if(st.mode === 'summary' || st.mode === 'byday') mode = st.mode;
      return;
    }
  }catch(err){ /* localStorage indisponível — segue com o default */ }
  const todayIdx = findTodayIndex();
  if(todayIdx>=0) active = todayIdx;
}

function persistState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({active, mode})); }catch(err){ /* ignora se indisponível */ }
  try{ history.replaceState(null, '', mode==='summary' ? '#resumo' : '#dia-'+(active+1)); }catch(err){ /* ignora se indisponível */ }
}

function setMode(m){
  mode = m;
  document.getElementById('btnByDay').classList.toggle('active', m==='byday');
  document.getElementById('btnSummary').classList.toggle('active', m==='summary');
  document.getElementById('dayNav').style.display = (m==='byday') ? 'flex' : 'none';
  if(m==='byday'){ renderNav(); renderDay(); } else { renderSummary(); }
  persistState();
}
document.getElementById('btnByDay').onclick = ()=>setMode('byday');
document.getElementById('btnSummary').onclick = ()=>setMode('summary');

const THEME_KEY = 'themeMode';
const THEME_LABELS = {auto:'AUTO', light:'CLARO', dark:'ESCURO'};
const THEME_ICONS = {light:'☀', dark:'🌙'};

function getStoredThemeMode(){
  try{ return localStorage.getItem(THEME_KEY) || 'auto'; }catch(err){ return 'auto'; }
}
function setStoredThemeMode(m){
  try{ localStorage.setItem(THEME_KEY, m); }catch(err){ /* ignora se indisponível */ }
}
function systemPrefersDark(){
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function applyTheme(mode){
  const effective = mode==='auto' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-theme', effective);
  const btn = document.getElementById('themeToggle');
  if(btn){
    btn.textContent = (THEME_ICONS[effective] || '') + ' ' + THEME_LABELS[mode];
    btn.setAttribute('aria-label', 'Tema: '+THEME_LABELS[mode]+'. Toque para trocar.');
  }
}
function cycleTheme(){
  const order = ['auto','light','dark'];
  const next = order[(order.indexOf(getStoredThemeMode())+1) % order.length];
  setStoredThemeMode(next);
  applyTheme(next);
}
document.getElementById('themeToggle').onclick = cycleTheme;
applyTheme(getStoredThemeMode());
if(window.matchMedia){
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
    if(getStoredThemeMode()==='auto') applyTheme('auto');
  });
}

function fmtEUR(n){
  return '€ ' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtBRL(n){
  return 'R$ ' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// Extrai o menor valor em euros presente numa string de preço (ex.: "€28,00 / €50,00" -> 28).
// Textos sem número (grátis, a confirmar, incluso) resultam em 0 — o item continua
// categorizado, só não soma nada ao total.
function parseEuroMin(str){
  if(!str) return 0;
  const matches = [...String(str).matchAll(/€\s?([\d.]+),(\d{2})/g)];
  if(!matches.length) return 0;
  const vals = matches.map(m => parseFloat(m[1].replace(/\./g,'')) + parseFloat(m[2])/100);
  return Math.min(...vals);
}

function categorySumsEUR(){
  const sums = {transporte:0, comida:0, atracao:0};
  DAYS.forEach(day=>{
    day.items.forEach(it=>{
      if(!it.cat) return;
      sums[it.cat] += parseEuroMin(it.p);
    });
  });
  return sums;
}

function renderSummary(){
  const view = document.getElementById('dayView');
  const totalDaily = DAYS.reduce((s,d)=>s+d.budget,0);
  view.style.removeProperty('--accent-city');
  view.style.removeProperty('--accent-city-soft');

  const cat = categorySumsEUR();
  const transporteBRL = cat.transporte * EXCHANGE_RATE;
  const comidaBRL = cat.comida * EXCHANGE_RATE;
  const atracaoBRL = cat.atracao * EXCHANGE_RATE;
  const totalMin = FIXED_COSTS_BRL.passagens + FIXED_COSTS_BRL.hoteis + transporteBRL + comidaBRL + atracaoBRL + FIXED_COSTS_BRL.seguroMiscMin;
  const totalMax = FIXED_COSTS_BRL.passagens + FIXED_COSTS_BRL.hoteis + transporteBRL + comidaBRL + atracaoBRL + FIXED_COSTS_BRL.seguroMiscMax;

  view.innerHTML = `
    <div class="summary-wrap">
      <div class="pass" style="margin-bottom:18px;">
        <div class="pass-head" style="border-left-color:var(--ink);">
          <div class="eyebrow" style="color:var(--ink);">Orçamento geral</div>
          <h2>Resumo da viagem</h2>
        </div>
        <div class="items" style="padding:14px 22px 18px;">
          <table style="width:100%; border-collapse:collapse; font-size:13.5px;">
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Passagens Brasil–Itália (pago)</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">${fmtBRL(FIXED_COSTS_BRL.passagens)}</td></tr>
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Hotéis</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">~${fmtBRL(FIXED_COSTS_BRL.hoteis)}</td></tr>
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Trens e transfers</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">${fmtBRL(transporteBRL)}</td></tr>
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Alimentação</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">${fmtBRL(comidaBRL)}</td></tr>
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Atrações (inclui Ferrari/test drive)</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">${fmtBRL(atracaoBRL)}</td></tr>
            <tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">Seguro / eSIM / misc. (estimado)</td><td style="text-align:right; font-family:'IBM Plex Mono',monospace; border-bottom:1px solid var(--line);">~${fmtBRL(FIXED_COSTS_BRL.seguroMiscMin)}–${fmtBRL(FIXED_COSTS_BRL.seguroMiscMax)}</td></tr>
            <tr><td style="padding-top:10px; font-weight:700;">Total estimado</td><td style="text-align:right; font-weight:700; font-family:'IBM Plex Mono',monospace; padding-top:10px;">~${fmtBRL(totalMin)}–${fmtBRL(totalMax)}</td></tr>
          </table>
        </div>
      </div>

      <div class="summary-intro">Toque em um dia pra abrir o detalhe · valores em euros, referentes só às atividades/transporte/comida daquele dia (hospedagem já está no total geral) · Trens/Alimentação/Atrações acima são calculados a partir dos itens do roteiro (câmbio de referência: ${EXCHANGE_RATE.toLocaleString('pt-BR')})</div>
      <div style="text-align:center; padding-bottom:14px;">
        <button type="button" class="icsbtn" id="exportAllBtn">📅 Exportar roteiro completo (.ics)</button>
      </div>
      <div id="sdayList"></div>
      <div class="foot-note" style="border:1px solid var(--line); border-radius:12px; margin-top:10px; background:var(--paper-raised);">
        Soma dos dias: ${fmtEUR(totalDaily)} — itens marcados "a confirmar" (Uffizi, Boboli, ferry Amalfi) não entram nessa soma
      </div>
    </div>
  `;

  document.getElementById('exportAllBtn').addEventListener('click', exportAllICS);

  // Cria cada card via DOM real e prende o índice por VALOR (não por leitura de atributo depois),
  // evitando qualquer dependência de innerHTML/delegação para o clique funcionar.
  const list = document.getElementById('sdayList');
  DAYS.forEach((day, dayIndex) => {
    const col = CITY_COLORS[day.city];
    const card = document.createElement('div');
    card.className = 'sday';
    card.tabIndex = 0;
    card.style.setProperty('--accent-city', col.c);
    card.style.setProperty('--accent-city-soft', col.soft);

    const dateEl = document.createElement('div');
    dateEl.className = 'sd-date';
    dateEl.innerHTML = day.d + '<br>' + day.wk.slice(0,3);

    const midEl = document.createElement('div');
    midEl.className = 'sd-mid';
    const titleEl = document.createElement('div');
    titleEl.className = 'sd-title';
    titleEl.textContent = day.title;
    const hotelEl = document.createElement('div');
    hotelEl.className = 'sd-hotel';
    hotelEl.textContent = (day.hotel ? '🏨 '+day.hotel : day.hotelNote);
    midEl.appendChild(titleEl);
    midEl.appendChild(hotelEl);

    const priceEl = document.createElement('div');
    priceEl.className = 'sd-price';
    priceEl.textContent = day.budget>0 ? fmtEUR(day.budget) : '—';
    const smallEl = document.createElement('small');
    smallEl.textContent = 'no dia';
    priceEl.appendChild(smallEl);

    card.appendChild(dateEl);
    card.appendChild(midEl);
    card.appendChild(priceEl);

    // dayIndex é capturado por valor nesta própria iteração do forEach — não muda depois.
    const open = function(){ active = dayIndex; setMode('byday'); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(); }
    });

    list.appendChild(card);
  });
}

function renderNav(){
  const nav = document.getElementById('dayNav');
  nav.innerHTML = '';
  const todayIdx = findTodayIndex();
  DAYS.forEach((day,i)=>{
    const col = CITY_COLORS[day.city];
    const btn = document.createElement('button');
    btn.className = 'stub' + (i===active ? ' active':'') + (i===todayIdx ? ' today':'');
    btn.style.setProperty('--accent-city', col.c);
    btn.style.setProperty('--accent-city-soft', col.soft);
    btn.setAttribute('aria-label', day.d+' '+day.wk+' '+day.title + (i===todayIdx ? ' (hoje)':''));
    btn.innerHTML = `<div class="dnum">${day.d.split('/')[0]}</div><div class="dwk">${day.wk.slice(0,3)}</div><div class="cdot"></div>`;
    btn.onclick = ()=>{active=i; renderNav(); renderDay(); persistState();};
    nav.appendChild(btn);
  });
  try{ nav.children[active].scrollIntoView({inline:'center', block:'nearest'}); }catch(err){ /* ambiente sem suporte a scrollIntoView com opções — ignora */ }
}

function mapsUrl(query){
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

function getMapsLinksFor(item, day){
  const links = [];
  const a = item.a || '';

  // Hotel: endereço exato
  if(a.includes('Check-in') || a.includes('Checkout')){
    for(const [name, addr] of Object.entries(HOTEL_ADDRESSES)){
      if(a.includes(name)) links.push({label:'📍 '+name+' no Maps', url: mapsUrl(addr)});
    }
    return links;
  }

  // Trecho de transporte "A → B": um pino pra cada ponta
  if(a.includes(' → ')){
    a.split(' → ').map(s=>s.trim()).forEach(place=>{
      links.push({label:'📍 '+place, url: mapsUrl(place+', Italy')});
    });
    return links;
  }

  // Ponto único: limpa prefixos comuns (Jantar —, Almoço —, etc.) antes de buscar
  let place = a
    .replace(/^Jantar( de Páscoa| de despedida)?\s*—?\s*/,'')
    .replace(/^Almoço\s*—?\s*(em|no)?\s*/,'')
    .replace(/^Café\/gelato\s*—\s*/,'')
    .replace(/^Test drive\s*—\s*/,'')
    .replace(/\s*\([^)]*\)\s*$/,'')
    .trim();

  if(place && place.toLowerCase() !== day.cityLabel.toLowerCase()){
    links.push({label:'📍 Ver no Google Maps', url: mapsUrl(place + ', ' + day.cityLabel)});
  }
  return links;
}

function getLinksFor(item){
  const links = [];
  const a = item.a || '';
  const tr = item.tr || '';

  if(a.includes('Check-in') || a.includes('Checkout')){
    HOTELS.forEach(([name,url])=>{ if(a.includes(name)) links.push({label:'Ver no Booking.com', url}); });
  }

  ATTRACTIONS.forEach(([key,url,label])=>{ if(a.includes(key)) links.push({label, url}); });

  if(tr.includes('Frecciarossa') || tr.includes('Leonardo Express') || tr.includes('Trenitalia')){
    links.push({label:'Comprar passagem · Trenitalia', url:'https://www.trenitalia.com'});
  }
  if(tr.includes('Italo')){
    links.push({label:'Comprar passagem · Italo', url:'https://www.italotreno.it'});
  }
  if(tr.includes('EAV') || tr.includes('Circumvesuviana')){
    links.push({label:'Site oficial · EAV', url:'https://www.eavsrl.it'});
  }
  if(tr.includes('SITA')){
    links.push({label:'Site oficial · SITA Sud', url:'https://www.sitasudtrasporti.it'});
  }
  if(tr.includes('Ferry')){
    links.push({label:'Ferry · Travelmar', url:'https://www.travelmar.it'});
  }

  return links;
}

function pad2(n){ return n<10 ? '0'+n : ''+n; }

function icsDate(d){
  return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate())+'T'+pad2(d.getHours())+pad2(d.getMinutes())+'00';
}

function parseDurationMinutes(dur){
  if(!dur) return null;
  let m = dur.match(/(\d+)\s*h\s*(\d+)?/);
  if(m) return parseInt(m[1],10)*60 + (m[2] ? parseInt(m[2],10) : 0);
  m = dur.match(/(\d+)\s*min/);
  if(m) return parseInt(m[1],10);
  return null;
}

function parseItemTimes(day, item){
  const raw = (item.t || '').replace(/~/g,'').trim();
  const base = dateForDay(day);
  const range = raw.match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  if(range){
    const start = new Date(base); start.setHours(+range[1], +range[2], 0, 0);
    const end = new Date(base); end.setHours(+range[3], +range[4], 0, 0);
    if(end <= start) end.setDate(end.getDate()+1);
    return {start, end};
  }
  const single = raw.match(/^(\d{1,2}):(\d{2})$/);
  if(single){
    const start = new Date(base); start.setHours(+single[1], +single[2], 0, 0);
    const end = new Date(start.getTime() + (parseDurationMinutes(item.dur) || 60) * 60000);
    return {start, end};
  }
  return null;
}

function icsEscape(s){
  return String(s || '').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
}

function buildICS(days){
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roteiro Italia//PT-BR//EN','CALSCALE:GREGORIAN'];
  const stamp = icsDate(new Date()) + 'Z';
  let count = 0;
  days.forEach(day=>{
    day.items.forEach(item=>{
      const times = parseItemTimes(day, item);
      if(!times) return;
      count++;
      const desc = [];
      if(item.tr && item.tr!=='—') desc.push('Transporte: '+item.tr);
      if(item.p && item.p!=='—') desc.push('Valor: '+item.p);
      if(item.flag) desc.push('Atenção: '+item.flag);
      lines.push('BEGIN:VEVENT');
      lines.push('UID:'+count+'-'+times.start.getTime()+'@roteiro-italia');
      lines.push('DTSTAMP:'+stamp);
      lines.push('DTSTART:'+icsDate(times.start));
      lines.push('DTEND:'+icsDate(times.end));
      lines.push('SUMMARY:'+icsEscape(item.a));
      if(desc.length) lines.push('DESCRIPTION:'+icsEscape(desc.join(' · ')));
      lines.push('LOCATION:'+icsEscape(day.cityLabel));
      lines.push('END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(content, filename){
  const blob = new Blob([content], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function exportDayICS(day){
  downloadICS(buildICS([day]), 'roteiro-'+day.d.replace('/','-')+'.ics');
}

function exportAllICS(){
  downloadICS(buildICS(DAYS), 'roteiro-italia-completo.ics');
}

function renderDay(){
  const day = DAYS[active];
  const col = CITY_COLORS[day.city];
  const view = document.getElementById('dayView');
  view.style.setProperty('--accent-city', col.c);
  view.style.setProperty('--accent-city-soft', col.soft);

  const isToday = findTodayIndex() === active;

  view.innerHTML = `
    <div class="pass">
      <div class="pass-head">
        <div class="eyebrow">${day.d} · ${day.wk}${isToday ? '<span class="today-badge">HOJE</span>' : ''}</div>
        <h2>${day.title}</h2>
        <div class="hotel-line">
          <span class="tag">${day.hotel ? 'Base':'Status'}</span>
          <span>${day.hotel ? day.hotel : day.hotelNote}</span>
        </div>
      </div>
      <div class="perf"></div>
      <div class="items" id="itemsList"></div>
      ${day.budget>0 ? `
      <div class="day-budget">
        <div>
          <div class="db-label">Gasto do dia</div>
          <div class="db-note">atrações + transporte + comida</div>
        </div>
        <div class="db-value">${fmtEUR(day.budget)}</div>
      </div>` : ''}
      <div class="foot-note">🌙 ${day.end}</div>
      <div class="foot-note" style="border-top:1px dashed var(--line);">
        <button type="button" class="icsbtn" id="exportDayBtn">📅 Exportar este dia (.ics)</button>
      </div>
    </div>
  `;

  document.getElementById('exportDayBtn').addEventListener('click', ()=>exportDayICS(day));

  const itemsList = document.getElementById('itemsList');
  day.items.forEach(it=>{
    const links = [...getLinksFor(it), ...getMapsLinksFor(it, day)];
    const row = document.createElement('div');
    row.className = 'item' + (it.ci ? ' checkinout' : '');
    row.tabIndex = 0;

    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.textContent = it.t;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'body';

    const actEl = document.createElement('div');
    actEl.className = 'act';
    if(it.ci){
      const b = document.createElement('b');
      b.textContent = it.a;
      actEl.appendChild(b);
    } else {
      actEl.textContent = it.a;
    }
    if(links.length){
      const chev = document.createElement('span');
      chev.className = 'chev';
      chev.textContent = '▸';
      actEl.appendChild(chev);
    }

    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    if(it.dur && it.dur!=='—'){
      const s = document.createElement('span'); s.className='m'; s.textContent = '⏱ '+it.dur; metaEl.appendChild(s);
    }
    if(it.tr && it.tr!=='—'){
      const s = document.createElement('span'); s.className='m'; s.textContent = it.tr; metaEl.appendChild(s);
    }
    if(it.p && it.p!=='—'){
      const s = document.createElement('span'); s.className='price'; s.textContent = it.p; metaEl.appendChild(s);
    }

    bodyEl.appendChild(actEl);
    bodyEl.appendChild(metaEl);

    if(it.flag){
      const f = document.createElement('span');
      f.className = 'flag';
      f.textContent = it.flag;
      bodyEl.appendChild(f);
    }

    if(links.length){
      const linksEl = document.createElement('div');
      linksEl.className = 'item-links';
      links.forEach(l=>{
        const a = document.createElement('a');
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = '↗ ' + l.label;
        a.addEventListener('click', (e)=> e.stopPropagation());
        linksEl.appendChild(a);
      });
      bodyEl.appendChild(linksEl);

      const toggle = ()=> row.classList.toggle('expanded');
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
    } else {
      row.style.cursor = 'default';
    }

    row.appendChild(timeEl);
    row.appendChild(bodyEl);
    itemsList.appendChild(row);
  });
}

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{ /* offline/PWA é um extra — segue sem quebrar o app */ });
  });
}

loadState();
setMode(mode);
