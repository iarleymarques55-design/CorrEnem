"""
Serviço de Seleção de Imagens de Fundo (Unsplash).
Mapeia palavras-chave temáticas para IDs de fotos verificadas do Unsplash
e seleciona a imagem mais relevante para cada tema gerado, sem repetição.
"""

UNSPLASH_BASE = "https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=800&q=80"

# Banco de fotos verificadas do Unsplash, agrupadas por palavra-chave temática
UNSPLASH_KEYWORD_POOL: dict[str, list[str]] = {
    # ── Meio Ambiente ──────────────────────────────────────────────────────
    "floresta":         ["photo-1441974231531-c6227db76b6e", "photo-1501854140801-50d01698950b", "photo-1448375240586-882707db888b"],
    "amazonia":         ["photo-1591768793355-74d04bb6608f", "photo-1536147116438-62679a5e01f2"],
    "clima":            ["photo-1504608524841-42584120d693", "photo-1561553590-267fc716698a", "photo-1464822759023-fed622ff2c3b"],
    "seca":             ["photo-1502101872923-d48509bff386", "photo-1617791160505-6f00504e3519"],
    "lixo":             ["photo-1558618666-fcd25c85cd64", "photo-1532996122724-e3c49ef4b321"],
    "plastico":         ["photo-1611284446314-60a58ac0deb9", "photo-1530587191325-3db32d826c18"],
    "agua":             ["photo-1500534314209-a25ddb2bd429", "photo-1559825481-12a05cc00344", "photo-1439405326-dd02b2be6c53"],
    "oceano":           ["photo-1505118380757-91f5f5632de0", "photo-1518020382113-a7e8fc38eac9"],
    "desmatamento":     ["photo-1542601906990-b4d3fb778b09", "photo-1569521374823-7de7ab78e888"],
    "energia":          ["photo-1466611653911-95081537e5b7", "photo-1497435334941-8c899ee9e8e9", "photo-1509391366360-2e959784a276"],

    # ── Sociedade ──────────────────────────────────────────────────────────
    "desigualdade":     ["photo-1529156069898-49953e39b3ac", "photo-1591522811280-a8759970b03f"],
    "pobreza":          ["photo-1488521787991-ed7bbaae773c", "photo-1518780664697-55e3ad937233"],
    "violencia":        ["photo-1590274853856-f22d5ee3d228", "photo-1578496781379-7dcfb995293d"],
    "mulher":           ["photo-1573496359142-b8d87734a5a2", "photo-1520810627419-35e592be37b2", "photo-1508214751196-bcfd4ca60f91"],
    "racismo":          ["photo-1591854810338-a9a1b0a7bcd7", "photo-1577563908411-5077b6dc7624"],
    "populacao":        ["photo-1529156069898-49953e39b3ac", "photo-1516534775068-ba3e7458af70"],
    "familia":          ["photo-1511895426328-dc8714191011", "photo-1476703993599-0035a21b17a9"],
    "migracao":         ["photo-1584438784894-089d6a62b8fa", "photo-1590859808308-3d2d9c515b1a"],
    "trabalho":         ["photo-1507679799987-c73779587ccf", "photo-1521737852567-6949f3f9f2b5"],
    "seguranca":        ["photo-1590274853856-f22d5ee3d228", "photo-1617983993700-9d0b0f9e9e1e"],
    "alimentar":        ["photo-1488521787991-ed7bbaae773c", "photo-1498837167922-ddd27525d352", "photo-1540189549336-e6e99c3679fe"],
    "fome":             ["photo-1488521787991-ed7bbaae773c", "photo-1504674900247-0877df9cc836"],
    "indigena":         ["photo-1516026672322-bc52d61a55d5", "photo-1536152470836-b943b246224c"],

    # ── Saúde ──────────────────────────────────────────────────────────────
    "saude":            ["photo-1505751172876-fa1923c5c528", "photo-1538108149393-fbbd81895907", "photo-1576091160550-2173dba999ef"],
    "mental":           ["photo-1493836512294-502baa1986e2", "photo-1505253468034-514d2507d914", "photo-1559839734-2b71ea197ec2"],
    "ansiedade":        ["photo-1512438248247-f0f2a5a8b7f0", "photo-1493836512294-502baa1986e2"],
    "hospital":         ["photo-1538108149393-fbbd81895907", "photo-1579684385127-1ef15d508118"],
    "sus":              ["photo-1576091160550-2173dba999ef", "photo-1505751172876-fa1923c5c528"],
    "pandemia":         ["photo-1584118624012-df056829fbd0", "photo-1582719471384-894fbb16e074"],
    "droga":            ["photo-1471864190281-a93a3070b6de", "photo-1575936123452-b67c3203c357"],
    "obesidade":        ["photo-1498837167922-ddd27525d352", "photo-1490645935967-10de6ba17061"],
    "crianca":          ["photo-1484863137850-59afcfe05386", "photo-1511895426328-dc8714191011"],

    # ── Educação ───────────────────────────────────────────────────────────
    "educacao":         ["photo-1503676260728-1c00da094a0b", "photo-1509062522246-3755977927d7", "photo-1427504494785-3a9ca7044f45"],
    "escola":           ["photo-1580582932707-520aed937b7b", "photo-1503676260728-1c00da094a0b"],
    "universidade":     ["photo-1523050854058-8df90110c9f1", "photo-1541339907198-e08756dedf3f"],
    "evasao":           ["photo-1544531586-fde5298cdd40", "photo-1503676260728-1c00da094a0b"],
    "leitura":          ["photo-1481627834876-b7833e8f5570", "photo-1456513080510-7bf3a84b82f8"],
    "digital":          ["photo-1518770660439-4636190af475", "photo-1526374965328-7f61d4dc18c5", "photo-1451187580459-43490279c0fa"],

    # ── Cultura ────────────────────────────────────────────────────────────
    "cultura":          ["photo-1516450360452-9312f5e86fc7", "photo-1508700115892-45ecd05ae2ad"],
    "arte":             ["photo-1541367777708-7905fe3296c0", "photo-1460661419201-fd4cecdf8a8b"],
    "musica":           ["photo-1511379938547-c1f69419868d", "photo-1514320291840-2e0a9bf2a9ae"],
    "patrimonio":       ["photo-1524492412937-b28074a5d7da", "photo-1516450360452-9312f5e86fc7"],
    "religiao":         ["photo-1438232992991-995b7058bbb3", "photo-1523906834658-6e24ef2386f9"],

    # ── Tecnologia ─────────────────────────────────────────────────────────
    "tecnologia":       ["photo-1518770660439-4636190af475", "photo-1488590528505-98d2b5aba04b", "photo-1461749280684-dccba630e2f6"],
    "inteligencia":     ["photo-1485827404703-89b55fcc595e", "photo-1677442135703-1787eea5ce01", "photo-1620712943543-bcc4688e7485"],
    "automacao":        ["photo-1485827404703-89b55fcc595e", "photo-1531746790731-6c087fecd65a"],
    "internet":         ["photo-1544197150-b99a580bb7a8", "photo-1516321318423-f06f85e504b3"],
    "redes":            ["photo-1611162617213-7d7a39e9b1d7", "photo-1432888498266-38ffec3eaf0a"],
    "privacidade":      ["photo-1563013544-824ae1b704d3", "photo-1555949963-ff9fe0c870eb"],
    "emprego":          ["photo-1521737852567-6949f3f9f2b5", "photo-1507679799987-c73779587ccf"],
}

# Fotos padrão por eixo (usadas quando nenhuma keyword do título dá match)
UNSPLASH_EIXO_FALLBACK: dict[str, list[str]] = {
    "Meio Ambiente": ["photo-1441974231531-c6227db76b6e", "photo-1501854140801-50d01698950b", "photo-1464822759023-fed622ff2c3b"],
    "Sociedade":     ["photo-1529156069898-49953e39b3ac", "photo-1516534775068-ba3e7458af70", "photo-1491438590914-bc09fcaaf77a"],
    "Saúde":         ["photo-1505751172876-fa1923c5c528", "photo-1576091160550-2173dba999ef", "photo-1579684385127-1ef15d508118"],
    "Educação":      ["photo-1503676260728-1c00da094a0b", "photo-1509062522246-3755977927d7", "photo-1427504494785-3a9ca7044f45"],
    "Cultura":       ["photo-1516450360452-9312f5e86fc7", "photo-1508700115892-45ecd05ae2ad", "photo-1460661419201-fd4cecdf8a8b"],
    "Tecnologia":    ["photo-1518770660439-4636190af475", "photo-1488590528505-98d2b5aba04b", "photo-1461749280684-dccba630e2f6"],
}

# Rastreia as últimas 10 fotos usadas para evitar repetição
_HISTORICO_IMAGENS_USADAS: list[str] = []


def get_bg_image_for_tema(titulo: str, eixo: str) -> str:
    """
    Seleciona a foto mais relevante para o tema:
    1. Extrai palavras-chave do título
    2. Busca matches no banco de fotos por keyword
    3. Evita repetir fotos usadas recentemente
    4. Fallback para pool do eixo se nenhuma keyword der match
    """
    global _HISTORICO_IMAGENS_USADAS

    titulo_lower = (titulo or "").lower()
    candidatos: list[str] = []

    # 1. Busca fotos por palavras-chave do título
    for keyword, fotos in UNSPLASH_KEYWORD_POOL.items():
        if keyword in titulo_lower:
            candidatos.extend(fotos)

    # 2. Se não achou por keyword, usa o pool do eixo como candidatos
    if not candidatos:
        eixo_normalizado = (eixo or "").strip().title()
        for key, fotos in UNSPLASH_EIXO_FALLBACK.items():
            if key.lower() in eixo_normalizado.lower() or eixo_normalizado.lower() in key.lower():
                candidatos.extend(fotos)

    # 3. Fallback final: usa todas as fotos do eixo Sociedade
    if not candidatos:
        candidatos = UNSPLASH_EIXO_FALLBACK["Sociedade"]

    # 4. Prioriza fotos não usadas recentemente
    candidatos_unicos = list(dict.fromkeys(candidatos))
    nao_repetidas = [f for f in candidatos_unicos if f not in _HISTORICO_IMAGENS_USADAS]

    escolhida = (nao_repetidas[0] if nao_repetidas else candidatos_unicos[0])

    # 5. Registra no histórico (mantém só as 10 últimas)
    _HISTORICO_IMAGENS_USADAS.append(escolhida)
    if len(_HISTORICO_IMAGENS_USADAS) > 10:
        _HISTORICO_IMAGENS_USADAS.pop(0)

    return UNSPLASH_BASE.format(photo_id=escolhida)
