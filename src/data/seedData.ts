import { CityConfig, LocalzItem, PharmacyDutyShift, CollaborativeContribution, Review } from '../types';

export const SEED_CITIES: CityConfig[] = [
  {
    id: 'sao-lourenco-mg',
    name: 'São Lourenço',
    state: 'MG',
    stateName: 'Minas Gerais',
    coordinates: { lat: -22.1158, lng: -45.0531 },
    population: 46261,
    dutyModel: 'rotation',
    dutyModelDescription: 'Rodízio semanal entre 4 farmácias credenciadas. Atendimento estendido até às 22h00 e pernoite em chamada de emergência.',
    dutySourceOfficial: 'Prefeitura Municipal de São Lourenço / Secretaria de Saúde - Decreto Municipal nº 8.412/2026',
    isActive: true,
  },
  {
    id: 'holambra-sp',
    name: 'Holambra',
    state: 'SP',
    stateName: 'São Paulo',
    coordinates: { lat: -22.6322, lng: -47.0547 },
    population: 15111,
    dutyModel: 'scheduled',
    dutyModelDescription: 'Escala municipal alternada aos fins de semana e feriados, com plantão das 18h00 às 23h00.',
    dutySourceOfficial: 'Associação Comercial e Prefeitura da Estância Turística de Holambra',
    isActive: true,
  },
  {
    id: 'pirenopolis-go',
    name: 'Pirenópolis',
    state: 'GO',
    stateName: 'Goiás',
    coordinates: { lat: -15.8525, lng: -48.9592 },
    population: 25000,
    dutyModel: 'rotation',
    dutyModelDescription: 'Rodízio quinzenal de plantão noturno (19h00 às 07h00) e feriados.',
    dutySourceOfficial: 'Conselho Municipal de Saúde de Pirenópolis',
    isActive: true,
  },
  {
    id: 'tiradentes-mg',
    name: 'Tiradentes',
    state: 'MG',
    stateName: 'Minas Gerais',
    coordinates: { lat: -21.1106, lng: -44.1758 },
    population: 8000,
    dutyModel: 'rotation',
    dutyModelDescription: 'Plantão rotativo entre as farmácias centrais aos sábados, domingos e feriados até 22h.',
    dutySourceOfficial: 'Prefeitura de Tiradentes - Vigilância Sanitária',
    isActive: true,
  },
];

// Helper to calculate standard weekly opening hours
const standardBusinessHours = [
  { dayOfWeek: 1, dayName: 'Segunda', isOpen: true, periods: [{ open: '08:00', close: '19:00' }] },
  { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '08:00', close: '19:00' }] },
  { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '08:00', close: '19:00' }] },
  { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '08:00', close: '19:00' }] },
  { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '08:00', close: '19:00' }] },
  { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '08:00', close: '14:00' }] },
  { dayOfWeek: 0, dayName: 'Domingo', isOpen: false },
];

const restaurantHours = [
  { dayOfWeek: 1, dayName: 'Segunda', isOpen: false },
  { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '11:30', close: '15:00' }, { open: '18:30', close: '23:00' }] },
  { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '11:30', close: '15:00' }, { open: '18:30', close: '23:00' }] },
  { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '11:30', close: '15:00' }, { open: '18:30', close: '23:00' }] },
  { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '11:30', close: '15:30' }, { open: '18:30', close: '23:59' }] },
  { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '11:30', close: '16:00' }, { open: '18:30', close: '23:59' }] },
  { dayOfWeek: 0, dayName: 'Domingo', isOpen: true, periods: [{ open: '11:30', close: '17:00' }] },
];

export const SEED_ITEMS: LocalzItem[] = [
  // --- FARMÁCIAS (São Lourenço) ---
  {
    id: 'farm-01',
    type: 'business',
    title: 'Farmácia São Lourenço Popular',
    description: 'Medicamentos genéricos com desconto, perfumaria completa e aplicação de injeções por farmacêutico presente.',
    category: 'saude_farmacia',
    subcategory: 'Farmácias e Drogarias',
    tags: ['farmácia', 'medicamentos', 'plantão', 'pressão arterial', 'injeções'],
    address: 'Av. Dom Pedro II, 420 - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    zipCode: '37470-000',
    coordinates: { lat: -22.1162, lng: -45.0535 },
    phone: '(35) 3332-1540',
    whatsapp: '5535988112233',
    photos: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&auto=format&fit=crop&q=80'
    ],
    verificationStatus: 'verified',
    localzScore: 9.4,
    reviewCount: 38,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-09-01T14:00:00Z',
    isPharmacy: true,
    is24h: false,
    priceRange: 'R$',
    openingHours: [
      { dayOfWeek: 1, dayName: 'Segunda', isOpen: true, periods: [{ open: '07:30', close: '21:00' }] },
      { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '07:30', close: '21:00' }] },
      { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '07:30', close: '21:00' }] },
      { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '07:30', close: '21:00' }] },
      { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '07:30', close: '21:00' }] },
      { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '08:00', close: '20:00' }] },
      { dayOfWeek: 0, dayName: 'Domingo', isOpen: true, periods: [{ open: '08:00', close: '14:00' }] },
    ],
    amenities: ['Estacionamento', 'Entrega a Domicílio', 'Aferição de Pressão', 'Aceita Pix/Cartão']
  },
  {
    id: 'farm-02',
    type: 'business',
    title: 'Drogaria Brasil & Manipulação',
    description: 'Laboratório próprio de fórmulas manipuladas, cosméticos naturais e linha ortopédica completa.',
    category: 'saude_farmacia',
    subcategory: 'Farmácias de Manipulação',
    tags: ['farmácia', 'manipulação', 'fórmulas', 'suplementos'],
    address: 'Rua Wenceslau Braz, 185 - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1179, lng: -45.0519 },
    phone: '(35) 3331-2890',
    whatsapp: '5535999887766',
    photos: [
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80'
    ],
    verificationStatus: 'claimed',
    localzScore: 8.9,
    reviewCount: 22,
    createdAt: '2026-02-15T12:00:00Z',
    updatedAt: '2026-08-20T11:00:00Z',
    isPharmacy: true,
    is24h: false,
    priceRange: 'R$$',
    openingHours: standardBusinessHours,
    amenities: ['Entrega Rápida', 'Laboratório Certificado']
  },

  // --- GASTRONOMIA (São Lourenço) ---
  {
    id: 'gast-01',
    type: 'business',
    title: 'Bistrô Quinta do Cedro',
    description: 'Culinária mineira contemporânea com ingredientes da serra da Mantiqueira, queijos artesanais e vista para o pomar.',
    category: 'gastronomia',
    subcategory: 'Restaurantes Típicos',
    tags: ['comida mineira', 'queijo artesanal', 'café', 'vinho', 'jantar'],
    address: 'Rua Cel. José Justino, 310 - Federal',
    neighborhood: 'Federal',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1132, lng: -45.0561 },
    phone: '(35) 3332-6010',
    whatsapp: '5535997223344',
    instagram: '@quintadocedro',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=80'
    ],
    isSponsored: true,
    verificationStatus: 'verified',
    localzScore: 9.7,
    reviewCount: 94,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    priceRange: 'R$$$',
    openingHours: restaurantHours,
    amenities: ['Ar Condicionado', 'Área Externa', 'Espaço Pet Friendly', 'Carta de Vinhos', 'Música ao Vivo']
  },
  {
    id: 'gast-02',
    type: 'business',
    title: 'Café & Confeitaria Mantiqueira',
    description: 'Cafés especiais torrados na cidade, broa de milho assada na hora, tortas caseiras e empadas artesanais.',
    category: 'gastronomia',
    subcategory: 'Cafés e Docerias',
    tags: ['café especial', 'doces', 'pão de queijo', 'café da tarde'],
    address: 'Calçadão Silvério Sanches, 45 - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1152, lng: -45.0528 },
    phone: '(35) 3332-7711',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
    ],
    verificationStatus: 'verified',
    localzScore: 9.2,
    reviewCount: 63,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
    priceRange: 'R$$',
    openingHours: [
      { dayOfWeek: 1, dayName: 'Segunda', isOpen: true, periods: [{ open: '08:30', close: '20:00' }] },
      { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '08:30', close: '20:00' }] },
      { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '08:30', close: '20:00' }] },
      { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '08:30', close: '20:00' }] },
      { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '08:30', close: '21:00' }] },
      { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '08:30', close: '21:00' }] },
      { dayOfWeek: 0, dayName: 'Domingo', isOpen: true, periods: [{ open: '09:00', close: '19:00' }] },
    ],
    amenities: ['Wi-Fi Grátis', 'Tomadas para Notebook', 'Ambiente Aconchegante']
  },

  // --- LUGARES E PONTOS TURÍSTICOS ---
  {
    id: 'plac-01',
    type: 'place',
    title: 'Parque das Águas de São Lourenço',
    description: 'Parque ecológico centenário com 7 fontes de águas minerais naturais carbogasosas, lago com pedalinhos, bosques e centro de hidroterapia.',
    category: 'turismo_lazer',
    subcategory: 'Parques e Natureza',
    tags: ['parque', 'águas minerais', 'natureza', 'caminhada', 'família', 'ponto turístico'],
    address: 'Praça Brasil, s/n - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    zipCode: '37470-000',
    coordinates: { lat: -22.1198, lng: -45.0502 },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'
    ],
    admission: 'paid',
    admissionPrice: 'R$ 16,00 (Meia R$ 8,00)',
    bestTimeVisit: 'Manhãs de sol entre 08h e 11h',
    accessibilityFeatures: ['Rampas de acesso', 'Banheiros adaptados', 'Cadeiras de rodas disponíveis'],
    verificationStatus: 'verified',
    localzScore: 9.8,
    reviewCount: 154,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    openingHours: [
      { dayOfWeek: 0, dayName: 'Domingo', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 1, dayName: 'Segunda', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
      { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '08:00', close: '17:30' }] },
    ]
  },
  {
    id: 'plac-02',
    type: 'place',
    title: 'Estação Trem das Águas (Maria Fumaça)',
    description: 'Passeio turístico de locomotiva a vapor histórica conectando São Lourenço a Soledade de Minas, com violeiros e degustação de queijos nos vagões.',
    category: 'turismo_lazer',
    subcategory: 'Patrimônio Histórico',
    tags: ['maria fumaça', 'trem', 'história', 'passeio', 'passeio infantil'],
    address: 'Praça Dr. Humberto Sanches, s/n - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1145, lng: -45.0489 },
    photos: [
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80'
    ],
    admission: 'paid',
    admissionPrice: 'A partir de R$ 85,00',
    bestTimeVisit: 'Sábados às 10h e 14h30 / Domingos às 10h',
    verificationStatus: 'verified',
    localzScore: 9.6,
    reviewCount: 88,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-25T15:00:00Z'
  },
  {
    id: 'plac-03',
    type: 'place',
    title: 'Mirante da Torre de São Lourenço',
    description: 'Ponto mais alto da cidade com vista panorâmica de 360 graus para o vale do Rio Verde e o pôr do sol na Serra da Mantiqueira.',
    category: 'turismo_lazer',
    subcategory: 'Mirantes e Paisagens',
    tags: ['mirante', 'pôr do sol', 'fotografia', 'gratuito', 'trilha'],
    address: 'Estrada do Cruzeiro, s/n - Alto dos Poetas',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1065, lng: -45.0598 },
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    admission: 'free',
    bestTimeVisit: 'Final de tarde para o pôr do sol (17h00)',
    verificationStatus: 'community',
    localzScore: 9.1,
    reviewCount: 42,
    createdAt: '2026-03-01T14:00:00Z',
    updatedAt: '2026-08-10T16:00:00Z'
  },

  // --- SERVIÇOS E COMÉRCIO ---
  {
    id: 'serv-01',
    type: 'service',
    title: 'Mecânica e Auto Center Mantiqueira',
    description: 'Diagnóstico computadorizado de injeção eletrônica, freios, suspensão, alinhamento 3D e socorro mecânico leve.',
    category: 'automotivo',
    subcategory: 'Oficinas Mecânicas',
    tags: ['mecânica', 'oficina', 'freio', 'suspensão', 'socorro auto'],
    address: 'Av. Getúlio Vargas, 980 - Carioca',
    neighborhood: 'Carioca',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1225, lng: -45.0592 },
    phone: '(35) 3331-4455',
    whatsapp: '5535991122334',
    photos: [
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=800&auto=format&fit=crop&q=80'
    ],
    verificationStatus: 'claimed',
    localzScore: 9.0,
    reviewCount: 19,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z',
    openingHours: standardBusinessHours,
    amenities: ['Orçamento Grátis', 'Garantia de 90 dias', 'Sala de Espera Climatizada']
  },

  // --- EVENTOS ---
  {
    id: 'eve-01',
    type: 'event',
    title: 'Feira Noturna de Artesanato e Gastronomia da Estação',
    description: 'Encontro semanal de produtores locais: queijos, cachaças da serra, doces em compota, artesanato em palha e shows acústicos ao vivo.',
    category: 'eventos_cultura',
    subcategory: 'Feiras e Mercados',
    tags: ['feira', 'artesanato', 'música ao vivo', 'família', 'grátis', 'acontecendo'],
    address: 'Praça da Estação Ferroviária - Centro',
    neighborhood: 'Centro',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1147, lng: -45.0487 },
    photos: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
    ],
    startDate: '2026-09-06',
    startTime: '18:00',
    endTime: '23:00',
    organizerName: 'Associação dos Artesãos e Produtores de São Lourenço',
    organizerReputationScore: 9.5,
    isFree: true,
    recurrence: 'weekly',
    recurrenceDetails: 'Todos os sábados e domingos à noite',
    eventStatus: 'happening_now',
    verificationStatus: 'verified',
    localzScore: 9.5,
    reviewCount: 72,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-09-06T08:00:00Z'
  },
  {
    id: 'eve-02',
    type: 'event',
    title: 'Festival Mantiqueira de Jazz & Vinhos de Inverno',
    description: '3 dias de grandes apresentações de jazz e blues instrumental com degustação de vinícolas de altitude e queijarias premiadas.',
    category: 'eventos_cultura',
    subcategory: 'Festivais de Música',
    tags: ['festival', 'jazz', 'vinho', 'show', 'fim de semana'],
    address: 'Parque Municipal Ilha Antônio Dutra',
    city: 'São Lourenço',
    state: 'MG',
    coordinates: { lat: -22.1240, lng: -45.0450 },
    photos: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    startTime: '19:30',
    endTime: '01:00',
    organizerName: 'Secretaria Municipal de Cultura e Turismo',
    organizerReputationScore: 9.2,
    isFree: false,
    ticketPrice: 'R$ 40,00 por dia (Lote 1)',
    recurrence: 'annual',
    recurrenceDetails: 'Edição Anual de Inverno/Primavera',
    eventStatus: 'scheduled',
    verificationStatus: 'verified',
    localzScore: 9.6,
    reviewCount: 45,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z'
  },

  // --- ITEMS EM HOLAMBRA (Demonstrating multi-city discovery) ---
  {
    id: 'hol-01',
    type: 'place',
    title: 'Moinho Povos Unidos de Holambra',
    description: 'Cópia autêntica dos moinhos holandeses tradicionais com 38 metros de altura, mirante no topo e moagem real de grãos.',
    category: 'turismo_lazer',
    subcategory: 'Pontos Turísticos',
    tags: ['moinho', 'holanda', 'flores', 'turismo'],
    address: 'Alameda Maurício de Nassau, 249',
    city: 'Holambra',
    state: 'SP',
    coordinates: { lat: -22.6285, lng: -47.0520 },
    photos: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80'
    ],
    admission: 'paid',
    admissionPrice: 'R$ 15,00',
    verificationStatus: 'verified',
    localzScore: 9.4,
    reviewCount: 110,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'hol-02',
    type: 'business',
    title: 'Farmácia Holambrense Central',
    description: 'Farmácia tradicional da colônia com convênios, testes rápidos e medicamentos de uso contínuo.',
    category: 'saude_farmacia',
    subcategory: 'Farmácias e Drogarias',
    tags: ['farmácia', 'remédios', 'plantão', 'holambra'],
    address: 'Rua Rota dos Imigrantes, 520',
    city: 'Holambra',
    state: 'SP',
    coordinates: { lat: -22.6310, lng: -47.0540 },
    phone: '(19) 3802-1200',
    photos: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80'
    ],
    verificationStatus: 'verified',
    localzScore: 9.1,
    reviewCount: 29,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    isPharmacy: true,
    openingHours: standardBusinessHours
  }
];

// --- PHARMACY DUTY SHIFTS (Escalas Reais Configuráveis por Município) ---
// Note: dates are set to cover today's current date (local time 2026-09-06)
export const SEED_DUTY_SHIFTS: PharmacyDutyShift[] = [
  {
    id: 'shift-sl-01',
    city: 'São Lourenço',
    state: 'MG',
    pharmacyId: 'farm-01',
    pharmacyName: 'Farmácia São Lourenço Popular',
    address: 'Av. Dom Pedro II, 420 - Centro',
    phone: '(35) 3332-1540',
    whatsapp: '5535988112233',
    coordinates: { lat: -22.1162, lng: -45.0535 },
    startDateTime: '2026-09-05T18:00:00Z',
    endDateTime: '2026-09-12T08:00:00Z',
    specialScheduleText: 'Plantão Noturno & Fim de Semana (Plantão aberto direto até 22h, após às 22h com campainha de emergência / telefone)',
    source: 'Prefeitura Municipal de São Lourenço — Portaria da Secretaria de Saúde nº 148/2026',
    sourceType: 'official_decree',
    status: 'confirmed',
    lastConfirmedDate: '2026-09-05',
    notes: 'Escala oficial do mês de Setembro. Farmacêutico responsável Dr. Marcos Aurélio CRF-MG 14.890 presente durante o período.',
    confirmedByAdminId: 'admin-01'
  },
  {
    id: 'shift-sl-02',
    city: 'São Lourenço',
    state: 'MG',
    pharmacyId: 'farm-02',
    pharmacyName: 'Drogaria Brasil & Manipulação',
    address: 'Rua Wenceslau Braz, 185 - Centro',
    phone: '(35) 3331-2890',
    whatsapp: '5535999887766',
    coordinates: { lat: -22.1179, lng: -45.0519 },
    startDateTime: '2026-09-12T08:00:00Z',
    endDateTime: '2026-09-19T08:00:00Z',
    specialScheduleText: 'Próxima escala do rodízio municipal (Inicia sábado 12/09 às 08h00)',
    source: 'Prefeitura Municipal de São Lourenço — Portaria da Secretaria de Saúde nº 148/2026',
    sourceType: 'official_decree',
    status: 'confirmed',
    lastConfirmedDate: '2026-09-05',
    notes: 'Assume após o término do plantão da Farmácia São Lourenço Popular.',
    confirmedByAdminId: 'admin-01'
  },
  {
    id: 'shift-hol-01',
    city: 'Holambra',
    state: 'SP',
    pharmacyId: 'hol-02',
    pharmacyName: 'Farmácia Holambrense Central',
    address: 'Rua Rota dos Imigrantes, 520',
    phone: '(19) 3802-1200',
    coordinates: { lat: -22.6310, lng: -47.0540 },
    startDateTime: '2026-09-06T08:00:00Z',
    endDateTime: '2026-09-06T23:00:00Z',
    specialScheduleText: 'Plantão dominical das 08h00 às 23h00',
    source: 'Associação Comercial e Prefeitura de Holambra',
    sourceType: 'commercial_assoc',
    status: 'confirmed',
    lastConfirmedDate: '2026-09-04',
    notes: 'Atendimento estendido no fim de semana.',
    confirmedByAdminId: 'admin-01'
  }
];

// Seed reviews showcasing dimensional evaluation
export const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    itemId: 'gast-01',
    userId: 'usr-02',
    userName: 'Mariana Silveira',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    overallRating: 5,
    dimensions: [
      { key: 'comida', label: 'Comida', rating: 5 },
      { key: 'atendimento', label: 'Atendimento', rating: 5 },
      { key: 'preco', label: 'Preço', rating: 4 },
      { key: 'ambiente', label: 'Ambiente', rating: 5 },
      { key: 'limpeza', label: 'Limpeza', rating: 5 },
      { key: 'custo_beneficio', label: 'Custo-benefício', rating: 4 }
    ],
    comment: 'Experiência maravilhosa! O risoto de truta com queijo da Mantiqueira é inesquecível. Ambiente aconchegante e garçons super atenciosos.',
    createdAt: '2026-08-28T20:30:00Z',
    verifiedVisit: true
  },
  {
    id: 'rev-02',
    itemId: 'farm-01',
    userId: 'usr-03',
    userName: 'Carlos Eduardo Nogueira',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    overallRating: 5,
    dimensions: [
      { key: 'atendimento', label: 'Atendimento', rating: 5 },
      { key: 'confianca', label: 'Confiança / Agilidade', rating: 5 },
      { key: 'preco', label: 'Preço justo', rating: 4 },
      { key: 'disponibilidade', label: 'Disponibilidade de remédios', rating: 5 }
    ],
    comment: 'Precisei de um antibiótico às 21h no plantão de domingo e fui atendido na hora. Farmacêutico muito prestativo e conferiu toda a receita.',
    createdAt: '2026-09-02T21:40:00Z',
    verifiedVisit: true
  },
  {
    id: 'rev-03',
    itemId: 'serv-01',
    userId: 'usr-04',
    userName: 'Juliana Pires',
    overallRating: 5,
    dimensions: [
      { key: 'qualidade', label: 'Qualidade do Serviço', rating: 5 },
      { key: 'atendimento', label: 'Atendimento', rating: 5 },
      { key: 'confianca', label: 'Confiança / Transparência', rating: 5 },
      { key: 'prazo', label: 'Cumprimento de Prazo', rating: 4 },
      { key: 'preco', label: 'Preço', rating: 4 }
    ],
    comment: 'Meu carro deu problema no caminho para a cidade e a oficina identificou rapidamente que era apenas o sensor de temperatura. Honestos e rápidos!',
    createdAt: '2026-08-15T16:00:00Z',
    verifiedVisit: true
  }
];

// Seed contributions in moderation queue
export const SEED_CONTRIBUTIONS: CollaborativeContribution[] = [
  {
    id: 'contrib-01',
    type: 'new_item',
    itemType: 'business',
    city: 'São Lourenço',
    userId: 'usr-05',
    userName: 'Lucas Fontes',
    userEmail: 'lucas.fontes@gmail.com',
    targetItemTitle: 'Armazém das Gerais - Queijos & Empório',
    payload: {
      title: 'Armazém das Gerais - Queijos & Empório',
      category: 'gastronomia',
      subcategory: 'Queijarias e Empórios',
      address: 'Rua Wenceslau Braz, 88 - Centro',
      phone: '(35) 3332-9090',
      description: 'Queijos premiados da Mantiqueira, doces de leite artesanais e cachaças locais.'
    },
    status: 'pending',
    submittedAt: '2026-09-05T19:00:00Z'
  },
  {
    id: 'contrib-02',
    type: 'edit_item',
    targetItemId: 'farm-02',
    targetItemTitle: 'Drogaria Brasil & Manipulação',
    city: 'São Lourenço',
    userId: 'usr-06',
    userName: 'Dra. Beatriz Santos',
    userEmail: 'beatriz.farmacia@yahoo.com.br',
    payload: {
      whatsapp: '5535999887766',
      notes: 'Atualização do número direto do balcão de manipulação para envio de receitas.'
    },
    status: 'pending',
    submittedAt: '2026-09-06T06:30:00Z'
  }
];
