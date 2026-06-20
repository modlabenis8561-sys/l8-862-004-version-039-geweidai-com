(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initFilters() {
        var forms = document.querySelectorAll("[data-filter-form]");
        forms.forEach(function (form) {
            var section = form.parentElement;
            var scope = section ? section.querySelector("[data-filter-scope]") : null;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var input = form.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(form.querySelectorAll("[data-filter-select]"));
            var empty = document.createElement("div");
            empty.className = "filter-empty";
            empty.textContent = "没有找到匹配的影片";
            scope.appendChild(empty);

            function apply() {
                var query = normalize(input ? input.value : "");
                var active = {};
                selects.forEach(function (select) {
                    active[select.getAttribute("data-filter-select")] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var ok = !query || haystack.indexOf(query) !== -1;
                    Object.keys(active).forEach(function (key) {
                        if (active[key] && normalize(card.getAttribute("data-" + key)) !== active[key]) {
                            ok = false;
                        }
                    });
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                empty.style.display = visible ? "none" : "block";
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var src = shell.getAttribute("data-src");
            var attached = false;
            var hlsInstance = null;
            if (!video || !cover || !src) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
                attached = true;
            }

            function start() {
                attach();
                shell.classList.add("is-playing");
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            cover.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initFilters();
        initPlayers();
    });
})();
