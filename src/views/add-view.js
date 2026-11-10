// src/views/add-view.js
class AddView {
  static getTemplate() {
    return `
      <section class="add-page">
        <h1 id="main-content">Tambah Cerita Baru</h1>
        <form id="add-story-form">
          <div>
            <label for="story-image">Gambar:</label>
            <input type="file" id="story-image" name="photo" accept="image/*">
            <button type="button" id="btn-camera">Ambil Foto</button>
            <video id="camera-preview" style="display:none;" autoplay></video>
            <canvas id="camera-canvas" style="display:none;"></canvas>
          </div>
          <div>
            <label for="story-desc">Deskripsi:</label>
            <textarea id="story-desc" name="description" required></textarea>
          </div>
          <div>
            <label>Lokasi:</label>
            <p>Klik pada peta untuk memilih lokasi</p>
            <div id="add-map" style="height: 300px;"></div>
            <input type="hidden" id="latitude" name="lat">
            <input type="hidden" id="longitude" name="lon">
          </div>
          <button type="submit">Kirim Cerita</button>
        </form>
        <div id="error-message" class="error-message"></div>
      </section>
    `;
  }
}
export default AddView;