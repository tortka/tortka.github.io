/* --------------- */
/* EXPANDABLE TEXT */
/* --------------- */
function initTextExpander(selector = 'p.expandable', maxChars = 150) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
        const fullText = el.textContent.trim();

        if (fullText.length <= maxChars) return;

        const shortText = fullText.slice(0, maxChars);

        el.innerHTML = `
            <span class="text-short">${shortText}...</span>
            <span class="text-full" style="display: none; opacity: 0; transition: opacity 0.4s ease;">${fullText}</span>
            <button class="expand-btn" style="background: none; border: none; color: var(--accent-color); cursor: pointer; font-weight: 600; padding: 0 0 0 5px;">Show more</button>
        `;

        const shortSpan = el.querySelector('.text-short');
        const fullSpan = el.querySelector('.text-full');
        const btn = el.querySelector('.expand-btn');

        btn.addEventListener('click', function() {
            if (fullSpan.style.display === 'none') {
                shortSpan.style.display = 'none';
                fullSpan.style.display = 'inline';
                setTimeout(() => { fullSpan.style.opacity = '1'; }, 10);
                this.textContent = 'Show less';
            } else {
                fullSpan.style.opacity = '0';
                fullSpan.style.display = 'none';
                shortSpan.style.display = 'inline';
                this.textContent = 'Show more';
            }
        });
    });
}

/* ----------------------- */
/* CHANGE SLIDE IN GALLERY */
/* ----------------------- */
function changeSlide(buttonElement, direction) {
const currentGallery = buttonElement.closest('.marginal-gallery');
if (!currentGallery) return;

const slides = currentGallery.querySelectorAll('.gallery-img');
const counter = currentGallery.querySelector('.gallery-counter');
if (slides.length === 0) return;

let currentSlideIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
if (currentSlideIndex === -1) currentSlideIndex = 0;

const oldSlide = slides[currentSlideIndex];

slides.forEach(slide => slide.style.zIndex = "0");
oldSlide.style.zIndex = "1";
oldSlide.classList.remove('active');

currentSlideIndex += direction;
if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;

const newSlide = slides[currentSlideIndex];
newSlide.style.zIndex = "2";
newSlide.classList.add('active');

if (counter) {counter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;}
}

/* ------------------- */
/* COPY CODE FROM HTML */
/* ------------------- */
function copyCode(button) {

const textToCopy = button.previousElementSibling.innerText;

navigator.clipboard.writeText(textToCopy).then(() => {

button.classList.add("copied");
const originalIcon = button.innerHTML;

button.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>`;

setTimeout(() => {
  button.classList.remove("copied");
  button.innerHTML = originalIcon;
}, 2000);
}).catch(err => {
console.error("Error: ", err);
});
}

/* ----------------------- */
/* DOM CONTENT LOADER */
/* ----------------------- */
document.addEventListener('DOMContentLoaded', function() {

initTextExpander('p.expandable', 150);

const toggleBtn = document.getElementById('dark-mode-toggle');
const icon = document.getElementById('toggle-icon');
const body = document.body;
const nav = document.getElementById('mainNav');
const btt = document.getElementById('back-to-top');

function updateUI(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        if(icon) icon.className = 'fa fa-sun-o';
    } else {
        body.classList.remove('dark-mode');
        if(icon) icon.className = 'fa fa-moon-o';
    }
}

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return false;
};

updateUI(getInitialTheme());

if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isNowDark = !body.classList.contains('dark-mode');
        updateUI(isNowDark);
        localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
    });
}

function handleScroll() {

    if (window.scrollY > 50) {
        nav.classList.add('is-fixed');
    } else {
        nav.classList.remove('is-fixed');
    }

    if (window.scrollY > 300) {
        btt.style.display = "flex";
    } else {
        btt.style.display = "none";
    }
}

handleScroll();
window.addEventListener('scroll', handleScroll);

if (btt) {
    btt.addEventListener('click', () => {
        const duration = 1200;
        const startPos = window.scrollY || document.documentElement.scrollTop;
        const startTime = performance.now();

        function scrollAnimation(currentTime) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const easeQuadOut = progress * (2 - progress);

            window.scrollTo(0, startPos * (1 - easeQuadOut));

            if (timeElapsed < duration) {
                requestAnimationFrame(scrollAnimation);
            } else {
                window.scrollTo(0, 0);
            }
        }

        requestAnimationFrame(scrollAnimation);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const coverLinks = document.querySelectorAll('.cover-link');

coverLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        if (window.innerWidth > 1440) {
            const url = this.getAttribute('data-href');
            if (url) this.setAttribute('href', url);
        }
    });

    link.addEventListener('mouseleave', function() {
        this.setAttribute('href', 'javascript:void(0)');
        this.classList.remove('active');
    });

    link.addEventListener('click', function(e) {
        const url = this.getAttribute('data-href');

        if (window.innerWidth <= 1440) {
            if (!this.classList.contains('active')) {
                e.preventDefault();
                e.stopPropagation();

                coverLinks.forEach(otherLink => {
                    otherLink.setAttribute('href', 'javascript:void(0)');
                    otherLink.classList.remove('active');
                });

                this.setAttribute('href', url);
                this.classList.add('active');
            }
        } else {
            if (url) this.setAttribute('href', url);
        }
    });
});

function closeAllOverlays(e) {
    if (!e.target.closest('.cover-link')) {
        coverLinks.forEach(link => {
            link.setAttribute('href', 'javascript:void(0)');
            link.classList.remove('active');
        });
    }
}

document.addEventListener('mousedown', closeAllOverlays);
document.addEventListener('touchstart', closeAllOverlays, { passive: true });

const galleries = document.querySelectorAll('.marginal-gallery');

galleries.forEach(gallery => {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 40;

    const nextBtn = gallery.querySelector('.gallery-btn-bottom.next');
    const prevBtn = gallery.querySelector('.gallery-btn-bottom.prev');

    gallery.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gallery.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;

        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance < -minSwipeDistance && nextBtn) {
            changeSlide(nextBtn, 1);
        }
        if (swipeDistance > minSwipeDistance && prevBtn) {
            changeSlide(prevBtn, -1);
        }
    }, { passive: true });
});

const legalTrigger = document.getElementById('legal-notice-trigger');
const legalModal = document.getElementById('legal-modal');
const legalClose = document.getElementById('legal-modal-close');
const mailContainer = document.getElementById('obfuscated-mail');
const tabBtnLegal = document.getElementById('tab-btn-legal');
const tabBtnPrivacy = document.getElementById('tab-btn-privacy');
const legalSection = document.getElementById('legal-content-section');
const privacySection = document.getElementById('privacy-content-section');

if (legalTrigger && legalModal && legalClose) {
    legalTrigger.addEventListener('click', () => {
        legalModal.style.display = 'flex';
        if (mailContainer && !mailContainer.innerHTML) {
            const reversedMail = "ed.xmg@pmaktro.mit";
            const realMail = reversedMail.split("").reverse().join("");
            const mailAnchor = document.createElement('a');
            mailAnchor.setAttribute('href', 'mailto:' + realMail);
            mailAnchor.textContent = realMail;
            mailAnchor.style.color = 'var(--accent-color, #fbbf24)';
            mailAnchor.style.textDecoration = 'underline';
            mailAnchor.style.fontWeight = '600';
            mailContainer.appendChild(mailAnchor);
        }
    });

    if (tabBtnLegal && tabBtnPrivacy && legalSection && privacySection) {
        tabBtnLegal.addEventListener('click', () => {
            legalSection.style.display = 'block';
            privacySection.style.display = 'none';
            tabBtnLegal.style.color = 'var(--accent-color, #fbbf24)';
            tabBtnPrivacy.style.color = '#888888';
        });

        tabBtnPrivacy.addEventListener('click', () => {
            legalSection.style.display = 'none';
            privacySection.style.display = 'block';
            tabBtnLegal.style.color = '#888888';
            tabBtnPrivacy.style.color = 'var(--accent-color, #fbbf24)';
        });
    }

    legalClose.addEventListener('click', () => { legalModal.style.display = 'none'; });
    legalModal.addEventListener('click', (e) => { if (e.target === legalModal) legalModal.style.display = 'none'; });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal.style.display === 'flex') legalModal.style.display = 'none';
    });
}

});

/* --------------------- */
/* NAVBAR EVENT LISTENER */
/* --------------------- */
document.addEventListener('click', function(event) {
const navCollapse = document.getElementById('bs-example-navbar-collapse-1');
const navToggle = document.querySelector('.navbar-toggle');

const isOpen = navCollapse.classList.contains('in') || navCollapse.classList.contains('show');
navToggle.setAttribute('aria-expanded', !isOpen);

if (isOpen) {
    if (!navCollapse.contains(event.target) && !navToggle.contains(event.target)) {
        navToggle.click();
    }
}

});

document.addEventListener('pointerdown', function(e) {
if (!e.target.closest('.cover-link')) {
    coverLinks.forEach(link => link.classList.remove('active'));
}
});

/* ------------------ */
/* FULLSCREEN GALLERY */
/* ------------------ */
function toggleFullscreen(buttonElement) {
const gallery = buttonElement.closest('.marginal-gallery');
if (!gallery) return;

let fsCarousel = document.getElementById('custom-fullscreen-carousel');

if (!fsCarousel) {
    fsCarousel = document.createElement('div');
    fsCarousel.id = 'custom-fullscreen-carousel';
    fsCarousel.innerHTML = `
        <button class="fs-close-btn" aria-label="Close">&times;</button>
        <img class="fs-img" src="" alt="Fullscreen">
        <div class="fs-controls">
            <div class="fs-controls-inner">
                <button class="fs-btn fs-prev">❮</button>
                <span class="fs-counter">1 / 15</span>
                <button class="fs-btn fs-next">❯</button>
            </div>
        </div>
    `;
    document.body.appendChild(fsCarousel);

    fsCarousel.querySelector('.fs-close-btn').addEventListener('click', () => {
        fsCarousel.style.display = 'none';
    });

    fsCarousel.querySelector('.fs-prev').addEventListener('click', () => {
        const activeGallery = document.querySelector('.marginal-gallery.fs-active-target');
        if (activeGallery) {
            const origPrevBtn = activeGallery.querySelector('.gallery-btn-bottom.prev');
            if (origPrevBtn) {
                changeSlide(origPrevBtn, -1);
                syncFullscreenWithGallery(activeGallery);
            }
        }
    });

    fsCarousel.querySelector('.fs-next').addEventListener('click', () => {
        const activeGallery = document.querySelector('.marginal-gallery.fs-active-target');
        if (activeGallery) {
            const origNextBtn = activeGallery.querySelector('.gallery-btn-bottom.next');
            if (origNextBtn) {
                changeSlide(origNextBtn, 1);
                syncFullscreenWithGallery(activeGallery);
            }
        }
    });

    let tsX = 0;
    fsCarousel.addEventListener('touchstart', (e) => { tsX = e.changedTouches[0].screenX; }, { passive: true });
    fsCarousel.addEventListener('touchend', (e) => {
        const teX = e.changedTouches[0].screenX;
        const dist = teX - tsX;
        if (Math.abs(dist) > 40) {
            const next = fsCarousel.querySelector('.fs-next');
            const prev = fsCarousel.querySelector('.fs-prev');
            if (dist < 0 && next) next.click();
            if (dist > 0 && prev) prev.click();
        }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (fsCarousel.style.display === 'flex') {
            if (e.key === 'Escape') {
                fsCarousel.style.display = 'none';
            } else if (e.key === 'ArrowRight') {
                fsCarousel.querySelector('.fs-next').click();
            } else if (e.key === 'ArrowLeft') {
                fsCarousel.querySelector('.fs-prev').click();
            }
        }
    });
}

function syncFullscreenWithGallery(targetGallery) {
    const activeImg = targetGallery.querySelector('.gallery-img.active');
    const origCounter = targetGallery.querySelector('.gallery-counter');
    if (activeImg) fsCarousel.querySelector('.fs-img').src = activeImg.src;
    if (origCounter) fsCarousel.querySelector('.fs-counter').textContent = origCounter.textContent;
}

document.querySelectorAll('.marginal-gallery').forEach(g => g.classList.remove('fs-active-target'));
gallery.classList.add('fs-active-target');

syncFullscreenWithGallery(gallery);
fsCarousel.style.display = 'flex';
}
