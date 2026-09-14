/* Loader + official resource-logo patch. The original application code lives in experience-core.js. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-intro{
      position:relative;
      overflow:hidden;
      margin:0 0 24px;
      padding:18px 18px 17px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:18px;
      background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 12px 32px rgba(0,0,0,.10);
    }
    .sidebar-intro::before{
      content:'';
      position:absolute;
      left:0;top:18px;bottom:18px;
      width:3px;
      border-radius:0 3px 3px 0;
      background:linear-gradient(#ffd84d,#8fb9ff);
      opacity:.95;
    }
    .sidebar-intro::after{
      content:'';
      position:absolute;
      width:120px;height:120px;
      right:-62px;top:-68px;
      border-radius:50%;
      background:radial-gradient(circle,rgba(109,166,255,.18),transparent 68%);
      pointer-events:none;
    }
    .sidebar-intro .eyebrow,
    .sidebar-intro > span:first-child{
      display:inline-flex;
      align-items:center;
      min-height:24px;
      padding:0 9px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:999px;
      background:rgba(4,20,37,.28);
      color:#9fc5f2;
      font-size:.64rem;
      font-weight:800;
      letter-spacing:.14em;
      text-transform:uppercase;
    }
    .sidebar-intro h2{
      max-width:170px;
      margin:15px 0 9px;
      color:#f4f8fd;
      font-size:1.12rem;
      font-weight:720;
      line-height:1.28;
      letter-spacing:-.025em;
      text-wrap:balance;
    }
    .sidebar-intro p{
      max-width:170px;
      margin:0;
      color:#a9c0d8;
      font-size:.79rem;
      line-height:1.55;
    }
    .constellation-layer{
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      z-index:1;
      pointer-events:none;
      opacity:.82;
    }
    @media (max-width:900px){
      .sidebar-intro{padding:14px 15px;margin-bottom:16px;border-radius:14px;}
      .sidebar-intro h2{max-width:none;font-size:1rem;margin:11px 0 6px;}
      .sidebar-intro p{max-width:none;}
    }
  `;
  document.head.append(style);

  const logoSpecs = {
    bpd: {type:'img', src:'https://legalaid.gov.ua/wp-content/themes/legalaidTheme/assets/img/icons/logo_2.svg'},
    diia: {type:'img', src:'https://guide.diia.gov.ua/static/img/logo-diia-black.svg'},
    unhcr: {type:'img', src:'https://help.unhcr.org/ukraine/wp-content/themes/help-v2/images/help-logo-en-en.png'},
    howareu: {type:'img', src:'https://howareu.com/static-objects/howareu/media/Logo.svg'},
    osvita: {type:'path', path:'M 20.009 0.5 c 5.315 0 8.736 0.133 11.144 0.586 c 2.444 0.46 3.873 1.255 5.189 2.57 c 1.325 1.325 2.121 2.753 2.579 5.194 c 0.45 2.404 0.579 5.82 0.579 11.131 c 0 5.313 -0.128 8.728 -0.58 11.132 c -0.457 2.44 -1.253 3.868 -2.577 5.192 c -1.315 1.325 -2.743 2.13 -5.188 2.597 c -2.408 0.46 -5.83 0.598 -11.146 0.598 c -5.315 0 -8.736 -0.133 -11.144 -0.586 c -2.443 -0.46 -3.873 -1.255 -5.19 -2.57 c -1.333 -1.333 -2.134 -2.766 -2.594 -5.21 C 0.628 28.729 0.5 25.313 0.5 20 s 0.133 -8.727 0.586 -11.132 c 0.46 -2.44 1.256 -3.868 2.57 -5.192 l 0.001 -0.001 C 4.982 2.35 6.416 1.55 8.862 1.088 C 11.272 0.632 14.694 0.5 20.01 0.5 Z m -9.974 17.875 c 0 1.034 -0.09 1.963 -0.246 2.734 c -0.153 0.762 -0.377 1.408 -0.67 1.846 l -0.148 0.223 h -0.525 v 2.582 h 0.552 v -2.124 h 6.874 v 2.124 h 0.552 v -2.582 h -1.127 v -8.254 h -5.262 Z m 8.77 -1.17 l 1.496 -0.013 l 0.669 -0.006 l -0.185 0.643 l -1.402 4.904 a 0.86 0.86 0 0 0 0.126 0.758 c 0.141 0.186 0.387 0.33 0.74 0.33 c 0.216 0 0.419 -0.046 0.69 -0.216 l 2.107 -1.43 l -0.215 -0.319 l -1.987 1.346 l -0.27 0.183 l -0.275 -0.173 l -0.149 -0.092 l -0.318 -0.2 l 0.103 -0.361 l 1.647 -5.789 h -2.653 Z m 8.483 -0.453 c -0.666 0 -1.194 0.216 -1.55 0.554 c -0.355 0.335 -0.573 0.818 -0.573 1.42 c 0 0.944 0.521 1.616 1.36 1.866 l 0.644 0.191 l -0.368 0.562 l -1.488 2.272 h 0.578 l 1.662 -2.543 l 0.148 -0.226 h 2.193 v 2.77 h 0.588 v -6.866 Z M 14.69 15.438 v 7.721 H 9.423 l 0.46 -0.76 c 0.167 -0.275 0.352 -0.802 0.493 -1.534 c 0.14 -0.72 0.23 -1.597 0.23 -2.546 v -2.881 Z m 15.166 1.699 V 20.5 h -2.902 v -0.084 a 1.6 1.6 0 0 1 -0.722 -0.406 c -0.316 -0.313 -0.48 -0.742 -0.48 -1.21 c 0 -0.469 0.165 -0.895 0.484 -1.204 s 0.75 -0.46 1.218 -0.46 Z m -8.221 -3.857 c -0.343 0 -0.466 0.069 -0.509 0.108 c -0.032 0.028 -0.1 0.114 -0.1 0.408 c 0 0.268 0.065 0.345 0.095 0.371 c 0.045 0.04 0.172 0.107 0.514 0.107 c 0.354 0 0.478 -0.07 0.518 -0.105 c 0.027 -0.024 0.09 -0.098 0.09 -0.373 c 0 -0.294 -0.068 -0.38 -0.1 -0.408 c -0.042 -0.04 -0.166 -0.108 -0.508 -0.108 Z'}
  };

  function applyLogo(card) {
    if (!(card instanceof Element)) return;
    const source = card.dataset.source;
    const spec = logoSpecs[source];
    const emblem = card.querySelector('.resource-emblem');
    if (!spec || !emblem || emblem.dataset.logoApplied === '1') return;
    emblem.dataset.logoApplied = '1';
    emblem.textContent = '';
    emblem.style.display = 'grid';
    emblem.style.placeItems = 'center';
    emblem.style.overflow = 'hidden';
    emblem.style.padding = '5px';
    emblem.style.background = '#fff';
    if (spec.type === 'img') {
      const img = document.createElement('img');
      img.src = spec.src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;';
      emblem.append(img); return;
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 40 40'); svg.setAttribute('aria-hidden','true');
    svg.style.cssText = 'display:block;width:100%;height:100%;fill:#111;stroke:none;';
    const path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d', spec.path); svg.append(path); emblem.append(svg);
  }

  function patchAll() { document.querySelectorAll('.resource-card[data-source]').forEach(applyLogo); }
  function installObserver() {
    patchAll();
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('.resource-card[data-source]')) applyLogo(node);
        node.querySelectorAll?.('.resource-card[data-source]').forEach(applyLogo);
      }
    });
    observer.observe(document.body, {childList:true, subtree:true});
    document.addEventListener('casebridge:catalog', () => requestAnimationFrame(patchAll));
  }

  function installConstellations() {
    const scene = document.querySelector('#welcomeScene');
    if (!scene || scene.querySelector('.constellation-layer')) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'constellation-layer';
    scene.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const constellations = [
      {
        name:'Ursa Major',
        stars:[[.08,.28,1.9],[.15,.24,1.55],[.22,.27,1.45],[.29,.31,1.65],[.36,.26,1.8],[.42,.22,1.45],[.48,.18,1.75]],
        lines:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]
      },
      {
        name:'Ursa Minor',
        stars:[[.57,.16,1.35],[.61,.19,1.15],[.65,.22,1.2],[.69,.25,1.35],[.73,.22,1.2],[.77,.18,1.3],[.81,.15,1.8]],
        lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
      },
      {
        name:'Canes Venatici',
        stars:[[.28,.56,1.7],[.36,.50,1.25],[.44,.54,1.85]],
        lines:[[0,1],[1,2]]
      },
      {
        name:'Cassiopeia',
        stars:[[.64,.47,1.55],[.70,.41,1.85],[.76,.48,1.55],[.82,.40,1.75],[.88,.46,1.45]],
        lines:[[0,1],[1,2],[2,3],[3,4]]
      },
      {
        name:'Draco',
        stars:[[.52,.72,1.3],[.58,.67,1.3],[.64,.69,1.2],[.69,.64,1.45],[.74,.68,1.2],[.79,.64,1.35],[.84,.68,1.2],[.88,.62,1.55]],
        lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]
      }
    ];

    const fieldStars = [
      [.05,.13,.75],[.12,.10,.65],[.18,.15,.8],[.24,.11,.55],[.31,.13,.65],[.39,.12,.75],[.46,.10,.6],[.53,.11,.7],[.91,.10,.7],[.95,.20,.6],
      [.05,.44,.6],[.13,.39,.55],[.21,.43,.7],[.49,.40,.55],[.56,.39,.65],[.92,.36,.55],[.96,.52,.75],[.06,.74,.7],[.15,.69,.55],[.23,.77,.65],
      [.34,.72,.6],[.43,.76,.7],[.49,.65,.55],[.91,.78,.65],[.96,.86,.55],[.12,.88,.6],[.20,.84,.55],[.29,.90,.7],[.38,.85,.55],[.47,.90,.65]
    ];

    let w=1,h=1,dpr=1,raf=0,start=performance.now();
    function resize(){
      const r=scene.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,2);
      w=Math.max(1,r.width);h=Math.max(1,r.height);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw();
    }
    function star(x,y,r,alpha){
      ctx.beginPath();ctx.fillStyle=`rgba(224,239,255,${alpha})`;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      const g=ctx.createRadialGradient(x,y,0,x,y,r*4.5);g.addColorStop(0,`rgba(205,229,255,${alpha*.35})`);g.addColorStop(1,'rgba(205,229,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*4.5,0,Math.PI*2);ctx.fill();
    }
    function draw(){
      const t=(performance.now()-start)/1000;
      ctx.clearRect(0,0,w,h);
      ctx.lineWidth=.75;
      ctx.strokeStyle='rgba(176,210,248,.18)';
      for(const c of constellations){
        for(const [a,b] of c.lines){
          const p=c.stars[a],q=c.stars[b];
          ctx.beginPath();ctx.moveTo(p[0]*w,p[1]*h);ctx.lineTo(q[0]*w,q[1]*h);ctx.stroke();
        }
        c.stars.forEach((s,i)=>star(s[0]*w,s[1]*h,s[2],.58+.25*Math.sin(t*.7+i*.9)**2));
      }
      fieldStars.forEach((s,i)=>star(s[0]*w,s[1]*h,s[2],.22+.16*Math.sin(t*.45+i)**2));
    }
    function tick(){draw();raf=requestAnimationFrame(tick);}
    const ro=new ResizeObserver(resize);ro.observe(scene);resize();tick();
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);ro.disconnect();},{once:true});
  }

  const script = document.createElement('script');
  script.src = './experience-core.js';
  script.onload = () => { installObserver(); installConstellations(); };
  script.onerror = () => console.error('CaseBridge-UA: failed to load experience-core.js');
  document.head.append(script);
})();
