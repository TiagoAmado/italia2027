const TRIP_YEAR = 2027;

// Cotação de referência usada para converter os totais calculados em € (a partir
// dos itens do roteiro) para R$ no resumo geral. Ajustar aqui se a cotação mudar.
const EXCHANGE_RATE = 5.3;

// Custos que não são itemizados dia a dia em DAYS (passagens internacionais,
// hospedagem, seguro/eSIM) — continuam manuais porque não têm de onde ser
// recalculados automaticamente.
const FIXED_COSTS_BRL = {
  passagens: 15599.61,
  hoteis: 14234,
  seguroMiscMin: 1000,
  seguroMiscMax: 2200
};

const CITY_COLORS = {
  voo:    {c:"#6B5F52", soft:"#6B5F521a"},
  roma:   {c:"#A8552E", soft:"#A8552E1a"},
  sorrento:{c:"#2A6F63", soft:"#2A6F631a"},
  firenze:{c:"#B8862E", soft:"#B8862E1a"},
  bologna:{c:"#9E2B25", soft:"#9E2B251a"},
  ferrari:{c:"#C8102E", soft:"#C8102E1a"},
  venezia:{c:"#1D5C64", soft:"#1D5C641a"}
};

const HOTEL_ADDRESSES = {
  'Aenea Inn': 'Via Urbana, 156, 00184 Roma RM, Italy',
  'Grace Suites': 'Via Luigi de Maio, 14, 80067 Sorrento NA, Italy',
  'Palazzo dal Borgo': 'Via della Scala, 6, 50123 Firenze FI, Italy',
  'Luxury Station Suite': 'Via Giovanni Amendola, 15, 40121 Bologna BO, Italy',
  'Hotel Saturnia & International': 'Calle Larga XXII Marzo, 2398, 30124 Venezia VE, Italy'
};

const HOTELS = [
  ['Aenea Inn', 'https://www.booking.com/hotel/it/aenea-superior-inn.html'],
  ['Grace Suites', 'https://www.booking.com/hotel/it/grace-suites.html'],
  ['Palazzo dal Borgo', 'https://www.booking.com/hotel/it/aprile-palazzo-dal-borgo.html'],
  ['Luxury Station Suite', 'https://www.booking.com/hotel/it/luxury-station-suite-1.html'],
  ['Hotel Saturnia & International', 'https://www.booking.com/hotel/it/hotelsaturniainternational.html']
];

// Preço médio por diária (€), consultado via Booking MCP nas datas reais de cada
// estadia (checkin/checkout batendo com as marcações ci:true em DAYS) e dividido
// pelo número de noites da consulta. Não recalcula sozinho — atualizar manualmente
// se os preços forem reconsultados.
const HOTEL_PRICES_EUR = {
  'Aenea Inn': 171.00,
  'Grace Suites': 160.00,
  'Palazzo dal Borgo': 155.60,
  'Luxury Station Suite': 126.90,
  'Hotel Saturnia & International': 275.40
};

const ATTRACTIONS = [
  ['Coliseu', 'https://parcocolosseo.it', 'Site oficial · Parco Colosseo'],
  ['Museus do Vaticano', 'https://www.museivaticani.va', 'Site oficial · Museus do Vaticano'],
  ['Basílica de São Pedro', 'https://www.basilicasanpietro.va', 'Site oficial · Basílica de São Pedro'],
  ["Castelo Sant'Angelo", 'https://castelsantangelo.beniculturali.it', "Site oficial · Castel Sant'Angelo"],
  ['Pompeia', 'https://pompeiisites.org', 'Site oficial · Parque Arqueológico de Pompeia'],
  ['Brunelleschi', 'https://duomo.firenze.it', 'Site oficial · Grande Museo del Duomo'],
  ['Accademia', 'https://www.gallerieaccademiafirenze.it', 'Site oficial · Galleria dell\'Accademia'],
  ['Uffizi', 'https://www.uffizi.it', 'Site oficial · Uffizi'],
  ["Torre dell'Orologio", 'https://www.bolognawelcome.com/it/esperienze/300685/Visita-alla-Torre-dell-Orologio-e-alle-Collezioni-Comunali-d-Arte', 'Reserva · Bologna Welcome'],
  ['Catedral de Siena', 'https://operaduomo.siena.it', 'Site oficial · OPA SI Pass'],
  ['Museu Casa Enzo Ferrari', 'https://www.ferrari.com/it-IT/museums/info-biglietti-visite-musei-ferrari', 'Bilheteria oficial · Museus Ferrari'],
  ['Galeria Ferrari', 'https://www.ferrari.com/it-IT/museums/info-biglietti-visite-musei-ferrari', 'Bilheteria oficial · Museus Ferrari'],
  ['Test drive', 'https://www.pushstart.it/pt/test-drive/ferrari-roma-spider/', 'Reserva · PushStart'],
  ['Basílica de São Marcos', 'https://www.sanmarco-venezia.it/it/tickets', 'Bilheteria oficial · Basílica São Marcos'],
  ['Campanário de São Marcos', 'https://www.sanmarco-venezia.it/it/tickets', 'Bilheteria oficial · Campanário'],
  ['Catedral de Amalfi', 'https://www.duomodiamalfi.it', 'Site oficial · Duomo di Amalfi']
];

const DAYS = [
{d:"22/3", wk:"Segunda", city:"voo", cityLabel:"Embarque", title:"Embarque", hotel:null, hotelNote:"Em voo (sem hospedagem)", budget:0,
 items:[
  {t:"20:40", a:"Voo GRU → FCO", dur:"—", tr:"ITA Airways AZ 679", p:"—"}
 ], end:"Em voo, rumo a Roma"},

{d:"23/3", wk:"Terça", city:"roma", cityLabel:"Roma", title:"Chegada em Roma", hotel:null, hotelNote:"Chegando em Roma (sem hotel ainda)", budget:103,
 items:[
  {t:"11:35", a:"Chegada em Fiumicino", dur:"—", tr:"—", p:"—"},
  {t:"11:45", a:"Fiumicino → Roma Termini", dur:"Leonardo Express ~32min · Táxi ~40min", tr:"Leonardo Express / Táxi fixo", p:"€28,00 / €50,00", cat:"transporte"},
  {t:"~12:30", a:"Check-in — Aenea Inn", dur:"30 min", tr:"A pé / metrô (10 min)", p:"—", ci:true},
  {t:"14:30–15:30", a:"Fontana di Trevi", dur:"1h", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao"},
  {t:"15:45–16:30", a:"Panteão", dur:"45 min", tr:"A pé (8 min)", p:"€10,00", cat:"atracao"},
  {t:"16:45–18:00", a:"Piazza Navona (tempo livre)", dur:"1h15", tr:"A pé (16 min)", p:"grátis", cat:"atracao"},
  {t:"19:00–20:30", a:"Jantar — Tonnarello (Trastevere)", dur:"1h30", tr:"A pé ~35min (grátis) / Táxi ~15min (~€13,00)", p:"€65,00", cat:"comida"}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"24/3", wk:"Quarta", city:"roma", cityLabel:"Roma", title:"Roma Antiga", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:150,
 items:[
  {t:"8:00–11:00", a:"Coliseu + Fórum Romano + Palatino", dur:"3h", tr:"A pé (15 min do hotel)", p:"€40,00", flag:"Reserva obrigatória", cat:"atracao"},
  {t:"11:15–11:45", a:"Circo Máximo", dur:"30 min", tr:"A pé (12 min)", p:"grátis", cat:"atracao"},
  {t:"13:00–14:30", a:"Almoço + descanso (região do Coliseu)", dur:"1h30", tr:"—", p:"€35,00", cat:"comida"},
  {t:"15:00–18:00", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—"},
  {t:"19:30–21:00", a:"Jantar — Roscioli", dur:"1h30", tr:"A pé (23 min)", p:"€75,00", flag:"Reserva antecipada", cat:"comida"}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"25/3", wk:"Quinta", city:"roma", cityLabel:"Roma", title:"Vaticano", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:227,
 items:[
  {t:"8:00–11:00", a:"Museus do Vaticano + Capela Sistina", dur:"3h", tr:"A pé/metrô (12 min)", p:"€50,00", flag:"Reserva obrigatória", cat:"atracao"},
  {t:"11:15–12:15", a:"Basílica de São Pedro + subida à cúpula", dur:"1h", tr:"A pé (15 min dos Museus)", p:"€16,00", cat:"atracao"},
  {t:"12:15–12:30", a:"Praça São Pedro", dur:"15 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao"},
  {t:"12:45–13:30", a:"Castelo Sant'Angelo", dur:"45 min", tr:"A pé (15 min)", p:"€36,00", cat:"atracao"},
  {t:"13:45–14:45", a:"Almoço (região de Piazza Navona)", dur:"1h", tr:"A pé (10 min)", p:"€40,00", cat:"comida"},
  {t:"15:00–19:30", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—"},
  {t:"20:00–21:30", a:"Jantar — Settimio All'Arancio", dur:"1h30", tr:"A pé ~25min (grátis) / Táxi ~10min (~€10,00)", p:"€85,00", cat:"comida"}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"26/3", wk:"Sexta", city:"sorrento", cityLabel:"Sorrento", title:"Roma → Pompeia → Sorrento", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:258,
 items:[
  {t:"7:00", a:"Checkout — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true},
  {t:"7:15–8:25", a:"Roma Termini → Napoli Centrale", dur:"1h10", tr:"Frecciarossa/Italo", p:"€75,00", cat:"transporte"},
  {t:"8:25–8:55", a:"Napoli Centrale → Pompei Scavi", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", cat:"transporte"},
  {t:"9:00–13:00", a:"Pompeia — Parque Arqueológico", dur:"~3h", tr:"A pé (caminhada livre pelo sítio)", p:"€50,00", flag:"Ingresso antecipado · mala no depósito grátis da Porta Marina", cat:"atracao"},
  {t:"13:15–13:45", a:"Pompei Scavi → Sorrento Train Station", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", cat:"transporte"},
  {t:"13:45–14:45", a:"Almoço em Sorrento (centro)", dur:"1h", tr:"A pé (10 min da estação)", p:"€40,00", cat:"comida"},
  {t:"15:00", a:"Check-in — Grace Suites", dur:"—", tr:"—", p:"—", ci:true},
  {t:"15:30–17:00", a:"Piazza Tasso + centro histórico", dur:"1h30", tr:"A pé (5 min do hotel)", p:"grátis", cat:"atracao"},
  {t:"20:00–21:30", a:"Jantar — Trattoria Da Emilia dal 1947", dur:"1h30", tr:"A pé (10 min)", p:"€65,00", cat:"comida"}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"27/3", wk:"Sábado", city:"sorrento", cityLabel:"Sorrento", title:"Costa Amalfitana", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:106,
 items:[
  {t:"8:30–9:05", a:"Sorrento → Positano", dur:"Ferry ~35min · Ônibus SITA ~50min", tr:"Ferry (confirmar sazonal) / Ônibus SITA", p:"Ferry a confirmar / Ônibus ~€5,00", cat:"transporte"},
  {t:"9:15–11:00", a:"Positano — Spiaggia Grande", dur:"1h45", tr:"A pé (3 min do porto)", p:"grátis", cat:"atracao"},
  {t:"11:30–12:30", a:"Positano → Amalfi", dur:"Ferry ~25-30min · Ônibus SITA ~45-50min", tr:"Ferry / Ônibus SITA", p:"Ferry ~€30,00 / Ônibus ~€5,00", cat:"transporte"},
  {t:"12:30–13:30", a:"Catedral de Amalfi", dur:"1h", tr:"A pé (5 min do porto)", p:"€6,00", cat:"atracao"},
  {t:"20:00–21:30", a:"Jantar — La Tagliata", dur:"1h30", tr:"Táxi (21 min)", p:"€90,00", flag:"Reserva com antecedência", cat:"comida"}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"28/3", wk:"Domingo", city:"sorrento", cityLabel:"Sorrento · Páscoa", title:"Páscoa em Sorrento", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:120,
 items:[
  {t:"9:30–10:15", a:"Villa Comunale di Sorrento", dur:"45 min", tr:"A pé (3 min)", p:"grátis", cat:"atracao"},
  {t:"10:45–12:15", a:"Bagni Regina Giovanna", dur:"1h30", tr:"A pé (38 min)", p:"grátis", cat:"atracao"},
  {t:"20:00–21:30", a:"Jantar de Páscoa — L'Antica Trattoria", dur:"1h30", tr:"A pé (3 min)", p:"€120,00", flag:"Reserva obrigatória — feriado", cat:"comida"}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"29/3", wk:"Segunda", city:"firenze", cityLabel:"Florença", title:"Sorrento → Florença", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:148,
 items:[
  {t:"8:00", a:"Checkout — Grace Suites", dur:"—", tr:"—", p:"—", ci:true},
  {t:"8:15–9:25", a:"Sorrento → Napoli Centrale", dur:"~1h10", tr:"EAV Circumvesuviana", p:"€10,00", cat:"transporte"},
  {t:"9:30–10:15", a:"Almoço — L'Antica Pizzeria da Michele", dur:"45 min", tr:"A pé (15 min da estação)", p:"€12,00", cat:"comida"},
  {t:"11:00–15:00", a:"Napoli Centrale → Firenze S.M. Novella", dur:"~3h/4h", tr:"Frecciarossa", p:"€110,00", flag:"Atenção: Pasquetta, trem mais cheio", cat:"transporte"},
  {t:"15:30", a:"Check-in — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", ci:true},
  {t:"16:00–16:30", a:"Piazza della Signoria", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao"},
  {t:"16:45–17:30", a:"Santa Maria del Fiore (vista externa)", dur:"45 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao"},
  {t:"19:30–20:30", a:"Jantar — All'Antico Vinaio", dur:"1h", tr:"A pé (13 min)", p:"€16,00", cat:"comida"}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"30/3", wk:"Terça", city:"firenze", cityLabel:"Florença", title:"Florença Clássica", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:104,
 items:[
  {t:"8:00–10:00", a:"Cúpula do Brunelleschi", dur:"1h30–2h", tr:"A pé (9 min)", p:"€40,00", flag:"Reserva obrigatória — OPA Pass", cat:"atracao"},
  {t:"10:15–11:15", a:"Galeria da Accademia (David)", dur:"1h", tr:"A pé (6 min)", p:"€24,00", cat:"atracao"},
  {t:"11:30–12:00", a:"Ponte Vecchio", dur:"30 min", tr:"A pé (14 min)", p:"grátis", cat:"atracao"},
  {t:"13:00–14:00", a:"Almoço — Trattoria Mario", dur:"1h", tr:"A pé (10 min)", p:"€40,00", flag:"Chegar cedo, lota", cat:"comida"},
  {t:"18:00–19:00", a:"Piazzale Michelangelo (pôr do sol)", dur:"1h", tr:"A pé ~30-35min subida (grátis) / Ônibus 12/13 ~15-20min (~€3,40)", p:"grátis", cat:"atracao"}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"31/3", wk:"Quarta", city:"firenze", cityLabel:"Florença", title:"Florença (Uffizi)", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:110,
 items:[
  {t:"8:15–8:30", a:"Chegada Galleria degli Uffizi", dur:"—", tr:"A pé (18 min do hotel)", p:"a confirmar", flag:"Reserva obrigatória — chegar 15 min antes", cat:"atracao"},
  {t:"8:30–11:30", a:"Galleria degli Uffizi", dur:"3h", tr:"—", p:"(incluso acima)", cat:"atracao"},
  {t:"11:45–12:30", a:"Café/gelato — Piazza della Repubblica", dur:"45 min", tr:"A pé (5 min)", p:"€15,00", cat:"comida"},
  {t:"13:00–14:00", a:"Almoço no Oltrarno (Santo Spirito)", dur:"1h", tr:"A pé (atravessar Ponte Vecchio, ~15 min)", p:"€35,00", cat:"comida"},
  {t:"14:30–16:30", a:"Giardino di Boboli", dur:"2h", tr:"A pé (10 min)", p:"a confirmar", cat:"atracao"},
  {t:"17:00–18:30", a:"Tempo livre — Santo Spirito / compras", dur:"livre", tr:"A pé (8 min)", p:"—"},
  {t:"20:00", a:"Jantar no Oltrarno (trattoria local)", dur:"1h30", tr:"A pé (5 min)", p:"€60,00", cat:"comida"}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"1/4", wk:"Quinta", city:"bologna", cityLabel:"Bologna", title:"Florença → Bologna", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:145,
 items:[
  {t:"11:30", a:"Checkout — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", ci:true},
  {t:"12:00–12:40", a:"Firenze S.M. Novella → Bologna Centrale", dur:"~35–40 min", tr:"Frecciarossa/Italo", p:"€55,00", cat:"transporte"},
  {t:"13:00", a:"Check-in — Luxury Station Suite", dur:"—", tr:"—", p:"—", ci:true},
  {t:"15:00–15:30", a:"Piazza Maggiore", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao"},
  {t:"15:45–17:15", a:"Torre dell'Orologio", dur:"1h30", tr:"A pé (7 min)", p:"€20,00", flag:"Reserva obrigatória", cat:"atracao"},
  {t:"17:30–18:15", a:"Mercato di Mezzo", dur:"45 min", tr:"A pé (8 min)", p:"grátis (compras à parte)", cat:"atracao"},
  {t:"19:30–21:00", a:"Jantar — Osteria dell'Orsa", dur:"1h30", tr:"A pé (7 min)", p:"€70,00", cat:"comida"}
 ], end:"Dormindo no Luxury Station Suite (Bologna)"},

{d:"2/4", wk:"Sexta", city:"ferrari", cityLabel:"Ferrari Day", title:"Ferrari Day", hotel:"Luxury Station Suite", hotelNote:"Hospedados no Luxury Station Suite (Bologna)", budget:570,
 items:[
  {t:"7:30–8:00", a:"Café da manhã, checkout — Luxury Station Suite", dur:"30 min", tr:"—", p:"—", ci:true},
  {t:"8:00–8:15", a:"Guardar bagagem no locker (KiPoint) da Bologna Centrale", dur:"15 min", tr:"A pé (2 min, dentro da estação)", p:"a confirmar", cat:"transporte"},
  {t:"8:30–8:55", a:"Bologna Centrale → Modena", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", cat:"transporte"},
  {t:"9:05–10:25", a:"Museu Casa Enzo Ferrari (Modena)", dur:"1h20", tr:"A pé (10 min estação→museu, 10 min volta)", p:"€56,00", cat:"atracao"},
  {t:"10:40–11:15", a:"Modena → Maranello", dur:"~35 min", tr:"Navetta \"Discover Ferrari\" (ida/volta)", p:"€20,00", cat:"transporte"},
  {t:"11:15–13:00", a:"Galeria Ferrari (Maranello)", dur:"1h45", tr:"A pé (2 min do ponto da navetta)", p:"(incluso na navetta)", cat:"atracao"},
  {t:"13:00–14:00", a:"Almoço em Maranello", dur:"1h", tr:"A pé (10 min)", p:"€35,00", cat:"comida"},
  {t:"14:00–15:30", a:"Test drive — Ferrari Roma Spider (PushStart)", dur:"1h30 (com folga)", tr:"A pé (frente ao museu)", p:"€300,00", cat:"atracao"},
  {t:"15:30–18:00", a:"Tempo livre em Maranello (loja, café, relax)", dur:"2h30", tr:"—", p:"—"},
  {t:"18:00–18:35", a:"Maranello → Modena", dur:"~35 min", tr:"Navetta \"Discover Ferrari\"", p:"(incluso acima)", cat:"transporte"},
  {t:"18:35–19:00", a:"Modena → Bologna Centrale", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", cat:"transporte"},
  {t:"19:00–19:15", a:"Retirar bagagem do locker", dur:"15 min", tr:"A pé (2 min)", p:"(incluso acima)", cat:"transporte"},
  {t:"19:30–20:50", a:"Bologna Centrale → Venezia Santa Lucia", dur:"~1h10–1h30", tr:"Frecciarossa", p:"€80,00", cat:"transporte"},
  {t:"21:15", a:"Check-in — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", ci:true},
  {t:"21:30", a:"Jantar tardio / room service (San Marco)", dur:"—", tr:"A pé (5 min do hotel)", p:"€55,00", cat:"comida"}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"3/4", wk:"Sábado", city:"venezia", cityLabel:"Veneza", title:"Veneza", hotel:"Hotel Saturnia & International", hotelNote:"Hospedados no Hotel Saturnia & International (Veneza)", budget:120,
 items:[
  {t:"9:00–9:30", a:"Piazza San Marco", dur:"30 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao"},
  {t:"9:45–10:45", a:"Basílica de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€10,00", cat:"atracao"},
  {t:"11:00–12:00", a:"Campanário de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€30,00", cat:"atracao"},
  {t:"12:15–13:00", a:"Ponte de Rialto", dur:"45 min", tr:"A pé (7 min)", p:"grátis", cat:"atracao"},
  {t:"20:00–21:30", a:"Jantar — Trattoria alla Madonna", dur:"1h30", tr:"A pé (11 min)", p:"€80,00", cat:"comida"}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"4/4", wk:"Domingo", city:"roma", cityLabel:"Veneza → Roma", title:"Veneza → Roma", hotel:"Hotel Saturnia & International", hotelNote:"Hospedados no Hotel Saturnia & International (Veneza)", budget:205,
 items:[
  {t:"9:00–9:45", a:"Fondamenta delle Zattere (Dorsoduro)", dur:"45 min", tr:"A pé (11 min)", p:"grátis", cat:"atracao"},
  {t:"10:15", a:"Checkout — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", ci:true},
  {t:"10:30–14:00", a:"Venezia Santa Lucia → Roma Termini", dur:"~3h30–4h", tr:"Frecciarossa", p:"€130,00", cat:"transporte"},
  {t:"15:00", a:"Check-in — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true},
  {t:"20:00–21:30", a:"Jantar de despedida — Trattoria Da Enzo (Trastevere)", dur:"1h30", tr:"A pé ~27min (grátis) / Táxi ~12min (~€13,00)", p:"€75,00", cat:"comida"}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"5/4", wk:"Segunda", city:"roma", cityLabel:"Roma", title:"Volta ao Brasil", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:28,
 items:[
  {t:"Manhã", a:"Livre / últimas compras", dur:"livre", tr:"—", p:"—"},
  {t:"12:00", a:"Checkout — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true},
  {t:"19:00", a:"Roma Termini → Fiumicino", dur:"Leonardo Express ~32min · Táxi ~40min", tr:"Leonardo Express / Táxi fixo", p:"€28,00 / €50,00", cat:"transporte"},
  {t:"22:05", a:"Voo FCO → GRU", dur:"—", tr:"ITA Airways AZ 674", p:"—"}
 ], end:"Em voo, rumo a São Paulo"}
];
