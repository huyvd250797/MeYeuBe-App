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
for name in ['app.js','boot.js','sw.js','relational-v1577.js','index.html','manifest.webmanifest']:
 if version not in (root/name).read_text():errors.append('Version mismatch '+name)
for p in list(root.glob('*.js'))+list(root.glob('src/**/*.js'))+list(root.glob('tests/*.cjs')):
 r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if r.returncode:errors.append(str(p.name)+': '+r.stderr)
for name in ['src/ui/runtime.js','src/ui/overlays.js','src/ui/components/dashboard.js','src/ui/components/care-timeline.js','src/ui/components/milk-inventory.js','src/ui/components/milk-picker.js','src/ui/components/care-form.js','src/ui/components/health-modal.js','src/ui/components/appointment-form.js','src/ui/render-coordinator.js','src/features/care/milk-selection-service.js','tests/components.cjs','tests/components-runtime.cjs','docs/COMPONENT_ARCHITECTURE_V16.0.0.md','supabase/migrations/20261026_1600_component_preflight.sql','src/data/realtime-repository.js','src/features/realtime/ui.js','src/features/care/milk-selection.js','supabase/migrations/20261025_1590_scoped_realtime.sql','tests/realtime-sql.cjs','tests/realtime-runtime.cjs','docs/SCOPED_REALTIME_V15.9.0.md','README.md','ROADMAP.md','CHANGELOG.md','package-lock.json','tests/data-safety.cjs','tests/cold-start.cjs','docs/DATA_SAFETY_V15.2.0.md','docs/DATA_ACCESS_V15.3.0.md','src/data/client.js','src/data/catalog-repository.js','src/features/catalog/service.js','src/features/catalog/ui.js','supabase/migrations/20261025_1530_catalog_api.sql','supabase/migrations/20261025_1540_care_milk_api.sql','docs/DATA_ACCESS_V15.4.0.md','src/data/care-repository.js','src/features/care/service.js','src/features/care/ui.js','tests/care-sql.cjs','tests/care-runtime.cjs','tests/care-fixture.sql','tests/health-fixture.sql','tests/health-sql.cjs','tests/health-runtime.cjs','src/data/health-repository.js','src/features/health/service.js','src/features/health/ui.js','supabase/migrations/20261025_1550_health_growth_api.sql','docs/DATA_ACCESS_V15.5.0.md','src/data/planning-repository.js','src/features/planning/service.js','src/features/planning/ui.js','supabase/migrations/20261025_1560_diary_planning_api.sql','tests/planning-fixture.sql','tests/planning-sql.cjs','tests/planning-runtime.cjs','docs/DATA_ACCESS_V15.6.0.md','src/data/settings-repository.js','src/data/scoped-repository.js','src/features/scoped/ui.js','supabase/migrations/20261025_1570_scoped_settings.sql','tests/scoped-sql.cjs','tests/scoped-runtime.cjs','tests/scoped-fixture.sql','docs/DATA_ACCESS_V15.7.0.md','src/data/cache.js','tests/startup-v158.cjs','docs/LEGACY_REMOVAL_V15.8.0.md','supabase/migrations/20261025_1580_legacy_preflight.sql']:
 if not (root/name).is_file():errors.append('Missing '+name)
if list(root.glob('me-yeu-be-db-*.json')):errors.append('Personal backup in public root')
if errors:print('\n'.join(errors));sys.exit(1)
print('Release structure and JavaScript syntax PASS — '+version)
