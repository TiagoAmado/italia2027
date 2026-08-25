const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context, {filename:'data.js'});
vm.runInContext(fs.readFileSync(path.join(root, 'budget.js'), 'utf8'), context, {filename:'budget.js'});
vm.runInContext('globalThis.__budgetTest = {DAYS, parseEuroMin, itemBudgetEUR, categorySumsEUR, hotelNightsSummary, categoryItems}', context);

const {DAYS, parseEuroMin, itemBudgetEUR, categorySumsEUR, hotelNightsSummary, categoryItems} = context.__budgetTest;
const failures = [];
const expect = (condition, message)=>{ if(!condition) failures.push(message); };
const closeTo = (actual, expected)=>Math.abs(actual-expected)<0.001;

expect(parseEuroMin('Ferry €28,00 / ônibus €5,00')===5, 'parseEuroMin não escolheu o menor valor');
expect(parseEuroMin('a confirmar')===0, 'texto sem preço não resultou em zero');
expect(itemBudgetEUR({p:'€12,00/pessoa', budgetEUR:24})===24, 'budgetEUR explícito não prevaleceu');

const sums = categorySumsEUR();
expect(closeTo(sums.transporte, 606), `transporte esperado 606, recebido ${sums.transporte}`);
expect(closeTo(sums.comida, 1196), `comida esperada 1196, recebida ${sums.comida}`);
expect(closeTo(sums.atracao, 742), `atrações esperadas 742, recebidas ${sums.atracao}`);
expect(closeTo(Object.values(sums).reduce((sum,value)=>sum+value,0), DAYS.reduce((sum,day)=>sum+day.budget,0)), 'categorias e soma dos dias divergiram');
expect(categoryItems('transporte').length>0, 'detalhamento de transporte vazio');

const stays = hotelNightsSummary();
expect(stays.length===5, `esperadas 5 estadias, recebidas ${stays.length}`);
expect(stays.reduce((sum,stay)=>sum+stay.nights,0)===13, 'total de noites diferente de 13');
expect(closeTo(stays.reduce((sum,stay)=>sum+stay.nights*stay.pricePerNight,0), 2264.4), 'total de hotéis diferente de € 2.264,40');

if(failures.length){
  console.error(failures.map(failure=>`- ${failure}`).join('\n'));
  process.exitCode = 1;
}else{
  console.log('Orçamento válido: categorias, totais diários e estadias verificados.');
}
