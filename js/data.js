// Global Education Karshi — namuna ma’lumotlar va hisob-kitoblar
/* ================= sample data ================= */
let seed = 7;
const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const TODAY = new Date(); TODAY.setHours(12, 0, 0, 0);
const TODAY_ISO = iso(TODAY);
const mkey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1);
const MONTH = mkey(TODAY);
const monthName = (k) => t('months')[+k.slice(5) - 1];
const dayName = (ds) => { const d = new Date(ds + 'T12:00'); return d.getDate() + ' ' + monthName(ds.slice(0, 7)).toLowerCase(); };
const wd = (d) => (d.getDay() + 6) % 7;
const ago = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() - n); return d; };
const phoneN = () => '+998 9' + pick(['0', '1', '3', '4', '7', '9']) + ' ' + (100 + Math.floor(rnd() * 900)) + ' ' + pad(Math.floor(rnd() * 100)) + ' ' + pad(Math.floor(rnd() * 100));
const half = (x) => Math.max(3, Math.min(9, Math.round(x * 2) / 2));
const overall = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length, f = Math.floor(m), r = m - f; return r < .25 ? f : r < .75 ? f + .5 : f + 1; };
const cefr = (s) => s >= 65 ? 'C1' : s >= 51 ? 'B2' : s >= 38 ? 'B1' : 'A2';

function build() {
  seed = 7;
  const first = ['Azizbek','Madina','Jasur','Dilnoza','Shahzod','Sevara','Bekzod','Malika','Sardor','Nilufar','Javohir','Zarina','Otabek','Gulnoza','Diyorbek','Shahnoza','Abdulloh','Mohinur','Islom','Muslima','Asadbek','Kamola','Behruz','Laylo','Sanjar','Mubina','Temur','Rayhona','Ulug‘bek','Charos','Firdavs','Oydin','Doniyor','Sabina','Ibrohim','Ziyoda'];
  const FEM = new Set(['Madina','Dilnoza','Sevara','Malika','Nilufar','Zarina','Gulnoza','Shahnoza','Mohinur','Muslima','Kamola','Laylo','Mubina','Rayhona','Charos','Oydin','Sabina','Ziyoda']);
  const last = ['Karimov','Rahimov','Tursunov','Xolmatov','Ergashev','Normatov','Qodirov','Abdullayev','Sultonov','Yusupov','Mamatqulov','Hamroyev','Jo‘rayev','Ismoilov','Boboyev','Nazarov','Shukurov','Raxmatov'];
  const person = () => { const f = pick(first); return f + ' ' + pick(last) + (FEM.has(f) ? 'a' : ''); };
  const teachers = [
    { id: 't1', name: 'Dilshod Tursunov', subject: 'IELTS', share: .45 }, { id: 't2', name: 'Sabina Karimova', subject: 'General English', share: .4 },
    { id: 't3', name: 'Shoxrux Nazarov', subject: 'Matematika', share: .4 }, { id: 't4', name: 'Nodira Ergasheva', subject: 'Kids English', share: .4 },
    { id: 't5', name: 'Akmal Rahimov', subject: 'Rus tili', share: .4 }, { id: 't6', name: 'Gulshan Yusupova', subject: 'SAT / DTM', share: .45 }];
  const courses = [
    { id: 'ielts', name: 'IELTS', price: 650000 }, { id: 'ge', name: 'General English', price: 450000 }, { id: 'kids', name: 'Kids English', price: 380000 },
    { id: 'math', name: 'Matematika (DTM)', price: 420000 }, { id: 'rus', name: 'Rus tili', price: 350000 }, { id: 'sat', name: 'SAT Math', price: 600000 }];
  const GG = [
    ['IELTS 6.5+', 'ielts', 't1', '201', 'odd', '16:00', 9, 6.2], ['IELTS Foundation', 'ielts', 't1', '201', 'even', '14:00', 11, 5],
    ['GE Elementary', 'ge', 't2', '102', 'odd', '14:00', 12, 0], ['GE Pre-Intermediate', 'ge', 't2', '102', 'even', '16:00', 10, 0],
    ['Kids Starters', 'kids', 't4', '101', 'odd', '10:00', 12, 0], ['Kids Movers', 'kids', 't4', '101', 'even', '10:00', 10, 0],
    ['Matematika DTM-1', 'math', 't3', '103', 'odd', '08:30', 13, 0], ['Matematika DTM-2', 'math', 't3', '103', 'even', '18:00', 11, 0],
    ['Rus tili A2', 'rus', 't5', '202', 'odd', '18:00', 9, 0], ['SAT Math', 'sat', 't6', '202', 'even', '12:00', 8, 0]];
  const students = [], groups = [];
  let sn = 0;
  GG.forEach((g, i) => {
    const grp = { id: 'g' + (i + 1), name: g[0], course: g[1], teacher: g[2], room: g[3], days: g[4], time: g[5], ids: [], base: g[7] };
    for (let k = 0; k < g[6]; k++) {
      const id = 's' + (++sn);
      students.push({ id, name: person(), phone: phoneN(), parent: pick(['mother', 'father']), pphone: phoneN(), groups: [grp.id], joined: iso(ago(Math.floor(rnd() * 330) + (k < 2 ? 0 : 20))),
        skip: rnd() < .12 ? .33 : .06, lazy: rnd() < .2 ? .45 : .1, payer: rnd(), lvl: g[7] ? g[7] + (rnd() - .5) * 1.4 : 0, cefrB: 34 + rnd() * 30 });
      grp.ids.push(id);
    }
    groups.push(grp);
  });
  for (let k = 0; k < 8; k++) { const s = students[Math.floor(rnd() * students.length)], g = pick(groups); if (!s.groups.includes(g.id)) { s.groups.push(g.id); g.ids.push(s.id); } }
  const att = {}, hw = {};
  for (let back = 40; back >= 1; back--) {
    const d = ago(back); if (wd(d) === 6) continue;
    groups.forEach((g) => {
      if (!lessonDay(g, d)) return;
      const key = g.id + '|' + iso(d), a = {}, h = {};
      g.ids.forEach((sid) => {
        const s = students.find((x) => x.id === sid); if (s.joined > iso(d)) return;
        const r = rnd(); a[sid] = r < s.skip ? 'a' : r < s.skip + .06 ? 'l' : 'p';
        if (a[sid] !== 'a') h[sid] = rnd() < s.lazy ? 'n' : 'y';
      });
      att[key] = a; hw[key] = h;
    });
  }
  const payments = []; let pn = 0;
  for (let m = 5; m >= 0; m--) {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - m, 3), mk = mkey(d);
    students.forEach((s) => s.groups.forEach((gid) => {
      const g = groups.find((x) => x.id === gid), price = courses.find((c) => c.id === g.course).price;
      if (s.joined.slice(0, 7) > mk) return;
      let part = 1;
      if (m === 0) part = s.payer < .62 ? 1 : s.payer < .76 ? .5 : 0; else if (s.payer > .97 && m === 1) part = .5;
      if (!part) return;
      const day = Math.min(28, 1 + Math.floor(rnd() * (m === 0 ? Math.max(1, TODAY.getDate()) : 15)));
      payments.push({ id: 'p' + (++pn), sid: s.id, gid, month: mk, amount: price * part, method: pick(['cash', 'cash', 'cash', 'card']), date: mk + '-' + pad(day) });
    }));
  }
  // mock exams run on the centre's mock website, imported here
  const mocks = [];
  const ieltsIds = groups.filter((g) => g.course === 'ielts').flatMap((g) => g.ids);
  const cefrIds = groups.filter((g) => g.course === 'ge').flatMap((g) => g.ids);
  [[36, 'IELTS', -.5], [15, 'CEFR', 0], [8, 'IELTS', 0]].forEach(([back, type, shift], i) => {
    const date = iso(ago(back)), rows = [];
    (type === 'IELTS' ? ieltsIds : cefrIds).forEach((sid) => {
      const s = students.find((x) => x.id === sid); if (s.joined > date || rnd() < .12) return;
      if (type === 'IELTS') { const b = s.lvl + shift; const sk = [half(b + .4 + rnd() * .6), half(b + rnd() * .6), half(b - .6 + rnd() * .5), half(b - .2 + rnd() * .6)]; rows.push({ sid, sk, ov: overall(sk) }); }
      else { const sc = Math.round(s.cefrB + rnd() * 6); rows.push({ sid, sc, lv: cefr(sc) }); }
    });
    mocks.push({ id: 'm' + (i + 1), type, date, source: 'site', rows });
  });
  const stages = ['new', 'new', 'new', 'call', 'call', 'call', 'trial', 'trial', 'won', 'won', 'won', 'lost', 'new', 'trial', 'won', 'call'];
  const leads = stages.map((st, i) => ({ id: 'l' + (i + 1), name: person(), phone: phoneN(), course: pick(courses).id, source: pick(['Instagram', 'Instagram', 'Telegram', 'Tanish orqali', 'Banner']), stage: st, ago: Math.floor(rnd() * 12) }));
  students.forEach((s) => { delete s.lvl; delete s.cefrB; });
  return { teachers, courses, groups, students, att, hw, payments, mocks, leads, v: 2, mode: 'demo' };
}
function lessonDay(g, d) { const w = wd(d); return w !== 6 && (g.days === 'all' || (g.days === 'odd' ? [0, 2, 4].includes(w) : g.days === 'even' && [1, 3, 5].includes(w))); }
/* a real centre starts empty and fills it in under "Boshqaruv" */
const emptyBase = () => ({ teachers: [], courses: [], groups: [], students: [], att: {}, hw: {}, payments: [], mocks: [], leads: [], v: 2, mode: 'real' });
const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);

let D;
try { D = JSON.parse(LS.get('gek-demo-v2', 'null')); } catch (e) { D = null; }
if (D && D.v !== 2) D = null;
if (D && !D.mode) D.mode = 'demo';
/* every change goes through persist(): saved on this device, and sent to the cloud when it is switched on */
const persist = () => { if (!D) return; LS.set('gek-demo-v2', JSON.stringify(D)); if (window.CLOUD && window.CLOUD.on) window.CLOUD.push(); };

/* ================= derived ================= */
const G = (id) => D.groups.find((g) => g.id === id);
const S = (id) => D.students.find((s) => s.id === id);
const T = (id) => D.teachers.find((x) => x.id === id);
const C = (id) => D.courses.find((c) => c.id === id);
const price = (gid) => C(G(gid).course).price;
const isOut = (s, mk) => s.left && s.left.slice(0, 7) < mk;
/* monthly fee for one student in one group, after his discount, rounded to 1 000 */
const fee = (sid, gid) => { const s = S(sid), d = (s && +s.discount) || 0; return Math.round(price(gid) * (1 - d / 100) / 1000) * 1000; };
const live = () => D.students.filter((s) => !s.left);
const tName = (id) => (T(id) || {}).name || '—';
const cName = (id) => (C(id) || {}).name || '—';
const gName = (id) => (G(id) || {}).name || '—';
const paidFor = (sid, gid, mk) => D.payments.filter((p) => p.sid === sid && p.gid === gid && p.month === mk).reduce((a, p) => a + p.amount, 0);
function dues(mk) {
  const out = [];
  D.students.forEach((s) => s.groups.forEach((gid) => {
    if (s.joined.slice(0, 7) > mk || isOut(s, mk) || !G(gid)) return;
    const need = fee(s.id, gid), got = paidFor(s.id, gid, mk);
    out.push({ s, g: G(gid), need, got, left: Math.max(0, need - got), st: got >= need ? 'paid' : got > 0 ? 'partial' : 'unpaid' });
  }));
  return out;
}
function rate(store, good, filter, days) {
  let ok = 0, n = 0; const from = iso(ago(days || 400));
  for (const key in store) {
    const [gid, ds] = key.split('|'); if (ds < from) continue;
    for (const sid in store[key]) { if (!filter(gid, sid)) continue; n++; if (good(store[key][sid])) ok++; }
  }
  return n ? Math.round(ok / n * 100) : null;
}
const attRate = (f, days) => rate(D.att, (v) => v !== 'a', f, days) ?? 100;
const hwRate = (f, days) => rate(D.hw, (v) => v === 'y', f, days) ?? 100;
const stAtt = (sid) => attRate((g, s) => s === sid, 30);
const stHw = (sid) => hwRate((g, s) => s === sid, 30);
const debtOf = (sid) => dues(MONTH).filter((x) => x.s.id === sid).reduce((a, x) => a + x.left, 0);
const mockRows = (sid) => D.mocks.filter((m) => m.rows.some((r) => r.sid === sid)).sort((a, b) => b.date.localeCompare(a.date)).map((m) => ({ m, r: m.rows.find((r) => r.sid === sid) }));
const COLORS = ['#c8371e', '#1f5f8b', '#2f7d4f', '#8a5a00', '#6b3fa0', '#0f766e', '#9d174d', '#4d5b1f'];
const colorOf = (n) => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) | 0; return COLORS[Math.abs(h) % COLORS.length]; };
const avatar = (n, size) => `<span class="av" style="background:${colorOf(n)}${size ? `;width:${size}px;height:${size}px;font-size:${Math.round(size / 3)}px` : ''}">${esc(n.split(' ').map((x) => x[0]).join('').slice(0, 2))}</span>`;
const stTag = (st) => `<span class="tag ${st === 'paid' ? 't-ok' : st === 'partial' ? 't-warn' : 't-bad'}">${t(st)}</span>`;
const pctTag = (p) => `<span class="tag ${p >= 90 ? 't-ok' : p >= 80 ? 't-warn' : 't-bad'}">${p}%</span>`;
const daysTxt = (g) => g.days === 'all' ? t('days_all').split(' (')[0] : t(g.days === 'odd' ? 'days_odd' : 'days_even');
const roomTxt = (g) => g.room ? ' · ' + t('room') + ' ' + g.room : '';
const bandCls = (b) => b >= 6.5 ? 'band hi' : b < 5 ? 'band lo' : 'band';
const parentWord = (p) => ({ uz: { mother: 'Onasi', father: 'Otasi' }, ru: { mother: 'Мама', father: 'Папа' }, en: { mother: 'Mother', father: 'Father' } }[L][p] || p);
