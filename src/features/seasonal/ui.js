(function(w,doc){
  'use strict';
  const {presets,ids,isDate,normalize,active} = w.mybSeasonalModel;
  const calendar = w.mybSeasonalCalendar;
  const key = 'mybSeasonalAppearance_v1';
  const illustration = w.mybSeasonalIllustration;
  const byId = id => doc.getElementById(id);
  const reduced = w.matchMedia?.('(prefers-reduced-motion: reduce)');
  const ui = byId('seasonForm');
  if(!ui) return;

  let config = read(), base, draft, selected = ids[0], liveScene, viewportVisible = true, previewVisible = true;
  let heroObserver, dayTimer, settingsOpen = false;

  function read(){
    try{return normalize(JSON.parse(localStorage.getItem(key)))}
    catch{return normalize(null)}
  }

  function paintHero(){
    const id = doc.documentElement.dataset.season;
    const host = doc.querySelector('#dashboard .bcHero');
    const motion = id && config.motion && !reduced?.matches ? config.themes[id].motion : 'still';
    if(!host || !id){
      heroObserver?.disconnect();
      illustration.remove(liveScene);
      liveScene = null;
      return;
    }
    if(liveScene?.dataset.art !== id || liveScene?.dataset.motion !== motion){
      illustration.remove(liveScene);
      liveScene = illustration.create(id,motion);
    }
    if(liveScene.parentNode !== host){
      host.append(liveScene);
      heroObserver?.disconnect();
      viewportVisible = !heroObserver || !byId('home')?.classList.contains('hidden');
      heroObserver?.observe(host);

    }
    updateRunning();
  }

  function updateRunning(){
    if(liveScene){
      const blocked = doc.hidden || !viewportVisible || byId('home')?.classList.contains('hidden')
        || doc.body.matches('.careModalOpen,.mybScrollLock,.mybBottomSheetLock,.menuOpen,.axOff');
      const value = String(!blocked);
      if(liveScene.dataset.running !== value) liveScene.dataset.running = value;
      illustration.setRunning(liveScene,!blocked);
    }
    const previewLayer = byId('seasonPreview')?.querySelector('.seasonScene');
    if(previewLayer){
      const value = String(!doc.hidden && previewVisible && !byId('seasonSettings').classList.contains('hidden') && !doc.body.classList.contains('axOff'));
      if(previewLayer.dataset.running !== value) previewLayer.dataset.running = value;
      illustration.setRunning(previewLayer,value === 'true');
    }
  }

  function updateDate(){
    const id = active(config,calendar.vietnamDate());
    if(id) doc.documentElement.dataset.season = id;
    else delete doc.documentElement.dataset.season;
    paintHero();
    w.clearTimeout(dayTimer);
    const msToMidnight = 86400000 - ((Date.now() + 25200000) % 86400000);
    dayTimer = w.setTimeout(updateDate,msToMidnight + 80);
  }

  function report(message){
    byId('seasonStatus').textContent = message;
  }

  function writePreview(){
    if(!draft) return;
    const card = byId('seasonPreview');
    const rule = draft.themes[selected];
    card.dataset.season = selected;
    card.dataset.seasonTone = byId('seasonPreviewTone').value;
    byId('seasonPreviewName').textContent = presets[selected].label;
    const motion = byId('seasonPreviewMotion').checked && !reduced?.matches ? rule.motion : 'still';
    const current = card.querySelector('.seasonScene');
    if(current?.dataset.art === selected && current.dataset.motion === motion){
      updateRunning();
      return;
    }
    illustration.remove(current);
    card.append(illustration.create(selected,motion));
    updateRunning();
  }

  function fillTheme(){
    const rule = draft.themes[selected];
    const motion = byId('seasonMotion');
    motion.replaceChildren(...[['still','Tĩnh'],...presets[selected].motions].map(([key,label]) => {
      const option = doc.createElement('option');
      option.value = key;
      option.textContent = label;
      return option;
    }));
    motion.value = rule.motion;
    byId('seasonThemeEnabled').checked = rule.enabled;
    byId('seasonFrom').value = rule.from;
    byId('seasonTo').value = rule.to;
    byId('seasonRecurring').checked = rule.recurring;
    byId('seasonDefaultDate').textContent = presets[selected].date;
    writePreview();
  }

  function startDraft(){
    config = read();
    base = normalize(config);
    draft = normalize(config);
    byId('seasonEnabled').checked = draft.enabled;
    byId('seasonMotionEnabled').checked = draft.motion;
    byId('seasonTheme').value = selected;
    byId('seasonPreviewTone').value = doc.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    byId('seasonPreviewMotion').checked = draft.motion;
    fillTheme();
    const current = active(config,calendar.vietnamDate());
    report(current ? 'Đang áp dụng ' + presets[current].label : 'Đang dùng giao diện thường.');
  }

  function copyFields(){
    const from = byId('seasonFrom').value;
    const to = byId('seasonTo').value;
    const recurring = byId('seasonRecurring').checked;
    if(!!from !== !!to || ((from || to) && (!isDate(from) || !isDate(to))) || (from && !recurring && from > to)){
      report('Nhập đủ hai ngày hợp lệ. Với lịch một lần, ngày kết thúc phải từ ngày bắt đầu trở đi.');
      return false;
    }
    draft.enabled = byId('seasonEnabled').checked;
    draft.motion = byId('seasonMotionEnabled').checked;
    draft.themes[selected] = {
      enabled:byId('seasonThemeEnabled').checked, motion:byId('seasonMotion').value,
      from,to,recurring:!!(from && recurring)
    };
    return true;
  }

  function save(event){
    event.preventDefault();
    if(!copyFields()) return;
    const next = read();
    ['enabled','motion'].forEach(field => {
      if(draft[field] !== base[field]) next[field] = draft[field];
    });
    ids.forEach(id => {
      const before = base.themes[id], after = draft.themes[id];
      ['enabled','motion'].forEach(field => {
        if(before[field] !== after[field]) next.themes[id][field] = after[field];
      });
      const fields = ['from','to','recurring'];
      if(fields.some(field => before[field] !== after[field])){
        fields.forEach(field => {next.themes[id][field] = after[field]});
      }
    });
    try{localStorage.setItem(key,JSON.stringify(normalize(next)))}
    catch{report('Thiết bị chưa lưu được cấu hình giao diện.');return}
    startDraft();
    updateDate();
    report('Đã lưu cấu hình giao diện trên thiết bị này.');
  }

  ids.forEach(id => {
    const option = doc.createElement('option');
    option.value = id;
    option.textContent = presets[id].label;
    byId('seasonTheme').append(option);
  });

  byId('seasonTheme').addEventListener('change',event => {
    if(!copyFields()){event.target.value = selected;return}
    selected = event.target.value;
    fillTheme();
    report('');
  });
  byId('seasonMotion').addEventListener('change',() => {
    draft.themes[selected].motion = byId('seasonMotion').value;
    writePreview();
  });
  byId('seasonPreviewTone').addEventListener('change',writePreview);
  byId('seasonPreviewMotion').addEventListener('change',writePreview);
  byId('seasonDefault').addEventListener('click',() => {
    byId('seasonFrom').value = '';
    byId('seasonTo').value = '';
    byId('seasonRecurring').checked = false;
    report('Đã chọn lịch mặc định. Bấm Lưu cấu hình để áp dụng.');
  });
  byId('seasonCancel').addEventListener('click',() => w.showPage('settings'));
  ui.addEventListener('submit',save);

  if(w.IntersectionObserver){
    new w.IntersectionObserver(([entry]) => {
      if(entry){previewVisible = entry.isIntersecting;updateRunning()}
    }).observe(byId('seasonPreview'));
    heroObserver = new w.IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === liveScene?.parentNode);
      if(entry){viewportVisible = entry.isIntersecting;updateRunning()}
    });
  }
  const state = new w.MutationObserver(updateRunning);
  state.observe(doc.body,{attributes:true,attributeFilter:['class']});
  state.observe(byId('home'),{attributes:true,attributeFilter:['class']});
  const settings = byId('seasonSettings');
  function syncSettings(){
    const visible = !settings.classList.contains('hidden');
    if(visible && !settingsOpen) startDraft();
    settingsOpen = visible;
    updateRunning();
  }
  new w.MutationObserver(syncSettings).observe(settings,{attributes:true,attributeFilter:['class']});
  syncSettings();

  doc.addEventListener('visibilitychange',() => {
    if(doc.hidden){w.clearTimeout(dayTimer);updateRunning()}
    else updateDate();
  });
  w.addEventListener('pageshow',updateDate);
  w.addEventListener('storage',event => {
    if(event.key === key || event.key === null){config = read();updateDate()}
  });
  reduced?.addEventListener?.('change',() => {paintHero();writePreview()});
  w.mybSeasonal = {paintHero};
  updateDate();
})(window,document);
