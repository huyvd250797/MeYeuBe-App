/* V16.0: extracted production renderer; global names are compatibility adapters. */
(function(w){'use strict';
function showAppLoading(){
  var l=byId('appLoading');
  if(!l)return;
  l.classList.add('show');
  l.setAttribute('aria-hidden','false');
}

function hideAppLoading(){
  if(window.mybStartupGate&&!window.mybStartupGate.ready)return;
  var l=byId('appLoading');
  if(!l)return;
  l.classList.remove('show');
  l.setAttribute('aria-hidden','true');
}
mybUI.define('loading-show',{render:showAppLoading});
w.showAppLoading=function(){return mybUI.render.apply(null,['loading-show'].concat(Array.prototype.slice.call(arguments)))};
mybUI.define('loading-hide',{render:hideAppLoading});
w.hideAppLoading=function(){return mybUI.render.apply(null,['loading-hide'].concat(Array.prototype.slice.call(arguments)))};
})(window);
