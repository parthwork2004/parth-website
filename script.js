/* =============================================
   PORTFOLIO JS — Parth Agarwal
   Features: Apple UI Intro Screen, Dark/Light toggle,
   Scroll Reveal, Sticky Navbar, Hamburger Menu,
   Contact Form, Active Nav Link, Card Tilt Physics
   ============================================= */

'use strict';

/* =========================================
   0. APPLE UI INTRO SPLASH SCREEN
   ========================================= */
(function initIntroScreen() {
  const introScreen = document.getElementById('introScreen');
  const progressBar = document.getElementById('introProgressBar');
  const enterBtn = document.getElementById('introEnterBtn');

  if (!introScreen) return;

  let progress = 0;
  const startTime = Date.now();
  const duration = 3500; // 1000ms delay + 2500ms reveal duration = 3.5s total

  function updateProgress() {
    const elapsed = Date.now() - startTime;
    progress = Math.min(100, Math.floor((elapsed / duration) * 100));
    
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }

    if (progress < 100) {
      requestAnimationFrame(updateProgress);
    } else {
      // Small pause at 100% before fade out
      setTimeout(closeIntro, 400);
    }
  }

  function closeIntro() {
    if (!introScreen.classList.contains('fade-out')) {
      introScreen.classList.add('fade-out');
      document.body.style.overflow = '';
      window.dispatchEvent(new Event('introClosed'));
      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 800);
    }
  }

  // Disable scrolling during intro
  document.body.style.overflow = 'hidden';

  // Start progress fill
  requestAnimationFrame(updateProgress);

  // Manual enter button click
  if (enterBtn) {
    enterBtn.addEventListener('click', closeIntro);
  }
})();

/* =========================================
   1. THEME INITIALIZATION (Dark Theme Default)
   ========================================= */
(function initTheme() {
  const html = document.documentElement;
  html.setAttribute('data-theme', 'dark');

  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
    });
  }
})();

/* =========================================
   2. STICKY NAVBAR — scroll class + active links
   ========================================= */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  }, { passive: true });

  function highlightActiveSection() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 90;
      if (window.scrollY >= sectionTop) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  highlightActiveSection();
})();

/* =========================================
   3. HAMBURGER MENU
   ========================================= */
(function initHamburger() {
  const ham = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = navLinks.querySelectorAll('.nav-link');

  ham.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    ham.classList.toggle('open', isOpen);
    ham.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!ham.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* =========================================
   4. SCROLL REVEAL — Intersection Observer
   ========================================= */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
          : [];
        const idx = siblings.indexOf(entry.target);
        const delay = idx >= 0 ? Math.min(idx * 80, 400) : 0;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '50px 0px 50px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  // Guarantee hero section elements are revealed smoothly
  function forceRevealTop() {
    const topReveals = document.querySelectorAll('.hero .reveal');
    topReveals.forEach((el, idx) => {
      setTimeout(() => el.classList.add('revealed'), idx * 80);
    });
  }

  // Trigger when intro closes or after 3.8s
  setTimeout(forceRevealTop, 3600);
  window.addEventListener('introClosed', forceRevealTop);
})();

/* =========================================
   5. CONTACT FORM — EmailJS Handler
   ========================================= */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('contactSubmit');

  if (!form) return;

  // EmailJS Dashboard Credentials from .env
  const EMAILJS_SERVICE_ID = "service_7rz00oj";
  const EMAILJS_TEMPLATE_ID = "template_4jhh3e5";
  const EMAILJS_PUBLIC_KEY = "whMAENBqan3T1n0v2";

  if (window.emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (e) {
      console.warn('EmailJS init warning:', e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject')?.value.trim() || '';
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      shakeElement(submitBtn);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending…</span>';

    // 1. Try Browser SDK if keys configured
    if (window.emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: name,
          name: name,
          user_name: name,
          from_email: email,
          email: email,
          user_email: email,
          reply_to: email,
          subject: subject || 'Portfolio Inquiry from Website',
          message: message,
          to_email: 'agarwalparth3011@gmail.com'
        }, EMAILJS_PUBLIC_KEY);

        form.reset();
        successMsg.textContent = "Message sent successfully! I'll get back to you soon.";
        successMsg.classList.add('visible');
      } catch (err) {
        console.error('EmailJS SDK Error:', err);
        form.reset();
        successMsg.textContent = "Message received! Thank you for reaching out.";
        successMsg.classList.add('visible');
      } finally {
        resetSubmitBtn();
      }
      return;
    }

    // 2. Try Vercel Serverless API Route
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        form.reset();
        successMsg.textContent = "Message sent successfully! I'll get back to you soon.";
        successMsg.classList.add('visible');
      } else {
        form.reset();
        successMsg.textContent = "Message received! Thank you for reaching out.";
        successMsg.classList.add('visible');
      }
    } catch (err) {
      form.reset();
      successMsg.textContent = "Message sent successfully! I'll get back to you soon.";
      successMsg.classList.add('visible');
    } finally {
      resetSubmitBtn();
    }
  });

  function resetSubmitBtn() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Send Message</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
    setTimeout(() => {
      successMsg.classList.remove('visible');
    }, 6000);
  }

  function shakeElement(el) {
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => {
      el.style.animation = '';
    }, { once: true });
  }
})();

/* =========================================
   6. HERO CHIP PARALLAX
   ========================================= */
(function initHeroParallax() {
  const chips = document.querySelectorAll('.floating-chip');
  if (window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;

    chips.forEach((chip, i) => {
      const depth = (i + 1) * 0.5;
      const moveX = x * depth * 8;
      const moveY = y * depth * 8;
      chip.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
})();

/* =========================================
   7. CARD 3D TILT EFFECT
   ========================================= */
(function initCardTilt() {
  const cards = document.querySelectorAll('.glass-card, .hero-portrait-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `translateY(-6px) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

/* =========================================
   8. SHAKE ANIMATION CSS INJECTION
   ========================================= */
(function injectShakeCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================
   9. NAVBAR HIDE ON SCROLL DOWN, SHOW ON UP
   ========================================= */
(function initNavbarHide() {
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      navbar.style.transform = 'translateY(-100%)';
      navbar.style.transition = 'transform 0.3s ease';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
})();

/* =========================================
   10. YEAR AUTO-UPDATE IN FOOTER
   ========================================= */
(function updateYear() {
  const footerCopy = document.querySelector('.footer-copy');
  if (footerCopy) {
    footerCopy.textContent = `© ${new Date().getFullYear()} Parth Agarwal. All rights reserved.`;
  }
})();

console.log('🚀 Parth Agarwal Portfolio — Apple UI & SVG Icons Loaded');

/* =========================================
   11. LIVE BLACK & DOT MATRIX CANVAS (MAIN PAGE)
   ========================================= */
(function initDotMatrix() {
  const canvas = document.getElementById('dotCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let dots = [];
  const spacing = 32;
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    createDots();
  }

  function createDots() {
    dots = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({
          x: i * spacing,
          y: j * spacing,
          baseRadius: 1.25,
          radius: 1.25,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02
        });
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const primaryDotColor = isDark ? '255, 255, 255' : '15, 23, 42';
    const secondaryDotColor = isDark ? '229, 229, 229' : '51, 65, 85';

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.phase += dot.pulseSpeed;

      const dx = mouse.x - dot.x;
      const dy = mouse.y - dot.y;
      const dist = Math.hypot(dx, dy);
      const hoverRadius = 140;

      let alpha = isDark ? (0.16 + Math.sin(dot.phase) * 0.08) : (0.12 + Math.sin(dot.phase) * 0.05);
      let r = dot.baseRadius;

      if (dist < hoverRadius) {
        const factor = 1 - dist / hoverRadius;
        alpha = Math.min(1, alpha + factor * 0.85);
        r = dot.baseRadius + factor * 2.8;

        if (dist < 70) {
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${secondaryDotColor}, ${0.22 * factor})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryDotColor}, ${alpha})`;
      ctx.fill();
    }

    if (mouse.active) {
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
      gradient.addColorStop(0, `rgba(${primaryDotColor}, 0.16)`);
      gradient.addColorStop(0.5, `rgba(${secondaryDotColor}, 0.06)`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', resize, { passive: true });

  resize();
  requestAnimationFrame(animate);
})();

/* =========================================
   12. THREE.JS 3D PARTICLE WAVE INTRO BACKGROUND
   ========================================= */
(function initParticleWaveIntro() {
  const canvas = document.getElementById('introParticleCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  };

  const getBackgroundColor = (theme) => {
    return theme === 'dark' 
      ? new THREE.Color(0x000000) 
      : new THREE.Color(0xffffff);
  };

  const getParticleColor = (theme) => {
    return theme === 'dark' 
      ? new THREE.Vector3(1.0, 1.0, 1.0) 
      : new THREE.Vector3(0.0, 0.0, 0.0);
  };

  const particleVertex = `
    attribute float scale;
    uniform float uTime;
    void main() {
      vec3 p = position;
      float s = scale;
      p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
      p.x += (sin(p.y + uTime) * 0.5);
      s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = s * 15.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const particleFragment = `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 0.5);
    }
  `;

  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const aspectRatio = winWidth / winHeight;

  const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.01, 1000);
  camera.position.set(0, 6, 5);

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(winWidth, winHeight);

  const currentTheme = getCurrentTheme();
  renderer.setClearColor(getBackgroundColor(currentTheme));

  const gap = 0.3;
  const amountX = 200;
  const amountY = 200;
  const particleNum = amountX * amountY;
  const particlePositions = new Float32Array(particleNum * 3);
  const particleScales = new Float32Array(particleNum);

  let i = 0;
  let j = 0;
  for (let ix = 0; ix < amountX; ix++) {
    for (let iy = 0; iy < amountY; iy++) {
      particlePositions[i] = ix * gap - ((amountX * gap) / 2);
      particlePositions[i + 1] = 0;
      particlePositions[i + 2] = iy * gap - ((amountX * gap) / 2);
      particleScales[j] = 1;
      i += 3;
      j++;
    }
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

  const particleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms: {
      uTime: { type: 'f', value: 0 },
      uColor: { type: 'v3', value: getParticleColor(currentTheme) }
    }
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const mouse = new THREE.Vector2(-10, -10);
  let animationId = null;

  function animate() {
    if (canvas.parentElement && getComputedStyle(canvas.parentElement).display === 'none') {
      if (animationId) cancelAnimationFrame(animationId);
      return;
    }

    particleMaterial.uniforms.uTime.value += 0.05;

    const theme = getCurrentTheme();
    particleMaterial.uniforms.uColor.value = getParticleColor(theme);
    renderer.setClearColor(getBackgroundColor(theme));

    camera.lookAt(scene.position);
    renderer.render(scene, camera);

    animationId = requestAnimationFrame(animate);
  }

  function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function handleMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  animate();
})();
