// Global Education Karshi — chizish va tugmalar
/* ================= render & events ================= */
function render() {
  document.documentElement.lang = L;
  if (!role || !D) { $('#root').innerHTML = loginView(); return; }
  $('#root').innerHTML = shell();
  const v = view();
  $('#view').innerHTML = V[v]();
  if (v === 'home' || v === 'reports') drawIncome();
  document.querySelectorAll('.scroll').forEach((x) => { if (x.querySelector('.reg')) x.scrollLeft = x.scrollWidth; });
  document.querySelectorAll('.chips').forEach((c) => { const on = c.querySelector('.on'); if (on) c.scrollLeft = on.offsetLeft - c.clientWidth / 2 + on.offsetWidth / 2; });
  const q = $('#q'); if (q) q.addEventListener('input', search);
}
function search() {
  const q = $('#q').value.trim().toLowerCase(), box = $('#sres');
  if (q.length < 2) { box.hidden = true; return; }
  const hits = D.students.filter((s) => mySid(s.id) && (s.name.toLowerCase().includes(q) || s.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) || s.groups.some((gid) => gName(gid).toLowerCase().includes(q)))).slice(0, 7);
  box.innerHTML = hits.length ? hits.map((s) => `<button type="button" data-res="${s.id}">${avatar(s.name)}<span><b>${esc(s.name)}</b><span class="muted">${esc(s.groups.map((gid) => gName(gid)).join(', '))}</span></span></button>`).join('') : `<p class="empty" style="padding:12px">${t('noRes')}</p>`;
  box.hidden = false;
}
function saveJournal() {
  const dr = J.draft, a = {}, h = {};
  for (const k in dr.a) if (dr.a[k]) a[k] = dr.a[k];
  for (const k in dr.h) if (dr.h[k] && a[k] !== 'a') h[k] = dr.h[k];
  D.att[dr.key] = a; D.hw[dr.key] = h; persist();
  const g = G(J.g), abs = Object.keys(a).filter((k) => a[k] === 'a'), no = Object.keys(h).filter((k) => h[k] === 'n');
  J.draft = null; render();
  if (abs.length + no.length) {
    modal(t('sentTitle'), `<p style="margin:0"><b>${abs.length + no.length}</b> ${t('sentTo')}</p><div style="display:grid;gap:8px;max-height:50vh;overflow:auto">
    ${abs.map((sid) => { const m = t('msgAbs', { n: S(sid).name, g: g.name }); return `<div class="msg">${esc(m)}<small>${esc(S(sid).pphone || '—')}</small>${sendBtns(S(sid).pphone, m)}</div>`; }).join('')}
    ${no.map((sid) => { const m = t('msgHw', { n: S(sid).name, g: g.name }); return `<div class="msg">${esc(m)}<small>${esc(S(sid).pphone || '—')}</small>${sendBtns(S(sid).pphone, m)}</div>`; }).join('')}</div><p class="demo">${t('sendHint')}</p>`);
  } else toast(t('saved'));
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('button,a,tr[data-st]'); if (!el) return;
  const d = el.dataset;
  if ('close' in d) { closeAll(); if (el.tagName !== 'A') return; }
  if (d.start) { D = d.start === 'demo' ? build() : emptyBase(); persist(); render(); return; }
  if (d.role) { if (d.role === 'teacher') return pickTeacher(); return enterAs(d.role); }
  if (d.asteacher) return enterAs('teacher', d.asteacher);
  if ('switchmode' in d) return ask(t('switchQ'), t('switchYes'), () => { D = D.mode === 'demo' ? emptyBase() : build(); persist(); J = { g: null, d: null, step: 'att', mv: 'att', draft: null }; MS = null; PS = null; location.hash = ROLES[role][0]; render(); }, t('switchMode'));
  if (d.copytext) return copyText(d.copytext);
  if ('print' in d) { window.print(); return; }
  if (d.lang) { L = d.lang; LS.set('gek-lang', L); const open = $('#modal').classList.contains('on'); render(); if (open) settingsModal(); return; }
  if (d.themeSet) { THEME = d.themeSet; LS.set('gek-theme', THEME); applyTheme(); settingsModal(); return; }
  if ('settings' in d) return settingsModal();
  if ('logout' in d) { closeAll(); role = ''; LS.set('gek-role', ''); history.replaceState(null, '', location.pathname + location.search); if (window.CLOUD && CLOUD.on) return CLOUD.signOut(); render(); return; }
  if ('reset' in d) { D = build(); persist(); J = { g: null, d: null, step: 'att', mv: 'att', draft: null }; MS = null; PS = null; closeAll(); render(); toast(t('saved')); return; }
  if ('more' in d) return moreSheet();
  if (d.g) { J.g = d.g; J.d = null; J.step = 'att'; }
  if (d.jg) { J.g = d.jg; J.d = null; render(); return; }
  if (d.jd) { J.d = d.jd; render(); return; }
  if (d.step) { J.step = d.step; render(); window.scrollTo(0, 0); return; }
  if (d.mv) { J.mv = d.mv; render(); return; }
  if (d.openj) { J.g = d.openj; J.d = null; J.step = 'att'; location.hash = 'journal'; return; }
  if (d.v && el.parentElement.dataset.s) { const p = el.parentElement, k = p.dataset.k, sid = p.dataset.s, o = J.draft[k]; o[sid] = o[sid] === d.v ? undefined : d.v; render(); return; }
  if (el.id === 'allHere') { G(J.g).ids.forEach((sid) => { if (!J.draft.a[sid]) J.draft.a[sid] = 'p'; }); render(); return; }
  if (el.id === 'allDone') { G(J.g).ids.forEach((sid) => { if (J.draft.a[sid] !== 'a' && !J.draft.h[sid]) J.draft.h[sid] = 'y'; }); render(); return; }
  if (el.id === 'saveJ') return saveJournal();
  if (d.sf) { SF = d.sf; render(); return; }
  if (d.pf) { PF = d.pf; render(); return; }
  if (d.ms) { MS = d.ms; render(); return; }
  if (d.st) return openStudent(d.st);
  if (d.pay) { closeAll(); const [sid, gid] = d.pay.split('|'); return payModal(sid, gid); }
  if (d.remind) return remindModal([d.remind.split('|')]);
  if (el.id === 'remindAll') return remindModal(dues(MONTH).filter((x) => x.left > 0).map((x) => [x.s.id, x.g.id]));
  if (el.id === 'addSt') return studentModal();
  if (el.id === 'addLead') return leadModal();
  if (el.id === 'importM') return importModal('file');
  if (d.imp) return importModal(d.imp);
  if ('sitedemo' in d) { toast(t('siteDemo')); return; }
  if ('paylater' in d) { toast(t('payLater')); return; }
  if (d.lm) { const [id, step] = d.lm.split('|'); const l = D.leads.find((x) => x.id === id); l.stage = step === 'lost' ? 'lost' : STAGES[Math.max(0, Math.min(3, STAGES.indexOf(l.stage) + +step))]; persist(); render(); return; }
  if (d.sd) { SD = +d.sd; render(); return; }
  if (d.res) { return openStudent(d.res); }
  if (d.mt) { MT = d.mt; render(); return; }
  if (d.edit) { const [k, id] = d.edit.split('|'); return editModal(k, id || null); }
  if (d.delitem) { const [k, id] = d.delitem.split('|'); closeAll(); return deleteItem(k, id); }
  if (d.setup) { const i = +d.setup; if (i === 3) return studentModal(); MT = ['course', 'teacher', 'group'][i]; if (location.hash !== '#manage') history.pushState(null, '', '#manage'); render(); if ((i === 0 || D.courses.length) && (i < 2 || D.teachers.length)) editModal(MT, null); return; }
  if (d.edst) { closeAll(); return studentModal(d.edst); }
  if (d.arch) return archiveStudent(d.arch, false);
  if (d.unarch) return archiveStudent(d.unarch, true);
  if (d.tost) return leadToStudent(d.tost);
  if (d.receipt) { closeAll(); return receiptModal(d.receipt); }
  if (d.delpay) return ask(t('delQ'), t('yesDel'), () => { D.payments = D.payments.filter((p) => p.id !== d.delpay); persist(); render(); toast(t('saved')); }, t('delPay'));
  if (d.export) return exportCSV(d.export);
  if ('backup' in d) return backup();
  if ('upload' in d) return CLOUD.uploadAll();
});
if (window.GEK_CONFIG && GEK_CONFIG.firebase) window.CLOUD = { enabled: true, on: false, user: null, status: 'synced' };
$('#shade').addEventListener('click', closeAll);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); const b = $('#sres'); if (b) b.hidden = true; } });
document.addEventListener('change', (e) => { if (e.target.id === 'psel') { PS = e.target.value; render(); } if (e.target.id === 'restoreF' && e.target.files[0]) restoreFrom(e.target.files[0]); });
document.addEventListener('submit', (e) => { if (e.target.id === 'cloudF') { e.preventDefault(); CLOUD.signIn($('#cEm').value.trim(), $('#cPw').value); } });
window.addEventListener('hashchange', () => { closeAll(); if (role) { render(); window.scrollTo(0, 0); } });
render();
/* installable app: works when the site is opened from its own address (GitHub Pages), not inside a preview frame */
if ('serviceWorker' in navigator && location.protocol === 'https:' && window.top === window.self) { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} }
