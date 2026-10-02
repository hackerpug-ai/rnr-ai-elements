import hashlib,json,os,pathlib,signal,socket,subprocess,tempfile,time,sys
root=pathlib.Path('/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/FIX-ORI-RN-003-3')
out=pathlib.Path(__file__).parent
originals=json.loads((out/'originals.json').read_text())
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()=='b38975b163aa71d748e604a74f1849824e562bfb'
for rel,note in originals.items():
 assert hashlib.sha256((root/rel).read_bytes()).hexdigest()==note['sha256'],rel
scratch=pathlib.Path(tempfile.mkdtemp(prefix='rnr-review-',dir=tempfile.gettempdir()))
baseenv=os.environ.copy();baseenv.pop('NODE_ENV',None);baseenv['TMPDIR']=str(scratch)
argv=['pnpm','exec','tsx','tests/sprint-05-orient-search/drive-web-return-proof.test.ts','--entry','runDriveWebReturnProof']
results=[]
def save_run(label,cmd,env,expect_failure=False):
 start=time.time()
 log=out/(label+'.log')
 with log.open('w') as f:
  proc=subprocess.Popen(cmd,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
  print(json.dumps({'phase':label,'pid':proc.pid,'log':str(log)}),flush=True)
  try: code=proc.wait(timeout=9000)
  except subprocess.TimeoutExpired:
   os.killpg(proc.pid,signal.SIGTERM)
   try: proc.wait(timeout=10)
   except subprocess.TimeoutExpired: os.killpg(proc.pid,signal.SIGKILL);proc.wait()
   code=124
 receipt=json.loads((root/'.tmp/FIX-ORI-RN-003-3/run.json').read_text())
 (out/(label+'.run.json')).write_text(json.dumps(receipt,indent=2)+'\n')
 green=root/'.tmp/FIX-ORI-RN-003-3/green.json'
 if green.exists() and not expect_failure:(out/(label+'.green.json')).write_bytes(green.read_bytes())
 for engine in ['nativewind','uniwind']:
  p=root/('tests/sprint-05-orient-search/evidence/ORI-RN-001/'+engine+'-install.txt')
  (out/(label+'.'+engine+'-install.txt')).write_bytes(p.read_bytes())
 result={'command':cmd,'exit':code,'elapsed_seconds':round(time.time()-start,3),'expected_failure':expect_failure,'scratch_root':str(scratch),'receipt':str(out/(label+'.run.json'))}
 results.append(result)
 (out/'commands.json').write_text(json.dumps(results,indent=2)+'\n')
 print(json.dumps({'phase':label,**result}),flush=True)
 if expect_failure:
  assert code!=0 and code!=124,'expected real browser launch failure'
  assert 'Executable doesn\'t exist' in log.read_text(),'failure was not real missing browser dependency'
 else:assert code==0,label+' failed'
 return receipt
try:
 diag=save_run('diagnostic',argv+['--mode','red'],baseenv)
 full=save_run('full-matrix',argv,baseenv)
 brokenenv=baseenv.copy();brokenenv['PLAYWRIGHT_BROWSERS_PATH']=str(scratch/'missing-browser-dependency')
 failure=save_run('browser-launch-failure',argv+['--mode','red'],brokenenv,True)
 calls=diag['diagnostic']['calls']+full['full_matrix']['calls']
 ports=[c['port'] for c in calls]
 import re
 failed_log=(out/'browser-launch-failure.log').read_text()
 ports += [int(p) for p in re.findall(r'drive diagnostic-uniwind-baseline http://127\.0\.0\.1:(\d+)',failed_log)]
 listeners=[]
 for port in ports:
  with socket.socket() as s:
   s.settimeout(.5)
   if s.connect_ex(('127.0.0.1',port))==0:listeners.append(port)
 remains=[str(p) for p in scratch.rglob('*') if p.is_dir() and (p.name.startswith('ori-rn-001-') or p.name.startswith('ori-rn-003-'))]
 audit={'ports_checked':ports,'listeners_remaining':listeners,'consumer_or_export_dirs_remaining':remains,'scratch_root':str(scratch)}
 (out/'cleanup-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
 assert not listeners and not remains,audit
 print(json.dumps({'cleanup':audit}),flush=True)
finally:
 for rel,note in originals.items():
  data=pathlib.Path(note['backup']).read_bytes()
  assert hashlib.sha256(data).hexdigest()==note['sha256']
  (root/rel).write_bytes(data)
 restored={rel:hashlib.sha256((root/rel).read_bytes()).hexdigest()==note['sha256'] for rel,note in originals.items()}
 status=subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True)
 (out/'restoration-audit.json').write_text(json.dumps({'restored':restored,'git_status':status},indent=2)+'\n')
 print(json.dumps({'restored':restored,'git_status':status}),flush=True)
