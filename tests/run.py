from pathlib import Path
import subprocess,sys,json,re
root=Path(__file__).resolve().parent.parent
allowed='--allow-baseline' in sys.argv
known={} # V15.4 fixes all eight inherited assertions; no exemptions.
commands=[['node','build_web.cjs'],['node','tests/dependency-lock.cjs'],['node','tests/build-lazy.cjs'],['node','tests/build-worker.cjs'],['node','tests/production-runtime.cjs'],['python3','release_check.py'],['python3','tests/package-cleanup.py']]+[['node',str(p)] for p in sorted(root.glob('test_*.js'))]+[['node','tests/cold-start.cjs'],['node','tests/data-safety.cjs'],['node','tests/catalog-sql.cjs'],['node','tests/catalog-runtime.cjs'],['node','tests/service-worker.cjs'],['node','tests/care-sql.cjs'],['node','tests/care-runtime.cjs'],['node','tests/health-sql.cjs'],['node','tests/health-runtime.cjs'],['node','tests/planning-sql.cjs'],['node','tests/planning-runtime.cjs'],['node','tests/scoped-sql.cjs'],['node','tests/scoped-runtime.cjs'],['node','tests/startup-v158.cjs'],['node','tests/realtime-sql.cjs'],['node','tests/realtime-runtime.cjs'],['node','tests/components.cjs'],['node','tests/components-runtime.cjs'],['node','tests/design-system.cjs'],['node','tests/performance.cjs'],['node','tests/pwa-reliability.cjs'],['node','tests/media-sql.cjs'],['node','tests/media-edge.cjs'],['node','tests/media-runtime.cjs'],['node','tests/backup-sql.cjs'],['node','tests/backup-runtime.cjs'],['node','tests/backup-ui.cjs'],['node','tests/notifications-rules.cjs'],['node','tests/notifications-sql.cjs'],['node','tests/notifications-edge.cjs'],['node','tests/notifications-scheduler.cjs'],['node','tests/notifications-ui.cjs'],['node','tests/notifications-runtime.cjs'],['node','tests/quality-accessibility.cjs'],['node','tests/care-workflow.cjs'],['node','tests/milk-insights.cjs'],['node','tests/form-footers.cjs'],['node','tests/ui-recovery.cjs'],['node','tests/feature-modules.cjs'],['node','tests/viewport-recovery.cjs'],['node','tests/fullscreen-detail.cjs'],['node','tests/form-viewport.cjs'],['node','tests/health-planning.cjs'],['node','tests/ui-consistency.cjs'],['node','tests/read-performance.cjs'],['node','tests/startup-performance.cjs']]
results=[];unexpected=0;known_count=0
for cmd in commands:
 name=Path(cmd[-1]).name;print('RUN '+name,flush=True)
 try:
  r=subprocess.run(cmd,cwd=root,capture_output=True,text=True,timeout=120)
  output=r.stdout+'\n'+r.stderr
  failed=[l.strip()[2:].split('  →')[0].strip() for l in output.splitlines() if l.strip().startswith('✗')]
  baseline=bool(r.returncode and name in known and set(failed)==known[name] and len(failed)==len(known[name]))
  if r.returncode and not baseline:unexpected+=1
  if baseline:known_count+=len(failed)
  status='KNOWN_BASELINE_FAILURE' if baseline else ('PASS' if r.returncode==0 else 'FAIL')
  results.append({'test':name,'exit':r.returncode,'status':status,'failed_checks':failed,'output':output})
  print(status+' '+name,flush=True)
 except subprocess.TimeoutExpired:
  unexpected+=1;results.append({'test':name,'status':'TIMEOUT'})
report={'version':'17.13.0','unexpected_failed_suites':unexpected,'known_baseline_failed_checks':known_count,'production_tested':False,'results':results}
(root/'docs/TEST_RESULTS_V17.13.0.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('Unexpected failed suites:',unexpected,'Known baseline failed checks:',known_count)
sys.exit(1 if unexpected or (known_count and not allowed) else 0)
