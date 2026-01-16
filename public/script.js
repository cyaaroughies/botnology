 <script>
(function(){
  const $ = (id)=>document.getElementById(id);

  const API = {
    health: "/api/health",
    chat: "/api/chat",
    auth: "/api/auth",
    me: "/api/me",
    checkout: "/api/stripe/create-checkout-session"
  };

  function toast(title, msg){
    const t = $("toast");
    if(!t) return;
    $("toastTitle").textContent = title;
    $("toastMsg").textContent = msg;
    t.style.display = "block";
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> t.style.display = "none", 3800);
  }

  function uid(){
    return (Math.random().toString(16).slice(2) + Date.now().toString(16)).slice(0, 24);
  }

  function lsGet(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }catch{ return fallback; }
  }
  function lsSet(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function getToken(){ return localStorage.getItem("bn_token") || ""; }
  function setToken(t){ localStorage.setItem("bn_token", t || ""); }

  function getStudentId(){
    let id = localStorage.getItem("bn_student_id");
    if(!id){
      id = "BN-" + uid().toUpperCase();
      localStorage.setItem("bn_student_id", id);
    }
    return id;
  }

  function getPlan(){
    return (localStorage.getItem("bn_plan") || "associates").toLowerCase();
  }
  function setPlan(p){
    localStorage.setItem("bn_plan", (p || "associates").toLowerCase());
  }

  async function apiGet(url){
    const tok = getToken();
    const res = await fetch(url, {
      headers: tok ? { "Authorization": "Bearer " + tok } : {}
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  }

  async function apiPost(url, body){
    const tok = getToken();
    const res = await fetch(url, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        ...(tok ? {"Authorization":"Bearer " + tok} : {})
      },
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  }

  function openModal(){ const m = $("authModal"); if(m) m.style.display="flex"; }
  function closeModal(){ const m = $("authModal"); if(m) m.style.display="none"; }

  async function syncMe(){
    const badge = $("planBadge");
    try{
      const me = await apiGet(API.me);
      if(me.logged_in){
        setPlan(me.plan || getPlan());
        if(badge) badge.textContent = (me.plan || "associates").toUpperCase();
        const who = $("whoami");
        if(who) who.textContent = `${me.name} • ${me.student_id}`;
        return me;
  }

  async function doAuth(){
    const email = ($("authEmail")?.value || "").trim();
    const name = ($("authName")?.value || "Student").trim();
    const plan = ($("authPlan")?.value || getPlan()).toLowerCase();
    if(!email || email.length < 5) return toast("Hold up", "Enter a real email.");
    const student_id = getStudentId();

    const out = await apiPost(API.auth, { email, name, student_id, plan });
    setToken(out.token);
    setPlan(out.plan);
    closeModal();
    toast("Welcome", `Signed in • Plan: ${out.plan.toUpperCase()}`);
    await syncMe();
  }

  function renderMsg(role, text){
    const box = $("messages");
    if(!box) return;
    const d = document.createElement("div");
    d.className = "msg " + (role === "user" ? "user" : "assistant");
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }

  function getHistory(){
    return lsGet("bn_history", []);
  }
  function setHistory(h){
    lsSet("bn_history", h);
  }

  async function sendChat(){
    const input = $("chatInput");
    if(!input) return;
    const msg = (input.value || "").trim();
    if(!msg) return;

    input.value = "";
    renderMsg("user", msg);

    const h = getHistory();
    h.push({role:"user", content: msg});
    while(h.length > 20) h.shift();
    setHistory(h);

    const typing = "Dr. Botonic is thinking…";
    renderMsg("assistant", typing);
    const box = $("messages");
    const last = box?.lastElementChild;

    try{
      const out = await apiPost(API.chat, {
        message: msg,
        history: h,
        subject: (document.body.dataset.page === "dashboard") ? (lsGet("bn_subject","General")) : "General"
      });
      if(last) last.textContent = out.reply || "";
      h.push({role:"assistant", content: out.reply || ""});
      while(h.length > 20) h.shift();
      setHistory(h);
      if(out.plan) setPlan(out.plan);
      const badge = $("planBadge");
      if(badge) badge.textContent = (out.plan || getPlan()).toUpperCase();
    }catch(e){
      if(last) last.textContent = "I hit a snag. Check OPENAI_API_KEY and try again.";
      toast("Chat failed", String(e.message || e));
    }
  }

  function restoreChat(){
    const h = getHistory();
    if(!h.length) return;
    for(const m of h){
      if(m.role === "user") renderMsg("user", m.content);
      if(m.role === "assistant") renderMsg("assistant", m.content);
    }
  }

  async function health(){
    try{
      const out = await apiGet(API.health);
      const dot = $("healthDot");
      if(dot) dot.style.background = out.status === "ok" ? "rgba(191,230,208,.95)" : "rgba(255,120,120,.95)";
      const line = $("healthLine");
      if(line) line.textContent = `API: ${out.status} • OpenAI: ${out.openai ? "ON" : "OFF"} • Stripe: ${out.stripe ? "ON" : "OFF"}`;
    }catch{
      const line = $("healthLine");
      if(line) line.textContent = "API: OFFLINE";
    }
  }

  function parseCheckoutSuccess(){
    const u = new URL(location.href);
    const ok = u.searchParams.get("checkout");
    const plan = u.searchParams.get("plan");
    if(ok === "success" && plan){
      setPlan(plan);
      toast("Checkout complete", `Plan set to ${plan.toUpperCase()}.`);
      u.searchParams.delete("checkout");
      history.replaceState({}, "", u.toString());
    }
  }

  async function startCheckout(plan, cadence){
    const student_id = getStudentId();
    const email = ($("authEmail")?.value || localStorage.getItem("bn_email") || "").trim() || undefined;
    try{
      const out = await apiPost(API.checkout, { plan, cadence, student_id, email });
      location.href = out.url;
    }catch(e){
      toast("Stripe error", String(e.message || e));
    }
  }

  function dashboardInit(){
    const storeKey = "bn_drive_v1";
    const subjectKey = "bn_subject";

    const defaultDrive = {
      folders: [
        { id:"f-general", name:"General", files: [] },
        { id:"f-anatomy", name:"Anatomy", files: [] },
        { id:"f-math", name:"Math", files: [] },
        { id:"f-writing", name:"Writing", files: [] }
      ]
    };

    const drive = lsGet(storeKey, defaultDrive);
    const subject = lsGet(subjectKey, "General");
    lsSet(subjectKey, subject);

    const folderSel = $("folderSel");
    const fileSel = $("fileSel");
    const editor = $("editor");
    const subjectSel = $("subjectSel");

    if(subjectSel){
      subjectSel.value = subject;
      subjectSel.onchange = ()=>{ lsSet(subjectKey, subjectSel.value); toast("Subject set", subjectSel.value); };
    }

    function saveDrive(){ lsSet(storeKey, drive); }

    function refreshFolders(){
      if(!folderSel) return;
      folderSel.innerHTML = "";
      for(const f of drive.folders){
        const o = document.createElement("option");
        o.value = f.id;
        o.textContent = f.name;
        folderSel.appendChild(o);
      }
      if(!folderSel.value) folderSel.value = drive.folders[0]?.id || "";
      refreshFiles();
    }

    function refreshFiles(){
      if(!fileSel) return;
      fileSel.innerHTML = "";
      const folder = drive.folders.find(x=>x.id===folderSel.value) || drive.folders[0];
      if(!folder) return;

      for(const file of folder.files){
        const o = document.createElement("option");
        o.value = file.id;
        o.textContent = file.name;
        fileSel.appendChild(o);
      }
      if(folder.files.length){
        if(!fileSel.value) fileSel.value = folder.files[0].id;
        loadFile();
      }else{
        if(editor) editor.value = "";
      }
    }

    function loadFile(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      if(!folder) return;
      const file = folder.files.find(x=>x.id===fileSel.value);
      if(editor) editor.value = file ? (file.content || "") : "";
    }

    function saveFile(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      if(!folder) return;
      const file = folder.files.find(x=>x.id===fileSel.value);
      if(!file){ toast("No file", "Create a file first."); return; }
      file.content = editor ? (editor.value || "") : "";
      file.updated = Date.now();
      saveDrive();
      toast("Saved", file.name);
    }

    function newFile(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      if(!folder) return;
      const name = prompt("File name (example: Notes - Chapter 3)") || "";
      const clean = name.trim();
      if(!clean) return;
      const id = "file-" + uid();
      folder.files.unshift({ id, name: clean, content:"", updated: Date.now() });
      saveDrive();
      refreshFiles();
      fileSel.value = id;
      loadFile();
      toast("Created", clean);
    }

    function newFolder(){
      const name = prompt("Folder name") || "";
      const clean = name.trim();
      if(!clean) return;
      const id = "f-" + uid();
      drive.folders.push({ id, name: clean, files: [] });
      saveDrive();
      refreshFolders();
      folderSel.value = id;
      refreshFiles();
      toast("Folder added", clean);
    }

    function delFile(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      if(!folder) return;
      const idx = folder.files.findIndex(x=>x.id===fileSel.value);
      if(idx < 0) return;
      const name = folder.files[idx].name;
      if(!confirm(`Delete "${name}"?`)) return;
      folder.files.splice(idx, 1);
      saveDrive();
      refreshFiles();
      toast("Deleted", name);
    }

    function downloadTxt(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      const file = folder?.files.find(x=>x.id===fileSel.value);
      if(!file) return toast("No file", "Create/select a file first.");
      const blob = new Blob([editor?.value || ""], {type:"text/plain;charset=utf-8"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/[^a-z0-9\-_ ]/gi,"").slice(0,80) + ".txt";
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href), 1200);
    }

    function downloadDoc(){
      const folder = drive.folders.find(x=>x.id===folderSel.value);
      const file = folder?.files.find(x=>x.id===fileSel.value);
      if(!file) return toast("No file", "Create/select a file first.");
      const html = `
        <html><head><meta charset="utf-8"></head>
        <body><pre style="font-family:Calibri,Arial; white-space:pre-wrap; line-height:1.4">${(editor?.value||"").replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre></body></html>`;
      const blob = new Blob([html], {type:"application/msword"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/[^a-z0-9\-_ ]/gi,"").slice(0,80) + ".doc";
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href), 1200);
    }

    folderSel && (folderSel.onchange = refreshFiles);
    fileSel && (fileSel.onchange = loadFile);

    $("btnSave") && ($("btnSave").onclick = saveFile);
    $("btnNewFile") && ($("btnNewFile").onclick = newFile);
    $("btnNewFolder") && ($("btnNewFolder").onclick = newFolder);
    $("btnDelFile") && ($("btnDelFile").onclick = delFile);
    $("btnTxt") && ($("btnTxt").onclick = downloadTxt);
    $("btnDoc") && ($("btnDoc").onclick = downloadDoc);

    refreshFolders();
  }

  function pricingInit(){
    const cadenceSel = $("cadenceSel");
    const c = cadenceSel ? cadenceSel.value : "monthly";
    $("buyAssociates") && ($("buyAssociates").onclick = ()=> startCheckout("associates", cadenceSel.value));
    $("buyBachelors") && ($("buyBachelors").onclick = ()=> startCheckout("bachelors", cadenceSel.value));
    $("buyMasters") && ($("buyMasters").onclick = ()=> startCheckout("masters", cadenceSel.value));
  }

  function pwaInit(){
    if(!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }

  function wireGlobal(){
    $("openAuth") && ($("openAuth").onclick = openModal);
    $("closeAuth") && ($("closeAuth").onclick = closeModal);
    $("doAuth") && ($("doAuth").onclick = ()=> doAuth().catch(e=>toast("Sign-in failed", String(e.message||e))));
    $("goDash") && ($("goDash").onclick = ()=> location.href="/dashboard.html");
    $("goPricing") && ($("goPricing").onclick = ()=> location.href="/pricing.html");
    $("goHome") && ($("goHome").onclick = ()=> location.href="/index.html");

    $("sendBtn") && ($("sendBtn").onclick = ()=> sendChat());
    $("chatInput") && ($("chatInput").addEventListener("keydown", (e)=>{
      if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendChat(); }
    }));
  }

  async function boot(){
    getStudentId();
    parseCheckoutSuccess();
    wireGlobal();
    pwaInit();
    await health();
    await syncMe();
    restoreChat();

    const page = document.body.dataset.page || "";
    if(page === "dashboard") dashboardInit();
    if(page === "pricing") pricingInit();
  }

  boot().catch(()=>{});
})();
</script>




