    // --- Presets (dataURIs SVG y simples) ---
    const sampleBorder = `Runeterra/Overlay.png`

    // Champions
    const champions = {
        Ahri: `Champions/Ahri.png`,
        Blitz: `Champions/Blitz.png`,
        Braum: `Champions/Braum.png`,
        Darius: `Champions/Darius.png`,
        Ekko: `Champions/Ekko.png`,
        Illaoi: `Champions/Illaoi.png`,
        Jinx: `Champions/Jinx.png`,
        Vi: `Champions/Vi.png`,
        Yasuo: `Champions/Yasuo.png`,
    }

    // Backgrounds
    const backgrounds = {
        Bandle: `Runeterra/Bandle.png`,
        Bilgewater: `Runeterra/Bilgewater.png`,
        Jonia: `Runeterra/Jonia.png`,
        Noxus: `Runeterra/Noxus.png`,
        Piltover: `Runeterra/Piltover.png`,
        SerpentIsles: `Runeterra/SerpentIsles.png`,
        Zaun: `Runeterra/Zaun.png`
    }




    // Elements
    const borderFile = document.getElementById('borderFile');
    const borderPresets = document.getElementById('borderPresets');

    const bgLeftPresets = document.getElementById('bgLeftPresets');
    const logoLeftPresets = document.getElementById('logoLeftPresets');
    const bgLeftFile = document.getElementById('bgLeftFile');
    const logoLeftFile = document.getElementById('logoLeftFile');
    const leftOpacity = document.getElementById('leftOpacity');
    const leftOpacityVal = document.getElementById('leftOpacityVal');
    const leftScale = document.getElementById('leftScale');
    const leftScaleVal = document.getElementById('leftScaleVal');
    const leftRotation = document.getElementById('leftRotation');
    const leftRotationVal = document.getElementById('leftRotationVal');

    const bgRightPresets = document.getElementById('bgRightPresets');
    const logoRightPresets = document.getElementById('logoRightPresets');
    const bgRightFile = document.getElementById('bgRightFile');
    const logoRightFile = document.getElementById('logoRightFile');
    const rightOpacity = document.getElementById('rightOpacity');
    const rightOpacityVal = document.getElementById('rightOpacityVal');
    const rightScale = document.getElementById('rightScale');
    const rightScaleVal = document.getElementById('rightScaleVal');
    const rightRotation = document.getElementById('rightRotation');
    const rightRotationVal = document.getElementById('rightRotationVal');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('info');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // State
    let borderImage = null;
    let leftBg = null, rightBg = null;
    let leftLogo = null, rightLogo = null;
    const leftState = { x: 122, y: 535, scale: 0.87, rot: 0, opacity: 1 };
    const rightState = { x: canvas.width * 0.75, y: canvas.height / 2, scale: 1, rot: 0, opacity: 1 };
    let activeDrag = null; // 'left' or 'right' or null
    let dragging = false, dragStart = null;

    function makeThumb(src,alt, container, onClick) {
      const div = document.createElement('div'); 
      div.className = 'thumb';
      const img = document.createElement('img'); 
      
      img.src = src; 
      img.alt = alt
      div.appendChild(img);
      div.addEventListener('click', () => { [...container.children].forEach(c => c.classList.remove('selected')); div.classList.add('selected'); onClick(src); });
      container.appendChild(div);
    }

    // add presets
    //Overlay
    makeThumb(sampleBorder,null, borderPresets, (s) => loadBorderFromSrc(s));

    //Champions
    for (const champion in champions) {
        makeThumb(champions[champion],champion, logoLeftPresets, (s) => loadLeftLogoFromSrc(s));
        makeThumb(champions[champion],champion, logoRightPresets, (s) => loadRightLogoFromSrc(s));
    }

    //Backgrounds
    for (const background in backgrounds) {
        makeThumb(backgrounds[background],background, bgLeftPresets, (s) => loadLeftBgFromSrc(s));
        makeThumb(backgrounds[background],background, bgRightPresets, (s) => loadRightBgFromSrc(s));
    }



    // load helpers
    function loadImageFromFile(file, cb) {
      const reader = new FileReader();
      reader.onload = e => { const img = new Image(); img.onload = () => cb(img); img.src = e.target.result; }
      reader.readAsDataURL(file);
    }
    function loadBorderFromSrc(src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { borderImage = img; render(); updateInfo(); }; img.src = src; }
    function loadLeftBgFromSrc(src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { leftBg = img; render(); updateInfo(); }; img.src = src; }
    function loadRightBgFromSrc(src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { rightBg = img; render(); updateInfo(); }; img.src = src; }
    function loadLeftLogoFromSrc(src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { leftLogo = img; leftState.x = 122; leftState.y = 543; leftState.scale = 0.87; leftState.rot = 0; leftState.opacity = 1; render(); updateInfo(); }; img.src = src; }
    function loadRightLogoFromSrc(src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { rightLogo = img; rightState.x = 1000; rightState.y = 543; rightState.scale = 0.87; rightState.rot = 0; rightState.opacity = 1; render(); updateInfo(); }; img.src = src; }

    // file inputs
    borderFile.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; loadImageFromFile(f, img => { borderImage = img; render(); updateInfo(); }); });
    bgLeftFile.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; loadImageFromFile(f, img => { leftBg = img; render(); updateInfo(); }); });
    logoLeftFile.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; loadImageFromFile(f, img => { leftLogo = img; leftState.x = canvas.width * 0.25; leftState.y = canvas.height / 2; render(); updateInfo(); }); });
    bgRightFile.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; loadImageFromFile(f, img => { rightBg = img; render(); updateInfo(); }); });
    logoRightFile.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; loadImageFromFile(f, img => { rightLogo = img; rightState.x = canvas.width * 0.75; rightState.y = canvas.height / 2; render(); updateInfo(); }); });

    // controls events
    leftOpacity.addEventListener('input', () => { leftOpacityVal.textContent = leftOpacity.value + '%'; leftState.opacity = leftOpacity.value / 100; render(); });
    leftScale.addEventListener('input', () => { leftScaleVal.textContent = leftScale.value + '%'; leftState.scale = leftScale.value / 100; render(); });
    leftRotation.addEventListener('input', () => { leftRotationVal.textContent = leftRotation.value + '°'; leftState.rot = leftRotation.value * Math.PI / 180; render(); });
    rightOpacity.addEventListener('input', () => { rightOpacityVal.textContent = rightOpacity.value + '%'; rightState.opacity = rightOpacity.value / 100; render(); });
    rightScale.addEventListener('input', () => { rightScaleVal.textContent = rightScale.value + '%'; rightState.scale = rightScale.value / 100; render(); });
    rightRotation.addEventListener('input', () => { rightRotationVal.textContent = rightRotation.value + '°'; rightState.rot = rightRotation.value * Math.PI / 180; render(); });

    resetBtn.addEventListener('click', () => { leftState.x = canvas.width * 0.25; leftState.y = canvas.height / 2; leftState.scale = 1; leftState.rot = 0; leftState.opacity = 1; rightState.x = canvas.width * 0.75; rightState.y = canvas.height / 2; rightState.scale = 1; rightState.rot = 0; rightState.opacity = 1; leftOpacity.value = 100; leftOpacityVal.textContent = '100%'; leftScale.value = 87; leftScaleVal.textContent = '100%'; leftRotation.value = 0; leftRotationVal.textContent = '0°'; rightOpacity.value = 100; rightOpacityVal.textContent = '100%'; rightScale.value = 87; rightScaleVal.textContent = '100%'; rightRotation.value = 0; rightRotationVal.textContent = '0°'; render(); });

    downloadBtn.addEventListener('click', () => {

      const LeftChampion = document.getElementById("logoLeftPresets").getElementsByClassName("selected")[0].getElementsByTagName("img")[0].alt;
      const RightChampion = document.getElementById("logoRightPresets").getElementsByClassName("selected")[0].getElementsByTagName("img")[0].alt;

      canvas.toBlob(blob => {
        const a = document.createElement('a'); a.download = `2XKO_Team_${LeftChampion}_${RightChampion}.png`; a.href = URL.createObjectURL(blob); a.click(); URL.revokeObjectURL(a.href);
      }, 'image/png');
    });

    // canvas interactions
    canvas.addEventListener('pointerdown', (e) => {
      const pos = getCanvasPos(e);
      // determine which half
      if (pos.x <= canvas.width / 2) { // left half
        if (leftLogo && pointInLogo(pos, 'left')) { activeDrag = 'left'; dragging = true; dragStart = { x: pos.x - leftState.x, y: pos.y - leftState.y }; canvas.setPointerCapture(e.pointerId); }
      } else {
        if (rightLogo && pointInLogo(pos, 'right')) { activeDrag = 'right'; dragging = true; dragStart = { x: pos.x - rightState.x, y: pos.y - rightState.y }; canvas.setPointerCapture(e.pointerId); }
      }
    });
    canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const pos = getCanvasPos(e); if (activeDrag === 'left') { leftState.x = pos.x - dragStart.x; leftState.y = pos.y - dragStart.y; render(); } else if (activeDrag === 'right') { rightState.x = pos.x - dragStart.x; rightState.y = pos.y - dragStart.y; render(); } });
    canvas.addEventListener('pointerup', (e) => { dragging = false; activeDrag = null; try { canvas.releasePointerCapture(e.pointerId) } catch { } });

    function getCanvasPos(e) { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height; return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }; }

    function pointInLogo(p, side) { const s = (side === 'left') ? leftState : rightState; const img = (side === 'left') ? leftLogo : rightLogo; if (!img) return false; const w = img.width * s.scale; const h = img.height * s.scale; const dx = p.x - s.x; const dy = p.y - s.y; const cos = Math.cos(-s.rot), sin = Math.sin(-s.rot); const lx = dx * cos - dy * sin + w / 2; const ly = dx * sin + dy * cos + h / 2; return lx >= 0 && ly >= 0 && lx <= w && ly <= h; }

    // render pipeline
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw left bg (cover within left half)
      if (leftBg) { drawImageCover(ctx, leftBg, 0, 0, canvas.width / 2, canvas.height); }
      else { ctx.fillStyle = '#071022'; ctx.fillRect(0, 0, canvas.width / 2, canvas.height); }
      // draw right bg
      if (rightBg) { drawImageCover(ctx, rightBg, canvas.width / 2, 0, canvas.width / 2, canvas.height); }
      else { ctx.fillStyle = '#071022'; ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height); }

      // optionally draw a faint guide for halves (not visible if border covers)
      // draw logos
      if (leftLogo) { ctx.save(); ctx.translate(leftState.x, leftState.y); ctx.rotate(leftState.rot); ctx.globalAlpha = leftState.opacity; const w = leftLogo.width * leftState.scale; const h = leftLogo.height * leftState.scale; ctx.drawImage(leftLogo, -w / 2, -h / 2, w, h); ctx.restore(); }
      if (rightLogo) { ctx.save(); ctx.translate(rightState.x, rightState.y); ctx.rotate(rightState.rot); ctx.globalAlpha = rightState.opacity; const w = rightLogo.width * rightState.scale; const h = rightLogo.height * rightState.scale; ctx.drawImage(rightLogo, -w / 2, -h / 2, w, h); ctx.restore(); }

      // finally draw border on top (fixed)
      if (borderImage) { ctx.save(); ctx.globalAlpha = 1; ctx.drawImage(borderImage, 0, 0, canvas.width, canvas.height); ctx.restore(); }
    }

    function drawImageCover(ctx, img, x, y, w, h) { const imgRatio = img.width / img.height; const boxRatio = w / h; let drawW, drawH, offsetX, offsetY; if (imgRatio > boxRatio) { drawH = h; drawW = img.width * (h / img.height); offsetX = (w - drawW) / 2; offsetY = 0; } else { drawW = w; drawH = img.height * (w / img.width); offsetX = 0; offsetY = (h - drawH) / 2; } ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH); }

    function updateInfo() { const parts = []; parts.push(`Canvas: ${canvas.width}×${canvas.height}`); parts.push(`Left BG: ${leftBg ? leftBg.width + '×' + leftBg.height : 'ninguno'}`); parts.push(`Right BG: ${rightBg ? rightBg.width + '×' + rightBg.height : 'ninguno'}`); parts.push(`Left logo: ${leftLogo ? leftLogo.width + '×' + leftLogo.height : 'ninguno'}`); parts.push(`Right logo: ${rightLogo ? rightLogo.width + '×' + rightLogo.height : 'ninguno'}`); info.innerText = parts.join('\n'); }

    // init defaults
    (function () { borderPresets.children[0].classList.add('selected'); bgLeftPresets.children[2].classList.add('selected'); bgRightPresets.children[6].classList.add('selected'); logoLeftPresets.children[0].classList.add('selected'); logoRightPresets.children[4].classList.add('selected'); loadBorderFromSrc(sampleBorder); loadLeftBgFromSrc(backgrounds["Jonia"]); loadRightBgFromSrc(backgrounds["Zaun"]); loadLeftLogoFromSrc(champions["Ahri"]); loadRightLogoFromSrc(champions["Ekko"]); })();
