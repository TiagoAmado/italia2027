const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {Intl};
vm.createContext(context);
['data.js','calendar.js','trip-time.js'].forEach(file=>{
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
});
vm.runInContext('globalThis.__tripTimeTest = {DAYS, findTripDayIndex, getDayLiveStatus}', context);
const {DAYS, findTripDayIndex, getDayLiveStatus} = context.__tripTimeTest;

const failures = [];
function expect(condition, message){ if(!condition) failures.push(message); }

expect(findTripDayIndex(DAYS, new Date('2027-03-22T23:00:00Z'))===0, 'Embarque não usa o fuso de São Paulo');
expect(findTripDayIndex(DAYS, new Date('2027-03-23T10:00:00Z'))===1, 'Chegada não usa o fuso de Roma');

const ancientRome = DAYS.find(day=>day.d==='24/3');
const duringColosseum = getDayLiveStatus(ancientRome, new Date('2027-03-24T07:30:00Z'));
expect(duringColosseum.label==='Agora' && duringColosseum.primary.includes('Coliseu'), 'Atividade atual incorreta');
const beforeCircus = getDayLiveStatus(ancientRome, new Date('2027-03-24T10:05:00Z'));
expect(beforeCircus.label==='Próximo' && beforeCircus.primary.includes('Circo Máximo'), 'Próxima atividade incorreta');

if(failures.length){
  console.error(failures.map(failure=>`- ${failure}`).join('\n'));
  process.exitCode = 1;
}else{
  console.log('Modo Hoje válido: fusos, atividade atual e próxima atividade verificados.');
}
