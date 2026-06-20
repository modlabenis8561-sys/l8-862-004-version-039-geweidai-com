(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-dot]'));
        var prev = hero.querySelector('[data-prev]');
        var next = hero.querySelector('[data-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var textInput = scope.querySelector('[data-filter-input]');
        var typeSelect = scope.querySelector('[data-filter-type]');
        var yearSelect = scope.querySelector('[data-filter-year]');
        var clearButton = scope.querySelector('[data-filter-clear]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty]');

        function applyFilter() {
            var text = textInput ? textInput.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var meta = (card.getAttribute('data-meta') || '').toLowerCase();
                var haystack = title + ' ' + meta;
                var ok = true;

                if (text && haystack.indexOf(text) === -1) {
                    ok = false;
                }
                if (type && meta.indexOf(type.toLowerCase()) === -1) {
                    ok = false;
                }
                if (year && meta.indexOf(year.toLowerCase()) === -1) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [textInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (textInput) {
                    textInput.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var streamUrl = player.getAttribute('data-stream');
        var prepared = false;

        function prepareVideo() {
            if (!video || !streamUrl || prepared) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            prepared = true;
        }

        function startPlayback() {
            prepareVideo();
            if (!video) {
                return;
            }
            player.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                startPlayback();
            });
        }

        player.addEventListener('click', function () {
            if (!video || video.paused) {
                startPlayback();
            }
        });
    });
})();
