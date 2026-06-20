(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    if (slides.length > 1) {
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-search]'));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var rankItems = Array.prototype.slice.call(document.querySelectorAll('.rank-item'));
    var filterItems = cards.concat(rankItems);

    function textOf(node, name) {
        return (node.getAttribute(name) || '').toLowerCase();
    }

    function applyFilters() {
        var keyword = searchInputs.length ? searchInputs[0].value.trim().toLowerCase() : '';
        var typeValue = typeFilters.length ? typeFilters[0].value : 'all';
        var yearValue = yearFilters.length ? yearFilters[0].value : 'all';

        filterItems.forEach(function (item) {
            var haystack = [
                textOf(item, 'data-title'),
                textOf(item, 'data-genre'),
                textOf(item, 'data-region'),
                textOf(item, 'data-tags'),
                textOf(item, 'data-year'),
                textOf(item, 'data-type')
            ].join(' ');
            var typeMatch = typeValue === 'all' || textOf(item, 'data-type') === typeValue.toLowerCase();
            var yearMatch = yearValue === 'all' || textOf(item, 'data-year') === yearValue.toLowerCase();
            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            item.classList.toggle('hidden-by-filter', !(typeMatch && yearMatch && keywordMatch));
        });
    }

    searchInputs.concat(typeFilters).concat(yearFilters).forEach(function (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
    });

    function bindPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var stream = shell.getAttribute('data-stream');
        var prepared = false;
        var hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            prepare();
            shell.classList.add('is-playing');
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playAttempt = video.play();
            if (playAttempt && playAttempt.catch) {
                playAttempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!prepared || video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
