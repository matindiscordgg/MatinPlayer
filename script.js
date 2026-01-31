// =================================================================
// Player Script - Consolidated & Refined Version
// =================================================================

// --- DOM Element Selections ---
const audio = document.querySelector('audio') || new Audio(); // fallback in case audio tag isn't present initially
const playPauseBtn = document.querySelector('#playPauseBtn');
const nextBtn = document.querySelector('#nextBtn');
const prevBtn = document.querySelector('#prevBtn');
const playlistContainer = document.querySelector('#playlist');
const trackTitle = document.querySelector('#trackTitle');
// *** اصلاح کلیدی: انتخابگر آیدی به درستی روی 'audioFile' تنظیم شد ***
const fileInput = document.querySelector('#audioFile'); 

let playlist = [];
let currentTrackIndex = -1; // -1 indicates no track loaded yet

// --- Helper Functions ---

// Function to format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to update the playlist UI
function updatePlaylistUI() {
    if (!playlistContainer) return;
    playlistContainer.innerHTML = ''; 
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${track.name}`;
        li.dataset.index = index;
        if (index === currentTrackIndex) {
            li.classList.add('active'); 
        }
        // Use an anonymous function wrapper for index passing
        li.addEventListener('click', () => loadTrack(index));
        playlistContainer.appendChild(li);
    });
}

// Function to load a track by index
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) {
        console.error("Track index out of bounds.");
        return;
    }

    currentTrackIndex = index;
    const track = playlist[index];

    if (audio) {
        // Revoke previous object URL
        if (audio.src && audio.src.startsWith('blob:')) {
             URL.revokeObjectURL(audio.src);
        }
        
        audio.src = track.url;
        if(trackTitle) trackTitle.textContent = track.name;
        audio.load();

        // Attempt to play
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            }).catch(error => {
                // Autoplay blocked: user must click play button later
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
            });
        }
    }
    updatePlaylistUI();
}

// Function to load the current track based on currentTrackIndex
function loadCurrentTrack() {
    loadTrack(currentTrackIndex);
}

// Function to toggle play/pause
function togglePlayPause() {
    if (!audio || playlist.length === 0) return;
    if (audio.paused) {
        audio.play().then(() => {
            if (playPauseBtn) playPauseBtn.textContent = 'Pause';
        }).catch(_ => { /* Handle blocked play */ });
    } else {
        audio.pause();
        if (playPauseBtn) playPauseBtn.textContent = 'Play';
    }
}

// Function to play the next track
function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadCurrentTrack();
}

// Function to play the previous track
function prevTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadCurrentTrack();
}

// --- File Input Trigger Function (For HTML Button Call) ---
function triggerFileInput() {
    if (fileInput) {
        fileInput.click(); // This forcibly opens the file selection dialog
    } else {
        console.error("Error: File Input element with ID 'audioFile' not found.");
    }
}


// --- Event Listeners for Player Controls ---
if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);

if (audio) {
    audio.addEventListener('ended', nextTrack); 
}

// --- File Input Handling ---
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Cleanup previous files' URLs
        playlist.forEach(track => {
            if (track.url && track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
        });
        playlist = []; 
        currentTrackIndex = -1;

        files.filter(file => file.type.startsWith('audio/')).forEach(file => {
            playlist.push({
                name: file.name,
                url: URL.createObjectURL(file), 
                duration: 0
            });
        });

        if (playlist.length > 0) {
            currentTrackIndex = 0;
            loadCurrentTrack();
        } else {
            if(trackTitle) trackTitle.textContent = "No valid audio files were selected.";
        }
        updatePlaylistUI();
    });
} else {
    console.error("FATAL ERROR: File input element with ID 'audioFile' not found in HTML.");
}

// --- Initialization ---
function initializePlayer() {
    if (playPauseBtn) playPauseBtn.textContent = 'Play';
    if (trackTitle) trackTitle.textContent = 'Ready to load audio';
    updatePlaylistUI();
}

document.addEventListener('DOMContentLoaded', initializePlayer);

// Cleanup on window close
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url && track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
    });
});
