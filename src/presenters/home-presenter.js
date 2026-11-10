// src/presenters/home-presenter.js
import HomeView from '../views/home-view.js';
import StoryApi from '../api/story-api.js';
import MapHelper from '../utils/map-helper.js';
import FavoriteStoryDB from '../utils/indexeddb-helper.js';

class HomePresenter {
  constructor() {
    this.mapInstance = null;
    this.stories = [];
  }

  async render(container) {
    container.innerHTML = HomeView.getLoadingTemplate();
    try {
      // Coba fetch dari API
      this.stories = await StoryApi.getAllStories();

      // Simpan ke IndexedDB untuk offline mode
      await FavoriteStoryDB.saveStories(this.stories);

      container.innerHTML = HomeView.getTemplate(this.stories, true); // true = online

      // --- PERBAIKAN PETA (TIMING) ---
      // Tunda eksekusi ke 'tick' berikutnya
      // Ini memberi browser waktu untuk menghitung ukuran <div id="map">
      setTimeout(async () => {
        this.initMap(this.stories);

        // PENTING: Pindahkan semua logika DOM ke dalam setTimeout
        this._addSaveButtonListeners();
        await this._updateSaveButtonsUI();
      }, 0); // 0 milidetik sudah cukup
      // --- AKHIR PERBAIKAN ---

    } catch (error) {
      // Jika offline, coba ambil dari IndexedDB
      try {
        this.stories = await FavoriteStoryDB.getStories();
        if (this.stories && this.stories.length > 0) {
          container.innerHTML = HomeView.getTemplate(this.stories, false); // false = offline
          setTimeout(async () => {
            this.initMap(this.stories);
            this._addSaveButtonListeners();
            await this._updateSaveButtonsUI();
          }, 0);
        } else {
          container.innerHTML = HomeView.getErrorTemplate('Tidak ada data offline tersedia.');
        }
      } catch (dbError) {
        container.innerHTML = HomeView.getErrorTemplate(error.message);
      }
    }
  }

  initMap(stories) {
    // FIX: Hapus peta lama untuk mencegah bug duplikasi
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    this.mapInstance = MapHelper.initMap('map');

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this.mapInstance)
          .bindPopup(
            `<b>${story.name}</b><br>${story.description.substring(0, 50)}...`,
          );
      }
    });

    // Event listener untuk sinkronisasi list dan peta
    document.querySelectorAll('.story-item').forEach((item) => {
      item.addEventListener('click', () => {
        const lat = item.dataset.lat;
        const lon = item.dataset.lon;
        if (lat && lon) {
          this.mapInstance.flyTo([lat, lon], 15);
        }
      });
    });

    // --- SOLUSI UTAMA ---
    // Setelah semua diatur, paksa Leaflet menghitung ulang ukurannya.
    // Dijalankan di dalam setTimeout(0) dari render(), 
    // tapi jika initMap dipanggil dari tempat lain, ini adalah pengaman.
    this.mapInstance.invalidateSize();
  }

  _addSaveButtonListeners() {
    const listContainer = document.querySelector('.story-list');
    if (!listContainer) return;
    listContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('save-button')) {
        event.stopPropagation(); // FIX: Mencegah klik 'bubble' ke peta
        const button = event.target;
        const storyId = button.dataset.storyId;
        const isSaved = button.classList.contains('saved');
        button.disabled = true;
        if (isSaved) {
          button.textContent = 'Menghapus...';
          try {
            await FavoriteStoryDB.deleteStory(storyId);
            alert('Cerita dihapus dari favorit!');
            button.textContent = 'Simpan ke Favorit';
            button.classList.remove('saved');
          } catch (error) {
            alert('Gagal menghapus favorit.');
            button.textContent = 'Tersimpan';
          }
        } else {
          button.textContent = 'Menyimpan...';
          const storyToSave = this.stories.find((s) => s.id === storyId);
          if (storyToSave) {
            try {
              await FavoriteStoryDB.addStory(storyToSave);
              alert('Cerita berhasil disimpan ke favorit!');
              button.textContent = 'Tersimpan';
              button.classList.add('saved');
            } catch (error) {
              alert('Gagal menyimpan favorit. Mungkin sudah ada?');
              button.textContent = 'Tersimpan';
              button.classList.add('saved');
            }
          }
        }
        button.disabled = false;
      }
    });
  }

  async _updateSaveButtonsUI() {
    const listContainer = document.querySelector('.story-list');
    if (!listContainer) return;
    try {
      const savedStories = await FavoriteStoryDB.getAllStories();
      const savedIds = savedStories.map((story) => story.id);
      const allButtons = listContainer.querySelectorAll('.save-button');
      allButtons.forEach((button) => {
        const storyId = button.dataset.storyId;
        if (savedIds.includes(storyId)) {
          button.textContent = 'Tersimpan';
          button.classList.add('saved');
        } else {
          button.textContent = 'Simpan ke Favorit';
          button.classList.remove('saved');
        }
        button.disabled = false;
      });
    } catch (error) {
      console.warn('Gagal memverifikasi status favorit dari DB:', error);
    }
  }
}

export default HomePresenter;