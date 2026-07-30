"""
Funções de Simulação / Fallback do CorrEnem.
Usadas quando o cliente Groq não está disponível (sem chave de API ou em caso de erro).
Retornam dados simulados realistas para manter o app funcional em modo demo.
"""
import random

# Compartilhado com routers/temas.py para anti-repetição
HISTORICO_TEMAS_GERADOS: list[str] = []


def simular_correcao(tema: str, texto: str) -> dict:
    """Gera uma correção simulada baseada em heurísticas simples do texto."""
    palavras = texto.split()
    desvios = []

    if len(palavras) > 10:
        desvios.append({
            "trecho": palavras[2],
            "erro": "Possível desvio de ortografia ou concordância",
            "competencia": "competencia1",
            "explicacao": "Análise sintática indica que o termo pode conter um erro formal de escrita ou regência inadequada no período.",
            "correcao": f"{palavras[2].lower()}"
        })
    if len(palavras) > 25:
        desvios.append({
            "trecho": f"{palavras[12]} {palavras[13]}",
            "erro": "Quebra de coesão referencial",
            "competencia": "competencia4",
            "explicacao": "Aqui você deveria ter sido mais claro e objetivo. A frase ficou ambígua e o conectivo utilizado gerou incoerência lógica.",
            "correcao": "portanto, o cenário"
        })

    tamanho = len(texto)
    c1 = 120 if tamanho < 500 else 160
    c2 = 120 if "conforme" not in texto.lower() else 160
    c3 = 120 if tamanho < 600 else 160
    c4 = 160 if "com efeito" in texto.lower() or "logo" in texto.lower() else 120
    c5 = 120 if "ministério" not in texto.lower() else 160
    nota_final = c1 + c2 + c3 + c4 + c5

    return {
        "competencia1": {
            "nota": c1,
            "feedback": "O texto apresenta um domínio mediano da norma padrão escrita, com pequenos desvios de pontuação e concordância espalhados pelos períodos.",
            "sugestoes": "Revise com cuidado o uso da vírgula entre o sujeito e o predicado, e atente-se às regras de concordância nominal."
        },
        "competencia2": {
            "nota": c2,
            "feedback": "O tema proposto foi bem compreendido e desenvolvido dentro da estrutura dissertativa requerida, apresentando repertório sociocultural legítimo.",
            "sugestoes": "Para alcançar a nota máxima, tente correlacionar pensadores modernos com a realidade prática do problema brasileiro."
        },
        "competencia3": {
            "nota": c3,
            "feedback": "Apresenta projeto de texto claro, com introdução, desenvolvimento e conclusão coerentes, defendendo com clareza o ponto de vista escolhido.",
            "sugestoes": "Organize melhor seus argumentos hierarquizando as causas mais importantes no início de cada parágrafo de desenvolvimento."
        },
        "competencia4": {
            "nota": c4,
            "feedback": "Demonstra bom uso de conectivos interparágrafos e intraparágrafos, evitando repetição de vocábulos e garantindo boa fluidez de leitura.",
            "sugestoes": "Diversifique ainda mais o repertório de conjunções adversativas e conclusivas ao longo dos períodos."
        },
        "competencia5": {
            "nota": c5,
            "feedback": "A proposta de intervenção está estruturada e propõe ações para mitigar o problema, mas falta detalhar melhor o agente executor ou os meios de realização.",
            "sugestoes": "Lembre-se dos cinco elementos obrigatórios: Agente (Quem), Ação (O que), Meio/Modo (Como), Efeito (Para que) e Detalhamento de um dos elementos."
        },
        "nota_final": nota_final,
        "comentario_geral": "Parabéns pelo esforço! Seu texto está muito bem estruturado e segue a receita tradicional da prova do ENEM. Fazendo pequenas revisões na gramática e adicionando um detalhamento a mais na proposta de intervenção, você tem grandes chances de ultrapassar a barreira dos 900 pontos nas próximas redações.",
        "explicacao_nota_final": f"A nota final foi calculada somando os desempenhos específicos em cada competência avaliada pela grade oficial: C1 ({c1} pontos) + C2 ({c2} pontos) + C3 ({c3} pontos) + C4 ({c4} pontos) + C5 ({c5} pontos) = {nota_final} pontos.",
        "desvios": desvios
    }


def simular_tema_gerado() -> dict:
    """Retorna um tema pré-definido e realista, evitando repetições recentes."""
    temas = [
        {
            "titulo": "Caminhos para combater a insegurança alimentar na infância no Brasil",
            "desc": "Analise a fome crônica infantil e a importância de redes públicas de nutrição básica escolar.",
            "eixo": "Sociedade",
            "bgImage": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
            "motivadores": (
                "TEXTO I — A subnutrição infantil no Brasil\n"
                "Conforme relatórios oficiais da UNICEF, mais de 2 milhões de crianças brasileiras vivem hoje em situação de extrema vulnerabilidade alimentar.\n\n"
                "TEXTO II — O Programa Nacional de Alimentação Escolar\n"
                "O PNAE representa uma das principais políticas de combate à fome estudantil. Para muitas crianças, a refeição escolar é a única fonte garantida de nutrientes.\n\n"
                "TEXTO III — A urgência da segurança nutricional\n"
                "Especialistas apontam que a desnutrição na primeira infância deixa sequelas irreversíveis na formação educacional."
            )
        },
        {
            "titulo": "Desafios para a valorização e integração dos povos tradicionais indígenas no Brasil",
            "desc": "Debata a demarcação de terras, a proteção cultural e os conflitos decorrentes de exploração ilegal.",
            "eixo": "Cultura",
            "bgImage": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80",
            "motivadores": (
                "TEXTO I — A demarcação territorial na Amazônia\n"
                "A preservação de florestas e rios está diretamente ligada à ocupação pacífica de terras pelas comunidades nativas.\n\n"
                "TEXTO II — A perda de saberes tradicionais\n"
                "A homogeneização cultural gera sério risco de desaparecimento de dialetos e conhecimentos botânicos milenares.\n\n"
                "TEXTO III — A invasão do garimpo ilegal\n"
                "Operações constatado a degradação de rios com mercúrio e contaminação em aldeias."
            )
        },
        {
            "titulo": "Impactos da automação e da inteligência artificial na preservação dos empregos formais",
            "desc": "Discuta a requalificação profissional e o papel do Estado na transição para uma economia digital inclusiva.",
            "eixo": "Tecnologia",
            "bgImage": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
            "motivadores": (
                "TEXTO I — A automação no mercado de trabalho\n"
                "Estudos indicam que 30% das ocupações de rotina correm risco de automação nos próximos dez anos.\n\n"
                "TEXTO II — O desafio do Reskilling\n"
                "A qualificação contínua tornou-se pré-requisito indispensável para a permanência de jovens profissionais no mercado de trabalho digital.\n\n"
                "TEXTO III — Proteção social e transição justa\n"
                "Especialistas defendem a criação de redes públicas de apoio a trabalhadores afetados pelo avanço algorítmico."
            )
        },
        {
            "titulo": "Caminhos para conter a crise da poluição por plásticos descartáveis no ecossistema marinho",
            "desc": "Analise a gestão de resíduos sólidos, a reciclagem inclusiva e a responsabilidade estendida dos produtores.",
            "eixo": "Meio Ambiente",
            "bgImage": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
            "motivadores": (
                "TEXTO I — O acúmulo de plásticos nos oceanos\n"
                "Milhões de toneladas de resíduos plásticos atingem o oceano anualmente, ameaçando a vida marinha.\n\n"
                "TEXTO II — Microplásticos e saúde pública\n"
                "Pesquisas detectaram partículas microplásticas na cadeia alimentar humana através do consumo de pescados.\n\n"
                "TEXTO III — Logística reversa e cooperativas\n"
                "A inclusão de catadores de materiais recicláveis é ponto central para a consolidação de uma economia circular."
            )
        },
        {
            "titulo": "A promoção da saúde mental e o enfrentamento dos transtornos de ansiedade na juventude",
            "desc": "Debata a pressão social, a hiperconectividade digital e a ampliação dos serviços de acolhimento público.",
            "eixo": "Saúde",
            "bgImage": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
            "motivadores": (
                "TEXTO I — O aumento dos sintomas ansiosos\n"
                "Dados da OMS revelam que a prevalência de quadros ansiosos e depressivos entre adolescentes cresceu significativamente.\n\n"
                "TEXTO II — O impacto das mídias digitais\n"
                "A comparação social contínua nas redes virtuais amplifica o esgotamento emocional dos estudantes.\n\n"
                "TEXTO III — A importância do suporte escolar\n"
                "Equipes multidisciplinares com psicólogos nas escolas públicas são fundamentais para o acolhimento preventivo."
            )
        }
    ]

    temas_disponiveis = [t for t in temas if t["titulo"] not in HISTORICO_TEMAS_GERADOS[-4:]]
    seletor = temas_disponiveis if temas_disponiveis else temas
    escolhido = random.choice(seletor)
    HISTORICO_TEMAS_GERADOS.append(escolhido["titulo"])
    return escolhido


def simular_roteiro(tema: str) -> dict:
    """Retorna um roteiro de perguntas genérico baseado no tema."""
    return {
        "pergunta1": f"Como você pode contextualizar o tema '{tema}' (ex: dados históricos, constituição ou atualidades) e definir a sua tese?",
        "pergunta2": "Quais são as causas fundamentais que alimentam esse problema na sociedade e impedem sua solução?",
        "pergunta3": "Como esse problema atinge na prática a população brasileira e quais são os principais reflexos negativos?",
        "pergunta4": "Que ações práticas o governo ou sociedade civil podem tomar (identificando Quem, O que, Como e Efeito) para intervir na questão?"
    }


def simular_exemplar(tema: str) -> dict:
    """Retorna um exemplar de redação nota 1000 simulado."""
    return {
        "tema_titulo": tema if tema and tema != "Enunciado Próprio" else "A permanência da desigualdade social e os caminhos para a cidadania no Brasil",
        "redacao_modelo": (
            "Historicamente, a Carta Magna de 1988 — documento jurídico mais importante da nação — assegura a todos os cidadãos "
            "o direito à dignidade, à educação e ao bem-estar social. Todavia, a persistência de entraves referentes a essa problemática no Brasil contemporâneo "
            "evidencia a distância existente entre a teoria constitutional e a prática diária. Desse modo, torna-se imperioso analisar "
            "como a inoperância governamental e a omissão comunitária corroboram com essa nefasta realidade.\n\n"
            "Em primeira análise, a negligência do poder público surge como um dos principais vetores do impasse. Conforme postulado "
            "pelo filósofo John Locke na teoria do contrato social, cabe ao Estado ofertar os meios necessários para o desenvolvimento "
            "saudável da coletividade. No entanto, observa-se que as verbas destinadas a programas de amparo à temática são irrisórias e "
            "mal distribuídas, deixando parcelas vulneráveis da população à mercê do abandono social e perpetuando o problema.\n\n"
            "Ademais, convém destacar que a omissão coletiva atua de forma a intensificar a gravidade desse cenário. De acordo com o "
            "sociólogo Zygmunt Bauman, a sociedade líquida contemporânea é marcada por um forte individualismo, o que enfraquece a "
            "solidariedade de classe e a mobilização popular diante de dores alheias. Dessa forma, sem um debate qualificado em salas "
            "de aula e com o silenciamento midiático das minorias prejudicadas, a problemática permanece invisibilizada e distante de resoluções.\n\n"
            "Infere-se, portanto, que medidas urgentes são necessárias. Cabe ao Ministério da Cidadania, em parceria com a Secretaria "
            "de Comunicação, destinar fundos governamentais prioritários para a execução de campanhas educacionais em canais abertos "
            "e plataformas online, com o objetivo de informar a população sobre o tema. Essas campanhas devem contar com cartilhas e "
            "debates liderados por especialistas de áreas correlatas. Consequentemente, espera-se mitigar a inércia estatal e promover "
            "um país condizente com a soberania expressa na constituição."
        ),
        "analise_c1": "Nota 200/200: A redação demonstra perfeito domínio da modalidade escrita culta da língua portuguesa, sem apresentar desvios de concordância, regência ou pontuação, utilizando vocabulário preciso e elegante.",
        "analise_c2": "Nota 200/200: O participante compreendeu integralmente a proposta temática e aplicou com maestria repertórios socioculturais legitimados e produtivos (John Locke e Zygmunt Bauman), perfeitamente vinculados à tese.",
        "analise_c3": "Nota 200/200: Apresenta um projeto de texto estratégico irretocável. A introdução estabelece a tese com clareza e os dois parágrafos de desenvolvimento articulam causas distintas (inércia estatal e omissão social) de forma progressiva.",
        "analise_c4": "Nota 200/200: Utilizou um repertório diversificado de elementos coesivos interparágrafos ('Em primeira análise', 'Ademais', 'Infere-se, portanto') e intraparágrafos sem repetições nem ambiguidades.",
        "analise_c5": "Nota 200/200: A proposta de intervenção reúne com rigor todos os 5 elementos obrigatórios do ENEM: Agente (Ministério da Cidadania), Ação (destinar fundos prioritários), Meio/Modo (parceria com a Secretaria de Comunicação), Efeito (informar a população e mitigar a inércia) e Detalhamento (cartilhas e debates liderados por especialistas)."
    }
