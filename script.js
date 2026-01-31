// =================================================================
// Player Script - Final Refined Version
// =================================================================

const audio = document.querySelector('audio');
const playPauseBtn = document.querySelector('#playPauseBtn');
const nextBtn = document.querySelector('#nextBtn');
const prevBtn = document.querySelector('#prevBtn');
const playlistContainer = document.querySelector('#playlist');
const trackTitle = document.querySelector('#trackTitle');

// FIX: Correctly select the file input using its ID 'audioFile'
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
            li.classList.add('active'); // Highlight current track
        }
        li.addEventListener('click', () => {
            loadTrack(index);
        });
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
        // Revoke previous object URL before setting a new one to clean memory
        if (audio.src && audio.src.startsWith('blob:')) {
             URL.revokeObjectURL(audio.src);
        }
        
        audio.src = track.url;
        trackTitle.textContent = track.name;
        audio.load();

        // Attempt to play. User gesture is usually required.
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            }).catch(error => {
                // Autoplay blocked by browser
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
    if (!audio) return;
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

// --- Event Listeners for Player Controls ---
if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);

if (audio) {
    audio.addEventListener('ended', nextTrack); // Play next on end
    
    audio.addEventListener('loadedmetadata', () => {
        // Optional: Update duration display
    });
}

// --- File Input Handling (The core fix) ---
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Clear existing playlist and reset index
        // IMPORTANT: Before creating new blob URLs, revoke old ones if they exist.
        playlist.forEach(track => {
            if (track.url && track.url.startsWith('blob:')) {
                URL.revokeObjectURL(track.url);
            }
        });
        playlist = []; 
        currentTrackIndex = -1;

        files.filter(file => file.type.startsWith('audio/')).forEach(file => {
            playlist.push({
                name: file.name,
                url: URL.createObjectURL(file), // Create new blob URL
                duration: 0
            });
        });

        if (playlist.length > 0) {
            currentTrackIndex = 0;
            loadCurrentTrack();
        } else {
            trackTitle.textContent = "No valid audio files were selected.";
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

// Cleanup: Revoke object URLs when the window is closed
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url && track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
        }
    });
});
