const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context, {filename:'data.js'});
vm.runInContext(fs.readFileSync(path.join(root, 'links.js'), 'utf8'), context, {filename:'links.js'});
vm.runInContext('globalThis.__linksTest = {DAYS, HOTEL_CATALOG, mapsUrl, getMapsLinksFor, getLinksFor}', context);

const {DAYS, HOTEL_CATALOG, mapsUrl, getMapsLinksFor, getLinksFor} = context.__linksTest;
const failures = [];
const expect = (condition, message)=>{ if(!condition) failures.push(message); };

const hotelItem = DAYS.flatMap(day=>day.items).find(item=>item.hotelId);
const hotelActions = getLinksFor(hotelItem);
const hotelMaps = getMapsLinksFor(hotelItem, DAYS[1]);
expect(hotelActions.some(link=>link.url===HOTEL_CATALOG[hotelItem.hotelId].bookingUrl), 'link canônico do hotel ausente');
expect(hotelMaps.length===1 && decodeURIComponent(hotelMaps[0].url).includes(HOTEL_CATALOG[hotelItem.hotelId].address), 'Maps não usou o endereço canônico do hotel');

const trainLinks = getLinksFor({a:'Roma Termini → Napoli Centrale', tr:'Frecciarossa/Italo'});
expect(trainLinks.some(link=>link.url.includes('trenitalia.com')), 'link da Trenitalia ausente');
expect(trainLinks.some(link=>link.url.includes('italotreno.it')), 'link da Italo ausente');

const routeMaps = getMapsLinksFor({a:'Roma Termini → Napoli Centrale'}, {cityLabel:'Roma'});
expect(routeMaps.length===2, 'trecho com seta não gerou dois pontos no Maps');
expect(mapsUrl('Piazza San Marco').includes('Piazza%20San%20Marco'), 'query do Maps não foi codificada');

if(failures.length){
  console.error(failures.map(failure=>`- ${failure}`).join('\n'));
  process.exitCode = 1;
}else{
  console.log('Links válidos: hotéis, mapas e operadores de transporte verificados.');
}
