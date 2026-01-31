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

    // آیکون‌های پخش/توقف
    const playIcon = playPauseButton.querySelector('.icon-play');
    const pauseIcon = playPauseButton.querySelector('.icon-pause');

    // آیکون‌های تم
    const themeDarkIcon = themeToggle.querySelector('.icon-theme-dark');
    const themeLightIcon = themeToggle.querySelector('.icon-theme-light');

    let audio = null;
    let isPlaying = false;
    let currentTrackIndex = -1;
    let playlist = []; // لیستی برای نگهداری فایل‌های انتخاب شده

    // تابع برای فرمت زمان (مثلاً 0:00)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    }

    // تابع برای تنظیم تم
    function setTheme(theme) {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            themeDarkIcon.style.display = 'none';
            themeLightIcon.style.display = 'block';
        } else {
            body.removeAttribute('data-theme');
            themeDarkIcon.style.display = 'block';
            themeLightIcon.style.display = 'none';
        }
        localStorage.setItem('playerTheme', theme);
    }

    // بارگذاری تم ذخیره شده در Local Storage
    const savedTheme = localStorage.getItem('playerTheme') || 'light';
    setTheme(savedTheme);

    // رویداد کلیک دکمه تم
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });

    // رویداد کلیک برای دکمه انتخاب فایل
    openFileButton.addEventListener('click', () => {
        audioFile.click();
    });

    // رویداد تغییر فایل انتخاب شده
    audioFile.addEventListener('change', (event) => {
        const files = Array.from(event.target.files); // تبدیل FileList به آرایه
        if (files.length > 0) {
            playlist = files.map(file => URL.createObjectURL(file));
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
            event.target.value = ''; // پاک کردن مقدار ورودی فایل
        }
    });

    // تابع بارگذاری آهنگ
    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            const trackUrl = playlist[index];
            const trackName = (audioFile.files && audioFile.files[index]) ? audioFile.files[index].name : `Track ${index + 1}`;

            if (audio) {
                audio.pause();
                audio.src = '';
                audio = null; // حذف نمونه قبلی
            }

            audio = new Audio(trackUrl);
            currentTrackTitle.textContent = trackName;
            isPlaying = false;
            playPauseButton.innerHTML = ''; // پاک کردن محتوای قبلی
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playPauseButton.appendChild(playIcon);

            audio.addEventListener('loadedmetadata', () => {
                durationDisplay.textContent = formatTime(audio.duration);
                seekBar.max = audio.duration;
            });

            audio.addEventListener('timeupdate', () => {
                seekBar.value = audio.currentTime;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                if (!isPlaying) { // اگر در حالت مکث بود و آهنگ شروع به پخش کرد
                     playIcon.style.display = 'none';
                     pauseIcon.style.display = 'block';
                     playPauseButton.appendChild(pauseIcon);
                     isPlaying = true;
                }
            });

            audio.addEventListener('ended', () => {
                playNextTrack();
            });

            // پخش خودکار پس از بارگذاری متا داده‌ها
            audio.play().then(() => {
                 playIcon.style.display = 'none';
                 pauseIcon.style.display = 'block';
                 playPauseButton.appendChild(pauseIcon);
                 isPlaying = true;
            }).catch(error => {
                console.error("Autoplay failed:", error);
                // ممکن است نیاز به تعامل کاربر برای شروع پخش باشد
                currentTrackTitle.textContent = "خطا در پخش، لطفاً روی دکمه پخش بزنید.";
                isPlaying = false;
            });
        } else {
            currentTrackTitle.textContent = "پلی‌لیست خالی است یا آهنگ نامعتبر.";
            currentTimeDisplay.textContent = "0:00";
            durationDisplay.textContent = "0:00";
            seekBar.value = 0;
            playPauseButton.innerHTML = '';
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playPauseButton.appendChild(playIcon);
            isPlaying = false;
            playlist = [];
            currentTrackIndex = -1;
        }
    }


    // تابع پخش/توقف
    playPauseButton.addEventListener('click', () => {
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            isPlaying = false;
        } else {
            audio.play().then(() => {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                isPlaying = true;
            }).catch(error => {
                console.error("Play failed:", error);
                currentTrackTitle.textContent = "پخش امکان‌پذیر نیست. لطفاً فایل صوتی دیگری انتخاب کنید.";
            });
        }
         // به‌روزرسانی نمایش آیکون‌ها
         playPauseButton.appendChild(isPlaying ? pauseIcon : playIcon);
    });


    // رویداد تغییر نوار پیشرفت
    seekBar.addEventListener('input', () => {
        if (audio) {
            audio.currentTime = seekBar.value;
        }
    });

    // توابع برای آهنگ قبلی و بعدی
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

    prevButton.addEventListener('click', playPrevTrack);
    nextButton.addEventListener('click', playNextTrack);

});
