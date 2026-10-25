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
for name in ['app.js','boot.js','sw.js','relational-v1577.js','index.html','manifest.webmanifest']:
 if version not in (root/name).read_text():errors.append('Version mismatch '+name)
for p in list(root.glob('*.js'))+list(root.glob('src/**/*.js'))+list(root.glob('tests/*.cjs')):
 r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if r.returncode:errors.append(str(p.name)+': '+r.stderr)
for name in ['README.md','ROADMAP.md','CHANGELOG.md','package-lock.json','tests/data-safety.cjs','tests/cold-start.cjs','docs/DATA_SAFETY_V15.2.0.md','docs/DATA_ACCESS_V15.3.0.md','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js','supabase/migrations/20261025_1530_catalog_api.sql','supabase/migrations/20261025_1540_care_milk_api.sql','docs/DATA_ACCESS_V15.4.0.md','src/data/care-repository.js','src/features/care/service.js','src/features/care/ui.js','tests/care-sql.cjs','tests/care-runtime.cjs','tests/care-fixture.sql']:
 if not (root/name).is_file():errors.append('Missing '+name)
if list(root.glob('me-yeu-be-db-*.json')):errors.append('Personal backup in public root')
if errors:print('\n'.join(errors));sys.exit(1)
print('Release structure and JavaScript syntax PASS — '+version)
