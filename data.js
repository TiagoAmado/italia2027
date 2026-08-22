const TRIP_YEAR = 2027;

// Cotação de referência usada para converter os totais calculados em € (a partir
// dos itens do roteiro) para R$ no resumo geral. Ajustar aqui se a cotação mudar.
const EXCHANGE_RATE = 6;

// Custo que não é itemizado dia a dia em DAYS (passagens internacionais) —
// continua manual porque não tem de onde ser recalculado automaticamente.
// Hospedagem e seguro/eSIM/misc. NÃO entram aqui: são derivados (ver
// HOTEL_PRICES_EUR/hotelNightsSummary() e INSURANCE_MISC_ITEMS_BRL abaixo).
const FIXED_COSTS_BRL = {
  passagens: 15599.61
};

// Itens estimados de seguro/eSIM/imprevistos — cada um pesquisado individualmente
// (não é um valor contratado ainda). Somados, formam a linha "Seguro / eSIM /
// misc." do orçamento geral; não têm dia/cidade porque são contratados/comprados
// antes da viagem, não em um ponto específico do roteiro.
const INSURANCE_MISC_ITEMS_BRL = [
  {label: 'Seguro viagem (2 pessoas, 15 dias)', brl: 1100},
  {label: 'eSIM Itália (2 pessoas, 15 dias)', brl: 560},
  {label: 'Imprevistos / compras de última hora', brl: 400}
];

const CITY_COLORS = {
  voo:    {c:"#6B5F52", soft:"#6B5F521a"},
  roma:   {c:"#A8552E", soft:"#A8552E1a"},
  sorrento:{c:"#2A6F63", soft:"#2A6F631a"},
  firenze:{c:"#B8862E", soft:"#B8862E1a"},
  bologna:{c:"#9E2B25", soft:"#9E2B251a"},
  ferrari:{c:"#C8102E", soft:"#C8102E1a"},
  venezia:{c:"#1D5C64", soft:"#1D5C641a"}
};

// Fotos de fundo do header, por cidade — hospedadas no Unsplash (cross-origin,
// não cacheadas pelo Service Worker: ver sw.js. Sem internet, o header cai de
// volta pro fundo chapado --paper).
const CITY_HERO = {
  default: "https://images.unsplash.com/photo-1552598715-7eeb9232a2ac?auto=format&fit=crop&w=1600&q=60",
  voo:     "https://images.unsplash.com/photo-1693827752623-230fb1b1d1a8?auto=format&fit=crop&w=1600&q=60",
  roma:    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=60",
  sorrento:"https://images.unsplash.com/photo-1506609181013-277d12a39cba?auto=format&fit=crop&w=1600&q=60",
  firenze: "https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?auto=format&fit=crop&w=1600&q=60",
  bologna: "https://images.unsplash.com/photo-1667758608427-f7be105f9bc3?auto=format&fit=crop&w=1600&q=60",
  ferrari: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1600&q=60",
  venezia: "https://images.unsplash.com/photo-1523906921802-b5d2d899e93b?auto=format&fit=crop&w=1600&q=60"
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
  ['Catedral de Amalfi', 'https://www.duomodiamalfi.it', 'Site oficial · Duomo di Amalfi'],
  ['Villa Rufolo', 'https://villarufolo.com/', 'Site oficial · Villa Rufolo'],
  ['Villa Cimbrone', 'https://www.hotelvillacimbrone.com/', 'Site oficial · Jardins de Villa Cimbrone']
];

const DAYS = [
{d:"22/3", wk:"Segunda", city:"voo", cityLabel:"Embarque", title:"Embarque", hotel:null, hotelNote:"Em voo (sem hospedagem)", budget:0,
 items:[
  {t:"20:40", a:"Voo GRU → FCO", dur:"—", tr:"ITA Airways AZ 679", p:"—", status:"confirmado", desc:"Voo noturno direto GRU→FCO — durmam o quanto der, a gente desembarca de manhã e já emenda direto com Roma no mesmo dia."}
 ], end:"Em voo, rumo a Roma"},

{d:"23/3", wk:"Terça", city:"roma", cityLabel:"Roma", title:"Chegada em Roma", hotel:null, hotelNote:"Chegando em Roma (sem hotel ainda)", budget:103,
 items:[
  {t:"11:35", a:"Chegada em Fiumicino", dur:"—", tr:"—", p:"—", desc:"Pouso em Fiumicino (FCO) — depois da imigração e da bagagem, sigam as placas pra estação de trem dentro do próprio aeroporto, é onde pegamos o Leonardo Express."},
  {t:"11:45", a:"Fiumicino → Roma Termini", dur:"Leonardo Express ~32min · Táxi ~40min", tr:"Leonardo Express / Táxi fixo", p:"€28,00 / €50,00", status:"a-reservar", cat:"transporte", reserveInfo:"Sem assento marcado e sem vantagem em comprar com antecedência — trens saem a cada 15min e qualquer um serve dentro da validade do bilhete. Comprar pelo site/app da Trenitalia ou na hora mesmo, sem perder preço nem vaga.", desc:"O Leonardo Express é direto até Termini e sai de hora em hora — vale comprar antecipado pra não perder tempo na bilheteria. Se estivermos com bagagem grande e cansados do voo, o táxi fixo (~€50) até o centro pode valer a folga."},
  {t:"~12:30", a:"Check-in — Aenea Inn", dur:"30 min", tr:"A pé / metrô (10 min)", p:"—", status:"a-reservar", ci:true, desc:"Primeira base em Roma, no bairro de Monti — tranquilo e charmoso, dá pra ir andando pro Coliseu. Deixem a mala pronta e troquem de roupa antes de sair de novo."},
  {t:"14:30–15:30", a:"Fontana di Trevi", dur:"1h", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Sempre cheia, mas vale passar mesmo assim nesse primeiro dia — joguem a moeda de costas, com a mão direita por cima do ombro esquerdo (é a tradição pra garantir volta a Roma)."},
  {t:"15:45–16:30", a:"Panteão", dur:"45 min", tr:"A pé (8 min)", p:"€10,00", cat:"atracao", desc:"Entrada paga desde 2023, mas dá pra comprar na hora se não estiver muito cheio — assim que entrar, olhem pra cima: o óculo no teto é o maior furo estrutural do mundo antigo."},
  {t:"16:45–18:00", a:"Piazza Navona (tempo livre)", dur:"1h15", tr:"A pé (16 min)", p:"grátis", cat:"atracao", desc:"Tempo livre pra passear sem pressa entre as fontes de Bernini — bom lugar pra sentar num café e já sentir a energia de Roma no primeiro dia."},
  {t:"19:00–20:30", a:"Jantar — Tonnarello (Trastevere)", dur:"1h30", tr:"A pé ~35min (grátis) / Táxi ~15min (~€13,00)", p:"€65,00", cat:"comida", desc:"Trattoria clássica, animada e sem luxo — cacio e pepe e carbonara são o forte. Costuma dar fila, então cheguem no horário certo ou um pouco antes."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"24/3", wk:"Quarta", city:"roma", cityLabel:"Roma", title:"Roma Antiga", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:150,
 items:[
  {t:"8:00–11:00", a:"Coliseu + Fórum Romano + Palatino", dur:"3h", tr:"A pé (15 min do hotel)", p:"€40,00", status:"a-reservar", flag:"Reserva obrigatória", cat:"atracao", reserveInfo:"Ingressos liberados exatamente 30 dias antes da visita, à meia-noite (horário de Roma), no site oficial ticketing.colosseo.it — reservar assim que abrir a janela, esgota rápido perto da Páscoa.", desc:"Ingresso combinado pros três — reserva com horário marcado, então precisamos comprar o bilhete com antecedência (o mesmo ingresso vale pra Fórum e Palatino dentro de 24h). Usem tênis confortável, é bastante caminhada em pedra irregular."},
  {t:"11:15–11:45", a:"Circo Máximo", dur:"30 min", tr:"A pé (12 min)", p:"grátis", cat:"atracao", desc:"Hoje é só um gramado enorme onde ficava o hipódromo romano — dá pra imaginar o tamanho da arena, mas não tem muito o que visitar além da vista."},
  {t:"13:00–14:30", a:"Almoço + descanso (região do Coliseu)", dur:"1h30", tr:"—", p:"€35,00", cat:"comida", desc:"Área bem turística — prefiram um lugar um pouco afastado da entrada principal do Coliseu pra fugir da armadilha de preço/qualidade ruim."},
  {t:"15:00–18:00", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—", desc:"Hora de tirar aquele cochilo ou só relaxar no hotel — o dia é puxado de caminhada, vale recarregar antes do jantar."},
  {t:"19:30–21:00", a:"Jantar — Roscioli", dur:"1h30", tr:"A pé (23 min)", p:"€75,00", status:"a-reservar", flag:"Reserva antecipada", cat:"comida", reserveInfo:"Reservar pelo site (salumeriaroscioli.com/en/pages/prenota) ou telefone +39 06 6875287 — pedem cartão de crédito como garantia (só cobra ~€20/pessoa em caso de no-show). Como cai perto da Páscoa, reservar com meses de antecedência, não só 1-2 semanas.", desc:"Um dos restaurantes mais concorridos de Roma — reserva com bastante antecedência é essencial, ainda precisamos garantir. Carbonara e a tábua de frios/queijos são clássicos daqui."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"25/3", wk:"Quinta", city:"roma", cityLabel:"Roma", title:"Vaticano", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:227,
 items:[
  {t:"8:00–11:00", a:"Museus do Vaticano + Capela Sistina", dur:"3h", tr:"A pé/metrô (12 min)", p:"€50,00", status:"a-reservar", flag:"Reserva obrigatória", cat:"atracao", reserveInfo:"Ingressos liberados 60 dias antes da visita, à meia-noite (horário de Roma), em tickets.museivaticani.va — como é temporada alta (Páscoa), reservar o quanto antes dentro dessa janela. Só pelo site oficial ou revendedor autorizado, não vende na hora.", desc:"Reserva com horário marcado — o ingresso combinado (museus + Capela Sistina) esgota fácil, então precisamos garantir com antecedência. Ombros e joelhos cobertos são obrigatórios pra entrar."},
  {t:"11:15–12:15", a:"Basílica de São Pedro + subida à cúpula", dur:"1h", tr:"A pé (15 min dos Museus)", p:"€16,00", cat:"atracao", desc:"A subida à cúpula tem elevador só até um certo ponto — depois são ~320 degraus estreitos até o topo. Vale o esforço pela vista de Roma inteira, mas tudo bem pular a escalada se preferirmos."},
  {t:"12:15–12:30", a:"Praça São Pedro", dur:"15 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Rápida passada pela praça de Bernini antes do almoço — reparem na perspectiva das colunatas, de um ponto específico elas 'somem' e viram uma fileira só."},
  {t:"12:45–13:30", a:"Castelo Sant'Angelo", dur:"45 min", tr:"A pé (15 min)", p:"€36,00", cat:"atracao", desc:"Antigo mausoléu de Adriano virado fortaleza papal — a vista do terraço no topo é um dos melhores ângulos de Roma, com a cúpula de São Pedro ao fundo."},
  {t:"13:45–14:45", a:"Almoço (região de Piazza Navona)", dur:"1h", tr:"A pé (10 min)", p:"€40,00", cat:"comida", desc:"Mesma região do passeio de ontem à noite — dá pra repetir algum lugar que gostamos ou explorar uma trattoria nova por ali."},
  {t:"15:00–19:30", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—", desc:"Tarde mais livre depois de uma manhã pesada de fila e caminhada — bom momento pra voltar ao hotel, tomar banho e descansar antes do jantar."},
  {t:"20:00–21:30", a:"Jantar — Settimio All'Arancio", dur:"1h30", tr:"A pé ~25min (grátis) / Táxi ~10min (~€10,00)", p:"€85,00", cat:"comida", desc:"Trattoria clássica perto do Panteão, ambiente mais tranquilo — boa pedida pra fechar essa primeira passagem por Roma."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"26/3", wk:"Sexta", city:"sorrento", cityLabel:"Sorrento", title:"Roma → Pompeia → Sorrento", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:258,
 items:[
  {t:"6:15", a:"Checkout — Aenea Inn", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Deixem as malas prontas na noite anterior — saída bem cedo pro trem antecipado, então já vale ter café da manhã reservado ou algo rápido pra levar."},
  {t:"6:40–7:50", a:"Roma Termini → Napoli Centrale", dur:"1h10", tr:"Frecciarossa/Italo", p:"€75,00", status:"a-reservar", cat:"transporte", reserveInfo:"Assento sempre marcado. Reservar via trenitalia.com/app ou italotreno.it/app — a Italo libera venda com ~6 meses de antecedência, a Trenitalia normalmente com ~4 meses. Preço sobe conforme as faixas mais baratas esgotam, então quanto antes comprar, mais barato. Evitar reseller tipo Trainline, é o mesmo bilhete com taxa a mais.", desc:"Trem antecipado de propósito, pra dar mais folga na conexão em Nápoles em vez de arriscar uma baldeação apertada. Comprem a passagem com antecedência — sai mais barata e garante os assentos juntos."},
  {t:"8:20–8:50", a:"Napoli Centrale → Pompei Scavi", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", status:"a-reservar", flag:"Comprar bilhete com antecedência pelo app", cat:"transporte", reserveInfo:"Trem regional sem assento marcado e sem conceito de compra antecipada de verdade — comprar pouco antes na maquininha da estação, numa tabacaria por perto, ou aproximando o cartão de crédito na roleta (Tap&Go). O app oficial (GoEAV) pede CPF italiano pra cadastro, então não compensa tentar usar.", desc:"Trem regional da EAV Circumvesuviana, sem luxo mas rápido. Comprando o bilhete pelo app antes, a gente evita a fila da bilheteria e ganha ~30min de folga na conexão — sem aquele aperto de trocar de trem em cima da hora. Fiquem de olho nos pertences, é uma linha bem cheia."},
  {t:"9:00–13:00", a:"Pompeia — Parque Arqueológico", dur:"~3h", tr:"A pé (caminhada livre pelo sítio)", p:"€50,00", status:"a-reservar", flag:"Ingresso antecipado · mala no depósito grátis da Porta Marina", cat:"atracao", reserveInfo:"Ingressos liberados cerca de 45 dias antes da visita no site oficial (venda agora via vivaticket.com) — reservar assim que abrir, abril é alta temporada. Cuidado com sites falsos que imitam o oficial.", desc:"Ingresso antecipado recomendado pra não perder tempo na fila — deixem a mala no depósito grátis perto da Porta Marina. Usem protetor solar, chapéu e tênis confortável, é bastante sol e pedra."},
  {t:"13:15–13:45", a:"Pompei Scavi → Sorrento Train Station", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", status:"a-reservar", cat:"transporte", reserveInfo:"Mesma linha regional, sem assento marcado — comprar pouco antes na maquininha da estação, tabacaria por perto, ou Tap&Go com cartão de crédito.", desc:"Mesma linha da Circumvesuviana, agora sentido Sorrento — o trem termina o trajeto na própria estação, sem baldeação."},
  {t:"13:45–14:45", a:"Almoço em Sorrento (centro)", dur:"1h", tr:"A pé (10 min da estação)", p:"€40,00", cat:"comida", desc:"Primeiro contato com Sorrento, direto do centro perto da estação — hora de já sentir o clima mais relaxado da Costa."},
  {t:"15:00–16:00", a:"Check-in — Grace Suites", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Segunda base da viagem, em pleno centro de Sorrento — hotel bem avaliado, ótimo ponto de partida pros passeios da Costa Amalfitana."},
  {t:"15:30–17:00", a:"Piazza Tasso + centro histórico", dur:"1h30", tr:"A pé (5 min do hotel)", p:"grátis", cat:"atracao", desc:"Coração de Sorrento, boa pra passear sem roteiro fixo — cafés, lojinhas de limoncello e a vista pro mar logo ali."},
  {t:"20:00–21:30", a:"Jantar — Trattoria Da Emilia dal 1947", dur:"1h30", tr:"A pé (10 min)", p:"€65,00", cat:"comida", desc:"Tradicional, funciona desde 1947 — peçam o que for de peixe/frutos do mar fresco, é o forte da região."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"27/3", wk:"Sábado", city:"sorrento", cityLabel:"Sorrento", title:"Costa Amalfitana", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:132,
 items:[
  {t:"8:30–9:20", a:"Sorrento → Positano", dur:"Ônibus SITA ~50min", tr:"Ônibus SITA", p:"€5,00", status:"a-reservar", cat:"transporte", reserveInfo:"Sem reserva antecipada e sem venda dentro do ônibus — comprar antes numa tabacaria, banca de jornal ou no guichê da estação de Sorrento. Vale mais a pena o passe Unico Costiera (~€10, 24h ilimitado nessa região) do que bilhete avulso pra cada trecho da Costa — dá pra comprar pelo app UnicoCampania.", desc:"Replanejado só de ônibus — no fim de março os ferries da Costa não são garantidos, então a gente não conta mais com eles pra não arriscar o dia. A estrada é sinuosa (quem enjoa, sente melhor sentado à frente)."},
  {t:"9:30–11:15", a:"Positano — Spiaggia Grande", dur:"1h45", tr:"A pé (3 min do porto)", p:"grátis", cat:"atracao", desc:"Praia principal e cartão-postal de Positano — não é a mais tranquila, mas é onde está a vista clássica das casinhas coloridas coladas na encosta."},
  {t:"11:30–12:15", a:"Positano → Amalfi", dur:"Ônibus SITA ~45-50min", tr:"Ônibus SITA", p:"€5,00", status:"a-reservar", cat:"transporte", reserveInfo:"Mesmo esquema — sem reserva, comprar antes numa tabacaria/banca ou usar o passe Unico Costiera já comprado no dia.", desc:"Mesmo raciocínio do trecho anterior — só ônibus, sem depender de ferry sazonal."},
  {t:"12:30–13:30", a:"Catedral de Amalfi", dur:"1h", tr:"A pé (5 min do porto)", p:"€6,00", cat:"atracao", desc:"Escadaria e fachada listrada são o principal — rápida de visitar, dá pra encaixar fácil antes de seguir pra Ravello."},
  {t:"14:00–14:25", a:"Amalfi → Ravello", dur:"~25 min", tr:"Ônibus SITA", p:"€1,50", status:"a-reservar", cat:"transporte", reserveInfo:"Sem reserva — bilhete numa tabacaria/bar antes de embarcar (não vende dentro do ônibus), ou já coberto pelo passe Unico Costiera do dia.", desc:"Trecho novo do roteiro — Ravello é considerado o pedaço mais romântico da Costa, vale muito a subida. Bilhete comprado numa tabacaria/bar antes de embarcar (não vende dentro do ônibus)."},
  {t:"14:30–16:30", a:"Ravello — Villa Rufolo + Villa Cimbrone", dur:"2h", tr:"A pé (os dois ficam a poucos minutos um do outro)", p:"€18,00", cat:"atracao", desc:"Dois jardins com vista pro mar, ingressos separados e sem reserva (compra na hora): Villa Rufolo €8, Villa Cimbrone €10 — esse é o pôr do sol mais bonito da Costa Amalfitana, dá pra render bem as duas visitas nessa janela."},
  {t:"17:00–18:15", a:"Ravello → Sorrento", dur:"~1h15 (via Amalfi)", tr:"Ônibus SITA (baldeação em Amalfi)", p:"~€6,50", status:"a-reservar", cat:"transporte", reserveInfo:"Sem reserva — se ainda estiver no passe Unico Costiera do dia já está coberto; senão, comprar numa tabacaria antes de embarcar.", desc:"Não tem ligação direta — volta com baldeação em Amalfi. Fiquem de olho no horário do primeiro ônibus pra não perder a conexão."},
  {t:"20:00–21:30", a:"Jantar — La Tagliata", dur:"1h30", tr:"Táxi (21 min)", p:"€90,00", status:"a-reservar", flag:"Reserva com antecedência", cat:"comida", reserveInfo:"Fica em Montepertuso, acima de Positano (não em Ravello) — reservar por e-mail (info@latagliata.com), telefone (+39 089 875 872) ou site (latagliata.com); sem confirmação instantânea. Reservar assim que a data estiver fechada, com semanas a poucos meses de antecedência.", desc:"Menu fixo, tudo por conta da casa e sem parar de servir — reserva com antecedência é obrigatória, ainda precisa ser feita. Vão com fome."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"28/3", wk:"Domingo", city:"sorrento", cityLabel:"Sorrento · Páscoa", title:"Páscoa em Sorrento", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:120,
 items:[
  {t:"9:30–10:15", a:"Villa Comunale di Sorrento", dur:"45 min", tr:"A pé (3 min)", p:"grátis", cat:"atracao", desc:"Jardim pequeno com mirante sobre o mar e a marina — ótimo pra um café da manhã tardio ou só sentar e apreciar a vista."},
  {t:"10:45–12:15", a:"Bagni Regina Giovanna", dur:"1h30", tr:"A pé (38 min)", p:"grátis", flag:"Levar água/lanche extra — comércio reduz no feriado", cat:"atracao", desc:"Ruínas romanas à beira-mar com uma piscina natural entre as pedras — caminhada mais longa até lá, vale levar água e um calçado que não escorregue. Como é Páscoa, muitos comércios por perto abrem com horário reduzido ou fecham, então levem água e um lanche por garantia."},
  {t:"20:00–21:30", a:"Jantar de Páscoa — L'Antica Trattoria", dur:"1h30", tr:"A pé (3 min)", p:"€120,00", status:"a-reservar", flag:"Reserva obrigatória — feriado", cat:"comida", reserveInfo:"Reservar pelo site (lanticatrattoria.com/newsite/en/book-now-2/) ou telefone (+39 081 8071082) — como cai no Domingo de Páscoa, a data mais concorrida do ano em Sorrento, reservar com o máximo de antecedência possível assim que as datas da viagem estiverem fechadas.", desc:"Domingo de Páscoa na Itália lota os restaurantes — reserva obrigatória, ainda precisa ser feita. Esperem um menu mais completo e festivo do que o normal."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"29/3", wk:"Segunda", city:"firenze", cityLabel:"Florença", title:"Sorrento → Florença", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:171,
 items:[
  {t:"8:00", a:"Checkout — Grace Suites", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Saída cedo de novo — deixem tudo arrumado na noite anterior pra não correr de manhã."},
  {t:"8:15–9:25", a:"Sorrento → Napoli Centrale", dur:"~1h10", tr:"EAV Circumvesuviana", p:"€10,00", cat:"transporte", desc:"Mesma Circumvesuviana da ida, agora de volta pra Napoli — passagem comprada na hora, sem reserva."},
  {t:"9:45–13:15", a:"Napoli Centrale → Firenze S.M. Novella", dur:"~3h/4h", tr:"Frecciarossa", p:"€110,00", status:"a-reservar", flag:"Comprar com antecedência — Pasquetta, trem mais cheio", cat:"transporte", reserveInfo:"Assento marcado — reservar via trenitalia.com/app ou italotreno.it/app assim que a venda abrir (Italo ~6 meses antes, Trenitalia normalmente ~4 meses — mas a Trenitalia estendeu a venda até dez/2026 por causa de eventos de 2026, vale checar de novo mais perto). Preço sobe conforme as faixas baratas esgotam.", desc:"Trecho mais longo do dia, antecipado em relação ao plano original — cortamos a parada da pizzaria em Nápoles pra ganhar essa tarde livre extra já em Florença. Como é Pasquetta (Segunda de Páscoa, feriado na Itália), o trem tende a vir mais cheio: comprem a passagem com bastante antecedência."},
  {t:"13:30–14:30", a:"Almoço já em Florença", dur:"1h", tr:"A pé (perto da estação)", p:"€35,00", cat:"comida", desc:"Substitui a parada da pizzaria em Nápoles — chegando direto em Florença, sobra mais tempo livre à tarde pra explorar a cidade com calma."},
  {t:"15:00–16:00", a:"Check-in — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Terceira base, já em Florença — hotel num palazzo histórico perto da estação, ótima localização pra andar a pé por tudo."},
  {t:"16:30–17:00", a:"Piazza della Signoria", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Museu a céu aberto — reparem nas esculturas da Loggia dei Lanzi e na réplica do David na entrada do Palazzo Vecchio (o original está na Accademia, que a gente visita amanhã)."},
  {t:"17:15–18:00", a:"Santa Maria del Fiore (vista externa)", dur:"45 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Só a parte de fora hoje — a subida à cúpula (com reserva) é amanhã de manhã. De noite iluminada fica ainda mais bonita, vale voltar depois do jantar se der."},
  {t:"19:30–20:30", a:"Jantar — All'Antico Vinaio", dur:"1h", tr:"A pé (13 min)", p:"€16,00", cat:"comida", desc:"Famosa pelos sanduíches de foccacia recheados — rápido, barato e com uma fila que costuma andar rápido. Bom pra um jantar leve depois de um dia cheio de trem."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"30/3", wk:"Terça", city:"firenze", cityLabel:"Florença", title:"Florença Clássica", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:104,
 items:[
  {t:"8:00–10:00", a:"Cúpula do Brunelleschi", dur:"1h30–2h", tr:"A pé (9 min)", p:"€40,00", status:"a-reservar", flag:"Reserva obrigatória — OPA Pass", cat:"atracao", reserveInfo:"Reserva pelo OPA Pass em tickets.duomo.firenze.it — não há janela oficial divulgada de quando abre, mas os horários são limitados por segurança e esgotam na alta temporada. Reservar assim que a data em Florença estiver fechada; o horário não pode ser alterado depois de comprado.", desc:"Subida por escada estreita e apertada (sem elevador), sentido único — 463 degraus. Reserva com horário marcado é obrigatória (OPA Pass), cheguem uns minutos antes."},
  {t:"10:15–11:15", a:"Galeria da Accademia (David)", dur:"1h", tr:"A pé (6 min)", p:"€24,00", status:"a-reservar", cat:"atracao", reserveInfo:"Reservar via b-ticket.com ou uffizi.it/en/tickets (ou telefone +39 055 294883) com pelo menos 2 meses de antecedência — é menor que os Uffizi e os horários bons esgotam mais rápido.", desc:"O David original está aqui — reserva com horário evita a fila enorme que se forma na porta. Vale reservar um tempinho só pra admirar de perto."},
  {t:"11:30–12:00", a:"Ponte Vecchio", dur:"30 min", tr:"A pé (14 min)", p:"grátis", cat:"atracao", desc:"Ponte medieval cheia de joalherias históricas — dá pra atravessar rápido ou parar pra olhar as vitrines de ouro, tradição da ponte desde o século XVI."},
  {t:"13:00–14:00", a:"Almoço — Trattoria Mario", dur:"1h", tr:"A pé (10 min)", p:"€40,00", flag:"Chegar cedo, lota", cat:"comida", desc:"Trattoria pequena e concorrida, sem reserva — só balcão e mesas compartilhadas. Chegar assim que abrir é a garantia de conseguir lugar."},
  {t:"18:00–19:00", a:"Piazzale Michelangelo (pôr do sol)", dur:"1h", tr:"A pé ~30-35min subida (grátis) / Ônibus 12/13 ~15-20min (~€3,40)", p:"grátis", cat:"atracao", desc:"Melhor mirante de Florença, com a cidade inteira e o Duomo ao fundo — vão com tempo de sobra pra escolher um bom lugar antes do sol começar a baixar. A subida a pé é puxada mas linda, ou peguem o ônibus se as pernas já estiverem cansadas."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"31/3", wk:"Quarta", city:"firenze", cityLabel:"Florença", title:"Florença (Uffizi)", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:142,
 items:[
  {t:"8:15–8:30", a:"Chegada Galleria degli Uffizi", dur:"—", tr:"A pé (18 min do hotel)", p:"€19,00", status:"a-reservar", flag:"Reserva obrigatória — chegar 15 min antes", cat:"atracao", reserveInfo:"Reservar via uffizi.it/en/tickets (ou b-ticket.com) com pelo menos 1 mês de antecedência pra garantir o horário das 8h15 (desconto da manhã) — dá pra reservar mais em cima da hora em dias de semana, mas arriscado numa data fixa.", desc:"Cheguem uns 15 minutos antes do horário escolhido — mesmo com ingresso marcado, tem uma fila de retirada que pode demorar. Esse horário (8:15–8:30) é justamente o do desconto oficial da manhã: €19 em vez dos €25-29 do resto do dia. Ainda falta comprar o ingresso."},
  {t:"8:30–11:30", a:"Galleria degli Uffizi", dur:"3h", tr:"—", p:"(incluso acima)", cat:"atracao", desc:"Um dos museus de arte mais importantes do mundo — Nascimento de Vênus e Primavera, de Botticelli, são os grandes destaques. Três horas rende bem, mas não tem problema sair antes se cansar."},
  {t:"11:45–12:30", a:"Café/gelato — Piazza della Repubblica", dur:"45 min", tr:"A pé (5 min)", p:"€15,00", cat:"comida", desc:"Pausa doce entre um museu e outro — praça boa pra sentar, tomar um espresso ou gelato e descansar as pernas."},
  {t:"13:00–14:00", a:"Almoço no Oltrarno (Santo Spirito)", dur:"1h", tr:"A pé (atravessar Ponte Vecchio, ~15 min)", p:"€35,00", cat:"comida", desc:"Do outro lado do rio, bairro mais local e menos turístico — as trattorias por ali costumam ser mais em conta e autênticas que no centro histórico."},
  {t:"14:30–16:30", a:"Giardino di Boboli", dur:"2h", tr:"A pé (10 min)", p:"€13,00", status:"a-reservar", cat:"atracao", reserveInfo:"Não exige reserva obrigatória, mas em abril vale comprar online com alguns dias de antecedência (site, telefone +39 055 294883 ou presencial) pra evitar fila de 30-45min.", desc:"Jardins renascentistas enormes atrás do Palazzo Pitti — bom pra caminhar com calma, tem sombra e vista de Florença lá de cima. Ingresso avulso antecipado."},
  {t:"17:00–18:30", a:"Tempo livre — Santo Spirito / compras", dur:"livre", tr:"A pé (8 min)", p:"—", desc:"Bairro artesão de Florença, com ateliês de couro e ourivesaria — bom lugar pra achar um souvenir com mais identidade do que as lojinhas de turista."},
  {t:"20:00", a:"Jantar no Oltrarno (trattoria local)", dur:"1h30", tr:"A pé (5 min)", p:"€60,00", cat:"comida", desc:"Fechando o dia sem sair do bairro — trattoria local, sem reserva marcada, mas região tranquila pra achar mesa."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"1/4", wk:"Quinta", city:"bologna", cityLabel:"Bologna", title:"Florença → Bologna", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:145,
 items:[
  {t:"11:30–12:30", a:"Checkout — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Checkout mais tarde — dá pra aproveitar a manhã com calma antes de pegar o trem."},
  {t:"12:00–12:40", a:"Firenze S.M. Novella → Bologna Centrale", dur:"~35–40 min", tr:"Frecciarossa/Italo", p:"€55,00", status:"a-reservar", cat:"transporte", reserveInfo:"Assento marcado — mesmo esquema dos outros trechos de alta velocidade: reservar via trenitalia.com/app ou italotreno.it/app, quanto antes melhor preço.", desc:"Trecho curto de alta velocidade, menos de 40 minutos — mal dá tempo de sentar."},
  {t:"13:00", a:"Check-in — Luxury Station Suite", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Última base antes de Veneza — bem pertinho da Bologna Centrale, ótimo já que amanhã (Ferrari Day) a gente sai cedo justamente daqui da estação."},
  {t:"15:00–15:30", a:"Piazza Maggiore", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Praça central de Bologna, com a Basílica de San Petronio dominando a paisagem — Bologna é mais tranquila e menos turística que as cidades anteriores, um respiro no meio da viagem."},
  {t:"15:45–17:15", a:"Torre dell'Orologio", dur:"1h30", tr:"A pé (7 min)", p:"€20,00", status:"a-reservar", flag:"Reserva obrigatória", cat:"atracao", reserveInfo:"Reserva obrigatória via bolognawelcome.com — cada grupo tem só 15 vagas por horário, então reservar assim que a data em Bologna estiver fechada. Dá pra alterar até 24h antes.", desc:"Reserva obrigatória, sobem em grupos pequenos por horário marcado — vista bonita dos telhados vermelhos de Bologna, a 'cidade rossa'."},
  {t:"17:30–18:15", a:"Mercato di Mezzo", dur:"45 min", tr:"A pé (8 min)", p:"grátis (compras à parte)", cat:"atracao", desc:"Mercado gastronômico coberto, ótimo pra beliscar produtos locais (mortadela, parmesão, tortellini) antes do jantar sério."},
  {t:"19:30–21:00", a:"Jantar — Osteria dell'Orsa", dur:"1h30", tr:"A pé (7 min)", p:"€70,00", cat:"comida", desc:"Clássica cantina de estudante, informal e barata pros padrões italianos — tortellini in brodo e tagliatelle al ragù são os fortes daqui, terra da massa fresca."}
 ], end:"Dormindo no Luxury Station Suite (Bologna)"},

{d:"2/4", wk:"Sexta", city:"ferrari", cityLabel:"Ferrari Day", title:"Ferrari Day", hotel:"Luxury Station Suite", hotelNote:"Hospedados no Luxury Station Suite (Bologna)", budget:505,
 items:[
  {t:"8:30–8:55", a:"Bologna Centrale → Modena", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", cat:"transporte", desc:"Sem pressa hoje — dormimos mais uma noite em Bologna, então não tem checkout nem bagagem pra carregar. Trem regional simples, sem reserva de assento."},
  {t:"9:05–10:25", a:"Museu Casa Enzo Ferrari (Modena)", dur:"1h20", tr:"A pé (10 min estação→museu, 10 min volta)", p:"€56,00", cat:"atracao", desc:"Onde Enzo Ferrari nasceu e teve sua primeira oficina — bom aquecimento antes da Galeria Ferrari em Maranello à tarde."},
  {t:"10:40–11:15", a:"Modena → Maranello", dur:"~35 min", tr:"Navetta \"Discover Ferrari\" (ida/volta)", p:"€20,00", status:"a-reservar", cat:"transporte", reserveInfo:"Operada por uma empresa terceirizada (Vivara Viaggi), não é vendida pelo site da Ferrari — reservar por telefone (+39 051 6120818) ou e-mail (booking@vivaraviaggi.it), ou tentar comprar direto com o motorista/no balcão do museu no dia (fontes divergem se ainda aceita dinheiro no ônibus). Passa a cada ~90min, então vale checar o horário perto da data mais do que se preocupar em comprar cedo.", desc:"Navetta oficial 'Discover Ferrari', ida e volta incluídas no mesmo bilhete — sai perto da estação de Modena, fiquem de olho no horário pra não perder."},
  {t:"11:15–13:00", a:"Galeria Ferrari (Maranello)", dur:"1h45", tr:"A pé (2 min do ponto da navetta)", p:"(incluso na navetta)", cat:"atracao", desc:"O museu principal da marca, com carros de corrida e de rua históricos — entrada já inclusa no bilhete da navetta."},
  {t:"13:00–14:00", a:"Almoço em Maranello", dur:"1h", tr:"A pé (10 min)", p:"€35,00", cat:"comida", desc:"Cidade pequena e bem ligada à Ferrari — não esperem muitas opções, mas dá pra comer bem rápido antes do test drive."},
  {t:"14:00–15:30", a:"Test drive — Ferrari Roma Spider (PushStart)", dur:"1h30 (com folga)", tr:"A pé (frente ao museu)", p:"€300,00", status:"a-reservar", cat:"atracao", reserveInfo:"Reservar direto em pushstart.it — exige sinal de 50% no ato. Não há janela oficial divulgada; algumas semanas a 1-2 meses de antecedência parece suficiente, mas cancelamento só é reembolsável até 24h antes.", desc:"O grande momento do dia — reserva a fazer com a PushStart, levem a carteira de motorista física (e a internacional, se tiverem) e cheguem um pouco antes do horário."},
  {t:"15:30–18:00", a:"Tempo livre em Maranello (loja, café, relax)", dur:"2h30", tr:"—", p:"—", desc:"Depois da adrenalina, tempo pra relaxar, passar na lojinha oficial da Ferrari e tomar um café com calma antes de voltar."},
  {t:"18:00–18:35", a:"Maranello → Modena", dur:"~35 min", tr:"Navetta \"Discover Ferrari\"", p:"(incluso acima)", cat:"transporte", desc:"Mesma navetta, volta já incluída no bilhete de ida — não precisa comprar de novo."},
  {t:"18:35–19:00", a:"Modena → Bologna Centrale", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", status:"a-reservar", cat:"transporte", reserveInfo:"Trem regional sem assento marcado — comprar pelo app/site da Trenitalia ou na maquininha da estação, inclusive em cima da hora. Bilhete digital do app já se valida sozinho na hora do embarque; só bilhete de papel precisa ser validado na maquininha verde antes de subir no trem (senão multa, mesmo com bilhete válido).", desc:"Último trecho regional do dia — sem pressa nenhuma, ainda dormimos aqui em Bologna, então dá pra ir com calma direto pra aula de massa."},
  {t:"20:00–21:30", a:"Aula de massa fresca em Bologna", dur:"1h30", tr:"A pé/táxi (depende da escola escolhida)", p:"~€70,00/pessoa", status:"pendente", flag:"Fornecedor a escolher", cat:"comida", reserveInfo:"Primeiro escolher a escola entre as opções pesquisadas, depois reservar com pelo menos algumas semanas de antecedência — aulas com refeição incluída costumam ter vagas limitadas por turma.", desc:"Substitui o jantar de hoje — aula prática de tortellini/tagliatelle já com a refeição inclusa, uma experiência mais única do que só sentar num restaurante na capital italiana da massa artesanal. Ainda falta escolher a escola: pesquisei uma faixa de €65-85/pessoa entre as opções com aula + refeição + vinho, mas não reservei nenhuma específica."}
 ], end:"Dormindo no Luxury Station Suite (Bologna)"},

{d:"3/4", wk:"Sábado", city:"venezia", cityLabel:"Veneza", title:"Bologna → Veneza", hotel:"Luxury Station Suite", hotelNote:"Hospedados no Luxury Station Suite (Bologna)", budget:175,
 items:[
  {t:"10:00–10:30", a:"Checkout — Luxury Station Suite", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Agora sim, a segunda noite em Bologna acabou — checkout com calma, sem pressa de manhã."},
  {t:"10:45–12:15", a:"Bologna Centrale → Venezia Santa Lucia", dur:"~1h10–1h30", tr:"Frecciarossa", p:"€80,00", status:"a-reservar", cat:"transporte", reserveInfo:"Assento marcado — reservar via trenitalia.com/app ou italotreno.it/app assim que a venda abrir, preço sobe conforme as faixas baratas esgotam.", desc:"Trem de alta velocidade direto até Veneza — chegando de manhã, sobra a tarde inteira pra já sentir a cidade, sem a correria do plano antigo de viajar de noite."},
  {t:"12:45–13:45", a:"Check-in — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Última base da viagem, direto no centro histórico de San Marco — hotel de charme, num palazzo antigo."},
  {t:"14:00–14:30", a:"Piazza San Marco", dur:"30 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Coração de Veneza — já dá pra sentir a praça mais calma no meio da tarde, antes do jantar."},
  {t:"14:45–15:45", a:"Basílica de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€10,00", status:"a-reservar", cat:"atracao", reserveInfo:"Desde jul/2025 a reserva online é obrigatória (não vende mais na hora) via sanmarco-venezia.it — recomendado reservar 2-3 semanas antes, escolhendo horário de manhã cedo ou fim de tarde pra fugir da fila.", desc:"Interior coberto de mosaicos dourados — a fila pode ser longa, então vale reservar entrada rápida (skip-the-line) se disponível."},
  {t:"16:00–17:00", a:"Campanário de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€30,00", cat:"atracao", desc:"Melhor vista panorâmica de Veneza e da lagoa — tem elevador, então não é preciso subir escada."},
  {t:"17:15–18:00", a:"Ponte de Rialto", dur:"45 min", tr:"A pé (7 min)", p:"grátis", cat:"atracao", desc:"A ponte mais famosa sobre o Grand Canal, cheia de lojinhas — bom ponto pra ver as gôndolas passando por baixo."},
  {t:"19:30–20:30", a:"Jantar leve — região San Marco", dur:"1h", tr:"A pé (perto do hotel)", p:"€55,00", cat:"comida", desc:"Nada muito elaborado hoje — dia de chegada, jantar leve pertinho do hotel. O jantar especial de Veneza fica pra amanhã, com mais tempo de sobra."}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"4/4", wk:"Domingo", city:"venezia", cityLabel:"Veneza", title:"Veneza (dia inteiro)", hotel:"Hotel Saturnia & International", hotelNote:"Hospedados no Hotel Saturnia & International (Veneza)", budget:80,
 items:[
  {t:"9:00–9:45", a:"Fondamenta delle Zattere (Dorsoduro)", dur:"45 min", tr:"A pé (11 min)", p:"grátis", cat:"atracao", desc:"Calçadão mais tranquilo, longe da multidão do centro — bom pra uma caminhada matinal em Veneza com vista pro canal Giudecca."},
  {t:"Manhã/tarde", a:"Manhã/tarde livre — Veneza", dur:"livre", tr:"—", p:"a definir", status:"pendente", flag:"Decidir antes da viagem", reserveInfo:"Gôndola e vaporetto (Murano/Burano) dá pra decidir e comprar no mesmo dia, sem antecedência. Já a Peggy Guggenheim Collection vale reservar online com alguns dias de antecedência se quiser garantir horário.", desc:"Ainda em aberto — três opções já pesquisadas pra decidir: passeio de gôndola (tarifa oficial €90 por até 5 pessoas, 8h-19h — dá uns €45 dividido a dois), Peggy Guggenheim Collection (€18/pessoa, coleção de arte moderna com terraço pro canal) ou Murano + Burano de vaporetto (passe ACTV 24h €25/pessoa, compensa mais que bilhete avulso pras duas ilhas)."},
  {t:"20:00–21:30", a:"Jantar romântico especial — Trattoria alla Madonna", dur:"1h30", tr:"A pé (11 min)", p:"€80,00", cat:"comida", desc:"Clássica de Veneza, especializada em frutos do mar — o jantar mais especial da passagem por aqui, com mais tempo de sobra pra aproveitar já que chegamos ontem. Costuma ter fila, mas o giro de mesas é rápido."}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"5/4", wk:"Segunda", city:"roma", cityLabel:"Veneza → Roma → Voo", title:"Veneza → Roma → Voo", hotel:null, hotelNote:"Sem hotel — trânsito até o voo", budget:158,
 items:[
  {t:"10:15", a:"Checkout — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", status:"a-reservar", ci:true, desc:"Malas prontas — hoje é só trânsito até o voo, sem mais nenhuma noite de hotel."},
  {t:"10:30–14:00", a:"Venezia Santa Lucia → Roma Termini", dur:"~3h30–4h", tr:"Frecciarossa", p:"€130,00", status:"a-reservar", cat:"transporte", reserveInfo:"Assento marcado, trecho mais longo e mais caro da viagem — reservar via trenitalia.com/app ou italotreno.it/app assim que a venda abrir, é o que mais compensa comprar cedo pelo preço.", desc:"Trecho mais longo de trem da viagem inteira — levem algo pra comer/beber e entretenimento pra passar o tempo."},
  {t:"14:00–18:30", a:"Tempo livre em Roma (bagagem no locker da Termini)", dur:"4h30", tr:"A pé — locker dentro da própria estação", p:"—", desc:"Sem hotel essa noite — deixem a bagagem guardada num locker da Termini e aproveitem as últimas horas em Roma livres de peso, pro último passeio ou gelato antes do voo."},
  {t:"19:00–19:32", a:"Roma Termini → Fiumicino", dur:"Leonardo Express ~32min", tr:"Leonardo Express", p:"€28,00", status:"a-reservar", cat:"transporte", reserveInfo:"Sem assento marcado, sem vantagem em comprar com antecedência — comprar pelo app/site da Trenitalia ou na hora mesmo, qualquer trem dentro da validade do bilhete serve.", desc:"Mesmo trajeto da chegada, agora de volta — o Leonardo Express é a opção mais previsível pra não arriscar perder o voo depois de pegar a bagagem no locker."},
  {t:"22:05", a:"Voo FCO → GRU", dur:"—", tr:"ITA Airways AZ 674", p:"—", status:"confirmado", desc:"Voo de volta pra casa — hora de descansar (e já sentir saudade da Itália)."}
 ], end:"Em voo, rumo a São Paulo"}
];

// Informação de referência sobre documentos de entrada — pesquisada em 08/2026,
// não muda com a viagem (exceto ETIAS, que está em aberto — ver CHECKLIST_ITEMS).
const TRAVEL_DOCS = [
  {title:"Passaporte", detail:"Precisa estar válido por pelo menos 3 meses além da data de saída do Espaço Schengen (ou seja, até 05/07/2027) e ter sido emitido nos últimos 10 anos. Regra da UE, sem exceção por país."},
  {title:"Visto", detail:"Não precisa — brasileiros continuam isentos de visto pra turismo de até 90 dias em qualquer período de 180 dias no Schengen (Decreto 12.864/2026 confirmou a regra, sem mudança de fundo)."},
  {title:"ETIAS", detail:"Ainda não está em vigor (checado em 08/2026) — foi adiado várias vezes e a UE tirou a data de lançamento do site oficial em jul/2026. Pode entrar em vigor antes da nossa viagem em março/2027: ficar de olho mais perto da data. Quando valer, é rápido de tirar (72h a poucas semanas antes, ~€20) em etias.europa.eu."},
  {title:"Outros documentos úteis", detail:"Passagem de volta (já temos, voo redondo), comprovante de hospedagem (reservas dos hotéis) e comprovante de recursos financeiros — a UE pode pedir na imigração, mesmo sem visto. Seguro viagem não é exigido por lei pra quem é isento de visto, mas vale levar (já está no orçamento)."}
];

// Checklist priorizado do que falta fazer antes da viagem, com data real de
// quando agir — id estável (usado pra persistir o "feito" no localStorage),
// date em ISO (ordena a lista), dateLabel troca o texto exibido quando a data
// em si não é o ponto (ex: "assim que possível"). Datas de reserva calculadas
// a partir do dia do roteiro em DAYS menos o prazo de cada reserveInfo.
const CHECKLIST_ITEMS = [
  {id:"hoteis", date:"2026-08-22", dateLabel:"Assim que possível", title:"Reservar os 5 hotéis", detail:"Nenhum foi reservado ainda: Aenea Inn (Roma), Grace Suites (Sorrento), Palazzo dal Borgo (Florença), Luxury Station Suite (Bologna) e Hotel Saturnia & International (Veneza). Sem janela oficial de abertura — quanto antes, melhor preço e disponibilidade."},
  {id:"passaporte", date:"2026-08-22", dateLabel:"Assim que possível", title:"Checar validade do passaporte dos dois", detail:"Precisa valer até pelo menos 05/07/2027 e ter sido emitido nos últimos 10 anos (ver Documentos de viagem acima). Se precisar renovar, o processo no Brasil pode levar semanas."},
  {id:"restaurantes-cedo", date:"2026-08-22", dateLabel:"Assim que possível", title:"Tentar reservar os restaurantes mais concorridos", detail:"Roscioli (24 de março), La Tagliata (27 de março) e L'Antica Trattoria no Domingo de Páscoa (28 de março) não têm reserva online instantânea — é por telefone/e-mail/formulário. Nenhum divulga uma janela oficial, então vale tentar agora e insistir de novo mais perto da data se disserem que é cedo demais."},
  {id:"vaticano", date:"2027-01-24", title:"Reservar Vaticano + Capela Sistina", detail:"Ingressos liberados exatamente 60 dias antes da visita (25 de março), à meia-noite, em tickets.museivaticani.va — reservar assim que abrir, é temporada de Páscoa."},
  {id:"accademia-duomo", date:"2027-01-30", title:"Reservar Accademia (David) e Cúpula do Duomo", detail:"Prazo recomendado de ~2 meses antes das visitas (30 de março) — nenhum divulga janela oficial de abertura, mas os horários costumam esgotar na alta temporada."},
  {id:"torre-testdrive", date:"2027-02-01", title:"Reservar Torre dell'Orologio e test drive da Ferrari", detail:"Torre dell'Orologio (1º de abril, só 15 vagas por horário) via bolognawelcome.com; test drive (2 de abril) direto em pushstart.it, com sinal de 50%. Nenhum tem janela oficial — reservar com 1-2 meses de antecedência."},
  {id:"pompeia", date:"2027-02-09", title:"Reservar Pompeia", detail:"Ingressos liberados cerca de 45 dias antes da visita (26 de março), agora vendidos via vivaticket.com — reservar assim que abrir."},
  {id:"coliseu", date:"2027-02-22", title:"Reservar Coliseu + Fórum + Palatino", detail:"Ingressos liberados exatamente 30 dias antes da visita (24 de março), à meia-noite, em ticketing.colosseo.it — esgota em horas perto da Páscoa, reservar na hora que abrir."},
  {id:"uffizi", date:"2027-03-01", title:"Reservar os Uffizi", detail:"Prazo recomendado de ~1 mês antes da visita (31 de março) pra garantir o horário das 8h15 (desconto da manhã) via uffizi.it/en/tickets."},
  {id:"massa-fresca", date:"2027-03-01", title:"Escolher escola e reservar a aula de massa fresca", detail:"Ainda falta decidir o fornecedor em Bologna (visita 2 de abril) — depois de escolher, reservar com pelo menos algumas semanas de antecedência."},
  {id:"etias", date:"2027-03-05", title:"Verificar se o ETIAS já é obrigatório", detail:"Sem data de lançamento confirmada até ago/2026 — pode entrar em vigor antes da viagem. Se estiver valendo, dá pra solicitar rápido (72h a poucas semanas antes) em etias.europa.eu."},
  {id:"sao-marcos", date:"2027-03-13", title:"Reservar Basílica de São Marcos", detail:"Reserva online obrigatória desde jul/2025 (não vende mais na hora) — recomendado 2-3 semanas antes da visita (3 de abril), então essa data é o começo dessa janela, via sanmarco-venezia.it."},
  {id:"boboli", date:"2027-03-24", title:"Comprar ingresso do Giardino di Boboli", detail:"Não é obrigatório reservar, mas comprar online alguns dias antes da visita (31 de março) evita fila de 30-45min."}
];
