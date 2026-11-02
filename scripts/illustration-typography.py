#!/usr/bin/env python3
"""Check HuiFont glyphs; typeset real text over a reviewed text-free background."""

import argparse
import base64
import hashlib
import html
import json
import os
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load_font():
    config = json.loads((ROOT / '.baoyu-skills/illustration-typography.json').read_text())['font']
    path = Path(os.environ.get(config['path_env'], config['default_local_path']))
    data = path.read_bytes()
    if sha(data) != config['sha256']:
        raise ValueError('Font SHA-256 differs from the user-selected HuiFontP29 file')
    with TTFont(path) as font:
        glyphs = font.getGlyphSet()
        cmap = {}
        # Some mapped CJK entries in this font contain no outline (e.g. 你, 份).
        # A cmap entry or document.fonts.check alone does not establish coverage.
        for codepoint, name in font.getBestCmap().items():
            if name == '.notdef':
                continue
            pen = BoundsPen(glyphs)
            glyphs[name].draw(pen)
            if pen.bounds is not None:
                cmap[codepoint] = name
    return config, data, cmap


def check_text(text, cmap):
    missing = sorted({c for c in text if not c.isspace() and cmap.get(ord(c), '.notdef') == '.notdef'})
    if missing:
        raise ValueError('Unsupported glyphs: ' + ' '.join(f'{c} (U+{ord(c):04X})' for c in missing))


def render(spec_path, output, chromium, config, font_data, cmap):
    from PIL import Image
    from playwright.sync_api import sync_playwright

    spec = json.loads(spec_path.read_text())
    if spec['schema_version'] != 1:
        raise ValueError('Unsupported typesetting schema')
    jobs = []
    ids = set()
    for image in spec['images']:
        ident = image['id']
        if not ident or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in ident) or ident in ids:
            raise ValueError('Image IDs must be unique lowercase filename slugs')
        ids.add(ident)
        background = (spec_path.parent / image['background']).resolve()
        with Image.open(background) as art:
            if art.format != 'PNG':
                raise ValueError('Background must be a reviewed PNG')
            width, height = art.size
        for label in image['labels']:
            check_text(label['text'], cmap)
            x, y, w, h, size = (label[k] for k in ['x', 'y', 'width', 'height', 'font_size'])
            if not (x >= 0 and y >= 0 and w > 0 and h > 0 and size > 0 and x + w <= width and y + h <= height):
                raise ValueError(f'Invalid label box in {ident}')
            if label.get('align', 'center') not in ('center', 'left'):
                raise ValueError('Unsupported alignment')
        jobs.append((image, background, width, height))

    output.mkdir(parents=True, exist_ok=True)
    reports = []
    font_url = 'data:font/ttf;base64,' + base64.b64encode(font_data).decode()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chromium, args=['--no-sandbox'])
        try:
            for image, background, width, height in jobs:
                art_data = background.read_bytes()
                art_url = 'data:image/png;base64,' + base64.b64encode(art_data).decode()
                labels = []
                for label in image['labels']:
                    style = ';'.join(f'{css}:{label[key]}px' for key, css in [
                        ('x', 'left'), ('y', 'top'), ('width', 'width'), ('height', 'height'), ('font_size', 'font-size')])
                    justify = 'flex-start' if label.get('align') == 'left' else 'center'
                    labels.append(f'<div class="label" style="{style};justify-content:{justify}"><span>{html.escape(label["text"])}</span></div>')
                document = f'''<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:MyNoteHui;src:url({font_url}) format('truetype');font-weight:400;font-style:normal;font-display:block}}
html,body{{margin:0;width:{width}px;height:{height}px;overflow:hidden;background:white}}
img{{position:absolute;inset:0;width:{width}px;height:{height}px}}
.label{{position:absolute;display:flex;align-items:center;color:#111;font-family:MyNoteHui;font-weight:400;font-style:normal;font-synthesis:none;line-height:1.2}}
.label span{{white-space:pre;flex-shrink:0}}
</style><img src="{art_url}" alt="">{''.join(labels)}'''
                page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
                try:
                    page.set_content(document, wait_until='load')
                    page.evaluate('document.fonts.ready')
                    text = ''.join(label['text'] for label in image['labels'])
                    if not page.evaluate('(text) => document.fonts.check("40px MyNoteHui", text)', text):
                        raise ValueError('Actual font did not load')
                    overflow = page.locator('.label').evaluate_all('''els => els.map((el,i) => {
                        const r=el.firstElementChild.getBoundingClientRect();
                        return r.width>el.clientWidth+0.5 || r.height>el.clientHeight+0.5 ? i : null;
                    }).filter(i => i!==null)''')
                    if overflow:
                        raise ValueError(f'Text exceeds its box in {image["id"]}: labels {overflow}')
                    target = output / (image['id'] + '.png')
                    page.screenshot(path=str(target))
                    reports.append({'id': image['id'], 'file': target.name, 'width': width, 'height': height,
                                    'font_sha256': config['sha256'], 'font_loaded': True, 'glyphs_checked': True,
                                    'overflow_checked': True, 'background_sha256': sha(art_data),
                                    'sha256': sha(target.read_bytes())})
                finally:
                    page.close()
        finally:
            browser.close()
    (output / 'typography-report.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(reports, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chromium', default='/usr/bin/chromium')
    commands = parser.add_subparsers(dest='command', required=True)
    check = commands.add_parser('check')
    check.add_argument('text_file', type=Path)
    make = commands.add_parser('render')
    make.add_argument('spec', type=Path)
    make.add_argument('output', type=Path)
    args = parser.parse_args()
    config, data, cmap = load_font()
    if args.command == 'check':
        check_text(args.text_file.read_text(), cmap)
        print('All characters supported by the verified HuiFontP29 file')
    else:
        render(args.spec.resolve(), args.output.resolve(), args.chromium, config, data, cmap)


if __name__ == '__main__':
    main()
