document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('mainAudioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const seekBar = document.getElementById('seekBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationTimeDisplay = document.getElementById('durationTime');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    
    // ** کنترل تم **
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const storedTheme = localStorage.getItem('theme');

    // تابع تنظیم تم
    const setTheme = (theme) => {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '🌙'; // آیکون ماه برای حالت تاریک
        } else {
            body.setAttribute('data-theme', 'light');
            themeToggle.textContent = '☀️'; // آیکون خورشید برای حالت روشن
        }
        localStorage.setItem('theme', theme);
    };

    // تنظیم اولیه تم بر اساس localStorage یا تنظیمات سیستم
    if (storedTheme) {
        setTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    // شنونده کلیک برای تغییر تم
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });


    // ** کنترل پخش **
    let isPlaying = false;
    let audioQueue = []; // صف پخش (هنوز برای چند آهنگ استفاده نمی‌شود، اما برای آینده)

    playPauseButton.addEventListener('click', () => {
        if (audioPlayer.src) {
            if (isPlaying) {
                audioPlayer.pause();
                playPauseButton.textContent = '▶️';
            } else {
                audioPlayer.play();
                playPauseButton.textContent = '⏸️';
            }
            isPlaying = !isPlaying;
        }
    });

    // به‌روزرسانی نوار پیشرفت
    audioPlayer.addEventListener('timeupdate', () => {
        if (!seekBar.hasAttribute('max')) {
            // اگر ماکسیمم تنظیم نشده، تنظیم می‌کنیم
            seekBar.max = audioPlayer.duration;
        }
        seekBar.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    // تغییر آهنگ بر اساس نوار پیشرفت
    seekBar.addEventListener('input', () => {
        audioPlayer.currentTime = seekBar.value;
    });

    // تنظیم طول آهنگ
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationTimeDisplay.textContent = formatTime(audioPlayer.duration);
        seekBar.max = audioPlayer.duration;
    });
    
    // تابع کمکی برای فرمت زمان
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    // ** کنترل فایل (جدید) **
    const openFileButton = document.getElementById('openFileButton');
    const audioFile = document.getElementById('audioFile');

    // کلیک روی دکمه ظاهر، ورودی فایل مخفی را فعال می‌کند
    openFileButton.addEventListener('click', () => {
        audioFile.click();
    });

    // بارگذاری فایل انتخاب شده
    audioFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // در آیفون، متأسفانه ما نمی‌توانیم فایل‌ها را به صورت پایدار در حافظه اپلیکیشن ذخیره کنیم
            // این راه حل فقط تا زمانی که مرورگر باز است کار می‌کند.
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            
            // نمایش نام فایل به جای عنوان پیش‌فرض
            currentTrackTitle.textContent = file.name;
            
            // شروع پخش
            audioPlayer.play();
            isPlaying = true;
            playPauseButton.textContent = '⏸️';

            // در اینجا می‌توانید منطق صف پخش (audioQueue) را برای اضافه کردن این فایل پیاده‌سازی کنید.
        }
    });
    
    // ** کنترل‌های Next/Prev (فعلاً فقط برای ساختار اضافه شده‌اند) **
    document.getElementById('prevButton').addEventListener('click', () => {
        alert('عملکرد پخش قبلی هنوز کامل نشده است.');
        // اینجا باید منطق پخش آهنگ قبلی در audioQueue اضافه شود.
    });
    document.getElementById('nextButton').addEventListener('click', () => {
        alert('عملکرد پخش بعدی هنوز کامل نشده است.');
        // اینجا باید منطق پخش آهنگ بعدی در audioQueue اضافه شود.
    });
});
