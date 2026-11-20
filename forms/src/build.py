import pathlib
d=pathlib.Path(__file__).resolve().parent
shell=(d/'shell.html').read_text()
css=(d/'style.css').read_text()
js='\n'.join((d/f).read_text() for f in ['core.js','docs.js','render.js','pages.js','main.js'])
out=shell.replace('/*CSS*/',css).replace('/*JS*/',js)
(d.parent/'index.html').write_text(out)
print(len(out))
