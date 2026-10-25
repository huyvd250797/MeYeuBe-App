/* Conservative display-only repair for reversibly misdecoded UTF-8. Never writes models, IDs, attributes or storage. */
(function(w){'use strict';
 var extra=[8364,129,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,141,381,143,144,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,157,382,376];
 function score(s){return (s.match(/Ã.|Â.|á[º»]|ðŸ|â[€‚„€¦]/g)||[]).length}
 function repair(s){var original=String(s),value=original;if(!score(value))return value;for(var pass=0;pass<2;pass++){try{var bytes=Array.from(value).map(function(c){var n=c.codePointAt(0),i=extra.indexOf(n);if(n>255&&i<0)throw Error('not reversible');return '%'+(i>=0?i+128:n).toString(16).padStart(2,'0')}).join(''),next=decodeURIComponent(bytes);if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(next)||score(next)>=score(value))break;value=next}catch(e){break}}return value}
 function visit(root){if(!root||!root.isConnected)return;var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;while((node=walker.nextNode())){if(!node.parentElement||node.parentElement.closest('script,style,textarea,input,pre,code,[contenteditable]'))continue;var value=repair(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value}}
 var queued=new Set(),scheduled=false;function schedule(root){if(!root)return;queued.add(root);if(scheduled)return;scheduled=true;setTimeout(function(){scheduled=false;var roots=Array.from(queued);queued.clear();roots.forEach(visit)},0)}
 function start(){visit(document.body);new MutationObserver(function(records){records.forEach(function(r){if(r.type==='characterData')schedule(r.target.parentElement);else r.addedNodes.forEach(function(n){schedule(n.nodeType===1?n:n.parentElement)})})}).observe(document.body,{childList:true,subtree:true,characterData:true})}
 w.mybDisplayText={repair:repair};if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})(window);
