/* ============================================================
   ROBERTO CÁRDENAS — Portafolio IA · interacción
   ============================================================ */
(function(){
  "use strict";

  /* iconos Lucide -------------------------------------------- */
  function icons(){
    if (window.lucide && window.lucide.createIcons){
      window.lucide.createIcons({ attrs:{ "stroke-width":1.5 } });
    }
  }
  if (document.readyState !== "loading") icons();
  else document.addEventListener("DOMContentLoaded", icons);
  window.addEventListener("load", icons);

  /* nav sólido al hacer scroll ------------------------------- */
  var nav = document.querySelector(".nav");
  function onScroll(){
    if (nav) nav.classList.toggle("solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* nav activo según sección (scroll spy) -------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".menu a[data-sec], .mm-links a[data-sec]"));
  var secIds = {};
  links.forEach(function(a){ secIds[a.dataset.sec] = true; });
  var secs = Object.keys(secIds).map(function(id){ return document.getElementById(id); }).filter(Boolean);
  if ("IntersectionObserver" in window && secs.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          links.forEach(function(a){ a.classList.toggle("active", a.dataset.sec === e.target.id); });
        }
      });
    }, { rootMargin:"-45% 0px -50% 0px", threshold:0 });
    secs.forEach(function(s){ spy.observe(s); });
  }

  /* reveal por scroll ---------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length){
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, { rootMargin:"0px 0px -8% 0px", threshold:.12 });
    reveals.forEach(function(el){ ro.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add("in"); });
  }

  /* tilt sutil en slots del hero (sensación premium) --------- */
  var canTilt = window.matchMedia("(hover:hover) and (pointer:fine)").matches &&
                !window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (canTilt){
    document.querySelectorAll("[data-tilt]").forEach(function(card){
      card.addEventListener("mousemove", function(ev){
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - .5;
        var py = (ev.clientY - r.top) / r.height - .5;
        card.style.setProperty("--rx", (py * -5).toFixed(2) + "deg");
        card.style.setProperty("--ry", (px * 6).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function(){
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* dibujar líneas del diagrama orbital ---------------------- */
  function drawOrbit(){
    var orbit = document.querySelector(".orbit");
    if (!orbit) return;
    var svg = orbit.querySelector("svg.links");
    var core = orbit.querySelector(".core");
    if (!svg || !core) return;
    var ob = orbit.getBoundingClientRect();
    var cb = core.getBoundingClientRect();
    var cx = cb.left + cb.width/2 - ob.left;
    var cy = cb.top + cb.height/2 - ob.top;
    svg.setAttribute("viewBox", "0 0 " + ob.width + " " + ob.height);
    var ns = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    orbit.querySelectorAll(".node .dotref, .node").forEach(function(){});
    orbit.querySelectorAll(".node").forEach(function(node){
      var dot = node;
      var after = window.getComputedStyle(node, "::after");
      var nb = node.getBoundingClientRect();
      // anclar la línea al punto del nodo más cercano al core
      var nx = nb.left + nb.width/2 - ob.left;
      var ny = nb.top + nb.height/2 - ob.top;
      // acercar a borde del nodo hacia el centro
      var dx = cx - nx, dy = cy - ny;
      var len = Math.hypot(dx,dy) || 1;
      var ex = nx + dx/len * (nb.width/2 * 0.62);
      var ey = ny + dy/len * (nb.height/2 * 0.7);
      var sx = cx - dx/len * (cb.width/2);
      var sy = cy - dy/len * (cb.height/2);
      var path = document.createElementNS(ns, "path");
      var mx = (sx+ex)/2, my = (sy+ey)/2;
      path.setAttribute("d", "M "+sx+" "+sy+" Q "+mx+" "+sy+" "+mx+" "+my+" T "+ex+" "+ey);
      path.setAttribute("class","orbit-link");
      svg.appendChild(path);
      var c = document.createElementNS(ns,"circle");
      c.setAttribute("cx", ex); c.setAttribute("cy", ey); c.setAttribute("r","3.5");
      c.setAttribute("class","orbit-node-dot");
      svg.appendChild(c);
    });
  }
  window.addEventListener("load", function(){ setTimeout(drawOrbit, 60); });
  var rT;
  window.addEventListener("resize", function(){ clearTimeout(rT); rT = setTimeout(drawOrbit, 120); });

  /* videos: pintar un cuadro atractivo como "still" + hover-play (solo ecosistema) */
  (function(){
    var stills = Array.prototype.slice.call(document.querySelectorAll("video.slot-img"));
    function primeStill(v){
      var t = parseFloat(v.getAttribute("data-poster-time") || "0.5");
      v.addEventListener("loadedmetadata", function(){ try{ v.currentTime = Math.min(t, (v.duration||1)-0.05); }catch(e){} }, { once:true });
    }
    if ("IntersectionObserver" in window){
      var vo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ var v=e.target; primeStill(v); try{ v.load(); }catch(err){} vo.unobserve(v); }
        });
      }, { rootMargin:"300px 0px" });
      stills.forEach(function(v){ vo.observe(v); });
    } else {
      stills.forEach(function(v){ primeStill(v); try{ v.load(); }catch(e){} });
    }
    // reproducción en tarjetas del ecosistema (sin audio): hover en desktop, TAP en táctil
    document.querySelectorAll(".slot-video").forEach(function(v){
      v.muted = true;
      var host = v.closest(".pcard") || v.closest(".slot");
      if (!host) return;
      function playV(){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
      function pauseV(){ v.pause(); try{ v.currentTime = 0.04; }catch(e){} }
      v.addEventListener("play",  function(){ v.classList.add("playing"); });
      v.addEventListener("pause", function(){ v.classList.remove("playing"); });
      // desktop: hover
      host.addEventListener("mouseenter", playV);
      host.addEventListener("mouseleave", pauseV);
      // táctil/clic: alternar play-pausa
      host.addEventListener("click", function(){
        if (v.paused){ try{ v.load(); }catch(e){} playV(); } else { v.pause(); }
      });
    });
  })();

  /* ---------- Reproductor modal (proyectos, con audio) ---------- */
  (function(){
    var modal = document.getElementById("vplayer");
    if (!modal) return;
    var video = document.getElementById("vp-video");
    var elTitle = modal.querySelector(".vp-title");
    var elSub = modal.querySelector(".vp-sub");
    var elCur = document.getElementById("vp-cur");
    var elDur = document.getElementById("vp-dur");
    var elProg = document.getElementById("vp-progress");
    var elBuf = document.getElementById("vp-buffered");
    var scrub = document.getElementById("vp-scrub");
    var btnToggle = document.getElementById("vp-toggle");
    var btnBig = document.getElementById("vp-bigplay");
    var btnBack = document.getElementById("vp-back");
    var btnFwd = document.getElementById("vp-fwd");
    var btnMute = document.getElementById("vp-mute");

    function setIcon(el, name){ el.innerHTML = '<i data-lucide="'+name+'"></i>'; if(window.lucide) lucide.createIcons({ attrs:{ "stroke-width":1.5 } }); }
    function fmt(t){ t=Math.max(0,t|0); var m=(t/60)|0, s=t%60; return m+":"+(s<10?"0":"")+s; }

    function open(src, title, sub){
      video.src = src;
      elTitle.textContent = title || "Proyecto";
      elSub.textContent = sub || "";
      modal.classList.add("open"); modal.classList.remove("playing","ready");
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow = "hidden";
      video.muted = false; video.volume = 1;
      var p = video.play(); if (p && p.catch) p.catch(function(){});
    }
    function close(){
      video.pause();
      modal.classList.remove("open","playing","ready");
      modal.setAttribute("aria-hidden","true");
      document.body.style.overflow = "";
      setTimeout(function(){ if(!modal.classList.contains("open")){ video.removeAttribute("src"); video.load(); } }, 420);
    }
    function toggle(){ if (video.paused) { var p=video.play(); if(p&&p.catch) p.catch(function(){}); } else video.pause(); }

    document.querySelectorAll(".play-card").forEach(function(card){
      card.addEventListener("click", function(){
        open(card.dataset.src, (card.dataset.title||"").replace(/&amp;/g,"&"), card.dataset.sub||"");
      });
    });
    modal.querySelectorAll("[data-close]").forEach(function(b){ b.addEventListener("click", close); });
    btnToggle.addEventListener("click", toggle);
    btnBig.addEventListener("click", toggle);
    btnBack.addEventListener("click", function(){ video.currentTime = Math.max(0, video.currentTime - 10); });
    btnFwd.addEventListener("click", function(){ video.currentTime = Math.min(video.duration||0, video.currentTime + 10); });
    btnMute.addEventListener("click", function(){ video.muted = !video.muted; setIcon(btnMute, video.muted ? "volume-x" : "volume-2"); });

    video.addEventListener("play", function(){ modal.classList.add("playing","ready"); setIcon(btnToggle,"pause"); });
    video.addEventListener("pause", function(){ modal.classList.remove("playing"); setIcon(btnToggle,"play"); });
    video.addEventListener("loadeddata", function(){ modal.classList.add("ready"); });
    video.addEventListener("loadedmetadata", function(){ elDur.textContent = fmt(video.duration); });
    video.addEventListener("timeupdate", function(){
      var d = video.duration || 0;
      elCur.textContent = fmt(video.currentTime);
      elProg.style.width = (d ? (video.currentTime/d*100) : 0) + "%";
      if (video.buffered.length) elBuf.style.width = (video.buffered.end(video.buffered.length-1)/ (d||1) *100) + "%";
    });
    video.addEventListener("ended", function(){ modal.classList.remove("playing"); setIcon(btnToggle,"play"); });

    function seekFromEvent(ev){
      var r = scrub.getBoundingClientRect();
      var x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var ratio = Math.min(1, Math.max(0, x / r.width));
      if (video.duration) video.currentTime = ratio * video.duration;
    }
    var dragging = false;
    scrub.addEventListener("mousedown", function(ev){ dragging = true; seekFromEvent(ev); });
    window.addEventListener("mousemove", function(ev){ if (dragging) seekFromEvent(ev); });
    window.addEventListener("mouseup", function(){ dragging = false; });
    scrub.addEventListener("click", seekFromEvent);

    document.addEventListener("keydown", function(ev){
      if (!modal.classList.contains("open")) return;
      if (ev.key === "Escape") close();
      else if (ev.key === " "){ ev.preventDefault(); toggle(); }
      else if (ev.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 10);
      else if (ev.key === "ArrowRight") video.currentTime = Math.min(video.duration||0, video.currentTime + 10);
    });
  })();

  /* burger (móvil) — menú desplegable -------------------------- */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu){
    function setMenu(open){
      mobileMenu.classList.toggle("open", open);
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      burger.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      document.body.style.overflow = open ? "hidden" : "";
      if (window.lucide) lucide.createIcons({ attrs:{ "stroke-width":1.5 } });
    }
    burger.addEventListener("click", function(){
      setMenu(!mobileMenu.classList.contains("open"));
    });
    mobileMenu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setMenu(false); });
    });
    document.addEventListener("keydown", function(ev){
      if (ev.key === "Escape" && mobileMenu.classList.contains("open")) setMenu(false);
    });
  }
})();
