/**
 * Banco de Dados de Temas Pré-cadastrados (ENEM)
 * Contém a lista de propostas temáticas fixas categorizadas por eixos (Meio Ambiente, Sociedade, Saúde,
 * Educação, Cultura, Tecnologia) com textos motivadores realistas e imagens do Unsplash associadas.
 */
import { Leaf, Laptop, Heart, Users, Landmark, BookOpen } from 'lucide-react';

// Mapeamento de ícones do lucide-react para uso dinâmico
const iconMap = { Leaf, Laptop, Heart, Users, Landmark, BookOpen };

export const TEMAS_ENEM = [
  {
    id: 'ia_sociedade',
    titulo: `Os impactos da inteligência artificial no mercado de trabalho e na formação profissional`,
    desc: `Analise os desdobramentos da automação inteligente sobre empregos, qualificação profissional e desigualdade social.`,
    motivadores: `TEXTO I — Automação e o Futuro do Emprego (Fórum Econômico Mundial, 2023)
Relatório publicado pelo Fórum Econômico Mundial estima que, até 2027, a inteligência artificial e a automação eliminarão cerca de 85 milhões de postos de trabalho em todo o mundo, ao mesmo tempo em que gerarão aproximadamente 97 milhões de novas funções. Contudo, a transição não será neutra: trabalhadores de baixa qualificação e com menor acesso à educação tecnológica serão os mais afetados. No Brasil, dados do IBGE revelam que mais de 30% dos empregos formais existentes hoje são classificados como "altamente automatizáveis" nos próximos dez anos, comprometendo especialmente setores como atendimento ao cliente, caixas de supermercado, operadores de telemarketing e motoristas de veículos de carga.

TEXTO II — A Necessidade de Requalificação Profissional (OIT — Organização Internacional do Trabalho, 2022)
Para a Organização Internacional do Trabalho, a resposta mais eficaz à onda de automação é o investimento maciço em programas de requalificação profissional, o chamado "reskilling". Nações que combinam incentivos fiscais a empresas de tecnologia com programas públicos de capacitação têm conseguido reduzir o impacto do desemprego estrutural causado pela IA. A OIT aponta que países como Alemanha, Singapura e Canadá já implementaram planos nacionais de educação continuada que preparam trabalhadores para funções que ainda não existem, mas que emergirão nas próximas décadas — como especialistas em ética de algoritmos, curadores de dados e engenheiros de modelos de linguagem.

TEXTO III — IA no Brasil: Oportunidade ou Ameaça? (Pesquisa FGV, 2024)
Segundo pesquisa da Fundação Getulio Vargas, o Brasil ocupa posição intermediária no ranking global de adoção de inteligência artificial no setor produtivo. Enquanto empresas de tecnologia e finanças avançam rapidamente na implementação de sistemas automatizados, o mercado informal — que representa quase 40% da força de trabalho nacional — permanece exposto sem nenhuma rede de proteção. A pesquisa conclui que, sem uma política pública de transição justa, a IA pode ampliar ainda mais o abismo entre as classes sociais brasileiras, tornando-se um vetor de desigualdade ao invés de desenvolvimento.

CHARGE — Folha de S.Paulo, 2023
Ilustração satiriza trabalhador carregando caixa com a inscrição "currículo" sendo substituído por um robô em frente ao RH de uma empresa. A legenda: "Obrigado pelos seus serviços. A empresa deseja sucesso na sua reconversão profissional."

Instrução: A partir da leitura dos textos acima e com base nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo em norma culta da língua portuguesa sobre os impactos da inteligência artificial no mercado de trabalho e na formação profissional. Apresente proposta de intervenção que respeite os direitos humanos.`,
    eixo: 'Tecnologia',
    icon: iconMap['Laptop'],
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'poluicao_plastica',
    titulo: `A crise do plástico descartável e os desafios da gestão de resíduos sólidos no Brasil`,
    desc: `Discuta a produção massiva de plástico de uso único e os impactos ambientais nos oceanos e ecossistemas.`,
    motivadores: `TEXTO I — O Plástico que Não Desaparece (National Geographic Brasil, 2023)
Desde a popularização do plástico na década de 1950, foram produzidas cerca de 9,2 bilhões de toneladas desse material no planeta — e aproximadamente 6,3 bilhões se transformaram em resíduos. Desse total, apenas 9% foi reciclado efetivamente, enquanto 12% foi incinerado e 79% foi parar em aterros sanitários ou no meio ambiente. No Brasil, o cenário é alarmante: o país gera cerca de 11,3 milhões de toneladas de plástico por ano, sendo que somente 145 municípios dos 5.570 existentes possuem sistema de coleta seletiva eficiente, conforme dados do Instituto Brasileiro de Administração Municipal (IBAM).

TEXTO II — Microplásticos na Cadeia Alimentar (Revista Science, 2022)
Estudos publicados na revista Science comprovaram que microplásticos — partículas invisíveis a olho nu formadas pela degradação do plástico comum — foram detectados em amostras de sangue humano pela primeira vez em 2022. A contaminação se dá pela ingestão de frutos do mar, peixes e até da água de torneira. Pesquisadores da FIOCRUZ identificaram microplásticos no leite materno de mulheres residentes em municípios costeiros do Nordeste brasileiro, o que indica que a contaminação já atingiu o ciclo reprodutivo da espécie humana, representando um risco à saúde pública de proporções ainda desconhecidas.

TEXTO III — Acordos Internacionais e a Legislação Brasileira (ONU Meio Ambiente, 2024)
Em 2024, a ONU iniciou as negociações para o primeiro tratado global juridicamente vinculante sobre poluição plástica, ao qual o Brasil aderiu como signatário. No entanto, críticos apontam que a Política Nacional de Resíduos Sólidos (PNRS), aprovada em 2010, ainda não foi integralmente implementada — 14 anos depois, apenas 3% dos plásticos gerados no Brasil são efetivamente reciclados. A ausência de responsabilidade estendida do produtor, a falta de incentivo à logística reversa e a baixa remuneração dos catadores de materiais recicláveis são obstáculos que travam o avanço de uma economia circular no país.

Instrução: Redija um texto dissertativo-argumentativo sobre a crise do plástico descartável e os desafios da gestão de resíduos sólidos no Brasil, propondo medidas de intervenção detalhadas.`,
    eixo: 'Meio Ambiente',
    icon: iconMap['Leaf'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'evasao_escolar',
    titulo: `Evasão escolar no Ensino Médio brasileiro: causas, consequências e caminhos para a permanência`,
    desc: `Debata os fatores socioeconômicos e pedagógicos que afastam adolescentes da escola antes da conclusão do ciclo básico.`,
    motivadores: `TEXTO I — O Abandono Silencioso (MEC / INEP, 2023)
O Censo Escolar 2023 revelou que mais de 1,5 milhão de jovens entre 15 e 17 anos estavam fora da escola no Brasil. No Ensino Médio, a taxa de abandono chega a 6,4% ao ano — o que significa que, a cada dez alunos que ingressam na primeira série, apenas seis chegam ao terceiro ano sem interrupções. As regiões Norte e Nordeste concentram os maiores índices de evasão, fortemente correlacionados com a necessidade de trabalhar para complementar a renda familiar. Para 42% dos jovens que abandonam os estudos, o principal motivo declarado é precisar trabalhar, segundo pesquisa do Instituto Unibanco.

TEXTO II — A Escola que Não Fala a Língua do Jovem (UNESCO, 2022)
Relatório da UNESCO aponta que, além da pobreza, a evasão escolar tem uma dimensão pedagógica grave: currículos desconectados da realidade dos alunos, metodologias ultrapassadas e ausência de sentido prático no conteúdo ensinado contribuem para que o jovem não encontre razão para permanecer na escola. A pesquisa "O que pensa o jovem brasileiro" revelou que 61% dos estudantes do Ensino Médio não enxergam relação entre o que aprendem em sala e suas perspectivas de futuro profissional. A reforma do Ensino Médio, implementada em 2021, tentou endereçar essa questão com os itinerários formativos, mas especialistas divergem sobre sua eficácia prática nas escolas públicas.

TEXTO III — Programas de Combate à Evasão: O que Funciona? (Fundação Lemann, 2023)
A Fundação Lemann mapeou 47 programas de combate à evasão em diferentes estados brasileiros e identificou que as iniciativas mais eficazes combinam três elementos: assistência financeira direta às famílias vulneráveis (como bolsas de permanência escolar), acompanhamento socioemocional dos estudantes em risco de abandono e parceria com o setor produtivo local para estágios remunerados. O programa "Jovem Aprendiz Escola" do Ceará reduziu a evasão em 34% nos municípios onde foi implementado, servindo de modelo para outras regiões do país.

Instrução: Com base nos textos e em seus conhecimentos, escreva uma dissertação argumentativa sobre a evasão escolar no Ensino Médio brasileiro, apresentando proposta de intervenção completa.`,
    eixo: 'Educação',
    icon: iconMap['BookOpen'],
    gradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
    bgImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'desinformacao_digital',
    titulo: `O papel das plataformas digitais na disseminação de desinformação e os limites da liberdade de expressão`,
    desc: `Analise como as redes sociais amplificam notícias falsas e debata os limites entre regulação e censura.`,
    motivadores: `TEXTO I — A Indústria da Desinformação (Reuters Institute, 2023)
O Relatório de Notícias Digitais 2023, do Reuters Institute for the Study of Journalism, revelou que o Brasil é o país com maior exposição a desinformação entre as nações pesquisadas: 62% dos brasileiros relataram ter encontrado notícias que consideravam falsas ou imprecisas na semana anterior à pesquisa. O ecossistema da desinformação no Brasil movimenta bilhões de reais em publicidade digital, já que conteúdo sensacionalista e falso gera mais engajamento — e, portanto, mais receita publicitária — do que conteúdo jornalístico verificado. Algoritmos de plataformas como Facebook, Instagram e YouTube são projetados para maximizar o tempo de permanência do usuário, o que, inevitavelmente, favorece conteúdos emocionalmente provocadores, incluindo desinformação.

TEXTO II — Saúde Democrática em Risco (TSE / Supremo Tribunal Federal, 2022)
O Tribunal Superior Eleitoral identificou que, nas eleições de 2022, mais de 1.200 notícias falsas sobre o processo eleitoral foram viralizadas em grupos de WhatsApp. A desinformação não é apenas um problema de comunicação: ela corrói a confiança nas instituições democráticas, estimula a polarização extrema e pode desencadear violência real — como demonstrou o ataque às sedes dos Três Poderes em 8 de janeiro de 2023. O STF reconheceu que a disseminação industrial de desinformação configura ameaça à ordem constitucional, abrindo precedente para regulação mais rígida das plataformas digitais.

TEXTO III — Regulação vs. Censura: O Debate Global (Comissão Europeia, 2023)
A União Europeia implementou o Digital Services Act (DSA) em 2023, legislação que responsabiliza plataformas digitais com mais de 45 milhões de usuários europeus por conteúdos que causem danos comprovados à sociedade. As empresas são obrigadas a auditar seus algoritmos, oferecer mecanismos de recurso aos usuários e remover conteúdos ilegais com maior agilidade. Críticos, porém, alertam para o risco de que regulações amplamente definidas possam ser usadas por governos autoritários para suprimir dissidência política. O equilíbrio entre o combate à desinformação e a preservação da liberdade de expressão permanece um dos grandes dilemas jurídicos e éticos do século XXI.

Instrução: Redija texto dissertativo-argumentativo sobre o papel das plataformas digitais na disseminação de desinformação e os limites da liberdade de expressão, apresentando proposta de intervenção detalhada.`,
    eixo: 'Tecnologia',
    icon: iconMap['Laptop'],
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    bgImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'saude_mental_jovens',
    titulo: `A crise de saúde mental entre jovens brasileiros e os desafios do suporte psicossocial`,
    desc: `Debata o aumento de transtornos de ansiedade e depressão entre adolescentes e os déficits do sistema de saúde pública.`,
    motivadores: `TEXTO I — Uma Geração em Colapso (CFP — Conselho Federal de Psicologia, 2023)
O Conselho Federal de Psicologia registrou aumento de 230% na procura por atendimento psicológico entre jovens de 14 a 24 anos no período pós-pandemia (2021-2023). A ansiedade e a depressão são os transtornos mais prevalentes, sendo que a taxa de ideação suicida entre adolescentes brasileiros aumentou 78% entre 2019 e 2022, segundo o Ministério da Saúde. O Brasil possui apenas um psicólogo para cada 3.400 habitantes nos serviços públicos de saúde, muito abaixo da recomendação da OMS, de um profissional para cada 1.000 habitantes. Nas regiões periféricas das grandes cidades e no interior do país, a escassez de profissionais é ainda mais crítica.

TEXTO II — Redes Sociais e a Epidemia de Ansiedade (Pesquisa Harvard Medical School, 2023)
Estudo da Harvard Medical School, com participação de pesquisadores da USP, concluiu que adolescentes que passam mais de três horas diárias em redes sociais apresentam risco 60% maior de desenvolver sintomas de depressão e ansiedade. A exposição constante a padrões de beleza irreais, a comparação social obsessiva e o fenômeno do cyberbullying criam um ambiente digitalmente tóxico que impacta diretamente a autoestima e o bem-estar emocional dos jovens. Paradoxalmente, as mesmas plataformas que amplificam o sofrimento são utilizadas pelos jovens como principais fontes de informação sobre saúde mental, criando um ciclo complexo de dependência e dano.

TEXTO III — Saúde Mental nas Escolas: Uma Urgência Pedagógica (UNICEF Brasil, 2023)
O UNICEF Brasil publicou recomendações para que as escolas se tornem espaços de promoção da saúde mental, incluindo a formação continuada de professores para identificação precoce de sinais de sofrimento psíquico, a implementação de programas de educação socioemocional no currículo e a criação de espaços seguros de escuta para os alunos. Países como Portugal e Finlândia já integraram psicólogos e assistentes sociais de forma permanente em suas escolas públicas, com resultados expressivos na redução de abandonos, violência escolar e transtornos mentais diagnosticados precocemente.

Instrução: Escreva uma dissertação argumentativa sobre a crise de saúde mental entre jovens brasileiros, propondo intervenção detalhada que envolva agentes públicos e privados.`,
    eixo: 'Saúde',
    icon: iconMap['Heart'],
    gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
    bgImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'inclusao_digital_idosos',
    titulo: `Os desafios da inclusão digital da população idosa e o risco de exclusão em serviços essenciais`,
    desc: `Analise como a digitalização dos serviços públicos e privados agrava a exclusão de idosos sem acesso à tecnologia.`,
    motivadores: `TEXTO I — A Terceira Idade na Era do App (IBGE, 2023)
O Brasil possui 34 milhões de pessoas com 60 anos ou mais, grupo que cresce aceleradamente e que, segundo o IBGE, representa a parcela populacional com menor índice de acesso e letramento digital. Apenas 38% dos brasileiros acima de 60 anos utilizam a internet regularmente, e destes, menos de 20% realizam transações bancárias digitais com autonomia. O movimento de digitalização dos serviços — bancários, previdenciários, de saúde e governamentais — tem criado uma barreira invisível que exclui os idosos do acesso a direitos básicos: filas quilométricas para atendimento presencial convivem com a extinção gradual das agências físicas.

TEXTO II — Golpes Digitais e a Vulnerabilidade do Idoso (Senacon / Procon-SP, 2023)
O Procon-SP registrou aumento de 312% no número de reclamações de golpes digitais praticados contra idosos entre 2020 e 2023. Fraudes como o "golpe do Pix", clonagem de WhatsApp e phishing bancário exploram justamente a menor familiaridade dos idosos com os mecanismos de segurança digital. Além do prejuízo financeiro direto — que em média supera R$ 4.200 por ocorrência —, as vítimas relatam impactos emocionais severos, incluindo depressão, isolamento social e perda de autonomia. A Secretaria Nacional do Consumidor aponta que apenas 12% dos casos chegam a ser formalmente denunciados, sugerindo que o problema é muito maior do que os números oficiais indicam.

TEXTO III — Modelos de Letramento Digital para Idosos (Governo de Portugal / OMS, 2022)
Portugal implementou o programa "Digital Sénior" em 2019, que oferece cursos gratuitos de letramento digital em bibliotecas públicas e centros comunitários, capacitando voluntários jovens para auxiliar idosos no uso de smartphones, tablets e serviços governamentais digitais. O modelo foi reconhecido pela OMS como exemplo de política pública de envelhecimento ativo. No Brasil, iniciativas similares como o programa "Digicidade" de São Paulo ainda têm alcance limitado: atendem menos de 2% dos idosos em situação de vulnerabilidade digital nas regiões periféricas da capital.

Instrução: Redija uma dissertação argumentativa sobre os desafios da inclusão digital da população idosa e proponha intervenção com agentes, meios e efeitos detalhados.`,
    eixo: 'Tecnologia',
    icon: iconMap['Laptop'],
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    bgImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preservacao_cultural',
    titulo: `A preservação do patrimônio cultural imaterial brasileiro diante da homogeneização cultural globalizada`,
    desc: `Discuta o risco de extinção de expressões culturais tradicionais frente à massificação da cultura global.`,
    motivadores: `TEXTO I — O Que é Patrimônio Cultural Imaterial? (UNESCO / IPHAN, 2022)
O patrimônio cultural imaterial compreende práticas, representações, expressões, conhecimentos e técnicas que comunidades e grupos reconhecem como parte integrante de sua herança cultural. No Brasil, o Instituto do Patrimônio Histórico e Artístico Nacional (IPHAN) registra mais de 40 bens imateriais em nível federal, incluindo o Frevo, o Círio de Nazaré, o sistema agrícola tradicional do Rio Negro e o Modo Artesanal de Fazer Queijo de Minas. No entanto, especialistas alertam que centenas de manifestações culturais regionais — línguas indígenas, festas populares, técnicas artesanais — estão em processo acelerado de extinção devido à falta de transmissão intergeracional e ao avanço da cultura massificada.

TEXTO II — A Ameaça da Monocultura Cultural (Doris Sommer / UNESCO, 2021)
A filósofa e crítica cultural Doris Sommer, em obra referendada pela UNESCO, argumenta que a globalização cultural, quando não acompanhada de políticas de valorização das diversidades locais, produz um fenômeno de "monocultura cultural" — a substituição progressiva de saberes e fazeres tradicionais por padrões homogêneos difundidos pelas indústrias de entretenimento globais. No Brasil, exemplos concretos incluem o declínio do consumo de música regional como o xaxado, o maracatu e o repente em detrimento de gêneros globalizados, e a substituição de técnicas artesanais por produtos industrializados que imitam o artesanato, destruindo a cadeia produtiva das comunidades tradicionais.

TEXTO III — Experiências de Salvaguarda Cultural que Funcionam (Ministério da Cultura, 2023)
O Ministério da Cultura aponta como exemplos bem-sucedidos de salvaguarda cultural o Programa Nacional do Patrimônio Imaterial (PNPI) e as iniciativas de mapeamento cultural realizadas por universidades públicas em parceria com comunidades quilombolas e indígenas. A criação de centros de referência cultural em territórios com alta concentração de bens imateriais ameaçados demonstrou resultados positivos ao gerar emprego e renda para mestres de saberes tradicionais, criar acervos digitais acessíveis e integrar o patrimônio cultural ao turismo sustentável local. A Lei Aldir Blanc, aprovada em 2020 como resposta à pandemia, revelou que o financiamento direto a agentes culturais locais é mais eficaz do que repasses a grandes equipamentos culturais metropolitanos.

Instrução: Redija texto dissertativo-argumentativo sobre a preservação do patrimônio cultural imaterial brasileiro diante da homogeneização globalizada, com proposta de intervenção detalhada.`,
    eixo: 'Cultura',
    icon: iconMap['Landmark'],
    gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    bgImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'mobilidade_urbana',
    titulo: `Mobilidade urbana e desigualdade: o direito à cidade nas metrópoles brasileiras`,
    desc: `Analise como a precariedade do transporte público intensifica a desigualdade social nas grandes cidades.`,
    motivadores: `TEXTO I — O Tempo Perdido nos Congestionamentos (IPEA, 2023)
O Instituto de Pesquisa Econômica Aplicada estima que os congestionamentos nas 11 maiores regiões metropolitanas do Brasil custam R$ 111 bilhões por ano à economia nacional, em perdas de produtividade, consumo de combustível e poluição do ar. Mais revelador, porém, é o custo humano: trabalhadores que dependem de transporte público nas periferias de São Paulo passam, em média, 3 horas e 20 minutos por dia em deslocamentos — tempo que não remunerado representa uma forma silenciosa de penalização da pobreza. Pesquisa do Movimento Nossa São Paulo demonstra que moradores da Zona Leste levam até 5 vezes mais tempo para acessar empregos no Centro Expandido do que moradores de bairros de alta renda com automóvel.

TEXTO II — Transporte Público, Direito Humano (ONU-Habitat, 2022)
A agência ONU-Habitat reconhece o acesso a transporte público de qualidade como direito humano fundamental, indissociável do direito à cidade. Em cidades com sistemas de transporte eficientes e integrados — como Curitiba (Brasil), Bogotá (Colômbia) e Amsterdam (Holanda) —, a mobilidade ativa das classes mais pobres aumenta substancialmente, ampliando o acesso a emprego, educação e saúde. No Brasil, no entanto, o modelo vigente de financiamento do transporte público, que transfere quase integralmente o custo às tarifas pagas pelos usuários, mantém as passagens acima da capacidade de pagamento das famílias de baixa renda, contribuindo para o aprofundamento das desigualdades.

TEXTO III — Alternativas Sustentáveis de Mobilidade (Prefeitura de São Paulo / BID, 2023)
O Banco Interamericano de Desenvolvimento financiou, em parceria com a Prefeitura de São Paulo, a expansão da rede de ciclovias e a implementação de corredores de ônibus expressos (BRT) em zonas periféricas. Dados preliminares mostram que a integração entre ciclovias e estações de metrô reduziu em 22% o tempo médio de deslocamento em determinados corredores e diminuiu em 15% os acidentes de trânsito nas vias contempladas. Especialistas em urbanismo defendem que a combinação de subsídio público ao transporte coletivo, expansão de ciclovias e regulação do transporte por aplicativo — integrando-o ao sistema público — é o caminho mais viável para democratizar a mobilidade nas metrópoles brasileiras.

Instrução: Escreva dissertação argumentativa sobre mobilidade urbana e desigualdade nas metrópoles brasileiras, com proposta de intervenção efetiva.`,
    eixo: 'Sociedade',
    icon: iconMap['Users'],
    gradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
    bgImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'desperdicio_alimentos',
    titulo: `O desperdício de alimentos no Brasil e sua contradição com a insegurança alimentar de milhões`,
    desc: `Discuta os paradoxos da cadeia alimentar brasileira, que desperdiça toneladas enquanto milhões passam fome.`,
    motivadores: `TEXTO I — Um País que Desperdiça e que Tem Fome (EMBRAPA / IBGE, 2023)
O Brasil desperdicia cerca de 46 milhões de toneladas de alimentos por ano — volume suficiente para alimentar toda a população nordestina por dois anos, segundo dados da Embrapa. Simultaneamente, a pesquisa VIGISAN (2023) revelou que 33 milhões de brasileiros enfrentam insegurança alimentar grave, ou seja, passam fome regularmente. Esse paradoxo revela uma falha sistêmica: o problema não é a insuficiência de produção — o Brasil é um dos maiores produtores agropecuários do mundo —, mas a ineficiência da distribuição, os gargalos logísticos e a ausência de políticas robustas de aproveitamento de excedentes.

TEXTO II — Onde Acontece o Desperdício? (FAO — Organização das Nações Unidas para Alimentação, 2022)
A FAO mapeia que o desperdício de alimentos ocorre em todas as etapas da cadeia: 20% se perde na produção rural, por colheita inadequada ou falta de armazenamento; 30% é desperdiçado na distribuição e no varejo, por critérios estéticos que rejeitam alimentos "feios" mas perfeitamente comestíveis; e 50% ocorre no nível do consumidor final, em domicílios e restaurantes. No Brasil, estima-se que cada cidadão descarte, em média, 128 quilos de alimentos ao ano. Além do impacto social, o desperdício tem consequência ambiental grave: a decomposição dos alimentos descartados é responsável por 8% das emissões globais de gases do efeito estufa.

TEXTO III — Caminhos Legais e Experiências de Sucesso (Mesa Brasil / SESC, 2023)
O programa Mesa Brasil, do SESC, atua há mais de 20 anos coletando excedentes de supermercados, feiras e restaurantes para redistribuição a entidades sociais cadastradas. Hoje, o programa atende 2 milhões de pessoas em situação de vulnerabilidade alimentar em mais de 30 estados. No plano legislativo, a Lei 14.016/2020 (Lei Alimentos Seguros) reduziu as barreiras jurídicas para doação de alimentos próximos ao vencimento, mas críticos apontam que o marco regulatório ainda é insuficiente para engajar as grandes redes varejistas. Países como França e Dinamarca adotaram legislação que proíbe supermercados de destruir alimentos próximos ao prazo de validade, exigindo doação obrigatória.

Instrução: Redija dissertação argumentativa sobre o desperdício de alimentos e sua contradição com a insegurança alimentar, apresentando proposta de intervenção detalhada.`,
    eixo: 'Meio Ambiente',
    icon: iconMap['Leaf'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'violencia_urbana',
    titulo: `Violência urbana e o ciclo de vulnerabilidade: causas estruturais e políticas de segurança pública`,
    desc: `Analise as raízes históricas e socioeconômicas da violência nas cidades e avalie modelos eficazes de segurança.`,
    motivadores: `TEXTO I — O Brasil entre os Mais Violentos do Mundo (Atlas da Violência, 2023)
O Atlas da Violência 2023, produzido pelo IPEA e pelo Fórum Brasileiro de Segurança Pública, registrou 47.508 homicídios dolosos no Brasil em 2022 — taxa de 22,3 mortes por 100.000 habitantes, quase seis vezes superior à média europeia. A violência não é uniformemente distribuída: 75% das vítimas são homens negros com até 29 anos, moradores de periferias urbanas, o que evidencia que a violência no Brasil tem cor, gênero, idade e endereço. Municípios do Nordeste com menos de 100.000 habitantes apresentam índices de homicídio superiores aos de muitas zonas de guerra, enquanto bairros de alta renda das mesmas cidades registram taxas comparáveis às de países escandinavos.

TEXTO II — As Raízes Estruturais da Violência (Boaventura de Sousa Santos / CLACSO, 2021)
O sociólogo Boaventura de Sousa Santos argumenta que a violência urbana no Brasil não pode ser compreendida fora do contexto histórico de exclusão racial, concentração fundiária e ausência do Estado nas periferias. A falta de acesso à educação de qualidade, ao mercado de trabalho formal, a moradia digna e ao lazer cria um campo fértil para o recrutamento de jovens por facções criminosas. Estudos criminológicos demonstram que cada ano adicional de escolaridade de um jovem em situação de vulnerabilidade reduz em 13% sua probabilidade de envolvimento com o crime violento, tornando a educação a mais eficaz política de segurança pública de longo prazo.

TEXTO III — Modelos de Segurança Pública que Funcionam (SINESP / Secretaria Nacional de Segurança Pública, 2023)
Experiências como o Programa Crack, é Possível Vencer, o modelo de policiamento comunitário do Rio Grande do Norte e as Unidades de Polícia Pacificadora (UPPs) do Rio de Janeiro — com suas limitações — demonstram que a segurança pública eficaz exige integração entre ações de repressão qualificada, prevenção social e recuperação de territórios vulneráveis. O modelo de "Cidades sem Medo", adotado em Medellín (Colômbia) na década de 2000, transformou a cidade mais violenta do mundo em referência de urbanismo social ao combinar infraestrutura, educação, cultura e presença estatal permanente nas comunidades mais carentes.

Instrução: Redija dissertação argumentativa sobre a violência urbana e as políticas de segurança pública no Brasil, com proposta de intervenção fundamentada.`,
    eixo: 'Sociedade',
    icon: iconMap['Users'],
    gradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
    bgImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'saude_mental_trabalho',
    titulo: `A saúde mental no ambiente de trabalho e o impacto do burnout na produtividade e nos direitos trabalhistas`,
    desc: `Discuta o crescimento da síndrome de esgotamento profissional e os desafios para o reconhecimento legal e tratamento.`,
    motivadores: `TEXTO I — Burnout: A Epidemia Silenciosa do Trabalho Moderno (OMS / ISMA, 2023)
A Organização Mundial da Saúde reconheceu a síndrome de burnout como fenômeno ocupacional em 2019 e, desde então, passou a incluí-la na Classificação Internacional de Doenças (CID-11). No Brasil, pesquisa da International Stress Management Association (ISMA) revelou que 72% dos trabalhadores brasileiros apresentam algum nível de esgotamento relacionado ao trabalho, sendo que 32% atingem critérios clínicos de burnout severo. O Brasil ocupa o segundo lugar no ranking mundial de países com maior prevalência da síndrome, atrás apenas do Japão. Os custos econômicos são expressivos: o absenteísmo relacionado a transtornos mentais custa ao Brasil R$ 4,9 bilhões por ano em afastamentos previdenciários.

TEXTO II — O Trabalho Remoto e a Dissolução das Fronteiras (FGV / ABRH, 2022)
A pandemia de Covid-19 acelerou a adoção do trabalho remoto, mas também dissolveu fronteiras entre vida profissional e pessoal, amplificando o risco de esgotamento. Pesquisa da FGV com trabalhadores em home office demonstrou que 61% relatam dificuldade em "desligar" do trabalho após o expediente, e 48% passaram a trabalhar efetivamente mais horas do que quando presencialmente. A cultura do "sempre conectado", reforçada por ferramentas como WhatsApp e Slack que permitem acionamento a qualquer hora, cria um estado permanente de disponibilidade que corrói progressivamente a saúde mental dos profissionais.

TEXTO III — O Direito à Desconexão e Experiências Internacionais (OIT / CLT, 2023)
A França foi pioneira ao regulamentar o direito à desconexão digital em 2017, proibindo que empresas com mais de 50 funcionários contatem seus empregados fora do horário de expediente. Portugal seguiu o mesmo caminho em 2021. No Brasil, embora a CLT proteja o descanso e preveja adicional de horas extras, não existe regulamentação específica para a desconexão digital. Projetos de lei que tramitam no Congresso propõem incluir o "direito à desconexão" explicitamente na legislação trabalhista, mas encontram resistência de setores empresariais. Especialistas em direito do trabalho argumentam que a prevenção do burnout deve ser tratada como questão de saúde pública, não apenas de relação individual entre empregado e empregador.

Instrução: Escreva dissertação argumentativa sobre a saúde mental no trabalho e o burnout, propondo intervenção com agentes, meios e efeitos claramente definidos.`,
    eixo: 'Saúde',
    icon: iconMap['Heart'],
    gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
    bgImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'acesso_agua',
    titulo: `O acesso à água potável como direito humano fundamental e os desafios da gestão hídrica no Brasil`,
    desc: `Analise as disparidades no acesso à água tratada e os impactos das mudanças climáticas nos recursos hídricos.`,
    motivadores: `TEXTO I — Água para Poucos (ONU / TRATA BRASIL, 2023)
Embora o Brasil possua cerca de 12% da água doce superficial do planeta, o acesso à água tratada ainda é profundamente desigual. Segundo o Instituto Trata Brasil, 35 milhões de brasileiros não têm acesso à água potável de qualidade, sendo que as populações ribeirinhas, quilombolas e indígenas são as mais afetadas. No semiárido nordestino, onde a escassez hídrica é estrutural, comunidades percorrem até 10 quilômetros diariamente para buscar água em fontes não tratadas, prática que expõe crianças a doenças gastrointestinais que respondem por 45% das internações hospitalares pediátricas na região.

TEXTO II — Crise Hídrica e Mudanças Climáticas (ANA — Agência Nacional de Águas, 2023)
A Agência Nacional de Águas alerta que as mudanças climáticas estão intensificando os extremos hídricos no Brasil: secas mais prolongadas no Nordeste e na região Centro-Oeste, e enchentes mais devastadoras no Sul e Sudeste. O Sistema Cantareira, que abastece a Grande São Paulo, operou abaixo de 20% de sua capacidade por dois anos consecutivos (2014-2015), e especialistas projetam que, sem investimentos massivos em infraestrutura hídrica e conservação de nascentes, crises semelhantes se tornarão mais frequentes e severas. O desmatamento da Amazônia — que regula o regime de chuvas em toda a América do Sul por meio dos chamados "rios voadores" — é apontado como fator crítico de agravamento da crise hídrica continental.

TEXTO III — Soluções Integradas para a Gestão das Águas (SNIS / BID, 2023)
O Sistema Nacional de Informações sobre Saneamento aponta que apenas 54% dos municípios brasileiros possuem sistema de esgotamento sanitário adequado, o que contamina rios e aquíferos e reduz a disponibilidade de água potável. Investimentos em saneamento básico — cujo déficit no Brasil é estimado em R$ 500 bilhões — têm retorno social comprovado: cada R$ 1,00 investido em saneamento gera R$ 4,00 de economia em saúde pública. Modelos como o de Singapura, que recicla 40% de sua água para consumo humano, e as cisternas do semiárido nordestino, implementadas pela ASA Brasil, demonstram que soluções técnicas combinadas com mobilização comunitária produzem resultados sustentáveis.

Instrução: Redija dissertação argumentativa sobre o acesso à água potável como direito humano e os desafios da gestão hídrica no Brasil.`,
    eixo: 'Meio Ambiente',
    icon: iconMap['Leaf'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bullying_cyberbullying',
    titulo: `Bullying e cyberbullying nas escolas brasileiras: responsabilidades, consequências e estratégias de prevenção`,
    desc: `Analise o fenômeno do assédio escolar digital e presencial e seus impactos na saúde mental de crianças e adolescentes.`,
    motivadores: `TEXTO I — O Bullying como Problema de Saúde Pública (UNICEF / CFP, 2023)
Pesquisa do UNICEF Brasil revelou que 43% dos estudantes do Ensino Fundamental afirmam ter sofrido algum tipo de bullying nos últimos 30 dias. O cyberbullying, modalidade digital do fenômeno, cresceu 156% entre 2019 e 2023, impulsionado pela expansão do acesso a smartphones entre crianças. As consequências para as vítimas são severas: estudos longitudinais demonstram que adolescentes vítimas de bullying recorrente apresentam risco três vezes maior de desenvolver depressão severa na idade adulta, além de taxas maiores de abandono escolar, abuso de substâncias e comportamento suicida. O Conselho Federal de Psicologia classifica o bullying como problema de saúde pública que demanda resposta intersetorial.

TEXTO II — A Lei e os Limites da Proteção (Lei 13.185/2015 — Programa de Combate à Intimidação Sistemática, 2023)
O Brasil possui a Lei 13.185/2015, que institui o Programa de Combate à Intimidação Sistemática (bullying), obrigando escolas a implementar ações de prevenção, capacitação de profissionais e atendimento às vítimas. Contudo, pesquisa do Instituto Ayrton Senna demonstra que apenas 31% das escolas públicas brasileiras implementaram efetivamente programas de combate ao bullying conforme previsto na lei. A fiscalização é deficiente, a formação inicial de professores raramente inclui o tema e muitas famílias ainda minimizam a gravidade das situações, tratando-as como "brincadeiras normais da infância". A lacuna entre a legislação existente e sua aplicação prática cria um ambiente de impunidade que perpetua o ciclo do assédio.

TEXTO III — Programas que Funcionam: Evidências de Sucesso (Programa KiVa — Finlândia, 2023)
O programa KiVa, desenvolvido na Finlândia e implementado em 40 países, é considerado a intervenção anti-bullying mais eficaz do mundo segundo estudos controlados. Seu diferencial está em trabalhar não apenas com vítimas e agressores, mas principalmente com os espectadores — que representam a maioria dos estudantes e cujo comportamento de indiferença ou encorajamento passivo é fundamental para a manutenção da dinâmica do bullying. Adaptações do programa no Brasil, realizadas pelo Instituto Rodrigo Mendes em parceria com secretarias de educação de São Paulo e Recife, mostraram redução de 34% nos casos registrados após dois anos de implementação.

Instrução: Redija dissertação argumentativa sobre bullying e cyberbullying nas escolas, propondo intervenção detalhada e eficaz.`,
    eixo: 'Educação',
    icon: iconMap['BookOpen'],
    gradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
    bgImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'desmatamento_amazonia',
    titulo: `O desmatamento da Amazônia e seus impactos sobre o clima global e a soberania nacional`,
    desc: `Analise as causas e consequências da devastação amazônica e os desafios da proteção territorial.`,
    motivadores: `TEXTO I — A Amazônia em Colapso (INPE / Mapbiomas, 2023)
O Instituto Nacional de Pesquisas Espaciais (INPE) registrou o desmatamento de 11.568 km² da Amazônia Legal no ano de 2022 — área equivalente ao estado de Sergipe. Embora os números mostrem redução em relação ao pico de 2021 (13.235 km²), a taxa acumulada das últimas duas décadas devastou mais de 800.000 km² da maior floresta tropical do planeta. Pesquisadores da Universidade Federal do Pará e do INPE publicaram estudo em 2023 alertando que a Amazônia pode atingir o "ponto de não retorno" em uma a duas décadas: quando 25% a 30% da floresta for destruída, os ciclos hídricos internos serão rompidos irreversivelmente, transformando partes da floresta em savana — processo denominado "savanização".

TEXTO II — Além do Brasil: Impactos Climáticos Globais (IPCC, 2023)
O Painel Intergovernamental sobre Mudanças Climáticas (IPCC) aponta que a Amazônia armazena entre 90 e 140 bilhões de toneladas de carbono, o que a torna um dos maiores "estoques" de carbono do planeta. O desmatamento libera esse carbono na atmosfera, acelerando o aquecimento global. Cientistas estimam que, entre 2010 e 2021, o desmatamento transformou a Amazônia de sumidouro de carbono em fonte líquida de emissões — ou seja, a floresta devastada passou a emitir mais gás carbônico do que absorve. As consequências extrapolam as fronteiras brasileiras: alterações nos padrões de chuva afetam a agricultura de países vizinhos, e o derretimento de geleiras andinas — relacionado ao aquecimento causado pela desflorestação — ameaça o abastecimento de água de 80 milhões de pessoas.

TEXTO III — Proteção da Amazônia: Soberania, Demarcação e Desenvolvimento Sustentável (FUNAI / ISA, 2023)
O Instituto Socioambiental (ISA) demonstra que as Terras Indígenas e Unidades de Conservação da Amazônia são os territórios com menores taxas de desmatamento — confirmando que a demarcação e proteção desses territórios é a estratégia mais eficaz de preservação ambiental. No entanto, a pressão do agronegócio ilegal, o garimpo e a grilagem de terras colocam em risco constante as fronteiras dessas áreas. O Programa Amazônia Legal, relançado em 2023 com metas de desmatamento zero até 2030, combina monitoramento por satélite, atuação integrada da Polícia Federal e IBAMA, fomento à bioeconomia e pagamento por serviços ambientais às comunidades que preservam a floresta.

Instrução: Escreva dissertação argumentativa sobre o desmatamento da Amazônia e seus impactos climáticos e nacionais, com proposta de intervenção detalhada.`,
    eixo: 'Meio Ambiente',
    icon: iconMap['Leaf'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'trabalho_informal',
    titulo: `A informalidade no mercado de trabalho brasileiro e seus impactos na proteção social e nos direitos trabalhistas`,
    desc: `Debata a precarização das relações de trabalho e a ausência de proteção social para trabalhadores informais.`,
    motivadores: `TEXTO I — A Metade Invisível do Mercado de Trabalho (IBGE / PNAD, 2023)
A Pesquisa Nacional por Amostra de Domicílios (PNAD) do IBGE revelou que 38,7% da força de trabalho brasileira — aproximadamente 39 milhões de pessoas — estava na informalidade em 2023. Esse número inclui trabalhadores sem carteira assinada, autônomos sem contribuição previdenciária e trabalhadores domésticos não registrados. A informalidade é estrutural: não se trata apenas de um fenômeno de recessão, mas de uma característica histórica do mercado de trabalho brasileiro, ligada à baixa escolaridade, à concentração de renda e às barreiras burocráticas ao empreendedorismo formal. Trabalhadores informais recebem, em média, 40% menos do que trabalhadores formais com as mesmas qualificações.

TEXTO II — Uberização e a Nova Precariedade (REMIR-Trabalho / USP, 2023)
A chamada "uberização" do trabalho — modelo em que plataformas digitais intermediam serviços sem vínculo empregatício formal — representa uma nova fronteira da informalidade. No Brasil, estima-se que mais de 1,5 milhão de pessoas trabalhem como entregadores e motoristas de aplicativo. Pesquisa da Rede de Estudos e Monitoramento Interdisciplinar da Reforma Trabalhista (REMIR) demonstrou que esses trabalhadores ganham, em média, R$ 9,80 por hora — abaixo do salário mínimo quando descontados os custos com manutenção do veículo e combustível. Sem direito a férias, décimo terceiro, FGTS ou seguro-desemprego, esses trabalhadores vivem em situação de vulnerabilidade permanente, sem qualquer proteção para situações de doença, acidente ou idade avançada.

TEXTO III — Caminhos para a Formalização e Proteção Social (ILO / SEBRAE, 2023)
A Organização Internacional do Trabalho recomenda que países com alta informalidade adotem estratégias combinadas: simplificação dos regimes tributários para micro e pequenos negócios, extensão da proteção social a trabalhadores autônomos, e reformulação dos sistemas de fiscalização para combater a sonegação sem penalizar desproporcionalmente os trabalhadores mais vulneráveis. No Brasil, o Microempreendedor Individual (MEI) foi uma política bem-sucedida de formalização: desde sua criação em 2008, mais de 15 milhões de trabalhadores formalizaram seus negócios, tendo acesso a benefícios previdenciários por um custo mensal de R$ 70. Especialistas sugerem que a expansão do modelo MEI para novas categorias de atividade, combinada com proteção trabalhista básica para plataformas digitais, poderia reduzir significativamente a precariedade laboral no país.

Instrução: Redija dissertação argumentativa sobre a informalidade trabalhista no Brasil e seus impactos na proteção social, com proposta de intervenção completa.`,
    eixo: 'Sociedade',
    icon: iconMap['Users'],
    gradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
    bgImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'patrimonio_historico',
    titulo: `O abandono do patrimônio histórico-arquitetônico e a perda da memória coletiva urbana`,
    desc: `Discuta o descaso com museus, prédios históricos e sítios arqueológicos no Brasil.`,
    motivadores: `TEXTO I — Ruínas da Memória (IPHAN, 2023)
O Instituto do Patrimônio Histórico e Artístico Nacional catalogou mais de 1.100 bens tombados em situação de risco no Brasil — prédios, conjuntos arquitetônicos, sítios arqueológicos e paisagens culturais que enfrentam deterioração severa por falta de manutenção e financiamento. O incêndio do Museu Nacional, em 2018, que destruiu 92% de seu acervo de 20 milhões de itens, tornou-se símbolo do abandono institucional à memória cultural do país. O episódio revelou décadas de negligência: o museu mais antigo das Américas havia solicitado R$ 3,5 milhões para reformas emergenciais no telhado nos anos anteriores ao desastre e não recebera resposta.

TEXTO II — Patrimônio como Motor de Desenvolvimento (SEBRAE / Ministério do Turismo, 2022)
Cidades que investem na restauração e requalificação de seu patrimônio histórico experimentam crescimento expressivo do turismo cultural. O Centro Histórico de Ouro Preto, o Pelourinho em Salvador e o Largo do Rosário em Embu das Artes são exemplos de que o patrimônio bem conservado gera emprego, renda e identidade comunitária. A cada R$ 1,00 investido em restauração patrimonial, estima-se retorno de R$ 7,00 em atividade econômica local, segundo estudo do SEBRAE. O desafio é criar mecanismos de financiamento sustentáveis que não dependam exclusivamente de verbas federais, incluindo parcerias público-privadas, incentivos fiscais e fundos municipais de preservação.

TEXTO III — Legislação e Lacunas (Decreto-Lei 25/1937 / CF 1988, 2023)
O Brasil possui legislação avançada de proteção ao patrimônio cultural — a Constituição de 1988 dedica o artigo 216 ao tema, e o Decreto-Lei 25/1937, que criou o tombamento, é anterior à própria Constituição. No entanto, especialistas apontam que o problema é de implementação: os órgãos de preservação possuem equipes reduzidas, orçamentos insuficientes e poucos mecanismos de responsabilização de proprietários e poder público pelo descumprimento das obrigações de conservação. A criação de planos de preservação municipais integrados, com metas, prazos e fontes de financiamento definidas, é apontada como condição essencial para reverter o quadro de deterioração acelerada do patrimônio nacional.

Instrução: Redija dissertação argumentativa sobre o abandono do patrimônio histórico e a perda da memória coletiva, com proposta de intervenção detalhada.`,
    eixo: 'Cultura',
    icon: iconMap['Landmark'],
    gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    bgImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'leitura_digital',
    titulo: `O declínio da leitura literária e os desafios de formar leitores na era do conteúdo digital`,
    desc: `Analise como a competição com mídias digitais impacta o hábito da leitura e a formação crítica.`,
    motivadores: `TEXTO I — Uma Nação que Não Lê (Retratos da Leitura no Brasil, 2023)
A pesquisa Retratos da Leitura no Brasil, realizada pelo Instituto Pró-Livro, revelou que 52% dos brasileiros não leram sequer um livro inteiro nos últimos três meses. Entre os que leram, a média é de 4,9 livros por ano — número baixo quando comparado à Finlândia (14 livros/ano) e à França (11 livros/ano). O perfil do não-leitor brasileiro é predominantemente jovem, de baixa renda e com acesso precário à educação de qualidade. A pesquisa aponta como principais barreiras à leitura: "falta de tempo" (43%), "preferência por outras atividades" (33%) e "não gosto de ler" (21%) — sendo este último um indicativo de que a escola não conseguiu desenvolver o prazer pela leitura em boa parte dos estudantes.

TEXTO II — A Leitura na Era das Notificações (MIT Media Lab / USP, 2022)
Pesquisadores do MIT Media Lab identificaram que a leitura profunda — aquela que permite a construção de sentido complexo, a empatia narrativa e o pensamento crítico — está sendo progressivamente substituída pela leitura fragmentada e superficial típica do consumo de conteúdo digital. O fenômeno, chamado de "mente digital", é caracterizado pela dificuldade crescente de manter a atenção em textos longos, pela preferência por conteúdo em vídeo e pela busca constante por novidade e estimulação imediata. A pesquisa demonstra que adolescentes que substituem completamente a leitura literária pelo consumo de redes sociais apresentam declínio mensurável em habilidades de compreensão textual e raciocínio inferencial.

TEXTO III — Políticas Públicas de Fomento à Leitura (PNLL / FNDE, 2023)
O Plano Nacional do Livro e da Leitura (PNLL) e o Programa Nacional Biblioteca da Escola (PNBE) são as principais políticas públicas brasileiras de fomento à leitura, mas enfrentam desafios históricos de financiamento insuficiente e fragmentação das ações. A Finlândia, referência mundial em leitura, combina disponibilidade universal de bibliotecas públicas (uma para cada 6.000 habitantes), mediadores de leitura profissionais em todas as escolas e integração curricular da leitura como atividade transversal em todas as disciplinas. No Brasil, o movimento de "saraus periféricos" — encontros literários em bares, praças e centros comunitários das periferias — demonstra que o interesse pela leitura existe quando o livro se torna acessível e representativo da realidade dos leitores.

Instrução: Redija dissertação argumentativa sobre o declínio da leitura e os desafios de formar leitores no Brasil, com proposta de intervenção completa.`,
    eixo: 'Cultura',
    icon: iconMap['Landmark'],
    gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    bgImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
];