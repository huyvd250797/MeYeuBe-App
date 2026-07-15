from pathlib import Path
import re,sys,subprocess,json,hashlib
root=Path(__file__).resolve().parent
errors=[]
required_files=[
 'index.html','app.js','sw.js','manifest.webmanifest','supabase_setup.sql',
 'supabase/functions/send-push/index.ts','release-manifest.json','AC_V10.9.0.md',
 'SECURITY_AUDIT.md','test_v1090.py'
]
for f in required_files:
    if not (root/f).is_file(): errors.append('Thiếu file runtime/release: '+f)

def read(f):
    p=root/f
    return p.read_text(encoding='utf-8') if p.exists() else ''

idx,app,sw,manifest_txt=read('index.html'),read('app.js'),read('sw.js'),read('manifest.webmanifest')
if idx.count('src="./app.js')!=1: errors.append('index.html phải nạp đúng một app.js')
if re.search(r'<script>(?:(?!</script>).){200,}</script>',idx,re.S): errors.append('Còn business JavaScript inline lớn')
for f in ['script0.js','script_inline_0.js','script1.js','script2.js']:
    if (root/f).exists(): errors.append('Còn JavaScript trùng lặp: '+f)
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    if '10.9.0' not in read(f): errors.append(f+' chưa đồng bộ V10.9.0')
for token in ['APP_BUILD_HASH','createSafetyBackup','refreshStorageHealth','migrateAvatarToCloud',
              'toggleAdvancedMenu','cloudTransactionMeta','resolveBabyAvatar']:
    if token not in app: errors.append('Thiếu chức năng: '+token)
for token in ['release-manifest.json','Build:']:
    if token not in (idx+app+read('release_check.py')): errors.append('Thiếu kiểm soát build: '+token)
if 'meYeuBePWA_v4' not in app: errors.append('Đã thay đổi localStorage key')
if 'syncId:\'main\'' in app: errors.append('Còn mặc định Sync ID main')
if 'care.feedMl<120' in app: errors.append('Còn cảnh báo bú hardcode <120 ml')
if '<div class="careTypeBtn"' in idx: errors.append('Quick Add còn dùng div thay vì button')
if 'advancedMenuToggle' not in idx or 'advancedNavItem' not in idx: errors.append('Thiếu menu nâng cao')
if 'baby-assets' not in read('supabase_setup.sql'): errors.append('Thiếu cấu hình Storage avatar')
# manifest integrity
try:
    rm=json.loads(read('release-manifest.json'))
    if rm.get('version')!='10.9.0': errors.append('release-manifest sai version')
    for f,meta in rm.get('files',{}).items():
        p=root/f
        if not p.exists(): errors.append('Manifest tham chiếu file thiếu: '+f);continue
        actual=hashlib.sha256(p.read_bytes()).hexdigest()
        if actual!=meta.get('sha256'): errors.append('Checksum sai: '+f)
except Exception as e: errors.append('release-manifest không hợp lệ: '+str(e))
for js in ['app.js','sw.js']:
    r=subprocess.run(['node','--check',str(root/js)],capture_output=True,text=True)
    if r.returncode!=0: errors.append(js+' lỗi cú pháp: '+r.stderr.strip())
# runtime test must execute and pass; unavailable runtime is a hard failure
r=subprocess.run([sys.executable,str(root/'test_v1090.py'),'--runtime-only'],capture_output=True,text=True)
if r.returncode!=0: errors.append('Runtime gate FAIL: '+(r.stdout+r.stderr).strip())
if errors:
    print('RELEASE CHECK FAILED')
    for e in errors: print('- '+e)
    sys.exit(1)
print('RELEASE CHECK PASSED: V10.9.0')
