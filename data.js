const TRIP_YEAR = 2027;

// Cotação de referência usada para converter os totais calculados em € (a partir
// dos itens do roteiro) para R$ no resumo geral. Ajustar aqui se a cotação mudar.
const EXCHANGE_RATE = 6;

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
  {t:"20:40", a:"Voo GRU → FCO", dur:"—", tr:"ITA Airways AZ 679", p:"—", desc:"Voo noturno direto GRU→FCO — durmam o quanto der, a gente desembarca de manhã e já emenda direto com Roma no mesmo dia."}
 ], end:"Em voo, rumo a Roma"},

{d:"23/3", wk:"Terça", city:"roma", cityLabel:"Roma", title:"Chegada em Roma", hotel:null, hotelNote:"Chegando em Roma (sem hotel ainda)", budget:103,
 items:[
  {t:"11:35", a:"Chegada em Fiumicino", dur:"—", tr:"—", p:"—", desc:"Pouso em Fiumicino (FCO) — depois da imigração e da bagagem, sigam as placas pra estação de trem dentro do próprio aeroporto, é onde pegamos o Leonardo Express."},
  {t:"11:45", a:"Fiumicino → Roma Termini", dur:"Leonardo Express ~32min · Táxi ~40min", tr:"Leonardo Express / Táxi fixo", p:"€28,00 / €50,00", cat:"transporte", desc:"O Leonardo Express é direto até Termini e sai de hora em hora — vale comprar antecipado pra não perder tempo na bilheteria. Se estivermos com bagagem grande e cansados do voo, o táxi fixo (~€50) até o centro pode valer a folga."},
  {t:"~12:30", a:"Check-in — Aenea Inn", dur:"30 min", tr:"A pé / metrô (10 min)", p:"—", ci:true, desc:"Primeira base em Roma, no bairro de Monti — tranquilo e charmoso, dá pra ir andando pro Coliseu. Deixem a mala pronta e troquem de roupa antes de sair de novo."},
  {t:"14:30–15:30", a:"Fontana di Trevi", dur:"1h", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Sempre cheia, mas vale passar mesmo assim nesse primeiro dia — joguem a moeda de costas, com a mão direita por cima do ombro esquerdo (é a tradição pra garantir volta a Roma)."},
  {t:"15:45–16:30", a:"Panteão", dur:"45 min", tr:"A pé (8 min)", p:"€10,00", cat:"atracao", desc:"Entrada paga desde 2023, mas dá pra comprar na hora se não estiver muito cheio — assim que entrar, olhem pra cima: o óculo no teto é o maior furo estrutural do mundo antigo."},
  {t:"16:45–18:00", a:"Piazza Navona (tempo livre)", dur:"1h15", tr:"A pé (16 min)", p:"grátis", cat:"atracao", desc:"Tempo livre pra passear sem pressa entre as fontes de Bernini — bom lugar pra sentar num café e já sentir a energia de Roma no primeiro dia."},
  {t:"19:00–20:30", a:"Jantar — Tonnarello (Trastevere)", dur:"1h30", tr:"A pé ~35min (grátis) / Táxi ~15min (~€13,00)", p:"€65,00", cat:"comida", desc:"Trattoria clássica, animada e sem luxo — cacio e pepe e carbonara são o forte. Costuma dar fila, então cheguem no horário certo ou um pouco antes."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"24/3", wk:"Quarta", city:"roma", cityLabel:"Roma", title:"Roma Antiga", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:150,
 items:[
  {t:"8:00–11:00", a:"Coliseu + Fórum Romano + Palatino", dur:"3h", tr:"A pé (15 min do hotel)", p:"€40,00", flag:"Reserva obrigatória", cat:"atracao", desc:"Ingresso combinado pros três — reserva com horário marcado, então já compramos o bilhete com antecedência (o mesmo ingresso vale pra Fórum e Palatino dentro de 24h). Usem tênis confortável, é bastante caminhada em pedra irregular."},
  {t:"11:15–11:45", a:"Circo Máximo", dur:"30 min", tr:"A pé (12 min)", p:"grátis", cat:"atracao", desc:"Hoje é só um gramado enorme onde ficava o hipódromo romano — dá pra imaginar o tamanho da arena, mas não tem muito o que visitar além da vista."},
  {t:"13:00–14:30", a:"Almoço + descanso (região do Coliseu)", dur:"1h30", tr:"—", p:"€35,00", cat:"comida", desc:"Área bem turística — prefiram um lugar um pouco afastado da entrada principal do Coliseu pra fugir da armadilha de preço/qualidade ruim."},
  {t:"15:00–18:00", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—", desc:"Hora de tirar aquele cochilo ou só relaxar no hotel — o dia é puxado de caminhada, vale recarregar antes do jantar."},
  {t:"19:30–21:00", a:"Jantar — Roscioli", dur:"1h30", tr:"A pé (23 min)", p:"€75,00", flag:"Reserva antecipada", cat:"comida", desc:"Um dos restaurantes mais concorridos de Roma — reserva com bastante antecedência é essencial (já garantimos, só confirmar perto da data). Carbonara e a tábua de frios/queijos são clássicos daqui."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"25/3", wk:"Quinta", city:"roma", cityLabel:"Roma", title:"Vaticano", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:227,
 items:[
  {t:"8:00–11:00", a:"Museus do Vaticano + Capela Sistina", dur:"3h", tr:"A pé/metrô (12 min)", p:"€50,00", flag:"Reserva obrigatória", cat:"atracao", desc:"Reserva com horário marcado — o ingresso combinado (museus + Capela Sistina) esgota fácil, então já garantimos com antecedência. Ombros e joelhos cobertos são obrigatórios pra entrar."},
  {t:"11:15–12:15", a:"Basílica de São Pedro + subida à cúpula", dur:"1h", tr:"A pé (15 min dos Museus)", p:"€16,00", cat:"atracao", desc:"A subida à cúpula tem elevador só até um certo ponto — depois são ~320 degraus estreitos até o topo. Vale o esforço pela vista de Roma inteira, mas tudo bem pular a escalada se preferirmos."},
  {t:"12:15–12:30", a:"Praça São Pedro", dur:"15 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Rápida passada pela praça de Bernini antes do almoço — reparem na perspectiva das colunatas, de um ponto específico elas 'somem' e viram uma fileira só."},
  {t:"12:45–13:30", a:"Castelo Sant'Angelo", dur:"45 min", tr:"A pé (15 min)", p:"€36,00", cat:"atracao", desc:"Antigo mausoléu de Adriano virado fortaleza papal — a vista do terraço no topo é um dos melhores ângulos de Roma, com a cúpula de São Pedro ao fundo."},
  {t:"13:45–14:45", a:"Almoço (região de Piazza Navona)", dur:"1h", tr:"A pé (10 min)", p:"€40,00", cat:"comida", desc:"Mesma região do passeio de ontem à noite — dá pra repetir algum lugar que gostamos ou explorar uma trattoria nova por ali."},
  {t:"15:00–19:30", a:"Tempo livre / descanso", dur:"livre", tr:"—", p:"—", desc:"Tarde mais livre depois de uma manhã pesada de fila e caminhada — bom momento pra voltar ao hotel, tomar banho e descansar antes do jantar."},
  {t:"20:00–21:30", a:"Jantar — Settimio All'Arancio", dur:"1h30", tr:"A pé ~25min (grátis) / Táxi ~10min (~€10,00)", p:"€85,00", cat:"comida", desc:"Trattoria clássica perto do Panteão, ambiente mais tranquilo — boa pedida pra fechar essa primeira passagem por Roma."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"26/3", wk:"Sexta", city:"sorrento", cityLabel:"Sorrento", title:"Roma → Pompeia → Sorrento", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:258,
 items:[
  {t:"7:00", a:"Checkout — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true, desc:"Deixem as malas prontas na noite anterior — saída bem cedo, então já vale ter café da manhã reservado ou algo rápido pra levar."},
  {t:"7:15–8:25", a:"Roma Termini → Napoli Centrale", dur:"1h10", tr:"Frecciarossa/Italo", p:"€75,00", cat:"transporte", desc:"Trem de alta velocidade — comprem a passagem com antecedência, costuma sair mais barata e garante os assentos juntos. Cheguem na estação com folga pra achar a plataforma."},
  {t:"8:25–8:55", a:"Napoli Centrale → Pompei Scavi", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", cat:"transporte", desc:"Trem regional da EAV Circumvesuviana, sem luxo mas rápido — a passagem é comprada na hora, sem reserva. Fiquem de olho nos pertences, é uma linha bem cheia."},
  {t:"9:00–13:00", a:"Pompeia — Parque Arqueológico", dur:"~3h", tr:"A pé (caminhada livre pelo sítio)", p:"€50,00", flag:"Ingresso antecipado · mala no depósito grátis da Porta Marina", cat:"atracao", desc:"Ingresso antecipado recomendado pra não perder tempo na fila — deixem a mala no depósito grátis perto da Porta Marina. Usem protetor solar, chapéu e tênis confortável, é bastante sol e pedra."},
  {t:"13:15–13:45", a:"Pompei Scavi → Sorrento Train Station", dur:"~30 min", tr:"EAV Circumvesuviana", p:"€14,00", cat:"transporte", desc:"Mesma linha da Circumvesuviana, agora sentido Sorrento — o trem termina o trajeto na própria estação, sem baldeação."},
  {t:"13:45–14:45", a:"Almoço em Sorrento (centro)", dur:"1h", tr:"A pé (10 min da estação)", p:"€40,00", cat:"comida", desc:"Primeiro contato com Sorrento, direto do centro perto da estação — hora de já sentir o clima mais relaxado da Costa."},
  {t:"15:00", a:"Check-in — Grace Suites", dur:"—", tr:"—", p:"—", ci:true, desc:"Segunda base da viagem, em pleno centro de Sorrento — hotel bem avaliado, ótimo ponto de partida pros passeios da Costa Amalfitana."},
  {t:"15:30–17:00", a:"Piazza Tasso + centro histórico", dur:"1h30", tr:"A pé (5 min do hotel)", p:"grátis", cat:"atracao", desc:"Coração de Sorrento, boa pra passear sem roteiro fixo — cafés, lojinhas de limoncello e a vista pro mar logo ali."},
  {t:"20:00–21:30", a:"Jantar — Trattoria Da Emilia dal 1947", dur:"1h30", tr:"A pé (10 min)", p:"€65,00", cat:"comida", desc:"Tradicional, funciona desde 1947 — peçam o que for de peixe/frutos do mar fresco, é o forte da região."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"27/3", wk:"Sábado", city:"sorrento", cityLabel:"Sorrento", title:"Costa Amalfitana", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:106,
 items:[
  {t:"8:30–9:05", a:"Sorrento → Positano", dur:"Ferry ~35min · Ônibus SITA ~50min", tr:"Ferry (confirmar sazonal) / Ônibus SITA", p:"Ferry a confirmar / Ônibus ~€5,00", cat:"transporte", desc:"O ferry é a opção mais bonita (vista do mar), mas depende de operar na temporada — vale confirmar perto da data. O ônibus SITA é mais barato e sempre roda, mas a estrada é sinuosa (quem enjoa, sente melhor sentado à frente)."},
  {t:"9:15–11:00", a:"Positano — Spiaggia Grande", dur:"1h45", tr:"A pé (3 min do porto)", p:"grátis", cat:"atracao", desc:"Praia principal e cartão-postal de Positano — não é a mais tranquila, mas é onde está a vista clássica das casinhas coloridas coladas na encosta."},
  {t:"11:30–12:30", a:"Positano → Amalfi", dur:"Ferry ~25-30min · Ônibus SITA ~45-50min", tr:"Ferry / Ônibus SITA", p:"Ferry ~€30,00 / Ônibus ~€5,00", cat:"transporte", desc:"Mesma lógica do trecho anterior — ferry mais caro e cênico, ônibus mais barato. Se o mar estiver ruim os ferries podem ser cancelados, então tenham o ônibus como plano B."},
  {t:"12:30–13:30", a:"Catedral de Amalfi", dur:"1h", tr:"A pé (5 min do porto)", p:"€6,00", cat:"atracao", desc:"Escadaria e fachada listrada são o principal — rápida de visitar, dá pra encaixar fácil entre o passeio e o jantar."},
  {t:"20:00–21:30", a:"Jantar — La Tagliata", dur:"1h30", tr:"Táxi (21 min)", p:"€90,00", flag:"Reserva com antecedência", cat:"comida", desc:"Menu fixo, tudo por conta da casa e sem parar de servir — reserva com antecedência é obrigatória, já garantida. Vão com fome."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"28/3", wk:"Domingo", city:"sorrento", cityLabel:"Sorrento · Páscoa", title:"Páscoa em Sorrento", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:120,
 items:[
  {t:"9:30–10:15", a:"Villa Comunale di Sorrento", dur:"45 min", tr:"A pé (3 min)", p:"grátis", cat:"atracao", desc:"Jardim pequeno com mirante sobre o mar e a marina — ótimo pra um café da manhã tardio ou só sentar e apreciar a vista."},
  {t:"10:45–12:15", a:"Bagni Regina Giovanna", dur:"1h30", tr:"A pé (38 min)", p:"grátis", cat:"atracao", desc:"Ruínas romanas à beira-mar com uma piscina natural entre as pedras — caminhada mais longa até lá, vale levar água e um calçado que não escorregue."},
  {t:"20:00–21:30", a:"Jantar de Páscoa — L'Antica Trattoria", dur:"1h30", tr:"A pé (3 min)", p:"€120,00", flag:"Reserva obrigatória — feriado", cat:"comida", desc:"Domingo de Páscoa na Itália lota os restaurantes — reserva obrigatória, já garantida. Esperem um menu mais completo e festivo do que o normal."}
 ], end:"Dormindo no Grace Suites (Sorrento)"},

{d:"29/3", wk:"Segunda", city:"firenze", cityLabel:"Florença", title:"Sorrento → Florença", hotel:"Grace Suites", hotelNote:"Hospedados no Grace Suites (Sorrento)", budget:148,
 items:[
  {t:"8:00", a:"Checkout — Grace Suites", dur:"—", tr:"—", p:"—", ci:true, desc:"Saída cedo de novo — deixem tudo arrumado na noite anterior pra não correr de manhã."},
  {t:"8:15–9:25", a:"Sorrento → Napoli Centrale", dur:"~1h10", tr:"EAV Circumvesuviana", p:"€10,00", cat:"transporte", desc:"Mesma Circumvesuviana da ida, agora de volta pra Napoli — passagem comprada na hora, sem reserva."},
  {t:"9:30–10:15", a:"Almoço — L'Antica Pizzeria da Michele", dur:"45 min", tr:"A pé (15 min da estação)", p:"€12,00", cat:"comida", desc:"A pizzaria mais lendária de Nápoles — menu simples, só marguerita e marinara, mas costuma ter fila. Não aceita reserva, é chegar e pegar senha."},
  {t:"11:00–15:00", a:"Napoli Centrale → Firenze S.M. Novella", dur:"~3h/4h", tr:"Frecciarossa", p:"€110,00", flag:"Atenção: Pasquetta, trem mais cheio", cat:"transporte", desc:"Trecho mais longo do dia — como é Pasquetta (Segunda de Páscoa, feriado na Itália), o trem tende a vir mais cheio. Levem algo pra comer/beber e um filme baixado ou livro pra passar o tempo."},
  {t:"15:30", a:"Check-in — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", ci:true, desc:"Terceira base, já em Florença — hotel num palazzo histórico perto da estação, ótima localização pra andar a pé por tudo."},
  {t:"16:00–16:30", a:"Piazza della Signoria", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Museu a céu aberto — reparem nas esculturas da Loggia dei Lanzi e na réplica do David na entrada do Palazzo Vecchio (o original está na Accademia, que a gente visita amanhã)."},
  {t:"16:45–17:30", a:"Santa Maria del Fiore (vista externa)", dur:"45 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Só a parte de fora hoje — a subida à cúpula (com reserva) é amanhã de manhã. De noite iluminada fica ainda mais bonita, vale voltar depois do jantar se der."},
  {t:"19:30–20:30", a:"Jantar — All'Antico Vinaio", dur:"1h", tr:"A pé (13 min)", p:"€16,00", cat:"comida", desc:"Famosa pelos sanduíches de foccacia recheados — rápido, barato e com uma fila que costuma andar rápido. Bom pra um jantar leve depois de um dia cheio de trem."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"30/3", wk:"Terça", city:"firenze", cityLabel:"Florença", title:"Florença Clássica", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:104,
 items:[
  {t:"8:00–10:00", a:"Cúpula do Brunelleschi", dur:"1h30–2h", tr:"A pé (9 min)", p:"€40,00", flag:"Reserva obrigatória — OPA Pass", cat:"atracao", desc:"Subida por escada estreita e apertada (sem elevador), sentido único — 463 degraus. Reserva com horário marcado é obrigatória (OPA Pass), cheguem uns minutos antes."},
  {t:"10:15–11:15", a:"Galeria da Accademia (David)", dur:"1h", tr:"A pé (6 min)", p:"€24,00", cat:"atracao", desc:"O David original está aqui — reserva com horário evita a fila enorme que se forma na porta. Vale reservar um tempinho só pra admirar de perto."},
  {t:"11:30–12:00", a:"Ponte Vecchio", dur:"30 min", tr:"A pé (14 min)", p:"grátis", cat:"atracao", desc:"Ponte medieval cheia de joalherias históricas — dá pra atravessar rápido ou parar pra olhar as vitrines de ouro, tradição da ponte desde o século XVI."},
  {t:"13:00–14:00", a:"Almoço — Trattoria Mario", dur:"1h", tr:"A pé (10 min)", p:"€40,00", flag:"Chegar cedo, lota", cat:"comida", desc:"Trattoria pequena e concorrida, sem reserva — só balcão e mesas compartilhadas. Chegar assim que abrir é a garantia de conseguir lugar."},
  {t:"18:00–19:00", a:"Piazzale Michelangelo (pôr do sol)", dur:"1h", tr:"A pé ~30-35min subida (grátis) / Ônibus 12/13 ~15-20min (~€3,40)", p:"grátis", cat:"atracao", desc:"Melhor mirante de Florença, com a cidade inteira e o Duomo ao fundo — vão com tempo de sobra pra escolher um bom lugar antes do sol começar a baixar. A subida a pé é puxada mas linda, ou peguem o ônibus se as pernas já estiverem cansadas."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"31/3", wk:"Quarta", city:"firenze", cityLabel:"Florença", title:"Florença (Uffizi)", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:110,
 items:[
  {t:"8:15–8:30", a:"Chegada Galleria degli Uffizi", dur:"—", tr:"A pé (18 min do hotel)", p:"a confirmar", flag:"Reserva obrigatória — chegar 15 min antes", cat:"atracao", desc:"Cheguem uns 15 minutos antes do horário reservado — mesmo com ingresso marcado, tem uma fila de retirada que pode demorar."},
  {t:"8:30–11:30", a:"Galleria degli Uffizi", dur:"3h", tr:"—", p:"(incluso acima)", cat:"atracao", desc:"Um dos museus de arte mais importantes do mundo — Nascimento de Vênus e Primavera, de Botticelli, são os grandes destaques. Três horas rende bem, mas não tem problema sair antes se cansar."},
  {t:"11:45–12:30", a:"Café/gelato — Piazza della Repubblica", dur:"45 min", tr:"A pé (5 min)", p:"€15,00", cat:"comida", desc:"Pausa doce entre um museu e outro — praça boa pra sentar, tomar um espresso ou gelato e descansar as pernas."},
  {t:"13:00–14:00", a:"Almoço no Oltrarno (Santo Spirito)", dur:"1h", tr:"A pé (atravessar Ponte Vecchio, ~15 min)", p:"€35,00", cat:"comida", desc:"Do outro lado do rio, bairro mais local e menos turístico — as trattorias por ali costumam ser mais em conta e autênticas que no centro histórico."},
  {t:"14:30–16:30", a:"Giardino di Boboli", dur:"2h", tr:"A pé (10 min)", p:"a confirmar", cat:"atracao", desc:"Jardins renascentistas enormes atrás do Palazzo Pitti — bom pra caminhar com calma, tem sombra e vista de Florença lá de cima."},
  {t:"17:00–18:30", a:"Tempo livre — Santo Spirito / compras", dur:"livre", tr:"A pé (8 min)", p:"—", desc:"Bairro artesão de Florença, com ateliês de couro e ourivesaria — bom lugar pra achar um souvenir com mais identidade do que as lojinhas de turista."},
  {t:"20:00", a:"Jantar no Oltrarno (trattoria local)", dur:"1h30", tr:"A pé (5 min)", p:"€60,00", cat:"comida", desc:"Fechando o dia sem sair do bairro — trattoria local, sem reserva marcada, mas região tranquila pra achar mesa."}
 ], end:"Dormindo no Palazzo dal Borgo (Florença)"},

{d:"1/4", wk:"Quinta", city:"bologna", cityLabel:"Bologna", title:"Florença → Bologna", hotel:"Palazzo dal Borgo", hotelNote:"Hospedados no Palazzo dal Borgo (Florença)", budget:145,
 items:[
  {t:"11:30", a:"Checkout — Palazzo dal Borgo", dur:"—", tr:"—", p:"—", ci:true, desc:"Checkout mais tarde (11:30) — dá pra aproveitar a manhã com calma antes de pegar o trem."},
  {t:"12:00–12:40", a:"Firenze S.M. Novella → Bologna Centrale", dur:"~35–40 min", tr:"Frecciarossa/Italo", p:"€55,00", cat:"transporte", desc:"Trecho curto de alta velocidade, menos de 40 minutos — mal dá tempo de sentar."},
  {t:"13:00", a:"Check-in — Luxury Station Suite", dur:"—", tr:"—", p:"—", ci:true, desc:"Última base antes de Veneza — bem pertinho da Bologna Centrale, ótimo já que amanhã (Ferrari Day) a gente sai cedo justamente daqui da estação."},
  {t:"15:00–15:30", a:"Piazza Maggiore", dur:"30 min", tr:"A pé (15 min do hotel)", p:"grátis", cat:"atracao", desc:"Praça central de Bologna, com a Basílica de San Petronio dominando a paisagem — Bologna é mais tranquila e menos turística que as cidades anteriores, um respiro no meio da viagem."},
  {t:"15:45–17:15", a:"Torre dell'Orologio", dur:"1h30", tr:"A pé (7 min)", p:"€20,00", flag:"Reserva obrigatória", cat:"atracao", desc:"Reserva obrigatória, sobem em grupos pequenos por horário marcado — vista bonita dos telhados vermelhos de Bologna, a 'cidade rossa'."},
  {t:"17:30–18:15", a:"Mercato di Mezzo", dur:"45 min", tr:"A pé (8 min)", p:"grátis (compras à parte)", cat:"atracao", desc:"Mercado gastronômico coberto, ótimo pra beliscar produtos locais (mortadela, parmesão, tortellini) antes do jantar sério."},
  {t:"19:30–21:00", a:"Jantar — Osteria dell'Orsa", dur:"1h30", tr:"A pé (7 min)", p:"€70,00", cat:"comida", desc:"Clássica cantina de estudante, informal e barata pros padrões italianos — tortellini in brodo e tagliatelle al ragù são os fortes daqui, terra da massa fresca."}
 ], end:"Dormindo no Luxury Station Suite (Bologna)"},

{d:"2/4", wk:"Sexta", city:"ferrari", cityLabel:"Ferrari Day", title:"Ferrari Day", hotel:"Luxury Station Suite", hotelNote:"Hospedados no Luxury Station Suite (Bologna)", budget:570,
 items:[
  {t:"7:30–8:00", a:"Café da manhã, checkout — Luxury Station Suite", dur:"30 min", tr:"—", p:"—", ci:true, desc:"Dia mais corrido da viagem — café rápido e malas prontas, porque a gente vai deixar a bagagem no locker da estação antes de sair."},
  {t:"8:00–8:15", a:"Guardar bagagem no locker (KiPoint) da Bologna Centrale", dur:"15 min", tr:"A pé (2 min, dentro da estação)", p:"a confirmar", cat:"transporte", desc:"KiPoint dentro da própria Bologna Centrale — preço varia por tamanho/tempo, aceitam cartão. Assim rodamos o dia todo sem carregar mala."},
  {t:"8:30–8:55", a:"Bologna Centrale → Modena", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", cat:"transporte", desc:"Trem regional simples, sem reserva de assento — qualquer regional serve, não precisa comprar com muita antecedência."},
  {t:"9:05–10:25", a:"Museu Casa Enzo Ferrari (Modena)", dur:"1h20", tr:"A pé (10 min estação→museu, 10 min volta)", p:"€56,00", cat:"atracao", desc:"Onde Enzo Ferrari nasceu e teve sua primeira oficina — bom aquecimento antes da Galeria Ferrari em Maranello à tarde."},
  {t:"10:40–11:15", a:"Modena → Maranello", dur:"~35 min", tr:"Navetta \"Discover Ferrari\" (ida/volta)", p:"€20,00", cat:"transporte", desc:"Navetta oficial 'Discover Ferrari', ida e volta incluídas no mesmo bilhete — sai perto da estação de Modena, fiquem de olho no horário pra não perder."},
  {t:"11:15–13:00", a:"Galeria Ferrari (Maranello)", dur:"1h45", tr:"A pé (2 min do ponto da navetta)", p:"(incluso na navetta)", cat:"atracao", desc:"O museu principal da marca, com carros de corrida e de rua históricos — entrada já inclusa no bilhete da navetta."},
  {t:"13:00–14:00", a:"Almoço em Maranello", dur:"1h", tr:"A pé (10 min)", p:"€35,00", cat:"comida", desc:"Cidade pequena e bem ligada à Ferrari — não esperem muitas opções, mas dá pra comer bem rápido antes do test drive."},
  {t:"14:00–15:30", a:"Test drive — Ferrari Roma Spider (PushStart)", dur:"1h30 (com folga)", tr:"A pé (frente ao museu)", p:"€300,00", cat:"atracao", desc:"O grande momento do dia — reserva feita com a PushStart, levem a carteira de motorista física (e a internacional, se tiverem) e cheguem um pouco antes do horário."},
  {t:"15:30–18:00", a:"Tempo livre em Maranello (loja, café, relax)", dur:"2h30", tr:"—", p:"—", desc:"Depois da adrenalina, tempo pra relaxar, passar na lojinha oficial da Ferrari e tomar um café com calma antes de voltar."},
  {t:"18:00–18:35", a:"Maranello → Modena", dur:"~35 min", tr:"Navetta \"Discover Ferrari\"", p:"(incluso acima)", cat:"transporte", desc:"Mesma navetta, volta já incluída no bilhete de ida — não precisa comprar de novo."},
  {t:"18:35–19:00", a:"Modena → Bologna Centrale", dur:"~20–25 min", tr:"Trenitalia Regionale", p:"€12,00", cat:"transporte", desc:"Último trecho regional do dia, de volta pra pegar a bagagem no locker."},
  {t:"19:00–19:15", a:"Retirar bagagem do locker", dur:"15 min", tr:"A pé (2 min)", p:"(incluso acima)", cat:"transporte", desc:"Rapidinho, só pegar a mala de volta antes de embarcar pra Veneza."},
  {t:"19:30–20:50", a:"Bologna Centrale → Venezia Santa Lucia", dur:"~1h10–1h30", tr:"Frecciarossa", p:"€80,00", cat:"transporte", desc:"Trecho mais longo do dia, de alta velocidade — depois de um dia puxado, aproveitem pra descansar no trem."},
  {t:"21:15", a:"Check-in — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", ci:true, desc:"Chegada tardia em Veneza, direto no centro histórico de San Marco — hotel de charme, num palazzo antigo."},
  {t:"21:30", a:"Jantar tardio / room service (San Marco)", dur:"—", tr:"A pé (5 min do hotel)", p:"€55,00", cat:"comida", desc:"Depois de um dia longo, nada de reserva chique — algo rápido e prático pertinho do hotel ou room service mesmo."}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"3/4", wk:"Sábado", city:"venezia", cityLabel:"Veneza", title:"Veneza", hotel:"Hotel Saturnia & International", hotelNote:"Hospedados no Hotel Saturnia & International (Veneza)", budget:120,
 items:[
  {t:"9:00–9:30", a:"Piazza San Marco", dur:"30 min", tr:"A pé (5 min)", p:"grátis", cat:"atracao", desc:"Coração de Veneza — cheguem cedo pra sentir a praça mais vazia, antes da multidão de turistas do dia."},
  {t:"9:45–10:45", a:"Basílica de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€10,00", cat:"atracao", desc:"Interior coberto de mosaicos dourados — a fila pode ser longa, então vale reservar entrada rápida (skip-the-line) se disponível."},
  {t:"11:00–12:00", a:"Campanário de São Marcos", dur:"1h", tr:"A pé (2 min)", p:"€30,00", cat:"atracao", desc:"Melhor vista panorâmica de Veneza e da lagoa — tem elevador, então não é preciso subir escada."},
  {t:"12:15–13:00", a:"Ponte de Rialto", dur:"45 min", tr:"A pé (7 min)", p:"grátis", cat:"atracao", desc:"A ponte mais famosa sobre o Grand Canal, cheia de lojinhas — bom ponto pra ver as gôndolas passando por baixo."},
  {t:"20:00–21:30", a:"Jantar — Trattoria alla Madonna", dur:"1h30", tr:"A pé (11 min)", p:"€80,00", cat:"comida", desc:"Clássica de Veneza, especializada em frutos do mar — costuma ter fila, mas o giro de mesas é rápido."}
 ], end:"Dormindo no Hotel Saturnia & International (Veneza)"},

{d:"4/4", wk:"Domingo", city:"roma", cityLabel:"Veneza → Roma", title:"Veneza → Roma", hotel:"Hotel Saturnia & International", hotelNote:"Hospedados no Hotel Saturnia & International (Veneza)", budget:205,
 items:[
  {t:"9:00–9:45", a:"Fondamenta delle Zattere (Dorsoduro)", dur:"45 min", tr:"A pé (11 min)", p:"grátis", cat:"atracao", desc:"Calçadão mais tranquilo, longe da multidão do centro — bom pra uma última caminhada em Veneza com vista pro canal Giudecca."},
  {t:"10:15", a:"Checkout — Hotel Saturnia & International", dur:"—", tr:"—", p:"—", ci:true, desc:"Malas prontas — hoje é dia de trem longo até Roma."},
  {t:"10:30–14:00", a:"Venezia Santa Lucia → Roma Termini", dur:"~3h30–4h", tr:"Frecciarossa", p:"€130,00", cat:"transporte", desc:"Trecho mais longo de trem da viagem inteira — levem algo pra comer/beber e entretenimento pra passar o tempo."},
  {t:"15:00", a:"Check-in — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true, desc:"De volta à primeira base em Roma, já íntimos do bairro Monti — última noite da viagem."},
  {t:"20:00–21:30", a:"Jantar de despedida — Trattoria Da Enzo (Trastevere)", dur:"1h30", tr:"A pé ~27min (grátis) / Táxi ~12min (~€13,00)", p:"€75,00", cat:"comida", desc:"Fechando a lua de mel com estilo, em Trastevere — reserva recomendada, é um lugar concorrido mesmo em dia de semana."}
 ], end:"Dormindo no Aenea Inn (Roma)"},

{d:"5/4", wk:"Segunda", city:"roma", cityLabel:"Roma", title:"Volta ao Brasil", hotel:"Aenea Inn", hotelNote:"Hospedados no Aenea Inn (Roma)", budget:28,
 items:[
  {t:"Manhã", a:"Livre / últimas compras", dur:"livre", tr:"—", p:"—", desc:"Última manhã em Roma — aproveitem pra comprar algum souvenir que ficou faltando ou voltar a algum lugar que gostaram."},
  {t:"12:00", a:"Checkout — Aenea Inn", dur:"—", tr:"—", p:"—", ci:true, desc:"Checkout ao meio-dia, ainda dá bastante folga até o voo à noite — podem deixar a mala guardada na recepção e sair sem peso."},
  {t:"19:00", a:"Roma Termini → Fiumicino", dur:"Leonardo Express ~32min · Táxi ~40min", tr:"Leonardo Express / Táxi fixo", p:"€28,00 / €50,00", cat:"transporte", desc:"Mesmo trajeto da chegada, agora de volta — o Leonardo Express é a opção mais previsível pra não arriscar perder o voo."},
  {t:"22:05", a:"Voo FCO → GRU", dur:"—", tr:"ITA Airways AZ 674", p:"—", desc:"Voo de volta pra casa — hora de descansar (e já sentir saudade da Itália)."}
 ], end:"Em voo, rumo a São Paulo"}
];
