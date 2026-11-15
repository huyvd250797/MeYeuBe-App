/* Vietnamese lunisolar dates, computed at UTC+7. New moon series from Meeus.
   Month numbering follows the Vietnamese calendar rules summarized by Hồ Ngọc Đức. */
(function(root){
  'use strict';
  const radians = Math.PI / 180;
  const civilOffset = 7 / 24;
  const synodicMonth = 29.530588853;
  const epoch = 2415021.076998695;
  const dayMs = 86400000;

  const toJulian = (year, month, day) => Date.UTC(year, month - 1, day) / dayMs + 2440588;
  const toIso = julian => new Date((julian - 2440588) * dayMs).toISOString().slice(0, 10);

  function newMoon(k){
    const t = k / 1236.85;
    const t2 = t * t, t3 = t2 * t;
    const sin = degree => Math.sin(degree * radians);
    const meanMoon = 2415020.75933 + 29.53058868 * k + .0001178 * t2 - .000000155 * t3
      + .00033 * sin(166.56 + 132.87 * t - .009173 * t2);
    const sun = 359.2242 + 29.10535608 * k - .0000333 * t2 - .00000347 * t3;
    const moon = 306.0253 + 385.81691806 * k + .0107306 * t2 + .00001236 * t3;
    const latitude = 21.2964 + 390.67050646 * k - .0016528 * t2 - .00000239 * t3;
    const l2 = 2 * latitude;
    const correction = (.1734 - .000393 * t) * sin(sun) + .0021 * sin(2 * sun)
      - .4068 * sin(moon) + .0161 * sin(2 * moon) - .0004 * sin(3 * moon)
      + .0104 * sin(l2) - .0051 * sin(sun + moon) - .0074 * sin(sun - moon)
      + .0004 * sin(l2 + sun) - .0004 * sin(l2 - sun)
      - .0006 * sin(l2 + moon) + .001 * sin(l2 - moon) + .0005 * sin(2 * moon + sun);
    const delta = t < -11
      ? .001 + .000839 * t + .0002261 * t2 - .00000845 * t3 - .000000081 * t * t3
      : -.000278 + .000265 * t + .000262 * t2;
    return Math.floor(meanMoon + correction - delta + .5 + civilOffset);
  }

  function solarTerm(day){
    const t = (day - .5 - civilOffset - 2451545) / 36525;
    const anomaly = (357.52910 + 35999.05030 * t - .0001559 * t * t - .00000048 * t ** 3) * radians;
    const mean = 280.46645 + 36000.76983 * t + .0003032 * t * t;
    const correction = (1.914600 - .004817 * t - .000014 * t * t) * Math.sin(anomaly)
      + (.019993 - .000101 * t) * Math.sin(2 * anomaly) + .000290 * Math.sin(3 * anomaly);
    return Math.floor((((mean + correction) % 360 + 360) % 360) / 30);
  }

  function monthEleven(year){
    const k = Math.floor((toJulian(year, 12, 31) - 2415021) / synodicMonth);
    return solarTerm(newMoon(k)) >= 9 ? newMoon(k - 1) : newMoon(k);
  }

  function leapOffset(k){
    let previous = solarTerm(newMoon(k + 1));
    for(let offset = 1; offset <= 13; offset++){
      const current = solarTerm(newMoon(k + offset + 1));
      if(current === previous) return offset;
      previous = current;
    }
    return 13;
  }

  function regularMonthCycle(year, month){
    const anchorYear = month < 11 ? year - 1 : year;
    const anchor = monthEleven(anchorYear);
    const k = Math.floor(.5 + (anchor - epoch) / synodicMonth);
    const offset = (month + 1) % 12;
    const hasLeap = monthEleven(anchorYear + 1) - anchor > 365;
    return k + offset + (hasLeap && offset >= leapOffset(k) ? 1 : 0);
  }

  function holidays(year){
    const firstCycle = regularMonthCycle(year, 1);
    const tet = newMoon(firstCycle);
    const mid = newMoon(regularMonthCycle(year, 8));
    return {
      tet:[toIso(newMoon(firstCycle - 1) + 22), toIso(tet + 6)],
      midautumn:[toIso(mid + 12), toIso(mid + 15)]
    };
  }

  function vietnamDate(now = Date.now()){
    return new Date(Number(now) + civilOffset * dayMs).toISOString().slice(0, 10);
  }

  root.mybSeasonalCalendar = {holidays, vietnamDate};
})(typeof window === 'undefined' ? globalThis : window);
