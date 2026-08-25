// Regras de orçamento e hospedagem. Mantidas fora da camada de renderização para
// poderem ser validadas sem DOM e reutilizadas por novas visões no futuro.
function fmtEUR(n){
  return '€ ' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function fmtBRL(n){
  return 'R$ ' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// Extrai o menor valor em euros presente numa string ("€28,00 / €50,00" -> 28).
// Textos sem número resultam em zero; budgetEUR permite informar o total explícito.
function parseEuroMin(str){
  if(!str) return 0;
  const matches = [...String(str).matchAll(/€\s?([\d.]+),(\d{2})/g)];
  if(!matches.length) return 0;
  const vals = matches.map(m => parseFloat(m[1].replace(/\./g,'')) + parseFloat(m[2])/100);
  return Math.min(...vals);
}

function itemBudgetEUR(item){
  return Number.isFinite(item.budgetEUR) ? item.budgetEUR : parseEuroMin(item.p);
}

function categorySumsEUR(){
  const sums = {transporte:0, comida:0, atracao:0};
  DAYS.forEach(day=>{
    day.items.forEach(it=>{
      if(!it.cat) return;
      sums[it.cat] += itemBudgetEUR(it);
    });
  });
  return sums;
}

function hotelNightsSummary(){
  const nights = {};
  const firstDayIndex = {};
  DAYS.forEach((day, dayIndex)=>{
    if(!day.overnightHotelId) return;
    nights[day.overnightHotelId] = (nights[day.overnightHotelId] || 0) + 1;
    if(firstDayIndex[day.overnightHotelId] == null) firstDayIndex[day.overnightHotelId] = dayIndex;
  });
  return Object.entries(HOTEL_CATALOG)
    .map(([id, hotel])=>({id, name:hotel.name, city:hotel.city, nights:nights[id] || 0, pricePerNight:hotel.priceEUR ?? null, firstDayIndex:firstDayIndex[id]}))
    .filter(h=>h.nights>0);
}

function categoryItems(catName){
  return DAYS.flatMap(day => day.items.filter(it=>it.cat===catName).map(it=>({d:day.d, cityLabel:day.cityLabel, a:it.a, p:it.p})));
}
