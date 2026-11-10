// src/presenters/add-presenter.js
import AddView from '../views/add-view.js';
import StoryApi from '../api/story-api.js';
import MapHelper from '../utils/map-helper.js';
import FavoriteStoryDB from '../utils/indexeddb-helper.js'; // Untuk Outbox

class AddPresenter {
  constructor() {
    this.mapInstance = null;
  }

  /**
   * Fase 1: Hanya siapkan HTML dan pasang listener form
   */
  async render(container) {
    container.innerHTML = AddView.getTemplate();
    
    // Listener form aman dipasang di sini karena form adalah bagian
    // dari template yang baru saja dirender.
    document.getElementById('add-story-form')
      .addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Fase 2: Dipanggil oleh Router SETELAH transisi selesai
   * Inisialisasi peta dan kamera aman dijalankan di sini.
   */
  afterRender() {
    this.initMap();
    this.initCamera();
  }

  initMap() {
    // FIX: Hapus peta lama untuk mencegah bug duplikasi (Kriteria 3)
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    this.mapInstance = MapHelper.initMap('add-map');
    let marker;
    this.mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('latitude').value = lat;
      document.getElementById('longitude').value = lng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(this.mapInstance);
      }
    });

    // Perintah ini mungkin tidak lagi diperlukan jika 'initMap'
    // dipanggil di 'afterRender', tapi aman sebagai cadangan.
    setTimeout(() => this.mapInstance.invalidateSize(), 0);
  }

  /**
   * (Kriteria 3 & 4 Advance) Menangani submit form,
   * termasuk validasi kamera dan logika offline sync
   */
  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const rawData = new FormData(form);
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = "";

    // 1. Validasi dan siapkan data
    const formData = new FormData();
    const description = rawData.get("description");
    formData.append("description", description);

    const photo = rawData.get("photo");
    let photoBlob = null; // Kita butuh Blob untuk IndexedDB

    if (photo && photo.name) {
      photoBlob = photo;
      formData.append("photo", photo);
    } else {
      const canvas = document.getElementById("camera-canvas");
      if (canvas.width > 0) {
        photoBlob = await this.getCanvasBlob(canvas);
        formData.append("photo", photoBlob, "camera-capture.jpg");
      } else {
        errorMessage.textContent = "Error: Harap unggah foto atau ambil gambar dari kamera.";
        return;
      }
    }
    const lat = rawData.get("lat");
    const lon = rawData.get("lon");
    if (lat && lat !== 'null') formData.append("lat", lat);
    if (lon && lon !== 'null') formData.append("lon", lon);

    // 2. Coba kirim ke server
    try {
      await StoryApi.postStory(formData);
      alert("Cerita berhasil ditambahkan!");
      window.location.hash = "#/";
    } catch (error) {
      // 3. (Kriteria 4 Advance) Jika gagal KARENA offline, simpan ke outbox
      if (!navigator.onLine) {
        alert('Anda offline. Cerita disimpan di Outbox dan akan di-sync saat online.');
        await this._saveToOutbox({
          description: description,
          photo: photoBlob,
          lat: lat,
          lon: lon,
        });
        window.location.hash = "#/";
      } else {
        // Jika gagal karena alasan lain (server error, dll)
        errorMessage.textContent = `Error: ${error.message}`;
      }
    }
  }

  async _saveToOutbox(storyData) {
    try {
      await FavoriteStoryDB.addStoryToOutbox(storyData);
      // Mendaftarkan task 'sync' ke service worker
      const swRegistration = await navigator.serviceWorker.ready;
      await swRegistration.sync.register('sync-new-stories');
    } catch (e) {
      console.error('Gagal menyimpan ke outbox:', e);
      alert('Gagal menyimpan cerita untuk sinkronisasi.');
    }
  }

  // --- Logika Kamera (Kriteria 3 Advance) ---

  initCamera() {
    const btnCamera = document.getElementById('btn-camera');
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');

    if (btnCamera) {
      btnCamera.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.style.display = 'block';
          setTimeout(() => {
            this.captureImage(video, canvas, stream);
          }, 3000);
        } catch (error) {
          console.error('Kamera tidak dapat diakses:', error);
          alert('Tidak bisa mengakses kamera.');
        }
      });
    }
  }

  captureImage(video, canvas, stream) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    video.style.display = 'none';
    stream.getTracks().forEach(track => track.stop());
  }

  getCanvasBlob(canvas) {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg');
    });
  }
}

export default AddPresenter;