(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var queryParams = new URLSearchParams(window.location.search);
    var initialQuery = queryParams.get('q');
    var activeType = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        var term = normalize(filterInput ? filterInput.value : '');
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var type = normalize(card.getAttribute('data-type'));
            var typeMatched = activeType === 'all' || type.indexOf(normalize(activeType)) !== -1;
            var textMatched = !term || text.indexOf(term) !== -1;
            card.classList.toggle('is-hidden', !(typeMatched && textMatched));
        });
    }

    if (filterInput) {
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeType = button.getAttribute('data-filter-button') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilter();
        });
    });

    if (cards.length) {
        applyFilter();
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-play-button]');
        var started = false;
        var stream = typeof pageStreamUrl === 'string' ? pageStreamUrl : '';

        function startPlayback() {
            if (!video || !stream) {
                return;
            }

            if (playButton) {
                playButton.classList.add('is-hidden');
            }

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                video.addEventListener('emptied', function () {
                    hls.destroy();
                }, { once: true });
            } else {
                video.src = stream;
                video.play().catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    startPlayback();
                }
            });
        }
    }
})();
