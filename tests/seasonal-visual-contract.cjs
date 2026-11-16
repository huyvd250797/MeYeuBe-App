const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'src/styles/seasonal.css'),'utf8');
const scene=css.match(/\/\* V17\.22\.4: full scenic illustration[\s\S]*?(?=html\[data-season\]:has\(\.bcHero \.seasonSceneReference\) body #dashboard \.bcHero:has\(\.seasonSceneReference\) \.bcHeroTop)/)?.[0]||'';
assert.ok(scene.includes('object-fit:contain;'),'hero image must contain the full scene');
assert.ok(scene.includes('filter:none;'),'hero image must not be filtered');
assert.ok(scene.includes('content:none!important;'),'hero overlay veil must stay disabled');
assert.ok(!scene.includes('object-fit:cover;'),'hero must never crop the photograph');
const responsive=css.match(/@media \(max-width:640px\)\{[\s\S]*?\n\}/)?.[0]||'';
assert.ok(!responsive.includes('68%'),'mobile scene must not be shrunk into 68% canvas');
for(const id of ['christmas','newyear','nationalday','tet','womensday','womenvn']){
  for(const layer of ['hero','header','accent']){
    const name=`${id}-photo-${layer}-v3.webp`;
    assert.ok(fs.statSync(path.join(root,'src/features/seasonal/art',name)).size>100,name);
  }
}
console.log('PASS: preserved full photo, no hero blur or occlusion, responsive frame, photo layers present');
