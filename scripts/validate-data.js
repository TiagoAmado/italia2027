const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\n' +
  fs.readFileSync(path.join(root, 'budget.js'), 'utf8') +
  '\n;globalThis.__tripData = { DAYS, CITY_COLORS, HOTEL_CATALOG, CHECKLIST_ITEMS, itemBudgetEUR };';
const context = {};
vm.createContext(context);
vm.runInContext(source, context, {filename:'data.js'});

const {DAYS, CITY_COLORS, HOTEL_CATALOG, CHECKLIST_ITEMS, itemBudgetEUR} = context.__tripData;
const errors = [];
const validCategories = new Set(['transporte', 'comida', 'atracao']);
const validStatuses = new Set(['confirmado', 'a-reservar', 'pendente']);

function minutes(value){
  const match = String(value || '').replace(/~/g, '').match(/^(\d{1,2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function scheduledRange(item){
  const raw = String(item.t || '').replace(/~/g, '').trim();
  const range = raw.match(/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/);
  if(range) return {start:minutes(range[1]), end:minutes(range[2])};
  const start = minutes(raw);
  if(start == null) return null;
  const hourDuration = String(item.dur || '').match(/(\d+)\s*h\s*(\d+)?/);
  const minuteDuration = String(item.dur || '').match(/(\d+)\s*min/);
  const duration = hourDuration
    ? Number(hourDuration[1]) * 60 + Number(hourDuration[2] || 0)
    : minuteDuration ? Number(minuteDuration[1]) : 0;
  return {start, end:start + duration};
}

const dates = new Set();
DAYS.forEach(day => {
  if(dates.has(day.d)) errors.push(`Dia duplicado: ${day.d}`);
  dates.add(day.d);
  if(!CITY_COLORS[day.city]) errors.push(`${day.d}: cidade sem cor (${day.city})`);
  if(day.overnightHotelId && !HOTEL_CATALOG[day.overnightHotelId]) errors.push(`${day.d}: hotel de pernoite inválido`);

  let calculatedBudget = 0;
  const scheduled = [];
  day.items.forEach((item, index) => {
    if(item.cat && !validCategories.has(item.cat)) errors.push(`${day.d} item ${index + 1}: categoria inválida`);
    if(item.status && !validStatuses.has(item.status)) errors.push(`${day.d} item ${index + 1}: status inválido`);
    if(item.ci && !HOTEL_CATALOG[item.hotelId]) errors.push(`${day.d} ${item.a}: check-in/checkout sem hotelId válido`);
    if(String(item.p || '').includes('/pessoa') && !Number.isFinite(item.budgetEUR)){
      errors.push(`${day.d} ${item.a}: preço por pessoa sem budgetEUR total`);
    }
    if(item.cat) calculatedBudget += itemBudgetEUR(item);
    const range = scheduledRange(item);
    if(range) scheduled.push({name:item.a, ...range});
  });

  if(Math.abs(calculatedBudget - day.budget) > 0.001){
    errors.push(`${day.d}: orçamento ${day.budget}, calculado ${calculatedBudget}`);
  }

  scheduled.sort((a,b) => a.start - b.start);
  for(let i = 1; i < scheduled.length; i++){
    if(scheduled[i].start < scheduled[i - 1].end){
      errors.push(`${day.d}: sobreposição entre "${scheduled[i - 1].name}" e "${scheduled[i].name}"`);
    }
  }
});

const checklistIds = new Set();
let lastChecklistDate = '';
CHECKLIST_ITEMS.forEach(item => {
  if(checklistIds.has(item.id)) errors.push(`Checklist ID duplicado: ${item.id}`);
  checklistIds.add(item.id);
  if(item.date < lastChecklistDate) errors.push(`Checklist fora de ordem: ${item.id}`);
  lastChecklistDate = item.date;
});

Object.entries(HOTEL_CATALOG).forEach(([id, hotel]) => {
  if(!hotel.name || !hotel.city) errors.push(`Hotel incompleto: ${id}`);
  if(!hotel.address) errors.push(`Hotel sem endereço: ${id}`);
  if(!hotel.bookingUrl) errors.push(`Hotel sem URL: ${id}`);
  if(!Number.isFinite(hotel.totalBRL)) errors.push(`Hotel sem preço: ${id}`);
  if(!hotel.checkIn || !hotel.checkOut) errors.push(`Hotel sem datas: ${id}`);
  if(!hotel.room) errors.push(`Hotel sem tipo de quarto: ${id}`);
});

if(errors.length){
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exitCode = 1;
}else{
  const itemCount = DAYS.reduce((total, day) => total + day.items.length, 0);
  console.log(`Dados válidos: ${DAYS.length} dias, ${itemCount} atividades e ${CHECKLIST_ITEMS.length} itens de checklist.`);
}
