(() => {
  const $ = (id) => document.getElementById(id);
  async function health(){
    try{
      const r = await fetch("/api/health");
      const j = await r.json();
      const line = $("healthLine");
      if(line) line.textContent = `API: ${j.status} • OpenAI: ${j.openai ? "ON":"OFF"} • Stripe: ${j.stripe ? "ON":"OFF"}`;
    }catch{
      const line = $("healthLine");
      if(line) line.textContent = "API: OFFLINE";
    }
  }
  function wire(){
    $("goHome") && ($("goHome").onclick = ()=> location.href="/");
    $("goPricing") && ($("goPricing").onclick = ()=> location.href="/pricing.html");
    $("goDash") && ($("goDash").onclick = ()=> location.href="/dashboard.html");
  }
  wire();
  health();
})();
