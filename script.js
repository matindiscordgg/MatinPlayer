document.addEventListener('DOMContentLoaded', () => {
    const audioFile = document.getElementById('audioFile');
    const openFileButton = document.getElementById('openFileButton');
    const playPauseButton = document.getElementById('playPauseButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const seekBar = document.getElementById('seekBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    const playIcon = playPauseButton.querySelector('.icon-play');
    const pauseIcon = playPauseButton.querySelector('.icon-pause');
    const themeDarkIcon = themeToggle.querySelector('.icon-theme-dark');
    const themeLightIcon = themeToggle.querySelector('.icon-theme-light');

    let audio = null;
    let isPlaying = false;
    let currentTrackIndex = -1;
    let playlist = [];

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            if (themeDarkIcon) themeDarkIcon.style.display = 'none';
            if (themeLightIcon) themeLightIcon.style.display = 'block';
        } else {
            body.removeAttribute('data-theme');
            if (themeDarkIcon) themeDarkIcon.style.display = 'block';
            if (themeLightIcon) themeLightIcon.style.display = 'none';
        }
        localStorage.setItem('playerTheme', theme);
    }

    const savedTheme = localStorage.getItem('playerTheme') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    openFileButton.addEventListener('click', () => {
        audioFile.click();
    });

    audioFile.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            playlist = files.map(file => URL.createObjectURL(file));
            // ذخیره نام فایل‌ها برای نمایش
            audioFile.filesForDisplay = files;
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
            event.target.value = '';
        }
    });

    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            const trackUrl = playlist[index];
            // استفاده از نام فایل ذخیره شده اگر موجود باشد
            const trackName = (audioFile.filesForDisplay && audioFile.filesForDisplay[index]) ? audioFile.filesForDisplay[index].name : `Track ${index + 1}`;

            if (audio) {
                audio.pause();
                audio.src = '';
                audio = null;
            }

            audio = new Audio(trackUrl);
            currentTrackTitle.textContent = trackName;
            isPlaying = false;

            // اطمینان از وجود آیکون‌ها قبل از دسترسی
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (playPauseButton) playPauseButton.innerHTML = ''; // پاک کردن محتوای قبلی
            if (playIcon) playPauseButton.appendChild(playIcon);

            audio.addEventListener('loadedmetadata', () => {
                durationDisplay.textContent = formatTime(audio.duration);
                seekBar.max = audio.duration;
            });

            audio.addEventListener('timeupdate', () => {
                if (seekBar) seekBar.value = audio.currentTime;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                 // اطمینان از وجود آیکون‌ها قبل از دسترسی
                if (!isPlaying && playIcon && pauseIcon) {
                     playIcon.style.display = 'none';
                     pauseIcon.style.display = 'block';
                     if (playPauseButton) playPauseButton.innerHTML = '';
                     if (pauseIcon) playPauseButton.appendChild(pauseIcon);
                     isPlaying = true;
                }
            });

            audio.addEventListener('ended', () => {
                playNextTrack();
            });

            audio.play().then(() => {
                // موفقیت پخش
            }).catch(error => {
                console.error("Autoplay failed:", error);
                if (currentTrackTitle) currentTrackTitle.textContent = "خطا در پخش، لطفاً روی دکمه پخش بزنید.";
                isPlaying = false;
            });
        } else {
            if (currentTrackTitle) currentTrackTitle.textContent = "پلی‌لیست خالی است یا آهنگ نامعتبر.";
            if (currentTimeDisplay) currentTimeDisplay.textContent = "0:00";
            if (durationDisplay) durationDisplay.textContent = "0:00";
            if (seekBar) seekBar.value = 0;
            if (playPauseButton && playIcon) {
                playPauseButton.innerHTML = '';
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                playPauseButton.appendChild(playIcon);
            }
            isPlaying = false;
            playlist = [];
            currentTrackIndex = -1;
        }
    }

    if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
            if (!audio) return;

            if (isPlaying) {
                audio.pause();
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
                isPlaying = false;
            } else {
                audio.play().then(() => {
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                    isPlaying = true;
                }).catch(error => {
                    console.error("Play failed:", error);
                    if (currentTrackTitle) currentTrackTitle.textContent = "پخش امکان‌پذیر نیست. لطفاً فایل صوتی دیگری انتخاب کنید.";
                });
            }
            // به‌روزرسانی نمایش آیکون‌ها
            if (playPauseButton && pauseIcon && playIcon) {
                playPauseButton.innerHTML = '';
                playPauseButton.appendChild(isPlaying ? pauseIcon : playIcon);
            }
        });
    }


    if (seekBar) {
        seekBar.addEventListener('input', () => {
            if (audio) {
                audio.currentTime = seekBar.value;
            }
        });
    }

    function playPrevTrack() {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 - playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    }

    function playNextTrack() {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    }

    if (prevButton) prevButton.addEventListener('click', playPrevTrack);
    if (nextButton) nextButton.addEventListener('click', playNextTrack);

});
