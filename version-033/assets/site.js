(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function autoplay() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                autoplay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                autoplay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                autoplay();
            });
        }

        show(0);
        autoplay();
    }

    function cardMatches(card, values) {
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
        if (values.q && haystack.indexOf(values.q) === -1) {
            return false;
        }
        if (values.type && (card.getAttribute('data-type') || '').indexOf(values.type) === -1) {
            return false;
        }
        if (values.region && (card.getAttribute('data-region') || '').indexOf(values.region) === -1) {
            return false;
        }
        if (values.year && (card.getAttribute('data-year') || '') !== values.year) {
            return false;
        }
        return true;
    }

    function initFilters() {
        qsa('[data-filter-form]').forEach(function (form) {
            var section = form.closest('section') || document;
            var list = qs('[data-card-list]', section) || qs('[data-card-list]');
            var empty = qs('[data-empty-state]', section) || qs('[data-empty-state]');
            var cards = list ? qsa('[data-card]', list) : [];

            function apply() {
                var data = new FormData(form);
                var values = {
                    q: String(data.get('q') || '').trim().toLowerCase(),
                    type: String(data.get('type') || '').trim(),
                    region: String(data.get('region') || '').trim(),
                    year: String(data.get('year') || '').trim()
                };
                var visible = 0;
                cards.forEach(function (card) {
                    var matched = cardMatches(card, values);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            form.addEventListener('input', apply);
            form.addEventListener('change', apply);
            form.addEventListener('reset', function () {
                setTimeout(apply, 0);
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                var input = form.querySelector('input[name="q"]');
                if (input) {
                    input.value = q;
                }
            }
            apply();
        });
    }

    window.MoviePlayer = {
        init: function (id, source) {
            var shell = document.getElementById(id);
            if (!shell) {
                return;
            }
            var video = shell.querySelector('video');
            var cover = shell.querySelector('.player-cover');
            var loaded = false;
            var hls = null;

            function attach() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                attach();
                if (cover) {
                    cover.hidden = true;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.hidden = true;
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
}());
