/* V16.0: UI lifecycle only. No persistence, RPC or business-state ownership. */
(function(w){'use strict';
 if(w.mybUI)return;
 var definitions=new Map(),mounted=new Map(),locks=new WeakMap();
 function node(value){return typeof value==='string'?document.getElementById(value):value}
 function events(){var cleanup=[],disposed=false;return {
  on:function(target,type,selector,handler,options){target=node(target);if(typeof selector==='function'){options=handler;handler=selector;selector=null}if(disposed||!target)return;var callback=selector?function(e){var match=e.target&&e.target.closest&&e.target.closest(selector);if(match&&target.contains(match))handler(e,match)}:handler;target.addEventListener(type,callback,options);cleanup.push(function(){target.removeEventListener(type,callback,options)})},
  later:function(fn,ms){if(disposed)return;var id=setTimeout(function(){if(!disposed)fn()},ms);cleanup.push(function(){clearTimeout(id)});return id},
  dispose:function(){if(disposed)return;disposed=true;cleanup.splice(0).reverse().forEach(function(fn){fn()})}
 }}
 function define(name,spec){if(definitions.has(name))throw new Error('UI component already defined: '+name);definitions.set(name,spec)}
 function render(name){var spec=definitions.get(name);if(!spec||typeof spec.render!=='function')throw new Error('Unknown UI renderer: '+name);return spec.render.apply(null,Array.prototype.slice.call(arguments,1))}
 function mount(name,root,props){root=node(root);if(!root)return null;var spec=definitions.get(name);if(!spec)throw new Error('Unknown UI component: '+name);var roots=mounted.get(name);if(!roots){roots=new Map();mounted.set(name,roots)}roots.forEach(function(record,prior){if(!prior.isConnected)record.destroy()});var record=roots.get(root);if(record){record.update(props);return record}
  var scope=events(),current=props||{},instance;
  record={update:function(next){current=next||{};if(instance&&instance.update)instance.update(current);return record},destroy:function(){if(!roots.has(root))return;scope.dispose();try{if(instance&&instance.destroy)instance.destroy()}finally{roots.delete(root)}}};
  try{instance=spec.mount?spec.mount({root:root,events:scope,props:function(){return current}}):null;roots.set(root,record);record.update(current);return record}catch(e){scope.dispose();roots.delete(root);throw e}
 }
 function unmount(name,root){var roots=mounted.get(name),record=roots&&roots.get(node(root));if(record)record.destroy()}
 function lockControls(controls){var list=typeof controls==='string'?Array.from(document.querySelectorAll(controls)):Array.from(controls||[]),released=false;list.forEach(function(e){var state=locks.get(e);if(!state){state={count:0,disabled:e.disabled};locks.set(e,state)}state.count++;e.disabled=true});return function(){if(released)return;released=true;list.forEach(function(e){var state=locks.get(e);if(!state)return;if(--state.count===0){e.disabled=state.disabled;locks.delete(e)}})}}
 function capture(controls){return Array.from(controls||[]).map(function(e){return {id:e.id,node:e,value:e.value,checked:e.checked,start:e.selectionStart,end:e.selectionEnd}})}
 function restore(snapshot){(snapshot||[]).forEach(function(s){var e=s.id?document.getElementById(s.id):s.node;if(!e||!e.isConnected)return;e.value=s.value;e.checked=s.checked;if(typeof s.start==='number'&&typeof e.setSelectionRange==='function')try{e.setSelectionRange(s.start,s.end)}catch(ignore){}})}
 function status(id,host,message,state){host=node(typeof host==='function'?host():host)||document.body;var box=document.getElementById(id);if(!box){box=document.createElement('p');box.id=id}if(box.parentNode!==host)host.appendChild(box);box.classList.add('mybStatus');box.textContent=message||'';box.dataset.state=state||'idle';box.setAttribute('role',state==='error'?'alert':'status');return box}
 function action(options){var busy=false,state='idle';return {isBusy:function(){return busy},state:function(){return state},run:async function(work,done){if(busy)return false;busy=true;var release=function(){};try{release=lockControls(typeof options.controls==='function'?options.controls():options.controls);state='saving';if(options.busy)options.busy(true);if(options.status)options.status('Đang lưu…','saving');var value=await work();if(!value&&!options.acceptEmpty){state='idle';return false}if(options.success)await options.success(value,done);else if(done)await done(value);state='saved';return true}catch(e){state='error';if(options.error)options.error(e);else if(options.status)options.status(e.message,'error');return false}finally{try{if(options.busy)options.busy(false)}finally{busy=false;release()}}}}}
 var ready=document.readyState==='loading'?new Promise(function(resolve){document.addEventListener('DOMContentLoaded',resolve,{once:true})}):Promise.resolve();
 w.mybUI={ready:ready,define:define,render:render,mount:mount,unmount:unmount,events:events,forms:{lock:lockControls,capture:capture,restore:restore},status:status,action:action,components:function(){return Array.from(definitions.keys())},mountedCount:function(){var n=0;mounted.forEach(function(roots){n+=roots.size});return n}};
})(window);
