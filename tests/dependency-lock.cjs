// Compare the lockfile with installed package manifests, including transitive ranges.
// App release versions must never be substituted into third-party dependencies.
const fs=require('fs'),assert=require('assert/strict');
const lock=JSON.parse(fs.readFileSync('package-lock.json')),pkg=JSON.parse(fs.readFileSync('package.json'));
assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
let count=0;
for(const [location,item] of Object.entries(lock.packages)){
 if(!location)continue;
 const manifest=JSON.parse(fs.readFileSync(location+'/package.json'));
 assert.equal(item.version,manifest.version,location+' version');
 for(const field of ['dependencies','optionalDependencies','peerDependencies'])assert.deepEqual(item[field]||{},manifest[field]||{},location+' '+field);
 count++;
}
console.log('PASS '+count+' installed package manifests match lock versions and dependency ranges');
