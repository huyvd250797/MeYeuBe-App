from pathlib import Path
import re, sys, subprocess, json

root=Path(__file__).resolve().parent
errors=[]
passes=[]

def check(condition, message):
    (passes if condition else errors).append(message)

idx=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
sql=(root/'supabase_setup.sql').read_text(encoding='utf-8')
manifest=(root/'manifest.webmanifest').read_text(encoding='utf-8')
sw=(root/'sw.js').read_text(encoding='utf-8')

check('10.6.0' in idx and '10.6.0' in app and '10.6.0' in manifest and '10.6.0' in sw, 'Version consistency V10.6.0')
check(idx.count('src="./app.js')==1, 'Single business JavaScript source')
check('supabase-js@2' in idx, 'Supabase JS client loaded')
check("var KEY='meYeuBePWA_v4'" in app, 'LocalStorage key preserved')
check('cloudRealtimeStart' in app and 'postgres_changes' in app and ".subscribe(" in app, 'Realtime subscription exists')
check("filter:'id=eq.'+cfg.syncId" in app, 'Realtime filtered by Sync ID')
check('_cloudDeviceId' in app and '_cloudRevision' in app and 'cloudApplyingRemote' in app, 'Loop prevention metadata exists')
check('cloudMergePayloads' in app and 'cloudMergeArray' in app, 'Conflict-aware array merge exists')
check("window.addEventListener('online'" in app and "visibilitychange" in app, 'Reconnect handlers exist')
check('alter publication supabase_realtime add table public.meyeube_sync' in sql, 'Realtime publication SQL exists')
check('replica identity full' in sql.lower(), 'Replica identity configured')
check('pushLocalToCloud' in app and 'pullCloudToLocal' in app and 'smartCloudSync' in app, 'Manual sync retained')
check('confirm(' in app and 'ĐẨY DỮ LIỆU LÊN CLOUD' in app and 'TẢI DỮ LIỆU CLOUD VỀ THIẾT BỊ' in app, 'Overwrite warnings retained')

required=['renderDashboard','renderCareTimeline','renderCareStats','renderMilkInventory','handleBabyAvatarUpload','exportDB','importDB','testCloudConnection']
for token in required:
    check(token in app, 'Regression module: '+token)

node=subprocess.run(['node','--check',str(root/'app.js')],capture_output=True,text=True)
check(node.returncode==0, 'JavaScript syntax')

if errors:
    print('HVUS V1.0 RELEASE GATE: FAILED')
    print('\nFAILED:')
    for e in errors: print('- '+e)
    sys.exit(1)

print('HVUS V1.0 RELEASE GATE: PASSED')
for p in passes: print('- PASS:',p)
