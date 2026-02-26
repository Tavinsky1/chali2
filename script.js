/**
 * CHALYMAN — Option 2
 * Brutalist Circus Poster Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initProgressBar();
    initNav();
    initScrollReveal();
    initCounters();
    initFormHandling();
    initGalleryReel();
});

/* ─────────────────────────────────────────
   CUSTOM SQUARE CURSOR
───────────────────────────────────────── */
function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    // Hide on touch
    if (window.matchMedia('(pointer: coarse)').matches) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    let cx = -100, cy = -100;

    document.addEventListener('mousemove', e => {
        cx = e.clientX;
        cy = e.clientY;
        cursor.style.left = cx + 'px';
        cursor.style.top  = cy + 'px';
    }, { passive: true });

    // Spin cursor as it moves
    let lastX = cx, rotation = 0;
    let rafId;
    function spin() {
        const delta = cx - lastX;
        rotation += delta * 0.5;
        cursor.style.transform = `translate(-50%,-50%) rotate(${rotation}deg)`;
        lastX = cx;
        rafId = requestAnimationFrame(spin);
    }
    spin();

    // Expand on interactive targets
    const hoverEls = document.querySelectorAll(
        'a, button, .show-row, .test-card, .reel-video, .stat-block'
    );
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}

/* ─────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────── */
function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
}

/* ─────────────────────────────────────────
   NAVIGATION (scroll shrink + burger)
───────────────────────────────────────── */
function initNav() {
    const nav       = document.getElementById('nav');
    const burger    = document.getElementById('burger');
    const mobileNav = document.getElementById('mobileNav');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('compact', window.scrollY > 60);
    }, { passive: true });

    if (burger) {
        burger.addEventListener('click', () => {
            const open = burger.classList.toggle('active');
            mobileNav.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        });
    });
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    const targets = document.querySelectorAll(
        '.about-content-col, .about-stats-col, .stat-block, ' +
        '.show-row, .test-card, .reel-header, .reel-video, ' +
        '.contact-left, .contact-right'
    );

    targets.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 4) * 0.07}s`;
        observer.observe(el);
    });
}

/* ─────────────────────────────────────────
   ANIMATED COUNTERS
───────────────────────────────────────── */
function initCounters() {
    const counters = document.querySelectorAll('.stat-num[data-count]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const dur    = 1800;
            const step   = target / (dur / 16);
            let current  = 0;

            function tick() {
                current += step;
                if (current < target) {
                    el.textContent = Math.floor(current);
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target >= 100 ? target + '+' : target + '+';
                }
            }
            tick();
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* ─────────────────────────────────────────
   FORM HANDLING
───────────────────────────────────────── */
function initFormHandling() {
    const form    = document.getElementById('bookingForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn  = form.querySelector('.form-submit-btn');
        const orig = btn.textContent;

        btn.disabled    = true;
        btn.textContent = 'SENDING…';

        const data = new FormData(form);
        data.append('_subject', 'New Booking Inquiry — CHALYMAN');
        data.append('_captcha', 'false');

        try {
            const res = await fetch('https://formsubmit.co/ajax/freddyamador@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: data
            });
            if (!res.ok) throw new Error();
            form.style.display = 'none';
            success.classList.add('active');
            setTimeout(() => {
                form.reset();
                form.style.display = '';
                success.classList.remove('active');
                btn.disabled    = false;
                btn.textContent = orig;
            }, 6000);
        } catch {
            btn.disabled    = false;
            btn.textContent = orig;
            alert('Something went wrong. Please try again.');
        }
    });
}

/* ─────────────────────────────────────────
   GALLERY DRAG-TO-SCROLL
───────────────────────────────────────── */
function initGalleryReel() {
    const reel = document.getElementById('galleryReel');
    if (!reel) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Touch: native
    let isDown = false, startX, scrollLeft;
    reel.addEventListener('mousedown', e => {
        isDown = true;
        reel.classList.add('grabbing');
        startX     = e.pageX - reel.offsetLeft;
        scrollLeft = reel.scrollLeft;
    });
    reel.addEventListener('mouseleave', () => { isDown = false; reel.classList.remove('grabbing'); });
    reel.addEventListener('mouseup',    () => { isDown = false; reel.classList.remove('grabbing'); });
    reel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - reel.offsetLeft;
        reel.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
}

/* ─────────────────────────────────────────
   SHOW ROW HOVER HIGHLIGHT
───────────────────────────────────────── */
(function initShowHover() {
    const rows = document.querySelectorAll('.show-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            rows.forEach(r => {
                if (r !== row) r.style.opacity = '.45';
            });
        });
        row.addEventListener('mouseleave', () => {
            rows.forEach(r => r.style.opacity = '1');
        });
    });
})();

/* ─────────────────────────────────────────
   MARQUEE SCROLL-SPEED BOOST
───────────────────────────────────────── */
(function initMarqueeSpeed() {
    const tracks = document.querySelectorAll('.marquee-inner');
    let  lastY   = 0;

    window.addEventListener('scroll', () => {
        const speed = Math.abs(window.scrollY - lastY);
        lastY       = window.scrollY;
        const dur   = speed > 40 ? '10s' : null;
        tracks.forEach(t => {
            t.style.animationDuration = dur || '';
        });
    }, { passive: true });
})();

/* ─────────────────────────────────────────
   PREFERS REDUCED MOTION
───────────────────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.marquee-inner, .rotating-badge').forEach(el => {
        el.style.animation = 'none';
    });
}
