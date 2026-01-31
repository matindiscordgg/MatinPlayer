document.addEventListener('DOMContentLoaded', () => {
    // 1. گرفتن المان‌های مورد نیاز
    const audioFile = document.getElementById('audioFile');
    const playPauseButton = document.getElementById('playPauseButton');
    const seekBar = document.getElementById('seekBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const themeToggle = document.getElementById('themeToggle');

    // ایجاد تگ audio به صورت داینامیک
    const audioPlayer = new Audio();
    audioPlayer.preload = 'auto'; // برای بارگذاری سریع‌تر

    let isPlaying = false;

    // --- توابع کمکی ---

    // فرمت زمان به صورت دقیقه:ثانیه
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // به‌روزرسانی آیکون پخش/توقف
    const updatePlayPauseIcon = () => {
        const playIcon = playPauseButton.querySelector('.icon-play');
        const pauseIcon = playPauseButton.querySelector('.icon-pause');
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline-block';
        } else {
            playIcon.style.display = 'inline-block';
            pauseIcon.style.display = 'none';
        }
    };

    // --- مدیریت رویدادها ---

    // 2. رویداد انتخاب فایل
    audioFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // ساخت URL برای فایل محلی
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            
            // به‌روزرسانی عنوان
            currentTrackTitle.textContent = file.name;

            // فعال‌سازی اولیه و آماده‌سازی برای پخش
            audioPlayer.load();
            // نیازی به اجرای خودکار نیست، منتظر کلیک کاربر می‌مانیم
            isPlaying = false;
            updatePlayPauseIcon();
            seekBar.value = 0;
            currentTimeSpan.textContent = '0:00';
            durationSpan.textContent = '0:00';

            // اگر تم (Theme) شما نیاز به تغییر آیکون خورشید/ماه دارد، اینجا کد آن را اضافه کنید
        }
    });

    // 3. رویداد پخش/توقف
    playPauseButton.addEventListener('click', () => {
        if (!audioPlayer.src) {
            alert("لطفاً ابتدا یک فایل صوتی انتخاب کنید.");
            return;
        }
        
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().catch(error => {
                console.error("خطا در پخش: ", error);
                alert("پخش با خطا مواجه شد. مرورگر ممکن است اجازه پخش خودکار نداده باشد.");
            });
        }
        isPlaying = !isPlaying;
        updatePlayPauseIcon();
    });

    // 4. به‌روزرسانی زمان و نوار پیشرفت در حین پخش
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isNaN(audioPlayer.duration)) {
            const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            seekBar.value = percentage;
            currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    // 5. تنظیم زمان از طریق نوار پیشرفت (Seek Bar)
    seekBar.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const newTime = (seekBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = newTime;
        }
    });

    // 6. تعیین مدت زمان آهنگ هنگام بارگذاری متادیتا
    audioPlayer.addEventListener('loadedmetadata', () => {
        if (!isNaN(audioPlayer.duration)) {
            durationSpan.textContent = formatTime(audioPlayer.duration);
            seekBar.max = 100; // مطمئن شدن از تنظیم درست max
        }
    });
    
    // 7. مدیریت پایان آهنگ
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon();
        seekBar.value = 0;
        currentTimeSpan.textContent = '0:00';
        // اینجا می‌توانید کد پرش به آهنگ بعدی را اضافه کنید
    });
    
    // 8. مدیریت دکمه‌های بعدی/قبلی (نیاز به لیست پخش دارد، فعلاً غیرفعال یا Placeholder است)
    // (برای کامل بودن، شما باید یک آرایه از فایل‌ها داشته باشید تا این دکمه‌ها کار کنند)
    document.getElementById('nextButton').addEventListener('click', () => {
        // در این نسخه ساده، چیزی تغییر نمی‌کند
        console.log("Next button clicked - requires playlist logic.");
    });

    document.getElementById('prevButton').addEventListener('click', () => {
        // در این نسخه ساده، چیزی تغییر نمی‌کند
        console.log("Previous button clicked - requires playlist logic.");
    });

    // 9. مدیریت تغییر تم (فقط یک نمونه ساده)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        // در اینجا باید آیکون SVG داخل دکمه را بر اساس کلاس dark-theme تغییر دهید.
    });
});
