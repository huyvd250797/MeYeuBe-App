(function(w,doc){
  'use strict';
  const {presets,ids,isDate,normalize,active} = w.mybSeasonalModel;
  const calendar = w.mybSeasonalCalendar;
  const legacyKey = 'mybSeasonalAppearance_v1';
  const setting = 'seasonalAppearance';
  const illustration = w.mybSeasonalIllustration;
  const byId = id => doc.getElementById(id);
  const reduced = w.matchMedia?.('(prefers-reduced-motion: reduce)');
  const ui = byId('seasonForm');
  if(!ui) return;

  let config = normalize(null), shared = null, base, draft, editorTarget, selected = ids[0];
  let splashConfigResolved = false;
  let liveScene, viewportVisible = true, previewVisible = true;
  let heroObserver, dayTimer, settingsOpen = false, saving = false, destination;
  let dashboardPreview = null, returningFromPreview = false;

  function connection(){
    const cloud = w.loadCloudConfig?.();
    return cloud?.enabled && cloud.url && cloud.anonKey && cloud.syncId
      ? w.mybDataClient.target(cloud) : null;
  }

  function legacyDraft(){
    try{return JSON.parse(localStorage.getItem(legacyKey))}
    catch{return null}
  }

  function acceptShared(settings){
    const target = connection();
    const value = target && settings?.[setting] ? normalize(settings[setting]) : null;
    if(target === destination && JSON.stringify(value) === JSON.stringify(shared)) return;
    destination = target;
    shared = value;
    config = normalize(value);
    splashConfigResolved = true;
    updateDate();
  }

  function paintHero(){
    const id = doc.documentElement.dataset.season;
    const host = doc.querySelector('#dashboard .bcHero');
    const previewMotion = dashboardPreview && dashboardPreview.id === id ? dashboardPreview.motion : null;
    const motion = id && !reduced?.matches
      ? (dashboardPreview ? previewMotion : (config.motion ? config.themes[id].motion : 'still'))
      : 'still';
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
    const actualId = active(config,calendar.vietnamDate());
    const id = dashboardPreview?.id || actualId;
    // The real Cloud-shared schedule is authoritative; update the startup
    // background without ever painting a seasonal scene on unrelated cards.
    if(splashConfigResolved && typeof w.mybSplashApply === 'function') w.mybSplashApply(actualId || '');
    if(id) doc.documentElement.dataset.season = id;
    else delete doc.documentElement.dataset.season;
    paintHero();
    w.clearTimeout(dayTimer);
    const msToMidnight = 86400000 - ((Date.now() + 25200000) % 86400000);
    dayTimer = w.setTimeout(updateDate,msToMidnight + 80);
  }

  // V17.22.48 — Real dashboard preview, fully local. The saved config and
  // Cloud-shared settings never change. Only DOM theme and animation selection
  // are temporarily overridden; on exit, updateDate() restores actual policy.
  function openDashboardPreview(){
    if(!draft || saving || !presets[selected]) return;
    if(dashboardPreview) closeDashboardPreview(false);
    dashboardPreview = {
      id:selected,
      motion:byId('seasonPreviewMotion').checked && byId('seasonMotion').value !== 'still'
        ? byId('seasonMotion').value : 'still',
      originalTone:doc.documentElement.dataset.theme,
      originalScroll:w.scrollY || 0
    };
    const tone = byId('seasonPreviewTone').value;
    if(tone==='light' || tone==='dark') doc.documentElement.dataset.theme=tone;
    doc.documentElement.dataset.season=dashboardPreview.id;
    w.showPage('home',null,true);
    byId('seasonDashboardPreviewLabel').textContent='Đang xem trước: '+presets[selected].label+' · Chưa lưu';
    byId('seasonDashboardPreviewBar').hidden=false;
    paintHero();
    updateRunning();
  }
  function closeDashboardPreview(returnToSettings){
    if(!dashboardPreview)return;
    const old = dashboardPreview;
    dashboardPreview=null;
    byId('seasonDashboardPreviewBar').hidden=true;
    if(old.originalTone)doc.documentElement.dataset.theme=old.originalTone;
    else delete doc.documentElement.dataset.theme;
    // Restore the live Cloud-authoritative theme and cached splash state.
    updateDate();
    if(returnToSettings){
      returningFromPreview=true;
      w.showPage('seasonSettings',null,true);
      w.requestAnimationFrame?.(() => {
        if(byId('seasonSettings') && !byId('seasonSettings').classList.contains('hidden'))
          w.scrollTo(0,old.originalScroll);
      });
    }
  }
  function openSplashPreview(){
    if(!draft || saving || !presets[selected])return;
    const overlay=byId('seasonSplashDemo');
    overlay.dataset.previewSeason=selected;
    overlay.hidden=false;
    overlay.setAttribute('aria-hidden','false');
    overlay.querySelector('[data-app-version]').textContent='V'+(byId('appLoading')?.querySelector('[data-app-version]')?.textContent||'17.22.64').replace(/^V/i,'');
    byId('seasonSplashDemoClose').focus();
  }
  function closeSplashPreview(){
    const overlay=byId('seasonSplashDemo');
    if(overlay.hidden)return;
    overlay.hidden=true;
    overlay.setAttribute('aria-hidden','true');
    delete overlay.dataset.previewSeason;
    byId('seasonPreviewSplashBtn')?.focus();
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
    editorTarget = connection();
    base = shared;
    const imported = !base && legacyDraft();
    draft = normalize(base || imported);
    byId('seasonEnabled').checked = draft.enabled;
    byId('seasonMotionEnabled').checked = draft.motion;
    byId('seasonTheme').value = selected;
    byId('seasonPreviewTone').value = doc.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    byId('seasonPreviewMotion').checked = draft.motion;
    fillTheme();
    const current = active(config,calendar.vietnamDate());
    report(imported ? 'Đã nạp cấu hình cũ của thiết bị vào bản nháp. Bấm Lưu để áp dụng chung.'
      : current ? 'Đang áp dụng ' + presets[current].label : 'Đang dùng giao diện thường.');
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

  async function save(event){
    event.preventDefault();
    if(saving || !copyFields()) return;
    if(!connection()){report('Bật Cloud Sync để lưu cấu hình chung.');return}
    if(connection() !== editorTarget){report('Kết nối đã đổi. Mở lại trang để chỉnh cấu hình.');return}
    if(!w.navigator.onLine){report('Mất mạng. Cấu hình chung chưa đổi. Hãy lưu lại khi có mạng.');return}

    const repo = w.mybSettingsRepository;
    const next = normalize(draft);
    const controls = [...ui.querySelectorAll('input,select,button')].filter(el => !el.disabled);
    saving = true;
    controls.forEach(el => {el.disabled = true});
    report('Đang lưu cấu hình chung…');
    try{
      const pending = repo.pending();
      if(pending){
        const value = pending.command?.patch?.other?.[setting];
        if(pending.target !== editorTarget || !value || JSON.stringify(normalize(value)) !== JSON.stringify(next)){
          report('Còn lần lưu chưa xác nhận. Kiểm tra kết quả lưu trước khi sửa tiếp.');
          return;
        }
        const repaired = await repo.recover();
        if(repaired && connection() === editorTarget)acceptShared(repaired.settings);
      }else{
        const latest = await repo.get();
        if(connection() !== editorTarget) throw new Error('Kết nối đã đổi. Mở lại trang để chỉnh cấu hình.');
        acceptShared(latest.settings);
        if(JSON.stringify(shared) !== JSON.stringify(base)){
          report('Cấu hình chung vừa đổi. Mở lại trang để xem bản mới rồi sửa tiếp.');
          return;
        }
        const result = await repo.save({...latest.settings,[setting]:next},latest.settings,latest.expected);
        acceptShared((result || latest).settings);
      }
      if(connection() !== editorTarget) throw new Error('Kết nối đã đổi. Mở lại trang để kiểm tra.');
      startDraft();
      report('Đã lưu cấu hình chung cho các thiết bị cùng kết nối.');
    }catch(error){
      report(error.message || 'Chưa lưu được cấu hình chung.');
    }finally{
      saving = false;
      controls.forEach(el => {el.disabled = false});
    }
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
  byId('seasonPreviewDashboardBtn').addEventListener('click',openDashboardPreview);
  byId('seasonDashboardPreviewClose').addEventListener('click',() => closeDashboardPreview(true));
  byId('seasonPreviewSplashBtn').addEventListener('click',openSplashPreview);
  byId('seasonSplashDemoClose').addEventListener('click',closeSplashPreview);
  doc.addEventListener('keydown',event => {
    if(event.key==='Escape'){
      if(!byId('seasonSplashDemo').hidden){closeSplashPreview();return}
      if(dashboardPreview){closeDashboardPreview(true)}
    }
  });
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
  new w.MutationObserver(() => {
    if(dashboardPreview && byId('home').classList.contains('hidden')) closeDashboardPreview(false);
  }).observe(byId('home'),{attributes:true,attributeFilter:['class']});
  const settings = byId('seasonSettings');
  function syncSettings(){
    const visible = !settings.classList.contains('hidden');
    if(visible && !settingsOpen){
      if(returningFromPreview){returningFromPreview=false;fillTheme();}
      else startDraft();
    }
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
  reduced?.addEventListener?.('change',() => {paintHero();writePreview()});
  w.mybSeasonal = {paintHero,acceptShared,openDashboardPreview,closeDashboardPreview,openSplashPreview,closeSplashPreview};
  updateDate();
})(window,document);
