import type { ReferenceCyberware } from "@/app/types/reference";

/** TECH-based skill ids for Techscanner +2. */
const TECH_SKILL_IDS = [
  "tecnologia-aeronaves", "tecnologia-basica", "cybertecnologia", "demolicoes",
  "tecnologia-eletronica-seguranca", "primeiros-socorros", "falsificacao",
  "tecnologia-veiculos-terrestres", "pintura-desenho-escultura", "paramedico",
  "fotografia-filme", "arrombamento", "bater-carteira", "tecnologia-veiculos-maritimos",
  "tecnologia-armas", "tocar-instrumentos",
];

export const referenceCyberware: ReferenceCyberware[] = [
  // ▶ FASHIONWARE (7 opções de slots)
  { id: "biomonitor", name: "Biomonitor", category: "Fashionware", price: 100, humanityCost: 0, description: "Implante subdérmico que gera uma leitura dos sinais vitais. Pode ligar ao Agente.", installation: "loja" },
  { id: "pigmentacao-artificial", name: "Pigmentação Artificial", category: "Fashionware", price: 100, humanityCost: 0, description: "Corantes e pigmentos infundidos na pele. +2 para Cuidados Pessoais se o usuário também tem Techcabelo.", installation: "loja", skillBonuses: [{ skillId: "cuidados-pessoais", bonus: 2 }] },
  { id: "fio-metalico-emp", name: "Fio Metálico EMP", category: "Fashionware", price: 10, humanityCost: 0, description: "Thin silver lines that run in circuit-like patterns across the body.", installation: "loja" },
  { id: "tatuagem-luminosa", name: "Tatuagem Luminosa", category: "Fashionware", price: 100, humanityCost: 0, description: "Patches subdérmicos armazenam tatuagens coloridas luminosas. +2 para Guarda-roupa e Estilo se o usuário tiver três ou mais tatuagens.", installation: "loja", skillBonuses: [{ skillId: "guarda-roupa-estilo", bonus: 2 }] },
  { id: "lentes-contato-mutativas", name: "Lentes de Contato Mutativas", category: "Fashionware", price: 100, humanityCost: 0, description: "Lentes de mudança de cor implantadas no olho.", installation: "loja" },
  { id: "relogio-subdermico", name: "Relógio Subdérmico", category: "Fashionware", price: 100, humanityCost: 0, description: "Relógio de LED subdermalmente implantado.", installation: "loja" },
  { id: "techcabelo", name: "Techcabelo", category: "Fashionware", price: 100, humanityCost: 0, description: "Cor-luz emitidos pelo cabelo artificial. +2 para Cuidados Pessoais se o usuário também tem Pigmentação Artificial.", installation: "loja", skillBonuses: [{ skillId: "cuidados-pessoais", bonus: 2 }] },

  // ▶ NEURALWARE (Foundation: Link Neural, 5 slots)
  { id: "link-neural", name: "Link Neural", category: "Neuralware", price: 500, humanityCost: 7, description: "Sistema nervoso artificial com fio. Necessário para Neuralware e Cabo Subcutâneo. Possui 5 opções de slots.", installation: "clinica", slotOptions: 5 },
  { id: "gravador-neurodanca", name: "Gravador de Neurodança", category: "Neuralware", price: 500, humanityCost: 7, description: "Registra as experiências do usuário para chip de memória ou dispositivo externo.", installation: "clinica", requires: ["link-neural"] },
  { id: "soquete-chipware", name: "Soquete para Chipware", category: "Neuralware", price: 500, humanityCost: 7, description: "Um soquete instalado na parte de trás do pescoço. Necessário para Chipware.", installation: "clinica", requires: ["link-neural"] },
  { id: "plugs-interface", name: "Plugs de Interface", category: "Neuralware", price: 500, humanityCost: 7, description: "Plugues no pulso ou na cabeça que permitem conexão com máquinas.", installation: "clinica", requires: ["link-neural"] },
  { id: "kerenzikov", name: "Kerenzikov", category: "Neuralware", price: 500, humanityCost: 14, description: "Speedware. O usuário adiciona +2 à Iniciativa. Apenas uma peça de Speedware por vez.", installation: "clinica", requires: ["link-neural"] },
  { id: "sandevistan", name: "Sandevistan", category: "Neuralware", price: 500, humanityCost: 7, description: "Speedware. Quando ativado como Ação adiciona +3 à Iniciativa durante um minuto. 1h cooldown.", installation: "clinica", requires: ["link-neural"] },
  { id: "analisador-quimico", name: "Analisador Químico", category: "Neuralware", price: 500, humanityCost: 3, description: "Chipware. Testes de substância para composição química. Requer Soquete para Chipware.", installation: "n/a", requires: ["soquete-chipware"] },
  { id: "chip-memoria", name: "Chip de Memória", category: "Neuralware", price: 10, humanityCost: 0, description: "Armazenamento de dados.", installation: "n/a" },
  { id: "olfato-aprimorado", name: "Olfato Aprimorado", category: "Neuralware", price: 100, humanityCost: 7, description: "Chipware. Rastreamento através de perfume. Requer Soquete para Chipware.", installation: "n/a", requires: ["soquete-chipware"] },
  { id: "editor-dor", name: "Editor de Dor", category: "Neuralware", price: 1000, humanityCost: 14, description: "Chipware. Usuário ignora penalidades por estar gravemente ferido. Requer Soquete para Chipware.", installation: "n/a", requires: ["soquete-chipware"] },
  { id: "chip-habilidade", name: "Chip de Habilidade", category: "Neuralware", price: 500, humanityCost: 7, description: "Chipware. Habilidade específica no nível 3 (a menos que já seja 3+). Requer Soquete para Chipware.", installation: "n/a", requires: ["soquete-chipware"] },
  { id: "tato-aprimorado", name: "Tato Aprimorado", category: "Neuralware", price: 100, humanityCost: 7, description: "Chipware. Detectar movimento dentro de 20m colocando a mão na superfície. Requer Soquete para Chipware.", installation: "n/a", requires: ["soquete-chipware"] },

  // ▶ CYBERÓPTICOS (Foundation: Cyberolho, 3 slots each)
  { id: "cyberolho", name: "Cyberolho", category: "Cyberópticos", price: 100, humanityCost: 7, description: "Olho artificial. Cada Cyberolho tem 3 opções de slots. Algumas opções devem ser emparelhadas.", installation: "clinica", slotOptions: 3 },
  { id: "antiofuscante", name: "Antiofuscante", category: "Cyberópticos", price: 100, humanityCost: 2, description: "Imune a flashes de luz. Requer dois Cyberolhos, emparelhado.", installation: "loja", requires: ["cyberolho"] },
  { id: "display-chyron", name: "Display Chyron", category: "Cyberópticos", price: 100, humanityCost: 2, description: "Projeta uma sub tela no campo de visão. Requer um Cyberolho.", installation: "loja", requires: ["cyberolho"] },
  { id: "cor-mutativa", name: "Cor Mutativa", category: "Cyberópticos", price: 100, humanityCost: 2, description: "Cores ilimitadas e mudanças de padrão para o olho. Requer um Cyberolho.", installation: "loja", requires: ["cyberolho"] },
  { id: "dartgun", name: "Dartgun", category: "Cyberópticos", price: 500, humanityCost: 2, description: "Arma exótica de dardos no olho, disparo único. Ocupa 3 slots.", installation: "clinica", requires: ["cyberolho"] },
  { id: "imagem-aperfeicoada", name: "Imagem Aperfeiçoada", category: "Cyberópticos", price: 500, humanityCost: 3, description: "+2 a Percepção, Leitura Labial e Esconder/Revelar Objetos. Requer dois Cyberolhos, emparelhado.", installation: "loja", requires: ["cyberolho"], skillBonuses: [{ skillId: "percepcao", bonus: 2 }, { skillId: "leitura-labial", bonus: 2 }, { skillId: "esconder-revelar-objeto", bonus: 2 }] },
  { id: "luz-baixa-infra-uv", name: "Luz Baixa / Infravermelho / UV", category: "Cyberópticos", price: 500, humanityCost: 3, description: "Ignorar penalidades por escuridão, fumaça, nevoeiro. Requer dois Cyberolhos, emparelhado, 2 slots por olho.", installation: "loja", requires: ["cyberolho"] },
  { id: "visao-microscopica", name: "Visão Microscópica", category: "Cyberópticos", price: 100, humanityCost: 2, description: "Ampliação 400x. Requer um Cyberolho.", installation: "clinica", requires: ["cyberolho"] },
  { id: "micro-video", name: "Micro Video", category: "Cyberópticos", price: 500, humanityCost: 2, description: "Câmera no olho. Grava áudio e vídeo. Ocupa 2 slots. Requer um Cyberolho.", installation: "clinica", requires: ["cyberolho"] },
  { id: "detector-radiacao", name: "Detector de Radiação", category: "Cyberópticos", price: 1000, humanityCost: 3, description: "Leituras de radiação dentro de 100m em forma de brilho azul. Requer um Cyberolho.", installation: "clinica", requires: ["cyberolho"] },
  { id: "sensor-mira", name: "Sensor de Mira", category: "Cyberópticos", price: 500, humanityCost: 3, description: "+1 na verificação ao fazer Tiro com Mira. Requer um Cyberolho.", installation: "clinica", requires: ["cyberolho"], skillBonuses: [{ skillId: "armas-de-ombro", bonus: 1 }] },
  { id: "lente-aumento", name: "Lente de Aumento", category: "Cyberópticos", price: 500, humanityCost: 3, description: "Ver detalhes até 800m. +1 para tiros direcionados contra alvo 51m+. Requer um Cyberolho.", installation: "clinica", requires: ["cyberolho"] },
  { id: "virtuality", name: "Virtuality", category: "Cyberópticos", price: 100, humanityCost: 2, description: "Projeta imagens do ciberespaço sobre a visão. Requer dois Cyberolhos, emparelhado.", installation: "loja", requires: ["cyberolho"] },

  // ▶ CYBERAUDIO (Foundation: Conjunto Cyberáudio, 3 slots)
  { id: "conjunto-cyberaudio", name: "Conjunto de Cyberáudio", category: "Cyberaudio", price: 500, humanityCost: 7, description: "Tem 3 opções de slots. Não é possível instalar mais de 1.", installation: "clinica", slotOptions: 3 },
  { id: "audicao-amplificada", name: "Audição Amplificada", category: "Cyberaudio", price: 100, humanityCost: 3, description: "+2 para Percepção em verificações envolvendo audição. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"], skillBonuses: [{ skillId: "percepcao", bonus: 2 }] },
  { id: "audio-gravador", name: "Áudio Gravador", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Grava áudio para Chip de Memória ou Agente. Requer Conjunto Cyberáudio.", installation: "clinica", requires: ["conjunto-cyberaudio"] },
  { id: "detector-escutas", name: "Detector de Escutas", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Apita a 2m de dispositivo de escuta. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"] },
  { id: "localizador", name: "Localizador", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Seguir um Localizador ligado até 1 milha. Requer Conjunto Cyberáudio.", installation: "clinica", requires: ["conjunto-cyberaudio"] },
  { id: "agente-interno", name: "Agente Interno", category: "Cyberaudio", price: 100, humanityCost: 3, description: "Agente instalado internamente. Pode ligar a Cyberolho com Display Chyron. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"] },
  { id: "amortecedor-ruido", name: "Amortecedor de Ruído", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Imune a efeitos de ruídos altos. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"] },
  { id: "radio-comunicador", name: "Rádio Comunicador", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Comunicação via rádio até 1km. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"] },
  { id: "radio-scanner-music", name: "Radio Scanner / Music Player", category: "Cyberaudio", price: 50, humanityCost: 2, description: "Transmissões de rádio 1km. Reproduz de Data Pool ou Chip. Requer Conjunto Cyberáudio.", installation: "clinica", requires: ["conjunto-cyberaudio"] },
  { id: "detector-radar", name: "Detector de Radar", category: "Cyberaudio", price: 500, humanityCost: 2, description: "Sinal sonoro se feixe de radar ativo dentro de 100m. Requer Conjunto Cyberáudio.", installation: "clinica", requires: ["conjunto-cyberaudio"] },
  { id: "codificador-decodificador", name: "Codificador / Decodificador", category: "Cyberaudio", price: 100, humanityCost: 2, description: "Embaralhar comunicações de saída e decodificar entrada. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"] },
  { id: "analisador-estresse-voz", name: "Analisador de Estresse por Voz", category: "Cyberaudio", price: 100, humanityCost: 3, description: "+2 a Percepção Humana e Interrogatório. Requer Conjunto Cyberáudio.", installation: "loja", requires: ["conjunto-cyberaudio"], skillBonuses: [{ skillId: "percepcao-humana", bonus: 2 }, { skillId: "interrogatorio", bonus: 2 }] },

  // ▶ CYBERWARE INTERNOS (7 opções de slots)
  { id: "audiovox", name: "AudioVox", category: "Cyberware Interno", price: 500, humanityCost: 3, description: "Sintetizador de voz. +2 a Atuação e Tocar Instrumento ao cantar.", installation: "clinica", skillBonuses: [{ skillId: "atuacao", bonus: 2 }, { skillId: "tocar-instrumentos", bonus: 2 }] },
  { id: "implante-contraceptivo", name: "Implante Contraceptivo", category: "Cyberware Interno", price: 10, humanityCost: 0, description: "Impede gravidez indesejável.", installation: "loja" },
  { id: "anticorpos-reforcados", name: "Anticorpos Reforçados", category: "Cyberware Interno", price: 500, humanityCost: 2, description: "Após estabilização, usuário cura BODY x 2 por dia de descanso.", installation: "loja" },
  { id: "cybervibora", name: "Cybervíbora", category: "Cyberware Interno", price: 1000, humanityCost: 14, description: "Arma branca muito pesada no esôfago. Pode ser ocultada.", installation: "hospital" },
  { id: "guelras", name: "Guelras", category: "Cyberware Interno", price: 1000, humanityCost: 7, description: "Respirar debaixo d'água.", installation: "hospital" },
  { id: "enxerto-muscular-malha-ossea", name: "Enxerto Muscular e Malha Óssea", category: "Cyberware Interno", price: 1000, humanityCost: 14, description: "Aumenta BODY em 2. Muda HP, Limite de Ferimento e Death Save. BODY não acima de 10.", installation: "hospital" },
  { id: "suprimento-oxigenio", name: "Suprimento de Oxigênio", category: "Cyberware Interno", price: 1000, humanityCost: 2, description: "30 minutos de oxigênio. 1h para reabastecer.", installation: "hospital" },
  { id: "midnight-lady", name: "Midnight Lady™ Implante Sexual", category: "Cyberware Interno", price: 100, humanityCost: 7, description: "Implante sexual.", installation: "clinica" },
  { id: "mr-stud", name: "Mr. Studd™ Implante Sexual", category: "Cyberware Interno", price: 100, humanityCost: 7, description: "Implante sexual.", installation: "clinica" },
  { id: "filtros-nasais", name: "Filtros Nasais", category: "Cyberware Interno", price: 100, humanityCost: 2, description: "Imune a gases tóxicos, fumos e similares.", installation: "clinica" },
  { id: "radar-sonar-implantado", name: "Radar / Sonar Implantado", category: "Cyberware Interno", price: 1000, humanityCost: 7, description: "Varre terreno dentro de 50m. Não varre através de cobertura.", installation: "clinica" },
  { id: "aglutinador-toxina", name: "Aglutinador de Toxina", category: "Cyberware Interno", price: 100, humanityCost: 2, description: "+2 para Resistir Tortura/Drogas.", installation: "clinica", skillBonuses: [{ skillId: "resistir-tortura-drogas", bonus: 2 }] },
  { id: "vampiros", name: "Vampiros", category: "Cyberware Interno", price: 500, humanityCost: 14, description: "Arma branca leve na boca. Pode ser ocultada. Pode adicionar veneno ou biotoxina.", installation: "clinica" },

  // ▶ CYBERWARE EXTERNOS (7 opções de slots)
  { id: "coldre-oculto", name: "Coldre Oculto", category: "Cyberware Externo", price: 500, humanityCost: 7, description: "Armazenar arma capaz de ser escondida dentro do corpo.", installation: "clinica" },
  { id: "malha-subdermica", name: "Malha Subdérmica", category: "Cyberware Externo", price: 500, humanityCost: 7, description: "Corpo e cabeça SP7. Não acumula com armadura vestida. Recupera 1 SP/dia.", installation: "hospital" },
  { id: "armadura-subdermica", name: "Armadura Subdérmica", category: "Cyberware Externo", price: 1000, humanityCost: 14, description: "Corpo e cabeça SP11. Não acumula com armadura. Recupera 1 SP/dia.", installation: "hospital" },
  { id: "bolso-subdermico", name: "Bolso Subdérmico", category: "Cyberware Externo", price: 100, humanityCost: 3, description: "2\" x 4\" espaço sob a pele com fecho RealSkinn™.", installation: "clinica" },

  // ▶ CYBERMEMBROS – Braços (Foundation: Cyberbraço, 4 slots)
  { id: "cyberbraco", name: "Cyberbraço", category: "Cybermembros", price: 500, humanityCost: 7, description: "Braço de substituição. 4 opções de slots. Vem com Mão Padrão.", installation: "hospital", slotOptions: 4 },
  { id: "mao-padrao", name: "Mão Padrão", category: "Cybermembros", price: 100, humanityCost: 2, description: "Mão cibernética padrão. Pode ser instalada em braço de carne.", installation: "clinica" },
  { id: "soqueira-grande", name: "Soqueira Grande", category: "Cybermembros", price: 100, humanityCost: 3, description: "Juntas blindadas. Arma Branca Média. Pode ser escondida.", installation: "clinica" },
  { id: "cyberdeck", name: "Cyberdeck", category: "Cybermembros", price: 500, humanityCost: 3, description: "Cyberdeck no Cyberbraço. Ocupa 3 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "mao-gancho", name: "Mão Gancho", category: "Cybermembros", price: 100, humanityCost: 3, description: "Dispara a mão com cabo de gancho até 30m. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "medscanner", name: "Medscanner", category: "Cybermembros", price: 500, humanityCost: 7, description: "Scanner médico no Cyberbraço. +2 para Primeiros Socorros e Paramédico. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"], skillBonuses: [{ skillId: "primeiros-socorros", bonus: 2 }, { skillId: "paramedico", bonus: 2 }] },
  { id: "lancador-granadas-embutido", name: "Lançador de Granadas Embutido", category: "Cybermembros", price: 500, humanityCost: 7, description: "Lançador de granada de tiro único. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "arma-branca-embutida", name: "Arma Branca Embutida", category: "Cybermembros", price: 500, humanityCost: 7, description: "Arma branca leve, Média ou Pesada no braço. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "escudo-embutido", name: "Escudo Embutido", category: "Cybermembros", price: 500, humanityCost: 7, description: "Escudo à prova de balas no Cyberbraço. Ocupa 3 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "arma-distancia-embutida", name: "Arma a Distância Embutida", category: "Cybermembros", price: 500, humanityCost: 7, description: "Arma de uma mão no Cyberbraço. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "encaixe-troca-rapida", name: "Encaixe de Troca Rápida", category: "Cybermembros", price: 100, humanityCost: 7, description: "Remover ou instalar Cyberbraço com uma ação. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "estripadores", name: "Estripadores", category: "Cybermembros", price: 500, humanityCost: 3, description: "Garras de carbo-vidro. Arma Branca Média. Pode ser escondido.", installation: "clinica" },
  { id: "arranhadores", name: "Arranhadores", category: "Cybermembros", price: 100, humanityCost: 2, description: "Unhas de carbo-vidro. Arma Branca Leve. Pode ser escondido.", installation: "loja" },
  { id: "camera-ombro", name: "Câmera de Ombro", category: "Cybermembros", price: 500, humanityCost: 7, description: "Câmera de vídeo no ombro. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"] },
  { id: "slice-n-dice", name: "Slice'N Dice", category: "Cybermembros", price: 500, humanityCost: 3, description: "Chicote de monofilamento no polegar. Arma Branca Média. Pode ser escondido.", installation: "clinica" },
  { id: "empunhadura-subdermica", name: "Empunhadura Subdérmica", category: "Cybermembros", price: 100, humanityCost: 3, description: "Usar Arma Inteligente sem plug de Interface. Requer Link Neural.", installation: "clinica", requires: ["link-neural"] },
  { id: "techscanner", name: "Techscanner", category: "Cybermembros", price: 500, humanityCost: 7, description: "Techscanner no Cyberbraço. +2 para várias habilidades baseadas em TECH. Ocupa 2 slots. Requer Cyberbraço.", installation: "clinica", requires: ["cyberbraco"], skillBonuses: TECH_SKILL_IDS.map((skillId) => ({ skillId, bonus: 2 })) },
  { id: "ferramentas-embutidas", name: "Ferramentas Embutidas", category: "Cybermembros", price: 100, humanityCost: 3, description: "Dedos com chave de fenda, broca, etc. Pode ser única peça em braço de carne.", installation: "clinica" },
  { id: "wolvers", name: "Wolvers", category: "Cybermembros", price: 500, humanityCost: 7, description: "Garras longas nas juntas. Arma branca Pesada. Pode ser escondido.", installation: "clinica" },

  // ▶ CYBERMEMBROS – Pernas (Foundation: Cyberperna, 3 slots)
  { id: "cyberperna", name: "Cyberperna", category: "Cybermembros", price: 100, humanityCost: 3, description: "Perna de substituição. 3 opções de slots. Vem com Pé Padrão.", installation: "hospital", slotOptions: 3 },
  { id: "pe-padrao", name: "Pé Padrão", category: "Cybermembros", price: 100, humanityCost: 2, description: "Pé cibernético padrão. Pode ser instalado em perna de carne.", installation: "clinica" },
  { id: "aderencia-aprimorada", name: "Aderência Aprimorada", category: "Cybermembros", price: 500, humanityCost: 3, description: "Tração melhorada. Nega penalidade ao escalar. Requer duas Cyberpernas, emparelhado.", installation: "clinica", requires: ["cyberperna"] },
  { id: "salto-aprimorado", name: "Salto Aprimorado", category: "Cybermembros", price: 500, humanityCost: 3, description: "Hidráulica nas pernas. Nega penalidade ao saltar. Ocupa 2 slots, emparelhado. Requer duas Cyberpernas.", installation: "clinica", requires: ["cyberperna"] },
  { id: "patins-embutidos", name: "Patins Embutidos", category: "Cybermembros", price: 500, humanityCost: 3, description: "Patins em linha nos pés. +6m ao usar Ação de Corrida. Requer duas Cyberpernas, emparelhado.", installation: "clinica", requires: ["cyberperna"] },
  { id: "lamina-embutida", name: "Lâmina Embutida", category: "Cybermembros", price: 500, humanityCost: 3, description: "Lâmina no pé. Arma branca Leve. Pode ser ocultado. Requer perna de carne ou Cyberperna.", installation: "clinica" },
  { id: "nadadeiras-embutidas", name: "Nadadeiras Embutidas", category: "Cybermembros", price: 500, humanityCost: 3, description: "Membrana entre os dedos. Nega penalidade ao nadar. Requer duas Cyberpernas, emparelhado.", installation: "clinica", requires: ["cyberperna"] },
  { id: "protecao-reforcada", name: "Proteção Reforçada", category: "Cybermembros", price: 1000, humanityCost: 3, description: "Cybermembros e acessórios não inoperáveis por EMP ou ICE Non-black. Requer Cyberbraço ou Cyberperna.", installation: "clinica" },
  { id: "cobertura-plastico", name: "Cobertura de Plástico", category: "Cybermembros", price: 100, humanityCost: 0, description: "Revestimento plástico para Cybermembros. Não ocupa slot. Requer Cyberbraço ou Cyberperna.", installation: "loja", requires: ["cyberbraco"] },
  { id: "cobertura-realskinn", name: "Cobertura Realskinn™", category: "Cybermembros", price: 500, humanityCost: 0, description: "Revestimento artificial de pele. Não ocupa slot. Requer Cyberbraço ou Cyberperna.", installation: "loja", requires: ["cyberbraco"] },
  { id: "cobertura-supercromo", name: "Cobertura de Supercromo®", category: "Cybermembros", price: 1000, humanityCost: 0, description: "Revestimento metálico brilhante. +2 para Guarda-roupa e Estilo. Não ocupa slot. Requer Cyberbraço ou Cyberperna.", installation: "loja", requires: ["cyberbraco"], skillBonuses: [{ skillId: "guarda-roupa-estilo", bonus: 2 }] },

  // ▶ BORGWARE
  { id: "encaixe-ombro-artificial", name: "Encaixe de Ombro Artificial", category: "Borgware", price: 1000, humanityCost: 14, description: "Montar 2 Cyberbraços sob o primeiro conjunto de braços.", installation: "hospital" },
  { id: "frame-linear-beta", name: "Frame Linear Implantado ß (Beta)", category: "Borgware", price: 5000, humanityCost: 14, description: "Esqueleto melhorado. Aumenta BODY para 14. Requer BODY 8 e 2 Enxerto Muscular e Malha Óssea.", installation: "hospital", requires: ["enxerto-muscular-malha-ossea"] },
  { id: "frame-linear-sigma", name: "Frame Linear Implantado ∑ (Sigma)", category: "Borgware", price: 1000, humanityCost: 14, description: "Esqueleto melhorado. Aumenta BODY para 12. Requer BODY 6 e Enxerto Muscular e Malha Óssea.", installation: "hospital", requires: ["enxerto-muscular-malha-ossea"] },
  { id: "suporte-multi-optico", name: "Suporte Multi Óptico", category: "Borgware", price: 1000, humanityCost: 14, description: "Até 5 Cyberolhos adicionais.", installation: "hospital" },
  { id: "matriz-sensores", name: "Matriz de Sensores", category: "Borgware", price: 1000, humanityCost: 14, description: "Até 5 opções adicionais de Cyberaudio. Requer Conjunto Cyberáudio, não ocupa slot.", installation: "clinica", requires: ["conjunto-cyberaudio"] },
];

/** Category display labels (Portuguese). */
export const CYBERWARE_CATEGORY_LABELS: Record<string, string> = {
  Fashionware: "Fashionware",
  Neuralware: "Neuralware",
  Cyberópticos: "Cyberópticos",
  Cyberaudio: "Cyberaudio",
  "Cyberware Interno": "Cyberware Interno",
  "Cyberware Externo": "Cyberware Externo",
  Cybermembros: "Cybermembros",
  Borgware: "Borgware",
};
