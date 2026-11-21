"""把 src/ 的模組組合成單一檔案 forms/index.html。用法：python3 forms/src/build.py"""
import pathlib, sys
d = pathlib.Path(__file__).resolve().parent
shell = (d / 'shell.html').read_text(encoding='utf-8')
css = (d / 'style.css').read_text(encoding='utf-8')
order = ['core.js', 'model.js', 'finance.js', 'catalog.js', 'docs-meeting.js', 'docs-other.js', 'ui-fields.js', 'ui-sections.js', 'ui-views.js', 'seal.js', 'stamp.js', 'files.js', 'cloud.js', 'sample.js', 'main.js']
js = '\n'.join((d / f).read_text(encoding='utf-8') for f in order)
out = shell.replace('/*CSS*/', css).replace('/*JS*/', js)
target = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else d.parent / 'index.html'
target.write_text(out, encoding='utf-8')
print(target, len(out))
