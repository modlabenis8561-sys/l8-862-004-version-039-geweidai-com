import { H as Hls } from './hls-vendor-dru42stk.js';

const navToggle = document.querySelector('[data-nav-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
        mobilePanel.classList.toggle('is-open');
    });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const next = carousel.querySelector('[data-hero-next]');
    const previous = carousel.querySelector('[data-hero-prev]');
    let currentIndex = 0;
    let timer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === currentIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === currentIndex);
        });
    };

    const restartTimer = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);
    };

    next?.addEventListener('click', () => {
        showSlide(currentIndex + 1);
        restartTimer();
    });

    previous?.addEventListener('click', () => {
        showSlide(currentIndex - 1);
        restartTimer();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            restartTimer();
        });
    });

    restartTimer();
}

const filterInput = document.querySelector('[data-filter-input]');
const filterList = document.querySelector('[data-filter-list]');
const emptyState = document.querySelector('[data-empty-state]');

if (filterInput && filterList) {
    const cards = Array.from(filterList.querySelectorAll('[data-search]'));
    filterInput.addEventListener('input', () => {
        const query = filterInput.value.trim().toLowerCase();
        let visibleCount = 0;
        cards.forEach((card) => {
            const text = (card.getAttribute('data-search') || '').toLowerCase();
            const isVisible = !query || text.includes(query);
            card.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    });
}

const initializePlayer = (shell) => {
    const video = shell.querySelector('video[data-hls-src]');
    if (!video) {
        return;
    }

    const src = video.getAttribute('data-hls-src');
    if (!src) {
        return;
    }

    if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = src;
        }
        video.dataset.ready = 'true';
    }

    shell.classList.add('is-playing');
    video.play().catch(() => {
        shell.classList.remove('is-playing');
    });
};

document.querySelectorAll('[data-player]').forEach((shell) => {
    const overlay = shell.querySelector('[data-play-overlay]');
    const video = shell.querySelector('video');

    overlay?.addEventListener('click', () => initializePlayer(shell));
    video?.addEventListener('play', () => shell.classList.add('is-playing'));
    video?.addEventListener('pause', () => {
        if (video.currentTime === 0 || video.ended) {
            shell.classList.remove('is-playing');
        }
    });
});
