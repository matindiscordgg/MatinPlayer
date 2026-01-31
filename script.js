// --- متغیرهای اصلی ---
const audioPlayer = new Audio();
const fileInput = document.getElementById('audioFile');
const playPauseButton = document.getElementById('playPauseButton');
const nextButton = document.getElementById('nextButton');
const prevButton = document.getElementById('prevButton');
const themeToggle = document.getElementById('themeToggle');
const seekBar = document.getElementById('seekBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const playlistContainer = document.getElementById('playlistContainer');
const currentTrackTitle = document.getElementById('currentTrackTitle');

let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;

// --- توابع کمکی ---

/**
 * فرمت زمان (ثانیه) به دقیقه:ثانیه
 * @param {number} secs - زمان بر حسب ثانیه
 * @returns {string} زمان فرمت شده
 */
function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * به‌روزرسانی ظاهر آیکون تم
 */
function updateThemeIcon() {
    const moonIcon = document.getElementById('moon-icon');
    const sunIconPath = document.getElementById('sun-icon-path');
    
    // اگر کلاس dark-theme روی body وجود دارد، یعنی حالت تاریک فعال است
    const isDark = document.body.classList.contains('dark-theme');
    
    if (isDark) {
        moonIcon.style.display = 'block'; // آیکون ماه را برای خاموش کردن تم تیره
        sunIconPath.style.display = 'none';
    } else {
        moonIcon.style.display = 'none';
        sunIconPath.style.display = 'block'; // آیکون خورشید را برای روشن کردن تم تیره
    }
}

// --- مدیریت فایل‌ها ---

/**
 * زمانی که کاربر فایل انتخاب می‌کند
 */
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files).filter(file => file.type.startsWith('audio/'));
    if (files.length === 0) return;

    // فایل‌ها را به لیست اضافه می‌کنیم
    files.forEach(file => {
        playlist.push({
            file: file,
            name: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
            url: URL.createObjectURL(file)
        });
    });
    
    renderPlaylist();
    
    // اگر اولین بار است، آهنگ اول را بارگذاری می‌کنیم
    if (currentTrackIndex === -1 || currentTrackIndex >= playlist.length - files.length) {
        currentTrackIndex = playlist.length - files.length; // شروع از اولین فایل جدید اضافه شده
        loadTrack(currentTrackIndex);
        playTrack();
    }
});

/**
 * رندر کردن لیست پخش
 */
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const listItem = document.createElement('li');
        listItem.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        listItem.dataset.index = index;
        
        // برای نمایش زمان، باید صبر کنیم تا متادیتا لود شود، اما فعلاً 0:00 می‌گذاریم
        listItem.innerHTML = `
            <span class="track-name">${track.name}</span>
            <span class="track-duration">...</span> 
        `;
        
        listItem.addEventListener('click', () => {
            if (currentTrackIndex !== index) {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                playTrack();
            }
        });
        
        playlistContainer.appendChild(listItem);
    });
}

/**
 * بارگذاری آهنگ در پلیر
 */
function loadTrack(index) {
    if (index >= 0 && index < playlist.length) {
        const track = playlist[index];
        audioPlayer.src = track.url;
        currentTrackTitle.textContent = track.name;
        
        // در حین بارگذاری، عنوان لیست را به‌روز می‌کنیم
        updateActiveInPlaylist();
    } else {
        currentTrackTitle.textContent = "هیچ آهنگی بارگذاری نشده است...";
        audioPlayer.src = "";
        durationDisplay.textContent = "0:00";
        currentTimeDisplay.textContent = "0:00";
        seekBar.value = 0;
        updateActiveInPlaylist();
    }
}

function updateActiveInPlaylist() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        item.classList.remove('active');
        // زمان نمایش داده شده در لیست را نیز در این مرحله به‌روز می‌کنیم اگر پلیر آماده باشد
        if (index === currentTrackIndex) {
            item.classList.add('active');
        }
        
        const durationSpan = item.querySelector('.track-duration');
        if(index === currentTrackIndex && !isNaN(audioPlayer.duration)) {
             durationSpan.textContent = formatTime(audioPlayer.duration);
        } else if (durationSpan.textContent === "...") {
             // در حالت اولیه یا برای لیست‌های دیگر، فعلاً آن را خالی می‌گذاریم
        }
    });
}


// --- کنترل‌های پخش ---

function playTrack() {
    if (playlist.length === 0 || currentTrackIndex === -1) return;
    
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayPauseButtonIcon();
    }).catch(error => {
        console.error("خطا در پخش:", error);
        alert("پخش آهنگ با خطا مواجه شد. لطفاً ابتدا یک آهنگ انتخاب یا بارگذاری کنید.");
    });
}

function pauseTrack() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayPauseButtonIcon();
}

function togglePlayPause() {
    if (playlist.length === 0) {
        fileInput.click(); // اگر لیستی خالی است، از کاربر بخواه فایل آپلود کند
        return;
    }
    
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function prevTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function updatePlayPauseButtonIcon() {
    const playIcon = playPauseButton.querySelector('.icon-play');
    const pauseIcon = playPauseButton.querySelector('.icon-pause');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
    } else {
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
    }
}

// --- رویدادهای پلیر ---

audioPlayer.addEventListener('loadedmetadata', () => {
    // زمانی که متادیتای آهنگ بارگذاری شد (طول آهنگ مشخص شد)
    durationDisplay.textContent = formatTime(audioPlayer.duration);
    seekBar.max = audioPlayer.duration;
    
    // به‌روزرسانی زمان در لیست پخش فعال
    const activeItem = playlistContainer.querySelector('.playlist-item.active .track-duration');
    if (activeItem) {
        activeItem.textContent = formatTime(audioPlayer.duration);
    }
});

audioPlayer.addEventListener('timeupdate', () => {
    // هر لحظه زمان را به‌روز می‌کنیم
    if (!isNaN(audioPlayer.duration)) {
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        seekBar.value = audioPlayer.currentTime;
    }
});

audioPlayer.addEventListener('ended', () => {
    // آهنگ تمام شد، برو به آهنگ بعدی
    nextTrack();
});

// --- رویدادهای کنترل نوار و تم ---

seekBar.addEventListener('input', () => {
    // کاربر در حال جابجایی نوار است (نمایش زمان جاری)
    currentTimeDisplay.textContent = formatTime(seekBar.value);
});

seekBar.addEventListener('change', () => {
    // کاربر نوار را رها کرد (تغییر واقعی زمان)
    if (playlist.length > 0 && !isNaN(audioPlayer.duration)) {
        audioPlayer.currentTime = seekBar.value;
        // اگر کاربر زمان را تغییر داد و پخش متوقف بود، پخش را از سر بگیریم
        if (!isPlaying) {
            playTrack();
        }
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    updateThemeIcon();
    // برای اعمال استایل‌های جدید لیست
    renderPlaylist(); 
});

// --- اتصال رویدادها به دکمه‌ها ---
playPauseButton.addEventListener('click', togglePlayPause);
nextButton.addEventListener('click', nextTrack);
prevButton.addEventListener('click', prevTrack);


// --- مقداردهی اولیه ---
updateThemeIcon(); // تنظیم اولیه آیکون تم
// اعمال اولیه وضعیت دکمه پخش/توقف
updatePlayPauseButtonIcon();
