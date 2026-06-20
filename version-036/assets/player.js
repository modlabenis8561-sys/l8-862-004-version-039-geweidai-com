(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var source = shell.querySelector('source');
        var cover = shell.querySelector('.player-cover');
        var hlsInstance = null;
        var started = false;
        var start = function () {
            if (!video || !source) {
                return;
            }
            var url = source.getAttribute('src');
            if (!url) {
                return;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                started = true;
            }
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {});
            }
        };
        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
