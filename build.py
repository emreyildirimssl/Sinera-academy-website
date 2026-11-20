"""Convert the Claude Design .dc.html boards into a static site.

Dynamic regions (top-level <sc-for>/<sc-if> outside the form) are kept as string
templates and rendered client-side by app.js; the form is converted to plain HTML.
"""
import json, re, pathlib

SRC = pathlib.Path('/home/claude/design/project')
OUT = pathlib.Path('/home/claude/academy-site')
ACCENT = '#E3000E'

FONT_MAP = {
    'ba1789be5245c1d41db58fbb46346236': 'm-latin-400.woff2',
    '6c311db6eb7f740d92397b90da45d814': 'm-latin-ext-400.woff2',
    'aa689485bcc36ee100f8d1a9a4bc2b31': 'm-latin-500.woff2',
    '968c01715cf311b24f34287b158eb1db': 'm-latin-ext-500.woff2',
    '35758795ffaff7815298b117f7dc16d8': 'm-latin-600.woff2',
    'cc6eec3705d2f2993c043e46d0a4682a': 'm-latin-ext-600.woff2',
    '6e95b73b5849b76df2750f24d2d53eae': 'm-latin-700.woff2',
    'd6da96a924576cab09c1c4b7d5cbabcc': 'm-latin-ext-700.woff2',
    '225fafc59b7f426d41ec9e5e5b4c02c9': 'i-latin-500.woff2',
    '63c451bc50ce8256367bc9a4fa89bdb8': 'i-latin-ext-500.woff2',
}
IMG_MAP = {
    '3afe10f889ab380a69ec370355f53be3': '/assets/img/sinera-logo.png',
    '413b82c12150378e1505d1b708756e0c': '/assets/img/emre-yildirim.jpg',
}

DESC = ('B2B satış ekipleri için yetkinlik ölçümü, eğitim ve gelişim. 36 saha vakası ve '
        '6 satış matematiği sorusuyla ekibinizin gelişim ihtiyaçlarını ölçün.')


def common(s):
    for k, v in FONT_MAP.items():
        s = s.replace(f'/_blob/{k}', f'/assets/fonts/{v}')
    for k, v in IMG_MAP.items():
        s = s.replace(f'/_blob/{k}', v)
    s = s.replace('{{accent}}', ACCENT).replace('{{ accent }}', ACCENT)
    s = s.replace('href="Gizlilik.dc.html"', 'href="/gizlilik/"')
    s = s.replace('href="Main.dc.html"', 'href="/"')
    return s


def split(s):
    style = re.search(r'<helmet>\s*<style>(.*?)</style>\s*</helmet>', s, re.S).group(1)
    body = s.split('</helmet>', 1)[1]
    body = body.split('<script type="text/x-dc"', 1)[0]
    body = body.rsplit('</x-dc>', 1)[0]
    title = re.search(r'<title>(.*?)</title>', s).group(1)
    return title, style, body.strip()


def find_block(s, tag, start):
    """Return end index (after closing tag) of the <tag ...> block opening at start."""
    depth, i = 0, start
    pat = re.compile(rf'<{tag}\b|</{tag}>')
    while True:
        m = pat.search(s, i)
        if not m:
            raise ValueError('unbalanced ' + tag)
        depth += 1 if not m.group(0).startswith('</') else -1
        i = m.end()
        if depth == 0:
            return i


def page(title, style, body, extra_head='', scripts=''):
    return f'''<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{DESC}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{DESC}">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<link rel="icon" href="/assets/img/favicon.png">
{extra_head}<style>
{style.strip()}
html{{scroll-behavior:smooth}}
img{{max-width:100%}}
</style>
</head>
<body>
{body}
{scripts}</body>
</html>
'''


def build_main():
    s = common((SRC / 'Main.dc.html').read_text())
    title, style, body = split(s)

    # report panels: static attributes driven by app.js
    for n in range(5):
        on = n == 0
        body = body.replace(f'aria-hidden="{{{{ hid{n} }}}}"',
                            f'data-panel="{n}" aria-hidden="{"false" if on else "true"}"')
        body = body.replace(f'{{{{ vis{n} }}}}',
                            'opacity: 1; visibility: visible' if on else 'opacity: 0; visibility: hidden')
    body = body.replace('{{ slideNo }}', '<span data-slide-no>1</span>')

    # form: notSubmitted / submitted sc-if -> static wrappers
    body = re.sub(r'<sc-if value="\{\{ notSubmitted \}\}"[^>]*>', '<div data-form-wrap>', body)
    body = re.sub(r'<sc-if value="\{\{ submitted \}\}"[^>]*>', '<div data-form-ok hidden>', body)
    # close those two: they are the only sc-if blocks that contain <form / role="status"
    def close_wrap(b, opener):
        i = b.index(opener)
        j = b.index('</sc-if>', i)
        return b[:j] + '</div>' + b[j + len('</sc-if>'):]
    body = close_wrap(body, '<div data-form-wrap>')
    body = close_wrap(body, '<div data-form-ok hidden>')
    body = body.replace('<form onSubmit="{{ submit }}"', '<form id="application-form" novalidate')
    honeypot = ('<div aria-hidden="true" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden">'
                '<label for="f-website">Web sitesi</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>\n'
                '<p data-form-error role="alert" hidden style="margin: 0; padding: 12px 14px; border-radius: 8px; background: rgba(227, 0, 14, 0.08); color: #C0000C; font-size: 14px"></p>\n')
    body = body.replace('<button type="submit"', honeypot + '<button type="submit"', 1)

    # loose dynamic element outside any block: wrap so it becomes a region
    btn = re.search(r'<button type="button" onClick="\{\{ reveal \}\}".*?</button>', body, re.S).group(0)
    body = body.replace(btn, '<sc-if value="{{ true }}">' + btn + '</sc-if>')

    # remaining top-level sc-for / sc-if -> client-rendered regions
    regions = []
    out, i = [], 0
    pat = re.compile(r'<(sc-for|sc-if)\b')
    while True:
        m = pat.search(body, i)
        if not m:
            out.append(body[i:])
            break
        end = find_block(body, m.group(1), m.start())
        out.append(body[i:m.start()])
        out.append(f'<dc-region data-r="{len(regions)}" style="display: contents"></dc-region>')
        regions.append(body[m.start():end])
        i = end
    body = ''.join(out)

    assert '{{' not in body, re.findall(r'.{40}\{\{.{40}', body)[:3]

    src = (SRC / 'Main.dc.html').read_text()
    logic = src.split('data-dc-script', 1)[1].split('>', 1)[1].rsplit('</script>', 1)[0]
    (OUT / 'assets' / 'logic.js').write_text(
        '// Generated from Main.dc.html (Claude Design). Do not edit by hand.\n'
        'window.DC_REGIONS = ' + json.dumps(regions, ensure_ascii=False) + ';\n'
        'window.DC_COMPONENT = function (DCLogic) {\n' + logic + '\nreturn Component;\n};\n')

    html = page(title, style, body,
                extra_head='<link rel="canonical" href="https://sinerasaleslab.academy/">\n'
                           '<link rel="preload" href="/assets/fonts/m-latin-700.woff2" as="font" type="font/woff2" crossorigin>\n',
                scripts='<script src="/assets/logic.js"></script>\n<script src="/assets/app.js"></script>\n')
    (OUT / 'index.html').write_text(html)
    return len(regions)


def build_privacy():
    s = common((SRC / 'Gizlilik.dc.html').read_text())
    title, style, body = split(s)
    body = body.replace(' ICO kayıt numarası: [ICO KAYIT NO].', '')
    body = body.replace('Son güncelleme: [TARİH]', 'Son güncelleme: 20 Kasım 2026')
    assert '{{' not in body and '[' not in body.replace('[stated]','')
    html = page(title, style, body,
                extra_head='<link rel="canonical" href="https://sinerasaleslab.academy/gizlilik/">\n<meta name="robots" content="noindex">\n')
    (OUT / 'gizlilik' / 'index.html').write_text(html)


if __name__ == '__main__':
    print('regions:', build_main())
    build_privacy()
