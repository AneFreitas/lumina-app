from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

BOOK_WORDS = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute',
    '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias',
    'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias',
    'Lamentações', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miqueias',
    'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Mateus', 'Marcos', 'Lucas',
    'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
    'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Ts', '2 Ts', '1 Timóteo',
    '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
    '3 João', 'Judas', 'Apocalipse'
]

REFERENCE_PATTERN = re.compile(
    r'^((?:[1-3]\s)?[^\d]+?\s\d+:\d+)\s+(.*)$'
)
BOOK_PREFIX_PATTERN = re.compile(
    r'^(?:' + '|'.join(re.escape(book) for book in sorted(BOOK_WORDS, key=len, reverse=True)) + r')\s+\d+:\d+'
)
THEME_LINE_PATTERN = re.compile(r'^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç0-9 /-]{2,}$')
SKIP_TEXT_MARKERS = (
    'kMDItem',
    'SOBRE O AUTOR',
    'Pastor Isaias',
    'autorprisaiasdasilva',
    'VEJA TODOS OS NOSSOS LIVROS',
)

THEME_INTROS = {
    'amor': 'Este versículo revela o amor de Deus como base segura para a alma.',
    'fé': 'Este texto fortalece a fé para seguir confiando mesmo sem ver tudo com clareza.',
    'esperança': 'Esta palavra reacende esperança e lembra que Deus continua agindo.',
    'paz': 'Este versículo conduz o coração à paz que vem da presença do Senhor.',
    'tribulação': 'Este texto mostra que a tribulação não tem a palavra final quando Deus sustenta.',
    'tristeza': 'Esta palavra acolhe a tristeza e aponta para o consolo do Senhor.',
    'vida': 'Este versículo chama a viver com propósito, dependência e plenitude em Deus.',
    'verdade': 'Este texto firma o coração na verdade de Deus, que não falha.',
    'vitória': 'Esta palavra lembra que a vitória verdadeira vem do Senhor.',
}


def slugify_theme(theme: str) -> str:
    normalized = (
        theme.lower()
        .replace('ã', 'a')
        .replace('á', 'a')
        .replace('à', 'a')
        .replace('â', 'a')
        .replace('é', 'e')
        .replace('ê', 'e')
        .replace('í', 'i')
        .replace('ó', 'o')
        .replace('ô', 'o')
        .replace('õ', 'o')
        .replace('ú', 'u')
        .replace('ç', 'c')
    )
    normalized = re.sub(r'[^a-z0-9]+', '-', normalized).strip('-')
    return normalized or 'geral'


def build_ai_explanation(theme: str, reference: str, verse_text: str) -> str:
    normalized_theme = slugify_theme(theme)
    intro = next(
        (message for key, message in THEME_INTROS.items() if key in normalized_theme),
        'Este versículo oferece direção espiritual para viver o dia com confiança e sensibilidade à voz de Deus.'
    )
    emphasis = 'Ele convida a transformar a mensagem em oração, prática e perseverança.'
    application = f' Em {reference}, vemos um chamado para responder ao Senhor com fé, obediência e coração disponível.'

    if 'jesus' in verse_text.lower() or 'cristo' in verse_text.lower():
        emphasis = 'Ele aponta para Cristo como centro da esperança, do consolo e da resposta de Deus.'
    elif 'senhor' in verse_text.lower() or 'deus' in verse_text.lower():
        emphasis = 'Ele lembra que o Senhor continua presente, soberano e atuante nas circunstâncias mais comuns e nas mais difíceis.'

    return f'{intro} {emphasis}{application}'


def load_pdf_text(pdf_path: str) -> str:
    output = subprocess.check_output(['mdimport', '-t', '-d3', pdf_path], text=True, errors='ignore')
    decoded = output.encode('utf-8', 'ignore').decode('unicode_escape', 'ignore')
    return decoded.replace('******ebook converter DEMO Watermarks*******', '\n')


def parse_entries(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    entries = []
    current_theme = 'Geral'
    pending = None

    def flush_pending() -> None:
        nonlocal pending
        if not pending:
            return
        pending['text'] = ' '.join(pending['text'].split())
        entries.append(pending)
        pending = None

    for line in lines:
        if line.startswith('%PDF') or line.startswith('Note: The tool simplified'):
            continue

        if BOOK_PREFIX_PATTERN.match(line):
            flush_pending()
            match = REFERENCE_PATTERN.match(line)
            if not match:
                continue
            pending = {
                'theme': current_theme,
                'reference': match.group(1).replace('  ', ' ').strip(),
                'text': match.group(2).strip(),
            }
            continue

        if pending:
            if THEME_LINE_PATTERN.match(line) and not re.search(r'\d+:\d+', line):
                flush_pending()
                current_theme = line
                continue
            if not any(marker in line for marker in SKIP_TEXT_MARKERS):
                pending['text'] += ' ' + line
            continue

        if THEME_LINE_PATTERN.match(line) and not re.search(r'\d+:\d+', line) and len(line) < 90:
            current_theme = line

    flush_pending()

    deduped = []
    seen = set()
    for index, item in enumerate(entries, start=1):
        if len(item['text']) < 12:
            continue
        if any(marker in item['text'] for marker in SKIP_TEXT_MARKERS):
            continue
        key = (item['reference'], item['text'])
        if key in seen:
            continue
        seen.add(key)
        deduped.append({
            'id': index,
            'theme': item['theme'],
            'themeKey': slugify_theme(item['theme']),
            'reference': item['reference'],
            'text': item['text'],
            'ai_explanation': build_ai_explanation(item['theme'], item['reference'], item['text']),
        })
    return deduped


def write_module(entries: list[dict], output_path: Path) -> None:
    serialized = json.dumps(entries, ensure_ascii=False, indent=2)
    content = (
        '// Arquivo gerado automaticamente a partir do PDF temático fornecido pelo usuário.\n'
        'export const LOCAL_VERSE_LIBRARY = ' + serialized + ';\n'
    )
    output_path.write_text(content, encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--pdf', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    text = load_pdf_text(args.pdf)
    entries = parse_entries(text)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    write_module(entries, output_path)
    print(json.dumps({'count': len(entries), 'output': str(output_path)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
