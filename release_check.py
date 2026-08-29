#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys, re
ROOT=Path(__file__).resolve().parent
errors=[]

def need(path, needle, label=None):
    p=ROOT/path
    if not p.exists(): errors.append(f'MISSING {path}'); return
    text=p.read_text(encoding='utf-8', errors='replace')
    if needle not in text: errors.append(f'{label or path}: missing {needle!r}')

def forbid(path, needle, label=None):
    p=ROOT/path
    if not p.exists(): return
    text=p.read_text(encoding='utf-8', errors='replace')
    if needle in text: errors.append(f'{label or path}: forbidden {needle!r}')

def node_check(path):
    p=ROOT/path
    try:
        r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True,timeout=30)
        if r.returncode: errors.append(f'node --check {path}: {r.stderr.strip()}')
    except Exception as e: errors.append(f'node --check {path}: {e}')

# Version / loading
need('app.js', 'APP_VERSION="15.0.78"', 'app version')
need('index.html', './relational-v1578.js?v=15.0.78', 'runtime load')
need('sw.js', './relational-v1578.js', 'service worker asset')
for f in ['index.html','boot.js','sw.js','manifest.webmanifest']:
    need(f,'15.0.78',f)
try:
    b=json.loads((ROOT/'build.json').read_text(encoding='utf-8'))
    if b.get('build')!='15.0.78': errors.append('build.json build != 15.0.78')
except Exception as e: errors.append(f'build.json invalid: {e}')

# The six legacy feature UI/runtime handlers are gone.
legacy_symbols=['rel62PreviewMigration','rel65RunDoctor','rel66RunDelta','rel67ToggleReadMode','rel68ToggleWriteMode','rel69PromotePrimary','rel70MilkIdentityDoctor']
for sym in legacy_symbols:
    for f in ['app.js','index.html']:
        forbid(f,sym,f'{f} legacy handler')
legacy_ui=['Migration JSON → Relational DB','Relational Migration Doctor','Relational Delta Sync','Relational Read Mode','Relational Write Queue','Đẩy dữ liệu chính thức','Milk Identity Doctor']
for txt in legacy_ui:
    forbid('index.html',txt,'index legacy UI')

# New DB-first runtime: direct RPC + authoritative refetch + realtime, no persistent write queue.
for token in ['myb_relational_apply_changes_v1576','myb_relational_export_state_v1576','myb_realtime_events','directSaveSnapshot','refreshAuthoritative','pendingPersistentWrites:0']:
    need('relational-v1578.js',token,'v1578 runtime')
for token in ['QUEUE_DB','indexedDB.open','qPut(','qAll(','qClear(']:
    forbid('relational-v1578.js',token,'persistent queue removed')

# Weight / decimal-comma repair.
need('app.js','inputmode="decimal"','health decimal input')
need('app.js',"return out.replace('.',',')",'measurement comma normalization')
need('app.js',"return s.replace('.',',')",'user-facing decimal formatter')
for token in ['abs(n) <= 100','health_measurements','weight_text','public.myb_num(p_text)']:
    need('SUPABASE_HOTFIX_V15.0.78_WEIGHT_DECIMAL.sql',token,'weight hotfix')
need('SUPABASE_SETUP.sql',"replace(p_text, ',', '.')",'comma parser')
need('SUPABASE_SETUP.sql','if abs(n) <= 100 then return round(n * 1000, 2); end if;','future schema weight rule')

# Obsolete top-level runtime files should not ship.
for f in ['relational-v1577.js','app.js.bak','index.html.bak','script0.js','script1.js','script2.js','script_inline_0.js','script_inline_1.js']:
    if (ROOT/f).exists(): errors.append(f'obsolete file still shipped: {f}')

# Syntax checks
for f in ['app.js','boot.js','relational-v1578.js','sw.js']:
    node_check(f)

if errors:
    print('RELEASE CHECK FAILED: V15.0.78')
    for e in errors: print(' -',e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V15.0.78')
