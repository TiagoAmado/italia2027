// Funções puras para identificar o dia e o compromisso atual no fuso correto.
function dateTimePartsInZone(date, timeZone){
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', hourCycle:'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(part=>part.type!=='literal').map(part=>[part.type, Number(part.value)]));
}

function findTripDayIndex(days, now){
  for(let i=0;i<days.length;i++){
    const day = days[i];
    const [date, month] = day.d.split('/').map(Number);
    const current = dateTimePartsInZone(now, day.timeZone || 'Europe/Rome');
    if(current.year===TRIP_YEAR && current.month===month && current.day===date) return i;
  }
  return -1;
}

function itemStartMinutes(item){
  const match = String(item.t || '').replace(/~/g,'').match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function itemEndMinutes(item, start){
  const range = String(item.t || '').replace(/~/g,'').match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if(range) return Number(range[3]) * 60 + Number(range[4]);
  const duration = parseDurationMinutes(item.dur);
  return duration ? start + duration : start;
}

function getDayLiveStatus(day, nowDate){
  const zone = day.timeZone || 'Europe/Rome';
  const now = dateTimePartsInZone(nowDate, zone);
  const currentMinutes = now.hour * 60 + now.minute;
  const timed = day.items.map(item=>{
    const start = itemStartMinutes(item);
    return start==null ? null : {item, start, end:itemEndMinutes(item, start)};
  }).filter(Boolean);
  const currentIndex = timed.findIndex(entry=>entry.end>entry.start && currentMinutes>=entry.start && currentMinutes<entry.end);
  if(currentIndex>=0) return {label:'Agora', primary:timed[currentIndex].item.a, next:timed[currentIndex+1] || null};
  const next = timed.find(entry=>entry.start>=currentMinutes);
  if(next) return {label:'Próximo', primary:next.item.a, next:null, time:next.item.t};
  return {label:'Hoje', primary:'Programação concluída por hoje', next:null};
}
