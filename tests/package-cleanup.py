"""Exercise the packaging guard against accidental private and unused files."""
import importlib.util,shutil,tempfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('release_builder',root/'build_release.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
with tempfile.TemporaryDirectory(prefix='myb-clean-test-') as temp:
 copy=Path(temp)/'source';shutil.copytree(root,copy,ignore=shutil.ignore_patterns('node_modules','.git','dist','__pycache__'))
 builder.ROOT=copy
 assert builder.collect();print('PASS Clean source accepted')
 for name in ['input-only/records.json','me-yeu-be-db-private.json','.env','script0.js','docs/OLD_REPORT.json','supabase/migrations/old_reset.sql']:
  p=copy/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('test')
  try:builder.collect()
  except SystemExit:print('PASS Packaging rejects '+name)
  else:raise AssertionError('Unexpected file accepted: '+name)
  p.unlink()
 p=copy/'src/unused.js';p.write_text('/* unused */')
 try:builder.collect()
 except SystemExit as e:assert 'Unreferenced runtime' in str(e);print('PASS Unreferenced source module rejected')
 else:raise AssertionError('Unused runtime module accepted')
 p.unlink()
 assert builder.collect();print('PASS Original clean source still accepted')
print('RESULT 9 PASS / 0 FAIL')
