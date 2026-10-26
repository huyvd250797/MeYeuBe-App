"""Structural/syntax checks for the current release. Business tests: npm test."""
from pathlib import Path
import json,subprocess,sys
from html.parser import HTMLParser
root=Path(__file__).resolve().parent
errors=[]
# Windows/macOS extraction must not collide on case-insensitive paths.
seen={}
for p in root.rglob('*'):
 if not p.is_file() or any(x in p.parts for x in ['node_modules','.git','__pycache__']):continue
 relative=p.relative_to(root).as_posix();key=relative.casefold()
 if key in seen:errors.append('Case-insensitive path collision: '+seen[key]+' / '+relative)
 else:seen[key]=relative
version=json.loads((root/'build.json').read_text())['build']
class Scripts(HTMLParser):
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='script' and d.get('src','').startswith('./'):
   src=d['src'].split('?')[0][2:]
   if not (root/src).is_file():errors.append('Missing script '+src)
parser=Scripts();parser.feed((root/'index.html').read_text())
import re
html=(root/'index.html').read_text();scripts=re.findall(r'<script src="\./([^"?]+)',html)
if len(scripts)!=len(set(scripts)):errors.append('Duplicate script entries')
if scripts.index('src/ui/runtime.js')>scripts.index('app.js'):errors.append('UI runtime must load before app.js')
for asset in scripts:
 if asset.startswith('src/') and './'+asset not in (root/'sw.js').read_text():errors.append('Missing service-worker asset '+asset)
for asset in re.findall(r'<link[^>]+href="\./([^"?]+\.css)',html):
 if not (root/asset).is_file():errors.append('Missing stylesheet '+asset)
 if './'+asset not in (root/'sw.js').read_text():errors.append('Missing cached stylesheet '+asset)
for name in ['app.js','boot.js','sw.js','relational-v1577.js','index.html','manifest.webmanifest']:
 if version not in (root/name).read_text():errors.append('Version mismatch '+name)
for p in list(root.glob('*.js'))+list(root.glob('src/**/*.js'))+list(root.glob('tests/*.cjs')):
 r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if r.returncode:errors.append(str(p.name)+': '+r.stderr)
for name in ['README.md','CHANGELOG.md','ROADMAP.md','package-lock.json','build_release.py','supabase/config.toml','docs/CSS_EXTRACTION_V16.1.0.json']:
 if not (root/name).is_file():errors.append('Missing '+name)
for p in root.glob('src/**/*.js'):
 if './'+p.relative_to(root).as_posix() not in (root/'sw.js').read_text():errors.append('Uncached runtime module '+str(p))
for p in root.glob('supabase/migrations/*.sql'):
 if any(x in p.name for x in ['preflight','doctor','rebuild','rescue']):errors.append('Obsolete migration in release '+p.name)
for p in root.rglob('*'):
 if any(x in p.parts for x in ['node_modules','.git','__pycache__']):continue
 if p.is_file() and (p.name.startswith('me-yeu-be-db-') or 'input-only' in p.parts):errors.append('Backup/input data in release '+str(p))
if list(root.glob('me-yeu-be-db-*.json')):errors.append('Personal backup in public root')
if errors:print('\n'.join(errors));sys.exit(1)
print('Release structure and JavaScript syntax PASS — '+version)
