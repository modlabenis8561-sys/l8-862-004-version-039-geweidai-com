
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');
    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    filterBars.forEach(function (bar) {
        var input = bar.querySelector('[data-filter-input]');
        var year = bar.querySelector('[data-filter-year]');
        var type = bar.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-empty-state]');
        if (input && q) {
            input.value = q;
        }
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-keywords') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }
                if (selectedType && cardType !== selectedType) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        if (type) {
            type.addEventListener('change', apply);
        }
        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play]');
        var stream = root.getAttribute('data-stream');
        var attached = false;
        var hls = null;
        var attach = function () {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        };
        var play = function () {
            attach();
            root.classList.add('is-playing');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    root.classList.remove('is-playing');
                });
            }
        };
        if (button && video) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                root.classList.add('is-playing');
            });
            video.addEventListener('ended', function () {
                root.classList.remove('is-playing');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    });
})();
