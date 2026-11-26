// Global Education Karshi — bulut: bitta baza, hamma xodimlarning telefonlari (Firebase).
// config.js da firebase: null bo‘lsa, bu fayl hech narsa qilmaydi.
const cfg = window.GEK_CONFIG || {};
const CL = window.CLOUD;
const LISTS = ['students', 'groups', 'teachers', 'courses', 'payments', 'leads', 'mocks'];
const MAPS = ['att', 'hw'];
// what each role may read; the same split is enforced on the server by firestore.rules
const READS = {
  director: [...LISTS, ...MAPS],
  admin: [...LISTS, ...MAPS],
  teacher: ['students', 'groups', 'teachers', 'courses', 'mocks', 'att', 'hw']
};
const clean = (x) => JSON.parse(JSON.stringify(x));
const keyToId = (k) => k.replace('|', '~');
const idToKey = (id) => id.replace('~', '|');

if (cfg.firebase && CL) start().catch((e) => { console.error('[GEK cloud]', e); CL.err = 'offline'; window.render && render(); });

async function start() {
  const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const [A, Au, F] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
  const app = A.initializeApp(cfg.firebase);
  const auth = Au.getAuth(app);
  let db;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache() }); } catch (e) { db = F.getFirestore(app); }
  const cid = cfg.centerId || 'gek';
  const col = (name) => F.collection(db, 'centers', cid, name);
  const ref = (name, id) => F.doc(db, 'centers', cid, name, id);

  let unsub = [], remote = {}, loaded = new Set(), member = null, pushT = null, drawT = null;
  const over = {}; // our writes not yet confirmed: kept on top of incoming snapshots so nothing flickers back

  /* remote snapshot → the app's data object */
  function rebuild() {
    const d = { v: 2, mode: 'real' };
    LISTS.forEach((c) => { d[c] = [...(remote[c] || new Map()).values()].map((j) => JSON.parse(j)); });
    MAPS.forEach((c) => { d[c] = {}; (remote[c] || new Map()).forEach((j, id) => { d[c][idToKey(id)] = JSON.parse(j); }); });
    return d;
  }
  function redraw() {
    clearTimeout(drawT);
    drawT = setTimeout(() => {
      const a = document.activeElement;
      if (a && a.closest && a.closest('#root') && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return redraw(); // don't pull the page from under someone typing
      render();
    }, 250);
  }
  function listen(names) {
    names.forEach((c) => {
      remote[c] = new Map();
      unsub.push(F.onSnapshot(col(c), (snap) => {
        if (pushT) { clearTimeout(pushT); pushT = null; flush(); } // send our unsent edits before taking the other device's
        const m = new Map();
        snap.forEach((doc) => m.set(doc.id, JSON.stringify(c === 'att' || c === 'hw' ? doc.data() : { ...doc.data(), id: doc.id })));
        (over[c] || new Map()).forEach((j, id) => { if (j === null) m.delete(id); else m.set(id, j); });
        remote[c] = m; loaded.add(c);
        const fresh = rebuild();
        names.forEach((k) => { if (!loaded.has(k)) fresh[k] = (MAPS.includes(k) ? {} : []); });
        D = fresh;
        if (loaded.size === names.length) { if (!role) { role = member.role; if (member.teacherId) ME_TEACHER = member.teacherId; LS.set('gek-role', role); if (!ROLES[role].includes(location.hash.slice(1))) location.hash = ROLES[role][0]; } redraw(); }
      }, (err) => { console.error('[GEK cloud]', c, err); CL.status = 'offline'; }));
    });
  }

  /* app data → server: only documents that changed */
  async function flush() {
    if (!member || !D) return;
    const names = READS[member.role].filter((c) => member.role !== 'teacher' || MAPS.includes(c));
    const ops = [];
    names.forEach((c) => {
      const old = remote[c] || new Map(), now = new Map();
      if (MAPS.includes(c)) Object.entries(D[c] || {}).forEach(([k, v]) => now.set(keyToId(k), JSON.stringify(clean(v))));
      else (D[c] || []).forEach((r) => now.set(r.id, JSON.stringify(clean(r))));
      now.forEach((j, id) => { if (old.get(id) !== j) ops.push(['set', c, id, j]); });
      old.forEach((j, id) => { if (!now.has(id)) ops.push(['del', c, id]); });
      remote[c] = now;
    });
    if (!ops.length) return;
    ops.forEach(([op, c, id, j]) => { (over[c] = over[c] || new Map()).set(id, op === 'set' ? j : null); });
    CL.status = 'syncing'; paintStatus();
    try {
      for (let i = 0; i < ops.length; i += 400) {
        const b = F.writeBatch(db);
        ops.slice(i, i + 400).forEach(([op, c, id, j]) => { if (op === 'set') { const v = JSON.parse(j); if (!MAPS.includes(c)) delete v.id; b.set(ref(c, id), v); } else b.delete(ref(c, id)); });
        await b.commit();
        ops.slice(i, i + 400).forEach(([op, c, id, j]) => { if (over[c] && over[c].get(id) === (op === 'set' ? j : null)) over[c].delete(id); });
      }
      CL.status = 'synced';
    } catch (e) { console.error('[GEK cloud] write', e); CL.status = navigator.onLine ? 'error' : 'offline'; }
    paintStatus();
  }
  function paintStatus() {
    const el = document.getElementById('cloudSt'); if (!el) return;
    el.textContent = '☁ ' + t(CL.status === 'synced' ? 'synced' : CL.status === 'syncing' ? 'syncing' : 'offline');
  }

  Object.assign(CL, {
    push() { clearTimeout(pushT); pushT = setTimeout(() => { pushT = null; flush(); }, 300); },
    async uploadAll() { remote = Object.fromEntries([...LISTS, ...MAPS].map((c) => [c, new Map()])); await flush(); toast(t('uploaded')); },
    async signIn(email, pw) {
      CL.err = '';
      try { await Au.signInWithEmailAndPassword(auth, email, pw); } catch (e) { CL.err = 'signInErr'; render(); }
    },
    async signOut() { unsub.forEach((u) => u()); unsub = []; member = null; CL.on = false; CL.user = null; role = ''; LS.set('gek-role', ''); await Au.signOut(auth); render(); }
  });

  Au.onAuthStateChanged(auth, async (user) => {
    unsub.forEach((u) => u()); unsub = []; remote = {}; loaded = new Set(); member = null;
    CL.user = user ? user.uid : null; CL.email = user ? user.email : '';
    if (!user) { CL.on = false; role = ''; render(); return; }
    render(); // "loading…"
    try {
      const m = await F.getDoc(ref('members', user.uid));
      member = m.exists() ? m.data() : null;
    } catch (e) { member = null; }
    if (!member || !READS[member.role]) { CL.err = 'noAccess'; await Au.signOut(auth); return; }
    CL.on = true; CL.name = member.name || user.email; CL.status = 'synced'; role = '';
    listen(READS[member.role]);
  });
  window.addEventListener('online', () => { CL.status = 'synced'; paintStatus(); });
  window.addEventListener('offline', () => { CL.status = 'offline'; paintStatus(); });
}
