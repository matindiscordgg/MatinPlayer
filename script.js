document.addEventListener('DOMContentLoaded', () => {
    // --- المان‌های اصلی ---
    const audioFile = document.getElementById('audioFile');
    const playPauseButton = document.getElementById('playPauseButton');
    const seekBar = document.getElementById('seekBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const playlistContainer = document.getElementById('playlistContainer');
    const themeToggle = document.getElementById('themeToggle');

    // --- المان‌های ناوبری ---
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');

    // --- وضعیت پلیر و لیست پخش ---
    const audioPlayer = new Audio();
    let isPlaying = false;
    let playlist = []; // آرایه برای نگهداری فایل‌های صوتی انتخابی
    let currentTrackIndex = -1;

    // --- توابع کمکی ---

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const updatePlayPauseIcon = () => {
        const playIcon = playPauseButton.querySelector('.icon-play');
        const pauseIcon = playPauseButton.querySelector('.icon-pause');
        if (isPlaying) {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'inline-block';
        } else {
            if (playIcon) playIcon.style.display = 'inline-block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    };

    const updatePlaylistUI = () => {
        if (!playlistContainer) return;
        playlistContainer.innerHTML = ''; // پاک کردن لیست قدیمی

        playlist.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
            listItem.dataset.index = index;
            listItem.textContent = item.name;

            listItem.addEventListener('click', () => {
                if (index !== currentTrackIndex) {
                    playTrack(index);
                } else if (!isPlaying) {
                    // اگر همین آهنگ بود و متوقف بود، پخش شود
                    audioPlayer.play();
                    isPlaying = true;
                    updatePlayPauseIcon();
                }
            });
            playlistContainer.appendChild(listItem);
        });
    };

    const playTrack = (index) => {
        if (index < 0 || index >= playlist.length) return;
        
        currentTrackIndex = index;
        const track = playlist[index];

        audioPlayer.src = track.url;
        audioPlayer.load();
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayPauseIcon();
            updatePlaylistUI(); // برای به‌روزرسانی کلاس 'active'
        }).catch(error => {
            console.error("خطا در پخش آهنگ: ", error);
            isPlaying = false;
            updatePlayPauseIcon();
            alert(`نمی‌توان آهنگ "${track.name}" را پخش کرد.`);
        });
    };

    // --- مدیریت رویدادها ---

    // 1. رویداد انتخاب فایل (حالا فایل‌ها به لیست اضافه می‌شوند)
    audioFile.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        Array.from(files).forEach(file => {
            // فقط فرمت‌های صوتی مجاز (این منطق از قبل در HTML کنترل شده بود)
            if (file.type.startsWith('audio/')) {
                playlist.push({
                    name: file.name,
                    url: URL.createObjectURL(file)
                });
            }
        });

        // اگر این اولین فایلی است که اضافه شده، آن را پخش کن
        if (currentTrackIndex === -1 && playlist.length > 0) {
            currentTrackIndex = 0;
            audioPlayer.src = playlist[0].url;
            currentTrackTitle.textContent = playlist[0].name;
        } else if (currentTrackIndex !== -1) {
            // اگر پلیر فعال است، عنوان فعلی را به‌روز کن
            currentTrackTitle.textContent = playlist[currentTrackIndex].name;
        }
        
        event.target.value = ''; // پاک کردن ورودی فایل برای اجازه انتخاب مجدد
        updatePlaylistUI();
    });

    // 2. رویداد پخش/توقف
    playPauseButton.addEventListener('click', () => {
        if (playlist.length === 0) {
            alert("لطفاً ابتدا فایل صوتی را از طریق دکمه انتخاب کنید.");
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

    // 3. به‌روزرسانی زمان و نوار پیشرفت
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isNaN(audioPlayer.duration)) {
            const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            seekBar.value = percentage;
            currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    // 4. تنظیم زمان از طریق نوار پیشرفت
    seekBar.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const newTime = (seekBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = newTime;
        }
    });

    // 5. تنظیم مدت زمان آهنگ
    audioPlayer.addEventListener('loadedmetadata', () => {
        if (!isNaN(audioPlayer.duration)) {
            durationSpan.textContent = formatTime(audioPlayer.duration);
        }
    });
    
    // 6. مدیریت پایان آهنگ (پرش به آهنگ بعدی)
    audioPlayer.addEventListener('ended', () => {
        if (currentTrackIndex < playlist.length - 1) {
            playTrack(currentTrackIndex + 1); // رفتن به آهنگ بعدی در لیست
        } else {
            // پایان لیست پخش
            isPlaying = false;
            updatePlayPauseIcon();
            seekBar.value = 0;
            currentTimeSpan.textContent = '0:00';
            currentTrackTitle.textContent = "لیست پخش تمام شد";
            currentTrackIndex = -1; // بازنشانی
            updatePlaylistUI();
        }
    });

    // 7. دکمه‌های ناوبری لیست پخش
    nextButton.addEventListener('click', () => {
        if (playlist.length > 0) {
            const nextIndex = (currentTrackIndex + 1) % playlist.length;
            playTrack(nextIndex);
        }
    });

    prevButton.addEventListener('click', () => {
        if (playlist.length > 0) {
            // برای آهنگ اول، به انتهای لیست برو
            const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            playTrack(prevIndex);
        }
    });
    
    // 8. مدیریت تغییر تم (Dark/Light Mode)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            // منطق تغییر آیکون‌ها (باید در HTML شما تنظیم شده باشد)
            const isDark = document.body.classList.contains('dark-theme');
            const toggleIcon = themeToggle.querySelector('svg'); // فرض می‌کنیم آیکون درون دکمه است
            if (toggleIcon) {
                // فرض می‌کنیم آیکون SVG شما دارای کلاس‌هایی برای تشخیص حالت است
                // مثال: اگر آیکون خورشید/ماه دارید، کلاس‌هایشان را بر اساس isDark تغییر دهید
                console.log(`Theme switched to ${isDark ? 'Dark' : 'Light'}`);
            }
        });
    }

    // --- مقداردهی اولیه ---
    updatePlayPauseIcon();
    if (playlist.length === 0) {
        currentTrackTitle.textContent = "منتظر انتخاب فایل صوتی";
    }
});
