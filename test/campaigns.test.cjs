const {test}=require('node:test'),assert=require('node:assert/strict');
const {createServer}=require('../server.cjs');
test('campaign cycle continues across uploads; feedback and telecaller isolation',async()=>{
 const crm=createServer({database:':memory:'}),server=crm.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const url='http://127.0.0.1:'+server.address().port+'/api/';
 let cookie='',csrf='';const call=async(path,method='GET',body)=>{const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json','Cookie':cookie,'X-CSRF-Token':csrf},body:body?JSON.stringify(body):undefined});const data=await r.json();return{status:r.status,data,cookie:r.headers.get('set-cookie')};};
 try{let r=await call('setup','POST',{name:'Admin',username:'admin',password:'test-password-123'});assert.equal(r.status,200);cookie=r.cookie.split(';')[0];csrf=r.data.csrf;
 const ids=[];for(let i=1;i<=5;i++){r=await call('users','POST',{name:'Agent '+i,username:'agent'+i,password:'test-password-123',role:'Agent'});assert.equal(r.status,200);ids.push(r.data.id);}
 r=await call('campaigns','POST',{name:'Small Database',channel:'Phone',status:'Active'});assert.equal(r.status,200);const cid=r.data.id;
 r=await call('campaign-team/'+cid,'PUT',{members:ids});assert.equal(r.status,200);
 const rows=Array.from({length:7},(_,i)=>({name:'Lead '+(i+1),phone:'+91900000000'+i}));r=await call('import-campaign','POST',{campaign_id:cid,rows:rows.slice(0,3)});assert.equal(r.data.imported,3);r=await call('import-campaign','POST',{campaign_id:cid,rows:rows.slice(3)});assert.equal(r.data.imported,4);
 const leads=(await call('leads')).data.sort((a,b)=>a.id-b.id);assert.deepEqual(leads.map(l=>l.assigned_user_id),[...ids,ids[0],ids[1]]);
 r=await call('import-campaign','POST',{campaign_id:cid,rows:[rows[0]]});assert.equal(r.data.duplicates,1);assert.equal((await call('campaign-teams')).data[0].cursor,7);
 r=await call('import-campaign','POST',{campaign_id:cid,rows:[{name:'Bad',phone:'invalid'}]});assert.equal(r.status,400);assert.equal((await call('leads')).data.length,7);
 r=await call('feedback/'+leads[0].id,'POST',{feedback:'Call Back',callback_at:'2999-01-01T12:00',notes:'Tomorrow'});assert.equal(r.status,200);assert.equal((await call('followups')).data.length,1);
 r=await call('feedback/'+leads[0].id,'POST',{feedback:'Call Back',callback_at:'2020-01-01T12:00'});assert.equal(r.status,400);
 r=await call('dids','POST',{name:'Primary',phone:'+918000000001',provider:'Test',status:'Active'});const did=r.data.id;assert.equal(r.status,200);
 r=await call('prepare-call/'+leads[0].id,'POST',{did_id:did});assert.equal(r.status,200);assert.ok(r.data.uri.startsWith('tel:'));
 r=await call('feedback/'+leads[0].id,'POST',{feedback:'Do Not Call'});assert.equal(r.status,200);assert.equal((await call('prepare-call/'+leads[0].id,'POST',{did_id:did})).status,409);
 r=await call('dids/'+did,'PUT',{name:'Primary',phone:'+918000000001',provider:'Test',status:'Flagged'});assert.equal(r.status,200);assert.equal((await call('prepare-call/'+leads[1].id,'POST',{did_id:did})).status,400);
 r=await call('feedback_options','POST',{name:'Site Visit Requested'});assert.equal(r.status,200);assert.equal((await call('feedback/'+leads[1].id,'POST',{feedback:'Site Visit Requested'})).status,200);
 const adminCookie=cookie,adminCsrf=csrf;r=await call('login','POST',{username:'agent1',password:'test-password-123'});cookie=r.cookie.split(';')[0];csrf=r.data.csrf;
 assert.equal((await call('leads')).data.length,2);assert.equal((await call('feedback/'+leads[1].id,'POST',{feedback:'Interested'})).status,403);assert.equal((await call('feedback/'+leads[5].id,'POST',{feedback:'Interested'})).status,200);assert.equal((await call('import-campaign','POST',{campaign_id:cid,rows})).status,403);assert.equal((await call('dids')).status,403);
 cookie=adminCookie;csrf=adminCsrf;const original=leads[5];assert.equal((await call('users','POST',{name:'Duplicate',username:'agent1',password:'test-password-123',role:'Agent'})).status,409);
 }finally{await new Promise(r=>server.close(r));crm.close();}
});
