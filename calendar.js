// Geração de calendário isolada do DOM para permitir validação automatizada.
// Horários do roteiro usam o fuso de Roma por padrão; dias podem sobrescrever
// com timeZone (por exemplo, o embarque em São Paulo).
function calendarPad2(value){ return value < 10 ? '0' + value : String(value); }

function calendarDateParts(day){
  const [date, month] = day.d.split('/').map(Number);
  return {year:TRIP_YEAR, month, date};
}

function calendarStamp(parts){
  return parts.year + calendarPad2(parts.month) + calendarPad2(parts.date) + 'T' +
    calendarPad2(parts.hour) + calendarPad2(parts.minute) + '00';
}

function calendarUTCStamp(date){
  return date.getUTCFullYear() + calendarPad2(date.getUTCMonth() + 1) + calendarPad2(date.getUTCDate()) + 'T' +
    calendarPad2(date.getUTCHours()) + calendarPad2(date.getUTCMinutes()) + calendarPad2(date.getUTCSeconds()) + 'Z';
}

function calendarAddMinutes(parts, amount){
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.date, parts.hour, parts.minute));
  date.setUTCMinutes(date.getUTCMinutes() + amount);
  return {
    year:date.getUTCFullYear(), month:date.getUTCMonth() + 1, date:date.getUTCDate(),
    hour:date.getUTCHours(), minute:date.getUTCMinutes()
  };
}

function parseDurationMinutes(duration){
  if(!duration) return null;
  let match = duration.match(/(\d+)\s*h\s*(\d+)?/);
  if(match) return Number(match[1]) * 60 + Number(match[2] || 0);
  match = duration.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : null;
}

function parseItemTimes(day, item){
  const raw = String(item.t || '').replace(/~/g, '').trim();
  const base = calendarDateParts(day);
  const range = raw.match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  const timeZone = item.timeZone || day.timeZone || 'Europe/Rome';

  if(range){
    const start = {...base, hour:Number(range[1]), minute:Number(range[2])};
    let end = {...base, hour:Number(range[3]), minute:Number(range[4])};
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    if(endMinutes <= startMinutes) end = calendarAddMinutes(end, 24 * 60);
    return {start, end, timeZone};
  }

  const single = raw.match(/^(\d{1,2}):(\d{2})$/);
  if(!single) return null;
  const start = {...base, hour:Number(single[1]), minute:Number(single[2])};
  const duration = Number.isFinite(item.calendarMinutes) ? item.calendarMinutes : parseDurationMinutes(item.dur);
  return {start, end:duration ? calendarAddMinutes(start, duration) : null, timeZone};
}

function icsEscape(value){
  return String(value || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function icsFoldLine(line){
  const encoder = new TextEncoder();
  const folded = [];
  let current = '';
  let limit = 75;
  for(const character of line){
    if(encoder.encode(current + character).length > limit){
      folded.push(current);
      current = ' ' + character;
      limit = 75;
    }else{
      current += character;
    }
  }
  folded.push(current);
  return folded;
}

function calendarTimeZones(){
  return [
    'BEGIN:VTIMEZONE','TZID:Europe/Rome','X-LIC-LOCATION:Europe/Rome',
    'BEGIN:DAYLIGHT','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT',
    'BEGIN:STANDARD','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE',
    'BEGIN:VTIMEZONE','TZID:America/Sao_Paulo','X-LIC-LOCATION:America/Sao_Paulo',
    'BEGIN:STANDARD','TZOFFSETFROM:-0300','TZOFFSETTO:-0300','TZNAME:-03','DTSTART:19700101T000000','END:STANDARD','END:VTIMEZONE'
  ];
}

function buildICS(days){
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roteiro Italia//PT-BR//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH', ...calendarTimeZones()];
  const stamp = calendarUTCStamp(new Date());
  let count = 0;

  days.forEach(day => day.items.forEach(item => {
    const times = parseItemTimes(day, item);
    if(!times) return;
    count++;
    const description = [];
    if(item.tr && item.tr !== '—') description.push('Transporte: ' + item.tr);
    if(item.p && item.p !== '—') description.push('Valor: ' + item.p);
    if(item.flag) description.push('Atenção: ' + item.flag);
    if(item.desc) description.push(item.desc);

    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + TRIP_YEAR + '-' + day.d.replace('/', '-') + '-' + count + '@roteiro-italia');
    lines.push('DTSTAMP:' + stamp);
    lines.push('DTSTART;TZID=' + times.timeZone + ':' + calendarStamp(times.start));
    if(times.end) lines.push('DTEND;TZID=' + times.timeZone + ':' + calendarStamp(times.end));
    lines.push('SUMMARY:' + icsEscape(item.a));
    if(description.length) lines.push('DESCRIPTION:' + icsEscape(description.join(' · ')));
    lines.push('LOCATION:' + icsEscape(day.cityLabel));
    lines.push('END:VEVENT');
  }));

  lines.push('END:VCALENDAR');
  return lines.flatMap(icsFoldLine).join('\r\n');
}
