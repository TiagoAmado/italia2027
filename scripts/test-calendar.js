const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {TextEncoder};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context, {filename:'data.js'});
vm.runInContext(fs.readFileSync(path.join(root, 'calendar.js'), 'utf8'), context, {filename:'calendar.js'});
vm.runInContext('globalThis.__calendarTest = {DAYS, buildICS, parseItemTimes}', context);

const {DAYS, buildICS, parseItemTimes} = context.__calendarTest;
const calendar = buildICS(DAYS);
const failures = [];

function expect(condition, message){ if(!condition) failures.push(message); }

expect(calendar.includes('DTSTART;TZID=America/Sao_Paulo:20270322T204000'), 'Voo de ida sem fuso de São Paulo');
expect(calendar.includes('DTSTART;TZID=Europe/Rome:20270323T113500'), 'Chegada em Roma sem fuso italiano');
expect(calendar.includes('BEGIN:VTIMEZONE\r\nTZID:Europe/Rome'), 'VTIMEZONE de Roma ausente');
expect(calendar.includes('BEGIN:VTIMEZONE\r\nTZID:America/Sao_Paulo'), 'VTIMEZONE de São Paulo ausente');

const outbound = parseItemTimes(DAYS[0], DAYS[0].items[0]);
expect(outbound.end === null, 'Evento pontual ganhou duração artificial');

const encoder = new TextEncoder();
calendar.split('\r\n').forEach((line, index) => {
  expect(encoder.encode(line).length <= 75, `Linha ${index + 1} excede 75 bytes`);
});

if(failures.length){
  console.error(failures.map(failure => `- ${failure}`).join('\n'));
  process.exitCode = 1;
}else{
  console.log('Calendário válido: fusos, eventos pontuais e line folding verificados.');
}
