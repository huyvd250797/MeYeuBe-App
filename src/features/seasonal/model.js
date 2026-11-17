/* Shared seasonal presets. Higher priority wins when dates overlap. */
(function(root){
  'use strict';
  const presets = {
    birthday:{label:'Sinh nhật', date:'Boss chọn khoảng ngày', motions:[['confetti','Pháo giấy dịu'],['candles','Nến lung linh']]},
    beach:{label:'Nghỉ mát', date:'Boss chọn khoảng ngày', motions:[['wave','Nắng biển lấp lánh'],['clouds','Lá dừa & mây nhẹ']]},
    tet:{label:'Tết Nguyên đán', date:'23 tháng Chạp – 07 tháng Giêng âm lịch', motions:[['blossoms','Cánh mai thật rơi nhẹ'],['lantern','Đèn lồng thật đung đưa']]},
    reunification:{label:'30/04', date:'30/04 – 01/05 hằng năm', range:['04-30','05-01'], motions:[['flag','Cờ Việt Nam bay nhẹ'],['ribbon','Pháo hoa trên bầu trời']]},
    children:{label:'Quốc tế Thiếu nhi', date:'01/06 hằng năm', range:['06-01','06-01'], motions:[['balloons','Bóng bay nhẹ'],['stars','Sao sáng nhẹ']]},
    midautumn:{label:'Tết Trung thu', date:'13–16 tháng 8 âm lịch', motions:[['starLantern','Đèn ông sao đung đưa'],['clouds','Mây qua trăng']]},
    school:{label:'Khai giảng', date:'05/09 hằng năm', range:['09-05','09-05'], motions:[['plane','Máy bay giấy'],['chalk','Nét phấn hiện dần']]},
    halloween:{label:'Halloween', date:'31/10 hằng năm', range:['10-31','10-31'], motions:[['pumpkin','Bí ngô sáng dịu'],['bats','Dơi bay qua']]},
    teachers:{label:'20/11', date:'20/11 hằng năm', range:['11-20','11-20'], motions:[['petals','Cánh hoa trôi'],['heart','Ánh nắng trên sách']]},
    christmas:{label:'Giáng sinh', date:'24–25/12 hằng năm', range:['12-24','12-25'], motions:[['snow','Tuyết rơi nhiều lớp'],['flakes','Đèn cây thông lấp lánh']]},
    newyear:{label:'Tết Dương lịch',date:'01/01 hằng năm',range:['01-01','01-01'],motions:[['fireworks','Pháo hoa đêm'],['confetti','Ánh vàng lấp lánh']]},
    nguyentieu:{label:'Tết Nguyên Tiêu',date:'15/01 âm lịch',motions:[['lanternGlow','Đèn trời bay lên'],['moonClouds','Hoa đăng trôi trên hồ']]},
    womensday:{label:'Quốc tế Phụ nữ',date:'08/03 hằng năm',range:['03-08','03-08'],motions:[['butterflies','Bướm bay quanh bó hoa'],['petals','Cánh hoa hồng rơi']]},
    hungking:{label:'Giỗ Tổ Hùng Vương',date:'10/03 âm lịch',motions:[['heritageClouds','Cánh hoa đào rơi nhẹ'],['banners','Cờ hội lay động tự nhiên']]},
    doanngo:{label:'Tết Đoan Ngọ',date:'05/05 âm lịch',motions:[['dragonflies','Chuồn chuồn bay'],['summerLeaves','Lá xanh lay động và rơi']]},
    family:{label:'Ngày Gia đình Việt Nam',date:'28/06 hằng năm',range:['06-28','06-28'],motions:[['floatingHearts','Điểm nhấn gia đình ấm áp'],['homeGlow','Ánh đèn gia đình']]},
    vulan:{label:'Lễ Vu Lan',date:'15/07 âm lịch',motions:[['floatingLotus','Hoa đăng trôi'],['candlelight','Ánh nến lung linh']]},
    nationalday:{label:'Quốc khánh Việt Nam',date:'02/09 hằng năm',range:['09-02','09-02'],motions:[['flagWave','Cờ Tổ quốc tung bay'],['fireworks','Pháo hoa vàng']]},
    womenvn:{label:'Ngày Phụ nữ Việt Nam',date:'20/10 hằng năm',range:['10-20','10-20'],motions:[['rosePetals','Cánh hồng rơi'],['silkRibbon','Ánh hoa phản chiếu']]},
    culture:{label:'Ngày Văn hóa Việt Nam',date:'24/11 hằng năm',range:['11-24','11-24'],motions:[['lotusPetals','Cánh sen bay'],['brocade','Hào quang trống đồng']]}
  };
  const ids = ['tet','newyear','nguyentieu','womensday','hungking','reunification','doanngo','children','family','vulan','beach','nationalday','midautumn','school','womenvn','halloween','teachers','culture','christmas','birthday'];
  const priority = Object.keys(presets);

  function isDate(value){
    if(typeof value !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === value;
  }

  function normalize(raw){
    const result = {enabled:raw?.enabled !== false, motion:raw?.motion !== false, themes:{}};
    ids.forEach(id => {
      const src = raw?.themes?.[id];
      const from = isDate(src?.from) ? src.from : '';
      const to = isDate(src?.to) ? src.to : '';
      const recurring = src?.recurring === true;
      const range = from && to && (recurring || from <= to);
      const motions = presets[id].motions;
      result.themes[id] = {
        enabled:src?.enabled !== false,
        motion:src?.motion === 'still' || motions.some(([value]) => value === src?.motion) ? src.motion : motions[0][0],
        from:range ? from : '', to:range ? to : '', recurring:!!(range && recurring)
      };
    });
    return result;
  }

  function within(day, from, to){
    return from <= to ? day >= from && day <= to : day >= from || day <= to;
  }

  function matches(id, config, day, lunar){
    if(!config.enabled) return false;
    if(config.from && config.to){
      if(config.recurring) return within(day.slice(5), config.from.slice(5), config.to.slice(5));
      return day >= config.from && day <= config.to;
    }
    const range = presets[id].range;
    if(range) return within(day.slice(5), ...range);
    const periods = lunar[id];
    return !!periods && periods.some(([from,to]) => day >= from && day <= to);
  }

  let cachedYear, lunarWindows;
  function active(config, day){
    if(!config.enabled || !isDate(day)) return null;
    const year = Number(day.slice(0,4));
    if(year !== cachedYear){
      const current = root.mybSeasonalCalendar.holidays(year);
      const following = root.mybSeasonalCalendar.holidays(year+1);
      lunarWindows = {tet:[current.tet,following.tet],midautumn:[current.midautumn]};
      for(const id of ['nguyentieu','hungking','doanngo','vulan'])lunarWindows[id]=[current[id]];
      cachedYear = year;
    }
    return priority.find(id => matches(id, config.themes[id], day, lunarWindows)) || null;
  }

  root.mybSeasonalModel = {presets, ids, isDate, normalize, active};
})(typeof window === 'undefined' ? globalThis : window);
