// =================================================================
// Player Script - Final Version with fixes
// =================================================================

const audio = document.querySelector('audio');
const playPauseBtn = document.querySelector('#playPauseBtn');
const nextBtn = document.querySelector('#nextBtn');
const prevBtn = document.querySelector('#prevBtn');
const playlistContainer = document.querySelector('#playlist');
const trackTitle = document.querySelector('#trackTitle');

// ********************************************************************
// FIX: Correctly select the file input using its ID 'audioFile'
// ********************************************************************
const fileInput = document.querySelector('#audioFile');
// ********************************************************************

let playlist = [];
let currentTrackIndex = -1; // -1 indicates no track loaded yet

// Function to format time (seconds to MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to update the playlist UI
function updatePlaylistUI() {
    if (!playlistContainer) return;
    playlistContainer.innerHTML = ''; // Clear existing list
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${track.name}`;
        li.dataset.index = index;
        li.addEventListener('click', () => {
            if (currentTrackIndex !== index) {
                loadTrack(index);
            } else {
                togglePlayPause(); // Allow re-clicking current track to play/pause
            }
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
        audio.src = track.url;
        trackTitle.textContent = track.name;
        audio.load();

        // Attempt to play. Autoplay might be blocked by the browser.
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Playback started successfully
                console.log(`Playback started for: ${track.name}`);
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            }).catch(error => {
                // Autoplay was prevented.
                console.warn("Autoplay was prevented. User must interact to start playback.", error);
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
                // Ensure player controls are not disabled if autoplay fails
            });
        }
    }
    updatePlaylistUI(); // Highlight current track in UI
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
        }).catch(error => {
            console.warn("Playback prevented on toggle.", error);
        });
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

// Event Listeners for Player Controls
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
}
if (nextBtn) {
    nextBtn.addEventListener('click', nextTrack);
}
if (prevBtn) {
    prevBtn.addEventListener('click', prevTrack);
}

// Event listener for when the current track ends
if (audio) {
    audio.addEventListener('ended', () => {
        // Simulate clicking the next button to play the next track
        // This ensures the same logic as nextTrack() is called
        nextTrack();
    });

    audio.addEventListener('timeupdate', () => {
        // Optional: Update time display if you have elements for it
        // For example:
        // const currentTimeDisplay = document.querySelector('#currentTime');
        // if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        // Update duration display if you have elements for it
        // For example:
        // const durationDisplay = document.querySelector('#duration');
        // if (durationDisplay) durationDisplay.textContent = formatTime(audio.duration);
        
        // Store duration if needed, though it might be complex with blob URLs
        if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
            playlist[currentTrackIndex].duration = audio.duration;
        }
    });
}

// ********************************************************************
// FIX: Event listener for file input 'change' event
// Ensures we correctly handle the selected audio files.
// ********************************************************************
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
            console.log("No files selected.");
            return;
        }

        // Clear existing playlist and reset index if new files are added
        // You might want different behavior here (e.g., appending)
        playlist = []; 
        currentTrackIndex = -1;

        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                playlist.push({
                    name: file.name,
                    url: URL.createObjectURL(file),
                    duration: 0 // Will be updated by loadedmetadata
                });
            } else {
                console.warn(`Skipping non-audio file: ${file.name}`);
            }
        });

        if (playlist.length > 0) {
            currentTrackIndex = 0; // Load the first file from the selection
            loadCurrentTrack();
        } else {
            console.log("No valid audio files were selected.");
            trackTitle.textContent = "No audio files selected.";
        }
        updatePlaylistUI();
    });
} else {
    console.error("Error: File input element with ID 'audioFile' not found. Upload functionality will not work.");
}
// ********************************************************************


// Function to initialize the player (e.g., set default state)
function initializePlayer() {
    // Set initial button states or text
    if (playPauseBtn) playPauseBtn.textContent = 'Play';
    if (trackTitle) trackTitle.textContent = 'No track loaded';
    
    // Ensure audio element is ready
    if (audio) {
        audio.pause();
        audio.removeAttribute('src'); // Clear any previous source
    }
    
    // Clear playlist UI initially
    updatePlaylistUI();
}

// Initialize the player when the DOM is ready
document.addEventListener('DOMContentLoaded', initializePlayer);

// Cleanup: Revoke object URLs when the window is closed or navigating away
window.addEventListener('beforeunload', () => {
    playlist.forEach(track => {
        if (track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
        }
    });
    console.log("Blob URLs revoked.");
});
