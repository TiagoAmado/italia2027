// Links de ação são derivados dos dados para não duplicar URLs em cada atividade.
function mapsUrl(query){
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

function getMapsLinksFor(item, day){
  const links = [];
  const a = item.a || '';

  if(item.hotelId && HOTEL_CATALOG[item.hotelId]){
    const hotel = HOTEL_CATALOG[item.hotelId];
    links.push({label:hotel.name+' no Maps', url:mapsUrl(hotel.address), icon:'pin'});
    return links;
  }
  if(a.includes('Check-in') || a.includes('Checkout')){
    for(const [name, addr] of Object.entries(HOTEL_ADDRESSES)){
      if(a.includes(name)) links.push({label:name+' no Maps', url:mapsUrl(addr), icon:'pin'});
    }
    return links;
  }

  if(a.includes(' → ')){
    a.split(' → ').map(s=>s.trim()).forEach(place=>{
      links.push({label:place, url:mapsUrl(place+', Italy'), icon:'pin'});
    });
    return links;
  }

  const place = a
    .replace(/^Jantar( de Páscoa| de despedida)?\s*—?\s*/,'')
    .replace(/^Almoço\s*—?\s*(em|no)?\s*/,'')
    .replace(/^Café\/gelato\s*—\s*/,'')
    .replace(/^Test drive\s*—\s*/,'')
    .replace(/\s*\([^)]*\)\s*$/,'')
    .trim();

  if(place && place.toLowerCase() !== day.cityLabel.toLowerCase()){
    links.push({label:'Ver no Google Maps', url:mapsUrl(place+', '+day.cityLabel), icon:'pin'});
  }
  return links;
}

function getLinksFor(item){
  const links = [];
  const a = item.a || '';
  const tr = item.tr || '';

  if(item.hotelId && HOTEL_CATALOG[item.hotelId]){
    links.push({label:'Ver no Booking.com', url:HOTEL_CATALOG[item.hotelId].bookingUrl});
  }else if(a.includes('Check-in') || a.includes('Checkout')){
    HOTELS.forEach(([name,url])=>{ if(a.includes(name)) links.push({label:'Ver no Booking.com', url}); });
  }

  ATTRACTIONS.forEach(([key,url,label])=>{ if(a.includes(key)) links.push({label, url}); });

  if(tr.includes('Frecciarossa') || tr.includes('Leonardo Express') || tr.includes('Trenitalia')){
    links.push({label:'Comprar passagem · Trenitalia', url:'https://www.trenitalia.com'});
  }
  if(tr.includes('Italo')) links.push({label:'Comprar passagem · Italo', url:'https://www.italotreno.it'});
  if(tr.includes('EAV') || tr.includes('Circumvesuviana')) links.push({label:'Site oficial · EAV', url:'https://www.eavsrl.it'});
  if(tr.includes('SITA')) links.push({label:'Site oficial · SITA Sud', url:'https://www.sitasudtrasporti.it'});
  if(tr.includes('Ferry')) links.push({label:'Ferry · Travelmar', url:'https://www.travelmar.it'});

  return links;
}
