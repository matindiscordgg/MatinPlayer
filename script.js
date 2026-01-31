document.addEventListener('DOMContentLoaded', () => {
    // --- عناصر DOM ---
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackTime = document.getElementById('trackTime');
    const trackDuration = document.getElementById('trackDuration');
    const progressBar = document.getElementById('progressBar');
    const fileInput = document.getElementById('fileInput');
    const addSongBtn = document.getElementById('addSongBtn');
    const playlistUl = document.getElementById('playlist');

    // --- وضعیت پلیر ---
    let playlist = [];
    let currentTrackIndex = -1;
    let isPlaying = false;
    let audio = new Audio();

    // --- توابع کمکی ---

    // نمایش زمان در فرمت MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // به‌روزرسانی لیست پخش در UI
    const renderPlaylist = () => {
        playlistUl.innerHTML = '';
        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = track.name;
            li.dataset.index = index;
            if (index === currentTrackIndex) {
                li.classList.add('playing');
            }
            // کلیک روی آیتم لیست برای پخش مستقیم
            li.addEventListener('click', () => {
                if (currentTrackIndex !== index) {
                    currentTrackIndex = index;
                    loadTrack(playlist[currentTrackIndex]);
                    playPause();
                    renderPlaylist(); // برای به‌روزرسانی کلاس 'playing'
                }
            });
            playlistUl.appendChild(li);
        });
    };

    // بارگذاری ترک جدید در پلیر صوتی
    const loadTrack = (track) => {
        if (track.url) {
            audio.src = track.url;
            document.getElementById('currentSongTitle').textContent = track.name;
            // دکمه پخش را فعال کن
            playPauseBtn.disabled = false;
        } else {
            // اگر ترک URL نداشت (مثلاً لیست خالی بود)
            audio.src = '';
            document.getElementById('currentSongTitle').textContent = "هیچ آهنگی انتخاب نشده";
            playPauseBtn.disabled = true;
        }
    };

    // اجرای پخش یا توقف
    const playPause = () => {
        if (playlist.length === 0) return;

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; // آیکون پخش
        } else {
            audio.play().catch(error => {
                console.error("خطا در پخش خودکار:", error);
                // این معمولاً به دلیل سیاست‌های Autoplay مرورگر است
                alert("اجرای خودکار مسدود شد. لطفاً دکمه پخش را دوباره بزنید.");
            });
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; // آیکون توقف
        }
        renderPlaylist();
    };

    // پخش آهنگ بعدی
    const playNext = () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(playlist[currentTrackIndex]);
        if (isPlaying) {
            audio.play();
        }
        renderPlaylist();
    };

    // پخش آهنگ قبلی
    const playPrev = () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(playlist[currentTrackIndex]);
        if (isPlaying) {
            audio.play();
        }
        renderPlaylist();
    };

    // --- رویدادهای Audio ---

    audio.addEventListener('loadedmetadata', () => {
        trackDuration.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
    });

    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            trackTime.textContent = formatTime(audio.currentTime);
            progressBar.value = audio.currentTime;
        }
    });

    audio.addEventListener('ended', playNext);

    // --- رویدادهای UI ---

    // کنترل پخش/توقف
    playPauseBtn.addEventListener('click', playPause);

    // کنترل آهنگ بعدی/قبلی
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);

    // کنترل صدا
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });
    audio.volume = volumeSlider.value / 100; // تنظیم اولیه

    // کنترل نوار پیشرفت (کشیدن نوار)
    progressBar.addEventListener('input', (e) => {
        audio.currentTime = e.target.value;
    });

    // رویداد کلیک روی دکمه افزودن آهنگ (باز کردن File Dialog)
    addSongBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // رویداد تغییر فایل (هنگامی که کاربر فایلی را انتخاب می‌کند)
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        let addedNewTrack = false;

        Array.from(files).forEach(file => {
            // اطمینان از اینکه فایل یک فایل صوتی است (می‌توانید این بررسی را دقیق‌تر کنید)
            if (file.type.startsWith('audio/')) {
                
                // **نکته مهم**: ما URL.createObjectURL را اینجا ایجاد می‌کنیم تا فایل در حافظه مرورگر بماند.
                const trackUrl = URL.createObjectURL(file); 
                const trackName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                
                playlist.push({
                    file: file, // ارجاع به آبجکت فایل اصلی (فقط برای نگهداری در لیست)
                    name: trackName,
                    url: trackUrl // URL موقت برای پخش
                });
                addedNewTrack = true;
            } else {
                console.warn(`فایل نادیده گرفته شد، نوع فایل صوتی نیست: ${file.name}`);
            }
        });
        
        // اگر ترک جدید اضافه شد و هیچ ترک فعالی نبود، اولین ترک اضافه شده را لود کن
        if (addedNewTrack && currentTrackIndex === -1) {
            currentTrackIndex = playlist.length - files.length; // اندیس اولین ترک جدید
            loadTrack(playlist[currentTrackIndex]);
        }
        
        renderPlaylist();
        // ریست کردن ورودی فایل برای امکان انتخاب مجدد فایل‌های تکراری
        e.target.value = null; 
    });

    // --- مقداردهی اولیه ---
    if (playlist.length === 0) {
        playPauseBtn.disabled = true;
        document.getElementById('currentSongTitle').textContent = "لطفاً با دکمه 'افزودن آهنگ' فایل اضافه کنید.";
    }
    renderPlaylist();
});

// پاکسازی URLهای ایجاد شده هنگام بسته شدن صفحه برای جلوگیری از نشت حافظه
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url && track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
        }
    });
});
