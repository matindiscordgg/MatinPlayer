// script.js - نسخه نهایی با گزارش‌گیری پیشرفته

const audio = document.querySelector('audio');
const playPauseBtn = document.querySelector('#playPauseBtn'); // فرض بر وجود آیدی
const nextBtn = document.querySelector('#nextBtn');           // فرض بر وجود آیدی
const prevBtn = document.querySelector('#prevBtn');           // فرض بر وجود آیدی
const playlistContainer = document.querySelector('#playlist'); // فرض بر وجود آیدی برای نمایش لیست
const trackTitleElement = document.querySelector('#trackTitle'); // فرض بر وجود آیدی

const fileInput = document.querySelector('#fileInput'); // ورودی فایل برای افزودن آهنگ

let playlist = [];
let currentTrackIndex = 0;

// =================================================================
// توابع کمکی
// =================================================================

/**
 * بارگذاری آهنگ بر اساس URL (چه blob و چه آدرس واقعی)
 * @param {string} url - منبع آهنگ
 */
function loadTrack(url) {
    console.log(`[DEBUG] Attempting to load track from URL: ${url}`);
    audio.src = url;
    audio.load(); // اجبار مرورگر به بارگذاری مجدد منبع
    
    // تلاش برای پخش خودکار (که ممکن است توسط مرورگر بلاک شود)
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log("[SUCCESS] Track started playing automatically.");
        }).catch(error => {
            // این بخش معمولاً به دلیل سیاست‌های Autoplay مرورگر رخ می‌دهد
            console.warn("[WARNING] Autoplay blocked. User must click play button.", error);
            if (trackTitleElement) {
                trackTitleElement.textContent = playlist[currentTrackIndex].name || "Ready to Play";
            }
            // اطمینان از فعال بودن دکمه پخش
            if (playPauseBtn) playPauseBtn.disabled = false;
        });
    }
}

/**
 * بارگذاری آهنگ فعلی از لیست پخش
 */
function loadCurrentTrack() {
    if (playlist.length === 0) {
        console.log("[INFO] Playlist is empty. Disabling controls.");
        if (playPauseBtn) playPauseBtn.disabled = true;
        if (trackTitleElement) trackTitleElement.textContent = "No Track Loaded";
        return;
    }

    const track = playlist[currentTrackIndex];
    if (track.url.startsWith('blob:')) {
        // اگر URL موقتی باشد، مستقیماً استفاده می‌شود
        loadTrack(track.url);
    } else {
        // اگر یک مسیر ثابت باشد (مثلاً 'music/song.mp3')، باید از آن استفاده کرد
        loadTrack(track.url);
    }
    
    if (playPauseBtn) playPauseBtn.disabled = false;
    if (trackTitleElement) trackTitleElement.textContent = track.name || `Track ${currentTrackIndex + 1}`;
}

// =================================================================
// Event Listeners
// =================================================================

// 1. مدیریت ورودی فایل جدید (آپلود)
if (fileInput) {
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        console.log(`[DEBUG] ${files.length} file(s) selected.`);

        Array.from(files).forEach(file => {
            // ایجاد URL موقت برای فایل محلی
            const trackUrl = URL.createObjectURL(file);
            
            playlist.push({
                name: file.name,
                url: trackUrl
            });
            console.log(`[SUCCESS] Added track to playlist: ${file.name}`);

            // اگر اولین آهنگ است، آن را بارگذاری کن
            if (playlist.length === 1) {
                currentTrackIndex = 0;
                loadCurrentTrack();
            }
        });

        // آپدیت بصری لیست پخش (اگر وجود داشته باشد)
        updatePlaylistDisplay();
        
        // ریست کردن ورودی فایل تا بتوان فایل تکراری را مجدداً انتخاب کرد
        fileInput.value = ''; 
    });
} else {
    console.error("[FATAL ERROR] Could not find file input element with ID 'fileInput'. Cannot load new tracks.");
}


// 2. مدیریت دکمه پخش/توقف
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (playlist.length === 0) {
             console.warn("[ACTION BLOCKED] Cannot play. Playlist is empty. Please add a track.");
             return;
        }

        if (audio.paused) {
            audio.play().catch(e => console.error("Error trying to play:", e));
            playPauseBtn.textContent = '❚❚'; // یا آیکون توقف
        } else {
            audio.pause();
            playPauseBtn.textContent = '▶'; // یا آیکون پخش
        }
    });
}

// 3. مدیریت دکمه‌های Next/Prev
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadCurrentTrack();
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadCurrentTrack();
    });
}

// 4. مدیریت پایان آهنگ
audio.addEventListener('ended', () => {
    console.log("[INFO] Current track ended. Skipping to next.");
    if (nextBtn) {
        nextBtn.click(); // استفاده از کلیک دکمه برای اجرای منطق Next
    } else {
        // اگر دکمه Next نداریم، به اول برمی‌گردیم
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadCurrentTrack();
    }
});

// 5. پاکسازی حافظه (بسیار مهم برای URLهای موقت)
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
            console.log(`[CLEANUP] Revoked object URL for: ${track.name}`);
        }
    });
});

// 6. تابع کمکی برای نمایش لیست (باید بر اساس HTML شما سفارشی شود)
function updatePlaylistDisplay() {
    if (!playlistContainer) return;
    playlistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${track.name}`;
        if (index === currentTrackIndex) {
            listItem.style.fontWeight = 'bold';
        }
        listItem.addEventListener('click', () => {
            currentTrackIndex = index;
            loadCurrentTrack();
        });
        playlistContainer.appendChild(listItem);
    });
}

// تنظیم اولیه (اگر فایلی از قبل در لیست بود)
loadCurrentTrack();
