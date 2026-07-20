/* =========================================================
   스탈존 x 피카플레이 미션 이벤트 — main.js
   - 스크롤 리빌 애니메이션
   - 참여방법 탭 전환
   - KV 그린 미스트 셰이더 + 그린 불티 파티클 / 섹션2~6 공통 화이트 안개 셰이더
   - KV 배경 스크롤 패럴랙스
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 스크롤 리빌 ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 누적 보상 그래프: 선 드로잉 + 마커 순차 등장 ---------- */
  function initRewardGraph() {
    var chart = document.querySelector('.rg-chart');
    if (!chart) return;
    var line = chart.querySelector('.rg-line');
    var revealRect = chart.querySelector('.rg-reveal-rect');
    var spots = Array.prototype.slice.call(chart.querySelectorAll('[data-x]'));
    if (!line || !spots.length) return;

    var total = line.getTotalLength();
    line.style.strokeDasharray = total;
    line.style.strokeDashoffset = total;

    function lengthAtX(targetX) {
      var lo = 0, hi = total;
      for (var i = 0; i < 24; i++) {
        var mid = (lo + hi) / 2;
        if (line.getPointAtLength(mid).x < targetX) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }

    spots.forEach(function (el) {
      var x = parseFloat(el.getAttribute('data-x'));
      el._rgFraction = isNaN(x) ? 1 : lengthAtX(x) / total;
    });

    var DURATION = 1700;
    var played = false;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function play() {
      if (played) return;
      played = true;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / DURATION);
        var eased = easeOutCubic(t);
        line.style.strokeDashoffset = total * (1 - eased);
        if (revealRect) revealRect.setAttribute('width', line.getPointAtLength(total * eased).x);
        spots.forEach(function (el) {
          if (eased >= el._rgFraction) el.classList.add('is-visible');
        });
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { play(); io.unobserve(e.target); }
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      io.observe(chart);
    } else {
      play();
    }
  }

  /* ---------- 참여방법 탭 ---------- */
  function initTabs() {
    var btns = document.querySelectorAll('.tabs__btn');
    var panels = document.querySelectorAll('.tabpanel');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        panels.forEach(function (p) {
          p.classList.toggle('is-hidden', p.getAttribute('data-panel') !== tab);
        });
      });
    });
  }

  /* ---------- 셰이더 마운트 헬퍼 ---------- */
  function mountShader(host, frag) {
    function mount() {
      var sd = document.createElement('shader-doodle');
      var sc = document.createElement('script');
      sc.type = 'x-shader/x-fragment';
      sc.textContent = frag;
      sd.appendChild(sc);
      sd.style.cssText = 'display:block;width:100%;height:100%;';
      host.innerHTML = '';
      host.appendChild(sd);
    }
    if (window.customElements && customElements.get('shader-doodle')) mount();
    else if (window.customElements) customElements.whenDefined('shader-doodle').then(mount);
    else window.addEventListener('load', mount);
  }

  var SNOISE = [
"vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}",
"float snoise(vec2 v){",
"const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);",
"vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1;",
"i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;",
"i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));",
"vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;",
"vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;",
"m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;",
"g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}"
  ].join("\n");

  /* KV — 그린/화이트 미스트 */
  function initHeroFog() {
    var host = document.getElementById('hero-shader');
    if (!host) return;
    var FRAG = SNOISE + "\n" + [
"vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);}",
"vec3 hsv2rgb(float h,float s,float v){return hsv2rgb(vec3(h/360.,s/100.,v/100.));}",
"float lerp(float a,float b,float w){return a*(1.-w)+b*w;}",
"float constrain(float v,float mn,float mx){return min(max(v,mn),mx);}",
"void main(){",
"vec2 d1=vec2(snoise(gl_FragCoord.xy/150.0+vec2(u_time*.3,u_time*.4)),snoise(gl_FragCoord.xy/150.0+vec2(3.+u_time*.4,4.+u_time*.3)));",
"vec2 ds=gl_FragCoord.xy/600.+d1*0.2;",
"vec2 d2=vec2(snoise(ds+vec2(u_time*-.01,u_time*-.02)),snoise(ds+vec2(3.+u_time*-.02,4.+u_time*-.3)));",
"vec2 ds2=gl_FragCoord.xy/600.+d2*0.2;",
"float nv=(snoise(ds2+vec2(u_time*-0.05,u_time*0.05))+1.)/2.;",
"const float h0mn=200.,s0mn=35.,v0mn=28.,h0mx=160.,s0mx=28.,v0mx=42.;",
"const float h1mn=160.,s1mn=22.,v1mn=58.,h1mx=120.,s1mx=12.,v1mx=82.;",
"float d=constrain(1.-distance(gl_FragCoord.xy+((ds-vec2(1.,1.))/2.)*1000.,u_resolution/2.)/sqrt(u_resolution.x*u_resolution.x*0.5+u_resolution.y*u_resolution.y*0.5),0.,1.);",
"d=pow(d,1.2);",
"float hmn=lerp(h0mn,h1mn,d),smn=lerp(s0mn,s1mn,d),vmn=lerp(v0mn,v1mn,d);",
"float hmx=lerp(h0mx,h1mx,d),smx=lerp(s0mx,s1mx,d),vmx=lerp(v0mx,v1mx,d);",
"vec3 color=hsv2rgb(lerp(hmn,hmx,nv),lerp(smn,smx,nv),lerp(vmn,vmx,nv));",
"gl_FragColor=vec4(color,1.);}"
    ].join("\n");
    mountShader(host, FRAG);
  }

  /* 불티 파티클 (canvas) */
  function initSparks(id, colors) {
    var cv = document.getElementById(id);
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function resize() {
      var r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    var N = 46;
    function make() {
      var life = rnd(3.2, 7.5);
      var left = Math.random() < 0.5;
      var edge = Math.max(70, w * 0.12);
      var x = left ? rnd(-10, edge) : rnd(w - edge, w + 10);
      var speed = rnd(26, 58);
      return {
        x: x, y: rnd(h * 0.15, h + 20),
        vx: left ? speed : -speed,
        vy: rnd(-14, -34),
        drift: rnd(0.5, 1.4), phase: rnd(0, 6.28),
        r: rnd(0.5, 1.4), life: life, t: rnd(0, life),
        max: rnd(0.5, 1), col: colors[(Math.random() * colors.length) | 0]
      };
    }
    var ps = [];
    for (var i = 0; i < N; i++) ps.push(make());
    var last = performance.now();
    function tick(now) {
      if (!document.body.contains(cv)) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < ps.length; j++) {
        var p = ps[j];
        p.t += dt;
        if (p.t >= p.life || p.x < -30 || p.x > w + 30) { ps[j] = make(); continue; }
        var k = p.t / p.life;
        p.phase += dt * 2;
        p.x += (p.vx + Math.sin(p.phase) * 14 * p.drift) * dt;
        p.y += p.vy * dt;
        p.vy += 4 * dt;
        var fade = Math.sin(Math.PI * k);
        var a = p.max * fade;
        if (a <= 0.01) continue;
        var rad = p.r * (0.7 + fade * 0.6);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 4);
        g.addColorStop(0, 'rgba(' + p.col + ',' + a + ')');
        g.addColorStop(0.4, 'rgba(' + p.col + ',' + (a * 0.4) + ')');
        g.addColorStop(1, 'rgba(' + p.col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad * 4, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* ---------- init ---------- */
  function init() {
    initReveal();
    initRewardGraph();
    initTabs();
    initHeroFog();
    initSparks('hero-sparks', ['80,220,120', '140,255,170', '40,170,90']);
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
