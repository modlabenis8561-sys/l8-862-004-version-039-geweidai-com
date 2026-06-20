(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('form.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.trim() : '';
            var url = form.getAttribute('data-search-url') || './search.html';
            if (keyword) {
                window.location.href = url + '?q=' + encodeURIComponent(keyword);
            } else {
                window.location.href = url;
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var filterInput = document.querySelector('.filter-input');
    var searchInput = document.getElementById('searchInput');
    var activeInput = searchInput || filterInput;
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
    }

    var normalize = function (value) {
        return (value || '').toString().toLowerCase();
    };

    var applyFilters = function () {
        if (!filterCards.length) {
            return;
        }
        var keyword = normalize(activeInput ? activeInput.value : '');
        var year = '';
        var type = '';
        selects.forEach(function (select) {
            var target = select.getAttribute('data-filter');
            if (target === 'year') {
                year = normalize(select.value);
            }
            if (target === 'type') {
                type = normalize(select.value);
            }
        });
        filterCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var matched = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (year && normalize(card.getAttribute('data-year')) !== year) {
                matched = false;
            }
            if (type && normalize(card.getAttribute('data-type')) !== type) {
                matched = false;
            }
            card.classList.toggle('is-hidden-by-filter', !matched);
        });
    };

    if (activeInput) {
        activeInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });
    applyFilters();
})();
