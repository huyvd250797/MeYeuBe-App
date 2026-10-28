"""Build a verified source ZIP; omit local dependencies/output and reject legacy/private files."""
from pathlib import Path
import argparse,hashlib,json,re,subprocess,sys,zipfile
ROOT=Path(__file__).resolve().parent
VERSION=json.loads((ROOT/'build.json').read_text())['build']
ROOT_FILES={'.gitignore','.env.example','README.md','CHANGELOG.md','ROADMAP.md','package.json','package-lock.json','build.json','index.html','app.js','boot.js','sw.js','relational-v1577.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','favicon.png','release_check.py','build_release.py','20261026_1660_notifications.txt','20261026_1710_milk_insights.txt','CHECKSUMS_V'+VERSION+'.sha256'}
DOCS={'ARCHITECTURE_AUDIT_V17.7.0.json','ARCHITECTURE_AUDIT_V17.7.0.md','CLEANUP_METRICS_V17.7.0.json','STARTUP_BENCHMARK_V17.7.0.json','CSS_EXTRACTION_V16.1.0.json','NOTIFICATIONS_V16.6.0.md','CARE_WORKFLOW_V17.0.0.md','MILK_INSIGHTS_V17.1.0.md','VALIDATION_REPORT_V17.7.0.md','TEST_RESULTS_V17.7.0.json','PERFORMANCE_RESULTS_V17.7.0.json'}
MIGRATIONS={'20261025_1530_catalog_api.sql','20261025_1540_care_milk_api.sql','20261025_1550_health_growth_api.sql','20261025_1560_diary_planning_api.sql','20261025_1570_scoped_settings.sql','20261025_1590_scoped_realtime.sql','20261026_1640_media_storage.sql','20261026_1650_backup_restore.sql','20261026_1660_notifications.sql','20261026_1661_notification_scheduler.sql','20261026_1710_milk_insights.sql'}
IGNORED={'node_modules','.git','__pycache__','dist'}
def collect():
 files=[];seen={};errors=[]
 html=(ROOT/'index.html').read_text();runtime_references=set(re.findall(r'(?:src|href)="\./([^"?]+)',html))
 for p in sorted(ROOT.rglob('*')):
  rel=p.relative_to(ROOT);parts=rel.parts
  if any(x in IGNORED for x in parts):continue
  if not p.is_file():continue
  name=rel.as_posix()
  if p.is_symlink():errors.append('Unexpected file symlink: '+name);continue
  if 'input-only' in parts or p.name.startswith('me-yeu-be-db-'):errors.append('Private input/backup: '+name);continue
  if p.name.startswith('.env') and p.name!='.env.example':errors.append('Private environment file: '+name);continue
  allowed=(len(parts)==1 and (p.name in ROOT_FILES or re.fullmatch(r'test_[a-zA-Z0-9_]+\.js',p.name))) or parts[0] in {'src','tests'} or (parts[0]=='docs' and len(parts)==2 and p.name in DOCS) or name=='supabase/config.toml' or name.startswith('supabase/functions/') or (parts[:2]==('supabase','migrations') and len(parts)==3 and p.name in MIGRATIONS)
  if not allowed:errors.append('Unreviewed release file: '+name);continue
  if parts[0]=='src' and p.suffix in {'.js','.css'} and name not in runtime_references:errors.append('Unreferenced runtime file: '+name)
  if name.casefold() in seen:errors.append('Case-insensitive collision: '+name+' / '+seen[name.casefold()])
  seen[name.casefold()]=name;files.append(p)
 for name in ROOT_FILES-{'CHECKSUMS_V'+VERSION+'.sha256'}:
  if not (ROOT/name).is_file():errors.append('Missing '+name)
 for name in MIGRATIONS:
  if not (ROOT/'supabase/migrations'/name).is_file():errors.append('Missing migration '+name)
 if errors:raise SystemExit('\n'.join(errors))
 return files

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');parser.add_argument('--output',type=Path);args=parser.parse_args()
 files=collect()
 subprocess.run([sys.executable,str(ROOT/'release_check.py')],cwd=ROOT,check=True)
 if args.check:print('Release file allowlist PASS:',len(files),'files');return
 checksum=ROOT/('CHECKSUMS_V'+VERSION+'.sha256');files=[p for p in files if p!=checksum]
 checksum.write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(ROOT).as_posix()+'\n' for p in files));files.append(checksum)
 target=args.output or ROOT/'dist'/('MeYeuBe_v'+VERSION+'.zip');target=target.resolve();target.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(files):z.write(p,'MeYeuBe_v'+VERSION+'/'+p.relative_to(ROOT).as_posix())
 with zipfile.ZipFile(target) as z:
  assert z.testzip() is None
  for p in files:assert z.read('MeYeuBe_v'+VERSION+'/'+p.relative_to(ROOT).as_posix())==p.read_bytes()
 print(json.dumps({'path':str(target),'files':len(files),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}))
if __name__=='__main__':main()
