const modules=["src/features/care/model.js", "src/features/care/form-controller.js", "src/features/health/model.js", "src/features/health/legacy-controller.js", "src/features/planning/legacy-controller.js", "src/features/dashboard/model.js"];
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),all=Array.from(html.matchAll(/<script src="\.\/([^"?]+)(?:\?[^" ]*)?"><\/script>/g),m=>m[1]);
const components=all.filter((f,i)=>(f.startsWith('src/ui/')||modules.includes(f))&&i<all.indexOf('app.js'));
function loadLegacy(w,root=path.join(__dirname,'..')){for(const file of components.concat('app.js'))w.eval(fs.readFileSync(path.join(root,file),'utf8'))}
module.exports={components,loadLegacy};
