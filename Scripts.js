const musicCard = document.getElementById('music-card');
const flipBtn = document.getElementById('flip-btn');
const showNowBtn = document.getElementById('show-now-btn');
const themeToggle = document.getElementById('theme-toggle');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgress = document.getElementById('volume-progress');
const favoriteBtn = document.getElementById('favorite-btn');
const wave = document.getElementById('wave');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const albumCover = document.getElementById('album-cover');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlistTabs = document.querySelectorAll('.playlist-tab');
const mainPlaylistSection = document.getElementById('main-playlist-section');
const tabContentOverlay = document.getElementById('tab-content-overlay');
const tabOverlayTitle = document.getElementById('tab-overlay-title');
const tabOverlayBody = document.getElementById('tab-overlay-body');
const closeOverlayBtn = document.getElementById('close-overlay-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
let createPlaylistForm, playlistNameInput, cancelCreateBtn, savePlaylistBtn;
let editPlaylistForm, editPlaylistNameInput, cancelEditBtn, saveEditBtn, editSongsList;

const songs = [
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        cover: "image.png",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "3:20",
        favorite: false
    },
    {
        title: "Save Your Tears",
        artist: "The Weeknd",
        cover: "image.png",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "3:35",
        favorite: true
    },
    {
        title: "Levitating",
        artist: "Dua Lipa",
        cover: "image.png",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "3:23",
        favorite: false
    },
    {
        title: "Stay",
        artist: "The Kid LAROI, Justin Bieber",
        cover: "image.png",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: "2:21",
        favorite: true
    },
    {
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        cover: "image.png",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: "2:58",
        favorite: false
    }
];

let playlists = [
    {
        name: "My Favorites",
        songs: [songs[1], songs[3]]
    },
    {
        name: "Workout Mix",
        songs: [songs[0], songs[2]]
    }
];

const audio = new Audio();

let currentSongIndex = 0;
let isPlaying = false;
let isFavorite = false;
let isDarkMode = true;
let activeTab = null;
let playlistToDeleteIndex = -1; 
let playlistToEditIndex = -1; 
function initPlayer() {
    if (isDarkMode) {
        document.body.classList.remove('light-mode'); 
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    loadSong(songs[currentSongIndex]);
    audio.volume = 0.5; 
    volumeProgress.style.width = '50%';
}

function loadSong(song) {
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumCover.src = song.cover;
    durationEl.textContent = song.duration;
    isFavorite = song.favorite;
    updateFavoriteButton();
    audio.src = song.audio;
}

async function togglePlay() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        try {
            await audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            musicCard.classList.add('playing'); 
            startWaveAnimation();
        } catch (error) {
            console.error("Error playing audio:", error);
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            musicCard.classList.remove('playing');
            stopWaveAnimation();
            showCustomModal("Playback Failed", "Autoplay might be blocked by your browser. Please interact with the player directly to start playback.");
        }
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        musicCard.classList.remove('playing');
        stopWaveAnimation();
    }
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) {
        audio.play();
    }
    if (activeTab === 'current') {
        renderCurrentTabContent();
    } else if (activeTab === 'favorites') {
        renderFavoritesTabContent();
    } else if (activeTab === 'playlists' && typeof playlistToEditIndex !== 'undefined' && playlistToEditIndex !== -1) {
        renderSpecificPlaylistContent(playlists[playlistToEditIndex], playlistToEditIndex);
    }
}

function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > songs.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) {
        audio.play();
    }
    if (activeTab === 'current') {
        renderCurrentTabContent();
    } else if (activeTab === 'favorites') {
        renderFavoritesTabContent();
    } else if (activeTab === 'playlists' && typeof playlistToEditIndex !== 'undefined' && playlistToEditIndex !== -1) {
        renderSpecificPlaylistContent(playlists[playlistToEditIndex], playlistToEditIndex);
    }
}

function updateProgress() {
    const { duration, currentTime } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    progressContainer.style.setProperty('--progress-width', `${progressPercent}%`);

    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) {
        currentSeconds = `0${currentSeconds}`;
    }
    currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;

    if (isNaN(duration) || duration === 0) {
        durationEl.textContent = '0:00';
    } else {
        const totalMinutes = Math.floor(duration / 60);
        let totalSeconds = Math.floor(duration % 60);
        if (totalSeconds < 10) {
            totalSeconds = `0${totalSeconds}`;
        }
        durationEl.textContent = `${totalMinutes}:${totalSeconds}`;
    }
}

function setProgress(e) {
    const width = progressContainer.clientWidth; 
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (!isNaN(duration) && duration > 0) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function setVolume(e) {
    const width = volumeSlider.clientWidth;
    const clickX = e.offsetX;
    const volume = Math.max(0, Math.min(1, clickX / width)); 
    audio.volume = volume;
    volumeProgress.style.width = `${volume * 100}%`;
}

function toggleFavorite() {
    isFavorite = !isFavorite;
    songs[currentSongIndex].favorite = isFavorite;
    updateFavoriteButton();
    if (activeTab === 'favorites') {
        renderFavoritesTabContent();
    }
    if (activeTab === 'current') {
        renderCurrentTabContent();
    }

    favoriteBtn.classList.add('active');
    setTimeout(() => {
        favoriteBtn.classList.remove('active');
    }, 800);
}

function updateFavoriteButton() {
    if (isFavorite) {
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        favoriteBtn.style.color = '#ff4757';
    } else {
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        favoriteBtn.style.color = 'var(--control-color)';
    }
}

function startWaveAnimation() {
    wave.style.display = 'flex';
    const bars = wave.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'running';
    });
}

function stopWaveAnimation() {
    const bars = wave.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.animationPlayState = 'paused';
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; 
    } else {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function openTabOverlay(tabName) {
    activeTab = tabName;
    tabOverlayBody.innerHTML = ''; 
    mainPlaylistSection.style.display = 'none'; 

    tabContentOverlay.classList.add('active'); 
    switch (tabName) {
        case 'current':
            tabOverlayTitle.textContent = 'Currently Playing';
            renderCurrentTabContent();
            break;
        case 'playlists':
            tabOverlayTitle.textContent = 'Your Playlists';
            renderPlaylistsTabContent();
            break;
        case 'favorites':
            tabOverlayTitle.textContent = 'Your Favorites';
            renderFavoritesTabContent();
            break;
        default:
            tabOverlayTitle.textContent = '';
    }
}

function closeTabOverlay() {
    tabContentOverlay.classList.remove('active');
    mainPlaylistSection.style.display = 'block'; 
    activeTab = null;
    playlistToEditIndex = -1; 
}

function renderCurrentTabContent() {
    tabOverlayBody.innerHTML = '';
    const currentSong = songs[currentSongIndex];
    if (currentSong) {
        const songItem = document.createElement('div');
        songItem.className = 'current-playing-info'; 
        songItem.innerHTML = `
                    <img src="${currentSong.cover}" alt="Album Cover" onerror="this.onerror=null;this.src='https://placehold.co/70x70/cccccc/333333?text=Cover';">
                    <div class="current-playing-text">
                        <h4>Now Playing: ${currentSong.title}</h4>
                        <p>${currentSong.artist}</p>
                    </div>
                    ${currentSong.favorite ? '<i class="fas fa-heart" style="color: var(--danger-color); margin-left: auto;"></i>' : ''}
                `;
        tabOverlayBody.appendChild(songItem);
    } else {
        tabOverlayBody.innerHTML = '<p style="text-align: center; color: var(--control-color); padding: 20px;">No song is currently playing.</p>';
    }
}

function renderPlaylistsTabContent() {
    tabOverlayBody.innerHTML = ''; 
    const existingBackButton = tabContentOverlay.querySelector('.tab-content-overlay-header .close-overlay-btn[data-back="true"]');
    if (existingBackButton) {
        existingBackButton.remove();
    }
    tabOverlayTitle.textContent = 'Your Playlists'; 

    const createFormHtml = `
                <div class="create-playlist-form" id="create-playlist-form-overlay">
                    <div class="form-group">
                        <label for="playlist-name-overlay">New Playlist Name:</label>
                        <input type="text" id="playlist-name-overlay" placeholder="e.g., Chill Vibes">
                    </div>
                    <div class="form-actions">
                        <button class="cancel-btn" id="cancel-create-overlay">Cancel</button>
                        <button class="save-btn" id="save-playlist-overlay">Create</button>
                    </div>
                </div>
                <button class="playlist-item playlist-item-clickable" id="create-playlist-btn-overlay">
                    <i class="fas fa-plus-circle"></i>
                    <div class="playlist-item-info">
                        <h4>Create New Playlist</h4>
                        <p>Start a new collection</p>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
    tabOverlayBody.insertAdjacentHTML('beforeend', createFormHtml);

    createPlaylistForm = document.getElementById('create-playlist-form-overlay');
    playlistNameInput = document.getElementById('playlist-name-overlay');
    cancelCreateBtn = document.getElementById('cancel-create-overlay');
    savePlaylistBtn = document.getElementById('save-playlist-overlay');
    const createPlaylistBtnOverlay = document.getElementById('create-playlist-btn-overlay');


    createPlaylistBtnOverlay.addEventListener('click', showCreatePlaylistFormOverlay);
    cancelCreateBtn.addEventListener('click', hideCreatePlaylistFormOverlay);
    savePlaylistBtn.addEventListener('click', createNewPlaylistOverlay);


    function showCreatePlaylistFormOverlay() {
        createPlaylistForm.classList.add('active');
        playlistNameInput.focus();
        createPlaylistBtnOverlay.style.display = 'none';
    }

    function hideCreatePlaylistFormOverlay() {
        createPlaylistForm.classList.remove('active');
        playlistNameInput.value = '';
        createPlaylistBtnOverlay.style.display = 'flex';
    }

    function createNewPlaylistOverlay() {
        const name = playlistNameInput.value.trim();
        if (name) {
            playlists.push({
                name: name,
                songs: []
            });
            renderPlaylistsTabContent(); 
            hideCreatePlaylistFormOverlay();
        } else {
            showCustomModal("Input Required", "Please enter a playlist name.");
        }
    }

    playlists.forEach((playlist, index) => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.innerHTML = `
                    <i class="fas fa-compact-disc" style="padding: 0 10px ; font-size: 2rem; "></i>

                    <div class="playlist-item-info">
                        <h4>${playlist.name}</h4>
                        <p>${playlist.songs.length} ${playlist.songs.length === 1 ? 'song' : 'songs'}</p>
                    </div>
                    <div class="playlist-actions">
                        <button class="edit-playlist-btn" data-playlist-index="${index}" title="Edit Playlist">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-playlist-btn" data-playlist-index="${index}" title="Delete Playlist">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="view-playlist-btn" data-playlist-index="${index}" title="View Songs">
                             <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;

   
        playlistItem.querySelector('.view-playlist-btn').addEventListener('click', () => {
            renderSpecificPlaylistContent(playlist, index);
        });
      
        playlistItem.querySelector('.delete-playlist-btn').addEventListener('click', (event) => {
            event.stopPropagation(); 
            console.log('Delete button clicked for playlist index:', index, 'Name:', playlist.name); // Debugging
            showDeleteConfirmation(index, playlist.name);
        });
        playlistItem.querySelector('.edit-playlist-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            openEditPlaylistForm(index);
        });

        tabOverlayBody.insertBefore(playlistItem, createPlaylistForm); 
    });
}

function renderSpecificPlaylistContent(playlist, playlistIndex) {
    tabOverlayBody.innerHTML = ''; 
    playlistToEditIndex = playlistIndex;

    tabOverlayTitle.textContent = playlist.name;

    const backButton = document.createElement('button');
    backButton.className = 'close-overlay-btn'; 
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backButton.setAttribute('data-back', 'true'); 
    backButton.style.position = 'absolute';
    backButton.style.left = '25px';
    backButton.style.top = '25px';
    backButton.onclick = () => renderPlaylistsTabContent(); 
    tabContentOverlay.querySelector('.tab-content-overlay-header').prepend(backButton); 

    const currentSong = songs[currentSongIndex];
    if (currentSong && playlist.songs.some(s => s.title === currentSong.title && s.artist === currentSong.artist)) {
        const currentPlayingInfoDiv = document.createElement('div');
        currentPlayingInfoDiv.className = 'current-playing-info';
        currentPlayingInfoDiv.innerHTML = `
                    <img src="${currentSong.cover}" alt="Album Cover" onerror="this.onerror=null;this.src='https://placehold.co/70x70/cccccc/333333?text=Cover';">
                    <div class="current-playing-text">
                        <h4>Now Playing: ${currentSong.title}</h4>
                        <p>${currentSong.artist}</p>
                    </div>
                `;
        tabOverlayBody.appendChild(currentPlayingInfoDiv);
    }

    if (playlist.songs.length === 0) {
        tabOverlayBody.innerHTML += '<p style="text-align: center; color: var(--control-color); padding: 20px;">This playlist is empty.</p>';
    } else {
        playlist.songs.forEach(song => {
            const songItem = document.createElement('div');
            songItem.className = 'playlist-item';
            if (songs[currentSongIndex].title === song.title && songs[currentSongIndex].artist === song.artist) {
                songItem.classList.add('active');
            }

            songItem.innerHTML = `
                        <img src="${song.cover}" alt="Cover" onerror="this.onerror=null;this.src='https://placehold.co/50x50/cccccc/333333?text=Cover';">
                        <div class="playlist-item-info">
                            <h4>${song.title}</h4>
                            <p>${song.artist}</p>
                        </div>
                        <i class="fas fa-play-circle" style="color: var(--primary-color);"></i>
                    `;

            songItem.addEventListener('click', () => {
                currentSongIndex = songs.findIndex(s => s.title === song.title && s.artist === song.artist);
                loadSong(songs[currentSongIndex]);
                if (isPlaying) {
                    audio.play();
                } else {
                    togglePlay();
                }
                renderSpecificPlaylistContent(playlist, playlistIndex);
            });
            tabOverlayBody.appendChild(songItem);
        });
    }
}

function renderFavoritesTabContent() {
    tabOverlayBody.innerHTML = ''; 

    const existingBackButton = tabContentOverlay.querySelector('.tab-content-overlay-header .close-overlay-btn[data-back="true"]');
    if (existingBackButton) {
        existingBackButton.remove();
    }
    tabOverlayTitle.textContent = 'Your Favorites'; 


    const favoriteSongs = songs.filter(song => song.favorite);

    if (favoriteSongs.length === 0) {
        tabOverlayBody.innerHTML = '<p style="text-align: center; color: var(--control-color); padding: 20px;">No favorite songs yet. Click the heart icon on the main player to add some!</p>';
        return;
    }

    favoriteSongs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.className = 'playlist-item';
        if (songs[currentSongIndex].title === song.title && songs[currentSongIndex].artist === song.artist) {
            songItem.classList.add('active');
        }

        songItem.innerHTML = `
                    <img src="${song.cover}" alt="Cover" onerror="this.onerror=null;this.src='https://placehold.co/50x50/cccccc/333333?text=Cover';">
                    <div class="playlist-item-info">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                    <i class="fas fa-heart" style="color: var(--danger-color);"></i>
                `;

        songItem.addEventListener('click', () => {
            currentSongIndex = songs.findIndex(s => s.title === song.title && s.artist === song.artist);
            loadSong(songs[currentSongIndex]);
            if (isPlaying) {
                audio.play();
            } else {
                togglePlay();
            }
            renderFavoritesTabContent();
        });

        tabOverlayBody.appendChild(songItem);
    });
}

// --- Playlist CRUD Operations ---

function showDeleteConfirmation(index, playlistName) {
    playlistToDeleteIndex = index; 
    modalMessage.textContent = `Are you sure you want to delete the playlist "${playlistName}"? This action cannot be undone.`;
    confirmationModal.classList.add('active'); 

   
    modalConfirmBtn.onclick = () => {
        console.log('Confirm delete button clicked. Deleting playlist at index:', playlistToDeleteIndex); // Debugging
        deletePlaylist();
    };
    modalCancelBtn.onclick = () => {
        console.log('Cancel delete button clicked.'); 
        hideCustomModal();
    };
    modalConfirmBtn.style.display = ''; 
    modalCancelBtn.textContent = 'Cancel';
}

function deletePlaylist() {
    if (playlistToDeleteIndex !== -1) {
        playlists.splice(playlistToDeleteIndex, 1);
        console.log('Playlist deleted. Current playlists:', playlists); 
        hideCustomModal(); 
        renderPlaylistsTabContent(); 
        playlistToDeleteIndex = -1; 
    } else {
        console.warn('Attempted to delete playlist but playlistToDeleteIndex was -1.');
    }
}

function hideCustomModal() {
    confirmationModal.classList.remove('active');
}

function showCustomModal(title, message) {
    modalConfirmBtn.style.display = 'none'; 
    modalCancelBtn.textContent = 'Ok'; 
    modalCancelBtn.onclick = () => hideCustomModal(); 
    modalMessage.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
    confirmationModal.classList.add('active');
}

function openEditPlaylistForm(index) {
    playlistToEditIndex = index;
    const playlist = playlists[index];

    tabOverlayBody.innerHTML = ''; 
    tabOverlayTitle.textContent = `Edit Playlist: ${playlist.name}`;

    const backButton = document.createElement('button');
    backButton.className = 'close-overlay-btn'; 
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backButton.setAttribute('data-back', 'true');
    backButton.style.position = 'absolute';
    backButton.style.left = '25px';
    backButton.style.top = '25px';
    backButton.onclick = () => renderPlaylistsTabContent(); 
    tabContentOverlay.querySelector('.tab-content-overlay-header').prepend(backButton);

    const editFormHtml = `
                <div class="edit-playlist-form active" id="edit-playlist-form-overlay">
                    <div class="form-group">
                        <label for="edit-playlist-name-overlay">Playlist Name:</label>
                        <input type="text" id="edit-playlist-name-overlay" value="${playlist.name}">
                    </div>
                    <h4>Songs in Playlist:</h4>
                    <div class="song-selection-list" id="edit-songs-in-playlist">
                        </div>
                    <h4>Add/Remove Songs:</h4>
                    <div class="song-selection-list" id="all-songs-selection">
                        </div>
                    <div class="form-actions">
                        <button class="cancel-btn" id="cancel-edit-overlay">Cancel</button>
                        <button class="save-btn" id="save-playlist-edit-overlay">Save Changes</button>
                    </div>
                </div>
            `;
    tabOverlayBody.insertAdjacentHTML('beforeend', editFormHtml);

    editPlaylistForm = document.getElementById('edit-playlist-form-overlay');
    editPlaylistNameInput = document.getElementById('edit-playlist-name-overlay');
    cancelEditBtn = document.getElementById('cancel-edit-overlay');
    saveEditBtn = document.getElementById('save-playlist-edit-overlay');
    editSongsList = document.getElementById('all-songs-selection');

    cancelEditBtn.addEventListener('click', () => renderPlaylistsTabContent()); 
    saveEditBtn.addEventListener('click', savePlaylistChanges);

    renderSongSelectionForEdit(playlist);
}

function renderSongSelectionForEdit(currentPlaylist) {
    editSongsList.innerHTML = '';

    songs.forEach((song, index) => {
        const isChecked = currentPlaylist.songs.some(s => s.title === song.title && s.artist === song.artist);

        const songItem = document.createElement('div');
        songItem.className = 'song-selection-item';
        songItem.innerHTML = `
                    <input type="checkbox" id="song-${index}" value="${index}" ${isChecked ? 'checked' : ''}>
                    <label for="song-${index}">
                        <img src="${song.cover}" alt="Cover" onerror="this.onerror=null;this.src='https://placehold.co/30x30/cccccc/333333?text=C';">
                        ${song.title} - ${song.artist}
                    </label>
                `;
        editSongsList.appendChild(songItem);
    });
}

function savePlaylistChanges() {
    const newName = editPlaylistNameInput.value.trim();
    if (!newName) {
        showCustomModal("Input Required", "Playlist name cannot be empty.");
        return;
    }

    const updatedSongs = [];
    editSongsList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const songIndex = parseInt(checkbox.value);
        updatedSongs.push(songs[songIndex]);
    });

    if (playlistToEditIndex !== -1) {
        playlists[playlistToEditIndex].name = newName;
        playlists[playlistToEditIndex].songs = updatedSongs;
        showCustomModal("Success!", `Playlist "${newName}" updated successfully.`);
        renderPlaylistsTabContent(); 
    } else {
        showCustomModal("Error", "No playlist selected for editing.");
    }
}



flipBtn.addEventListener('click', () => {
    musicCard.classList.add('flipped');
});

showNowBtn.addEventListener('click', () => {
    musicCard.classList.remove('flipped');
});

themeToggle.addEventListener('click', toggleTheme);

playBtn.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', prevSong);

nextBtn.addEventListener('click', nextSong);

let isDraggingProgress = false;
progressContainer.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    setProgress(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audio.duration;
        if (!isNaN(duration) && duration > 0) {
            audio.currentTime = (clickX / width) * duration;
        }
    }
});
document.addEventListener('mouseup', () => {
    isDraggingProgress = false;
});

let isDraggingVolume = false;
volumeSlider.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    setVolume(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) {
        const rect = volumeSlider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const volume = Math.max(0, Math.min(1, clickX / width));
        audio.volume = volume;
        volumeProgress.style.width = `${volume * 100}%`;
    }
});
document.addEventListener('mouseup', () => {
    isDraggingVolume = false;
});

favoriteBtn.addEventListener('click', toggleFavorite);

playlistTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        openTabOverlay(tab.dataset.tab);
    });
});


closeOverlayBtn.addEventListener('click', closeTabOverlay);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);
audio.addEventListener('loadedmetadata', updateProgress);

window.onload = function() {
    initPlayer();
}