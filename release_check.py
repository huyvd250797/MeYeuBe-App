from pathlib import Path
import re,sys,json
root=Path(__file__).resolve().parent
errors=[]
idx=(root/'index.html').read_text(encoding='utf-8')
app=(root/'app.js').read_text(encoding='utf-8')
if idx.count('src="./app.js')!=1: errors.append('index.html phải nạp đúng một app.js')
if re.search(r'<script>(?:(?!</script>).){200,}</script>',idx,re.S): errors.append('Không được chứa business JavaScript inline lớn')
for f in ['script0.js','script_inline_0.js','script1.js','script2.js']: 
    if (root/f).exists(): errors.append('Còn file JavaScript trùng lặp: '+f)
for token in ['careMetrics','openCareEventFromDashboard','nextFeedHours','medicine','temperature','spitup','cloudRealtimeStart','cloudMergePayloads']:
    if token not in app: errors.append('Thiếu chức năng bắt buộc: '+token)
if 'care.feedMl<120' in app: errors.append('Còn cảnh báo bú hardcode <120 ml')
if "latestB&&latestB.weight?latestB.weight:(latestP" in app: errors.append('Còn fallback cân nặng thai sau sinh')
for f in ['index.html','app.js','manifest.webmanifest','sw.js','version.md']:
    if '10.6.0' not in (root/f).read_text(encoding='utf-8'): errors.append(f+' chưa đồng bộ version')
if errors:
    print('RELEASE CHECK FAILED')
    [print('- '+e) for e in errors]
    sys.exit(1)
print('RELEASE CHECK PASSED: V10.6.0')
