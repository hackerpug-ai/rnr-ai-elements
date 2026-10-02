import json, os, pathlib, subprocess, tempfile, shutil, hashlib, time
repo=pathlib.Path('/Users/justinrich/Projects/rnr-ai-elements')
source=repo/'.kb-run-sprint/worktrees/sprint-05-orient-search/FIX-ORI-SUITE-1'
output=pathlib.Path(__file__).parent
candidate='e2a734a64c0596d1ef82a69559951236d0db99ac'
scratch=pathlib.Path(tempfile.mkdtemp(prefix='suite1-review-'))
results={"candidate":candidate,"scratch":str(scratch),"checks":{}}
def run(name,args,cwd,env=None,required=False):
    t=time.time(); p=subprocess.run(args,cwd=cwd,env=env,text=True,capture_output=True,timeout=120)
    text=p.stdout+p.stderr
    (output/(name+'.log')).write_text(text)
    r={"command":args,"exit_code":p.returncode,"duration_seconds":round(time.time()-t,3),"log":str(output/(name+'.log'))}
    results['checks'][name]=r
    print(name,p.returncode,flush=True)
    if required and p.returncode: raise RuntimeError(text[-5000:])
    return p
before=subprocess.check_output(['git','rev-parse','main'],cwd=source,text=True).strip()
status_before=subprocess.check_output(['git','status','--porcelain'],cwd=source)
results['main_before']=before
results['status_before_sha256']=hashlib.sha256(status_before).hexdigest()
(output/'status-before.txt').write_bytes(status_before)
def clone(name,src,ref):
    d=scratch/name
    run(name+'-init',['git','init',str(d)],scratch,required=True)
    run(name+'-fetch',['git','fetch','--depth=1',src.as_uri(),ref],d,required=True)
    run(name+'-checkout',['git','checkout','--detach','FETCH_HEAD'],d,required=True)
    (d/'node_modules').symlink_to(source/'node_modules',target_is_directory=True)
    with (d/'.git/info/exclude').open('a') as f:f.write('\nnode_modules\n')
    return d
def selector(name,d):
    env=dict(os.environ,SUITE_REPAIR_PROOF_MODE='scope')
    env.pop('SUITE_REPAIR_EVIDENCE_CYCLE',None)
    return run(name,['pnpm','exec','vitest','run','tests/sprint-05-orient-search/suite-repair-proof.test.ts'],d,env)
try:
    d=clone('candidate',source,candidate)
    for n,args in [('shallow',['rev-parse','--is-shallow-repository']),('detached',['symbolic-ref','-q','HEAD']),('local-main',['show-ref','--verify','--quiet','refs/heads/main']),('depth',['rev-list','--count','HEAD']),('base-absent',['cat-file','-e','09123090d57f7747ac3760055a5932392b598351^{commit}'])]:
        run(n,['git',*args],d)
    selector('clean-scope',d)
    for name,path in [('source-tamper','tests/sprint-05-orient-search/search-contract.spec.ts'),('evidence-tamper','tests/sprint-05-orient-search/evidence/ORI-CI-001/manifest.json')]:
        p=d/path; original=p.read_bytes()
        try:
            p.write_bytes(original+b'\nreviewer tamper probe\n')
            selector(name,d)
        finally:p.write_bytes(original)
    # Real unrelated metadata commit followed by a new depth-1 detached fetch.
    p=d/'.review-metadata.txt';p.write_text('Independent review metadata only.\n')
    run('metadata-add',['git','add','.review-metadata.txt'],d,required=True)
    run('metadata-commit',['git','-c','user.name=Sprint checkpoint reviewer','-c','user.email=reviewer@localhost','commit','-m','test: independent review metadata probe'],d,required=True)
    sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=d,text=True).strip()
    m=clone('metadata',d,sha)
    selector('metadata-scope',m)
    # Test the actual recorded-boundary validator, without changing executable bytes.
    a=m/'.tmp/FIX-ORI-SUITE-1/cycle-5/scope-audit.json'; original=a.read_bytes()
    v=json.loads(original);v['boundaryProof']['changed']=[];v['boundaryProof']['proofRecords']=[]
    a.write_text(json.dumps(v,indent=2)+'\n')
    run('boundary-add',['git','add','.tmp/FIX-ORI-SUITE-1/cycle-5/scope-audit.json'],m,required=True)
    run('boundary-commit',['git','-c','user.name=Sprint checkpoint reviewer','-c','user.email=reviewer@localhost','commit','-m','test: contradictory recorded boundary probe'],m,required=True)
    sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=m,text=True).strip()
    f=clone('contradictory-boundary',m,sha)
    selector('contradictory-boundary-scope',f)
finally:
    results['main_after']=subprocess.check_output(['git','rev-parse','main'],cwd=source,text=True).strip()
    status_after=subprocess.check_output(['git','status','--porcelain'],cwd=source)
    results['status_after_sha256']=hashlib.sha256(status_after).hexdigest()
    (output/'status-after.txt').write_bytes(status_after)
    shutil.rmtree(scratch)
    results['scratch_removed']=not scratch.exists()
    (output/'probes.json').write_text(json.dumps(results,indent=2)+'\n')
