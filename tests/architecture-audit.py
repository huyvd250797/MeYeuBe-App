"""Static inventory; references/overrides are candidates, never dead-code proof."""
from pathlib import Path
import re,json,collections
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text()
order=re.findall(r'<script[^>]+src="([^"?]+)',html)
files=[]
for url in order:
 p=ROOT/url.removeprefix('./')
 if not p.is_file():continue
 s=p.read_text();declarations=[{'name':m[1],'line':s.count('\n',0,m.start())+1} for m in re.finditer(r'\bfunction\s+(\w+)\s*\(',s)]
 overrides=[{'name':m[1],'line':s.count('\n',0,m.start())+1} for m in re.finditer(r'\b(?:window|w)\.(\w+)\s*=\s*(?:\w+\s*=\s*)?(?:async\s+)?function',s)]
 files.append({'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'declarations':declarations,'globalOverrides':overrides})
owners=collections.defaultdict(list)
for f in files:
 for x in f['globalOverrides']:owners[x['name']].append({'file':f['path'],'line':x['line']})
handlers=sorted(set(re.findall(r'on(?:click|change|input|submit)="([^"]+)',html)))
report={'version':'17.18.1','method':'Lexical static inventory, nested scopes included. Not a call graph or runtime coverage. Handlers and aliases can refer indirectly; unreferenced does not mean dead.','scriptOrder':order,'files':files,'overrideChains':dict(owners),'inlineHandlerExpressions':handlers}
(ROOT/'docs/ARCHITECTURE_AUDIT_V17.18.1.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Inventory:',len(files),'internal scripts;',len(owners),'global override names')
