/* ============================================================
   THE GRAND BARBER — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── State ── */
  const state = {
    selectedService : '',
    selectedBarber  : '',
    selectedTime    : '',
    reviewRating    : 0,
    reviews: [
      { name:'Rafael M.',  date:'February 2026',  stars:5, emoji:'👨‍💼', text:'Ernesto gave me the finest cut I have ever received. The hot towel shave was absolute luxury — every detail was perfection.' },
      { name:'Carlos B.',  date:'January 2026',   stars:5, emoji:'🎩',  text:'The atmosphere alone is worth the visit. Walking in feels like stepping back into an era of true craftsmanship. Marco is an artist.' },
      { name:'Jose A.',    date:'January 2026',   stars:5, emoji:'✦',   text:'Three years a loyal patron. The Grand Combo is my weekly ritual — the beard sculpt is impeccably done every single time.' },
      { name:'Miguel T.',  date:'December 2025',  stars:4, emoji:'🎖️', text:'Seamless booking, extraordinarily skilled barbers, and an unmatched ambience. Worth every single centavo.' },
      { name:'Andres L.',  date:'December 2025',  stars:5, emoji:'🧔',  text:'Brought my son for his first proper haircut. Ernesto made him so at ease. We both left looking and feeling like gentlemen.' },
      { name:'Paolo G.',   date:'November 2025',  stars:5, emoji:'✂️', text:'Drove 45 minutes for this. Marco stepped in when Rodrigo was fully booked and delivered beyond every expectation.' }
    ]
  };

  /* ================================================================
     MOBILE MENU
  ================================================================ */
  const hamburger = document.getElementById('hamburger');
  const mobMenu   = document.getElementById('mobMenu');

  function openMenu () {
    hamburger.classList.add('open');
    mobMenu.classList.add('open');
    mobMenu.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu () {
    hamburger.classList.remove('open');
    mobMenu.classList.remove('open');
    mobMenu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () =>
    mobMenu.classList.contains('open') ? closeMenu() : openMenu()
  );

  /* close on any mob-link click */
  document.querySelectorAll('.mob-link').forEach(el =>
    el.addEventListener('click', closeMenu)
  );

  /* close on Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ================================================================
     NAVBAR SCROLL SHADOW
  ================================================================ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ================================================================
     DATE INPUT — default to today
  ================================================================ */
  const dateEl = document.getElementById('dateInput');
  if (dateEl) {
    const today = new Date().toISOString().split('T')[0];
    dateEl.min   = today;
    dateEl.value = today;
  }

  /* ================================================================
     SERVICE SELECTION
  ================================================================ */
  window.selectService = function (btn, name, price, duration) {
    document.querySelectorAll('.svc-btn').forEach(b => {
      b.classList.remove('active');
      b.textContent = 'Select Service';
    });
    document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('selected'));

    btn.classList.add('active');
    btn.textContent = '✓ Selected';
    btn.closest('.svc-card').classList.add('selected');

    state.selectedService = `${name} — ${price}`;

    const sel = document.getElementById('serviceSelect');
    if (sel) {
      for (const o of sel.options) {
        if (o.value.startsWith(name.substring(0, 8))) { sel.value = o.value; break; }
      }
    }
    updateRecap();
    showToast(`${name} selected`);
  };

  /* ================================================================
     TIME SLOT SELECTION
  ================================================================ */
  window.selectSlot = function (el, barber, time) {
    if (el.classList.contains('taken')) return;

    document.querySelectorAll('.slot.open').forEach(s => s.classList.remove('chosen'));
    el.classList.add('chosen');

    state.selectedBarber = barber;
    state.selectedTime   = time;

    const bs = document.getElementById('barberSelect');
    const ts = document.getElementById('timeSelect');
    if (bs) bs.value = barber;
    if (ts) ts.value = time;

    updateRecap();
    showToast(`${time} with ${barber} selected`);

    setTimeout(() => {
      const target = document.getElementById('booking');
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 350);
  };

  /* ================================================================
     RECAP PANEL
  ================================================================ */
  function updateRecap () {
    const box     = document.getElementById('recap');
    const details = document.getElementById('recapDetails');
    if (!box || !details) return;

    const svc  = state.selectedService || document.getElementById('serviceSelect')?.value;
    const bar  = state.selectedBarber  || document.getElementById('barberSelect')?.value;
    const time = state.selectedTime    || document.getElementById('timeSelect')?.value;
    const date = document.getElementById('dateInput')?.value;

    if (svc || bar || time) {
      box.classList.add('show');
      let html = '';
      if (svc)  html += `<div class="recap-row"><span>Service</span><span>${svc}</span></div>`;
      if (bar)  html += `<div class="recap-row"><span>Barber</span><span>${bar}</span></div>`;
      if (time) html += `<div class="recap-row"><span>Time</span><span>${time}</span></div>`;
      if (date) {
        try {
          const fmt = new Date(date + 'T12:00:00').toLocaleDateString('en-PH',
            { weekday:'short', month:'long', day:'numeric' });
          html += `<div class="recap-row"><span>Date</span><span>${fmt}</span></div>`;
        } catch (_) {}
      }
      details.innerHTML = html;
    }
  }

  document.getElementById('serviceSelect')?.addEventListener('change', updateRecap);
  document.getElementById('barberSelect') ?.addEventListener('change', e => { state.selectedBarber = e.target.value; updateRecap(); });
  document.getElementById('timeSelect')   ?.addEventListener('change', e => { state.selectedTime   = e.target.value; updateRecap(); });
  document.getElementById('dateInput')    ?.addEventListener('change', updateRecap);

  /* ================================================================
     BOOKING FORM SUBMIT
  ================================================================ */
  document.getElementById('bookingForm')?.addEventListener('submit', e => {
    e.preventDefault();

    const service = document.getElementById('serviceSelect')?.value;
    const barber  = document.getElementById('barberSelect')?.value;
    const time    = document.getElementById('timeSelect')?.value;
    const date    = document.getElementById('dateInput')?.value;
    const fname   = document.querySelector('input[name="fname"]')?.value || 'Gentleman';

    if (!service || !barber || !time) {
      showToast('Please complete all required fields');
      return;
    }

    let dateStr = date;
    try {
      dateStr = new Date(date + 'T12:00:00').toLocaleDateString('en-PH',
        { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    } catch (_) {}

    document.getElementById('modalText').innerHTML =
      `Dear ${fname},<br><br>
       Your appointment for <strong>${service}</strong><br>
       with <strong>${barber}</strong><br>
       on <strong>${dateStr}</strong> at <strong>${time}</strong><br><br>
       <em>A confirmation will be sent to your mobile. We look forward to welcoming you.</em>`;

    document.getElementById('modalBg')?.classList.add('show');

    /* reset */
    e.target.reset();
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.svc-btn').forEach(b => { b.classList.remove('active'); b.textContent = 'Select Service'; });
    document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.slot.open').forEach(s => s.classList.remove('chosen'));
    document.getElementById('recap')?.classList.remove('show');
    state.selectedService = ''; state.selectedBarber = ''; state.selectedTime = '';
  });

  window.closeModal = () => document.getElementById('modalBg')?.classList.remove('show');
  document.getElementById('modalBg')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  /* ================================================================
     STAR RATING
  ================================================================ */
  const starBtns = document.querySelectorAll('.star-btn');
  starBtns.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () =>
      starBtns.forEach((b, j) => b.classList.toggle('lit', j <= i))
    );
    btn.addEventListener('click', () => {
      state.reviewRating = i + 1;
      starBtns.forEach((b, j) => b.classList.toggle('lit', j <= i));
    });
  });
  document.querySelector('.star-row')?.addEventListener('mouseleave', () =>
    starBtns.forEach((b, j) => b.classList.toggle('lit', j < state.reviewRating))
  );

  /* ================================================================
     REVIEW FORM
  ================================================================ */
  document.getElementById('reviewForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('rName')?.value?.trim();
    const text = document.getElementById('rText')?.value?.trim();
    if (!name || !text || state.reviewRating === 0) {
      showToast('Please provide your name, a rating, and a review');
      return;
    }
    state.reviews.unshift({
      name, text, stars: state.reviewRating,
      date:  new Date().toLocaleDateString('en-PH', { month:'long', year:'numeric' }),
      emoji: '✦'
    });
    renderReviews();
    e.target.reset();
    state.reviewRating = 0;
    starBtns.forEach(b => b.classList.remove('lit'));
    showToast('Thank you for your review!');
  });

  /* ================================================================
     RENDER REVIEWS
  ================================================================ */
  function renderReviews () {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    grid.innerHTML = state.reviews.slice(0, 6).map(r => `
      <div class="review-card reveal visible">
        <div class="r-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div class="r-quote">"</div>
        <p class="r-text">${r.text}</p>
        <div class="reviewer">
          <div class="reviewer-av">${r.emoji}</div>
          <div>
            <div class="reviewer-name">${r.name}</div>
            <div class="reviewer-date">${r.date}</div>
          </div>
        </div>
      </div>
    `).join('');
  }
  renderReviews();

  /* ================================================================
     TOAST
  ================================================================ */
  window.showToast = function (msg) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ================================================================
     SMOOTH ANCHOR LINKS (offset for fixed nav)
  ================================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ================================================================
     SCROLL REVEAL
  ================================================================ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));

});