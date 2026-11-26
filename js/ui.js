// Global Education Karshi — menyu, yordamchi funksiyalar, kirish ekrani, karkas
/* ================= navigation ================= */
const ICON = {
  home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  journal: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  students: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.8 2.7 2.6 3 5.2"/>',
  mocks: '<path d="M12 3 2 8l10 5 10-5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/>',
  groups: '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  payments: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
  leads: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  schedule: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  teachers: '<circle cx="12" cy="7" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  parent: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
  manage: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
const ROLES = {
  director: ['home', 'journal', 'students', 'payments', 'mocks', 'groups', 'leads', 'schedule', 'teachers', 'reports', 'manage', 'parent'],
  admin: ['home', 'students', 'payments', 'mocks', 'leads', 'journal', 'groups', 'schedule', 'manage', 'parent'],
  teacher: ['journal', 'mocks', 'groups', 'schedule', 'students'],
  parentR: ['parent']};
const ROLE_ICON = { director: 'reports', admin: 'payments', teacher: 'journal', parentR: 'parent' };
let role = LS.get('gek-role', '');
if (!ROLES[role]) role = '';
let ME_TEACHER = LS.get('gek-teacher', 't1');
const myGroups = () => role === 'teacher' ? D.groups.filter((g) => g.teacher === ME_TEACHER) : D.groups;
const mySid = (sid) => { const s = S(sid); return !!s && (role !== 'teacher' || s.groups.some((gid) => G(gid) && G(gid).teacher === ME_TEACHER)); };
const view = () => { const h = location.hash.slice(1); return ROLES[role].includes(h) ? h : ROLES[role][0]; };
const meName = () => role === 'teacher' ? (T(ME_TEACHER) || {}).name || t('teacher') : (window.CLOUD && CLOUD.name) || t(role);
const canEdit = () => role === 'director' || role === 'admin';

/* ================= helpers ================= */
let toastT;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
function closeAll() { $('#shade').classList.remove('on'); $('#drawer').classList.remove('on'); $('#modal').classList.remove('on'); }
function modal(title, body, bind) {
  const m = $('#modal');
  m.innerHTML = `<div class="bar" style="flex-wrap:nowrap"><h3 class="grow">${title}</h3><button class="x noprint" data-close aria-label="×">×</button></div>${body}`;
  $('#shade').classList.add('on'); m.classList.add('on'); bind && bind(m);
}
/* in-page confirmation (browser confirm() boxes are blocked in some frames and look foreign on phones) */
function ask(text, yes, onYes, title) {
  modal(title || yes, `<p style="margin:0">${esc(text)}</p><div class="bar" style="justify-content:flex-end"><button class="btn" data-close>${t('cancel')}</button><button class="btn p" id="askYes">${yes}</button></div>`,
    (m) => m.querySelector('#askYes').addEventListener('click', () => { closeAll(); onYes(); }));
}
async function copyText(text) { try { await navigator.clipboard.writeText(text); } catch (e) {} toast(t('copied')); }
/* a message to a parent: opens Telegram (choose the chat) or the phone's SMS app with the text already typed */
const digits = (p) => String(p || '').replace(/[^\d+]/g, '');
const sendBtns = (phone, text) => `<span class="bar" style="gap:6px;margin-top:8px"><a class="btn sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent('GEK')}&text=${encodeURIComponent(text)}">${t('sendTg')}</a>${digits(phone).length > 8 ? `<a class="btn sm" href="sms:${digits(phone)}?&body=${encodeURIComponent(text)}">${t('sendSms')}</a>` : ''}<button class="btn sm" data-copytext="${esc(text)}">${t('copy')}</button></span>`;

/* ================= login ================= */
const langSeg = () => `<div class="seg" role="group" aria-label="${t('lang')}">${['uz', 'ru', 'en'].map((l) => `<button class="${l === L ? 'on' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>`;
const brandRow = () => `<div class="bar" style="flex-wrap:nowrap"><div class="logo" style="width:52px;height:52px;font-size:20px">GE</div><div class="grow"><b style="font-size:20px;display:block;line-height:1.15">Global Education</b><span class="muted" style="font-size:15px">Karshi</span></div>${langSeg()}</div>`;
function startView() {
  return `<div class="login"><div class="lbox">${brandRow()}<p class="lead">${t('startTitle')}</p>
  <div class="roles"><button class="rolec" data-start="demo">${svg('reports')}<b>${t('startDemo')}</b><span>${t('startDemoD')}</span></button>
  <button class="rolec" data-start="real">${svg('home')}<b>${t('startReal')}</b><span>${t('startRealD')}</span></button></div></div></div>`;
}
function cloudLoginView() {
  return `<div class="login"><div class="lbox">${brandRow()}<p class="lead">${t('cloudLogin')}</p>
  <form id="cloudF" class="panel" style="display:grid;gap:12px"><div class="f"><label for="cEm">${t('email')}</label><input id="cEm" type="email" autocomplete="username" required></div>
  <div class="f"><label for="cPw">${t('password')}</label><input id="cPw" type="password" autocomplete="current-password" required></div>
  <p class="demo" id="cErr" style="color:var(--brick-ink)">${window.CLOUD && CLOUD.err ? esc(t(CLOUD.err)) : ''}</p>
  <button class="btn p">${t('signIn')}</button></form></div></div>`;
}
function loginView() {
  if (window.CLOUD && CLOUD.enabled) return CLOUD.user ? `<div class="login"><p class="lead">${t('loading')}</p></div>` : cloudLoginView();
  if (!D) return startView();
  return `<div class="login"><div class="lbox">${brandRow()}
  <p class="lead">${t('welcome')}</p>
  <div class="roles">${['director', 'admin', 'teacher', 'parentR'].map((r) => `<button class="rolec" data-role="${r}">${svg(ROLE_ICON[r])}<b>${t(r)}</b><span>${t({ director: 'directorD', admin: 'adminD', teacher: 'teacherD', parentR: 'parentD' }[r])}</span></button>`).join('')}</div>
  <p class="demo">${D.mode === 'demo' ? t('modeDemo') + ' · ' : t('modeReal') + ' · '}${t('demoLogin')}</p></div></div>`;
}
function pickTeacher() {
  if (!D.teachers.length) return toast(t('noTeachers'));
  if (D.teachers.length === 1) return enterAs('teacher', D.teachers[0].id);
  modal(t('whichTeacher'), `<div class="list">${D.teachers.map((x) => `<button class="row btn" data-asteacher="${x.id}" style="justify-content:flex-start;border:0;padding-left:0">${avatar(x.name)}<span class="grow" style="text-align:left"><b>${esc(x.name)}</b><small>${esc(x.subject || '')}</small></span></button>`).join('')}</div>`);
}
function enterAs(r, tid) {
  role = r; LS.set('gek-role', r);
  if (tid) { ME_TEACHER = tid; LS.set('gek-teacher', tid); }
  closeAll(); location.hash = ROLES[role][0]; render();
}

/* ================= shell ================= */
function shell() {
  const v = view(), r = ROLES[role], tabsN = r.length > 5 ? 4 : r.length;
  return `<div class="app">
  <aside class="side"><div class="brand"><div class="logo">GE</div><div><b>Global Education</b><small>Karshi</small></div></div>
    <nav class="nav">${r.map((k) => `<a href="#${k}" class="${k === v ? 'on' : ''}">${svg(k)}<span>${t(k)}</span></a>`).join('')}</nav>
    <div class="me">${avatar(meName(), 36)}<div class="grow"><b>${esc(meName())}</b><small>${t(role)} · ${window.CLOUD && CLOUD.on ? `<span id="cloudSt">☁ ${t(CLOUD.status === 'syncing' ? 'syncing' : CLOUD.status === 'synced' ? 'synced' : 'offline')}</span>` : t(D.mode === 'demo' ? 'modeDemo' : 'modeReal')}</small></div><button class="ibtn" data-settings aria-label="${t('settings')}">${svg('gear')}</button></div></aside>
  <div class="main"><header class="top">
    <div class="logo mlogo" style="width:36px;height:36px;font-size:14px">GE</div>
    <h1>${t(v)}${D.mode === 'demo' ? ` <span class="tag t-warn" style="vertical-align:middle">${t('modeDemo')}</span>` : ''}</h1>
    ${role === 'parentR' ? '<span class="grow"></span>' : `<div class="search">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'}<input id="q" type="search" autocomplete="off" placeholder="${t('search')}" aria-label="${t('search')}"><div class="sres" id="sres" hidden></div></div>`}
    <button class="ibtn mset" data-settings aria-label="${t('settings')}">${svg('gear')}</button>
  </header><div id="view"></div></div>
  <nav class="tabs" style="grid-template-columns:repeat(${Math.min(5, r.length > 5 ? 5 : r.length)},1fr)">${r.slice(0, tabsN).map((k) => `<a href="#${k}" class="${k === v ? 'on' : ''}">${svg(k)}<span>${t(k)}</span></a>`).join('')}${r.length > 5 ? `<button type="button" data-more>${svg('more')}<span>${t('more')}</span></button>` : ''}</nav></div>`;
}
