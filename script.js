// --- DOM Element Selections ---
const audio = document.getElementById('audioElement'); 
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const playlistContainer = document.getElementById('playlist');
const trackTitle = document.getElementById('trackTitle');
const fileInput = document.getElementById('audioFile'); // ورودی فایل مخفی

let playlist = [];
let currentTrackIndex = -1;

// --- Helper Functions ---
function updatePlaylistUI() {
    if (!playlistContainer) return;
    playlistContainer.innerHTML = ''; 
    if (playlist.length === 0) {
         playlistContainer.innerHTML = '<li style="color: #888;">(لیست خالی است)</li>';
         return;
    }
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${track.name}`;
        if (index === currentTrackIndex) {
            li.classList.add('active'); 
        }
        li.addEventListener('click', () => loadTrack(index));
        playlistContainer.appendChild(li);
    });
}

function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    currentTrackIndex = index;
    const track = playlist[index];

    if (audio) {
        // پاکسازی URL قدیمی
        if (audio.src && audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
        
        audio.src = track.url;
        if(trackTitle) trackTitle.textContent = track.name;
        audio.load();

        // تلاش برای پخش خودکار
        audio.play().then(() => {
             if (playPauseBtn) playPauseBtn.textContent = 'Pause';
        }).catch(error => {
            // اگر پخش به دلیل سیاست‌های مرورگر مسدود شد
            if (playPauseBtn) playPauseBtn.textContent = 'Play (کلیک کنید)';
        });
    }
    updatePlaylistUI();
}

function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
}

function prevTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
}

// *** این تابع مستقیماً روی ورودی فایل مخفی کلیک می کند ***
function triggerFileInput() {
    if (fileInput) {
        fileInput.click(); 
    }
}


// --- Event Listeners ---
if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
    if (!audio || playlist.length === 0) return;
    if (audio.paused) {
        audio.play().then(() => {
             if (playPauseBtn) playPauseBtn.textContent = 'Pause';
        }).catch(_ => { /* مدیریت خطای پخش */ });
    } else {
        audio.pause();
        if (playPauseBtn) playPauseBtn.textContent = 'Play';
    }
});
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);
if (audio) audio.addEventListener('ended', nextTrack); 

// --- File Input Handling (زمانی که فایل انتخاب می شود) ---
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // پاکسازی لیست قدیمی
        playlist.forEach(track => {
            if (track.url && track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
        });
        playlist = []; 
        currentTrackIndex = -1;

        files.filter(file => file.type.startsWith('audio/')).forEach(file => {
            playlist.push({
                name: file.name,
                url: URL.createObjectURL(file), // ساخت URL برای فایل
            });
        });

        if (playlist.length > 0) {
            currentTrackIndex = 0;
            loadTrack(0);
        } else {
            if(trackTitle) trackTitle.textContent = "فایلی بارگذاری نشده است...";
        }
        updatePlaylistUI();
    });
}

// --- Cleanup on window close (برای جلوگیری از Memory Leak) ---
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url && track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
    });
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (playPauseBtn) playPauseBtn.textContent = 'Play';
    updatePlaylistUI();
});
