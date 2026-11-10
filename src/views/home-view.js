// src/views/home-view.js
class HomeView {
  static getTemplate(stories, isOnline = true) {
    const statusIndicator = isOnline
      ? '<div class="status-indicator online">🟢 Online</div>'
      : '<div class="status-indicator offline">🔴 Offline - Menampilkan data tersimpan</div>';

    return `
      <section class="home-page">
        <h1 id="main-content">Semua Cerita</h1>
        ${statusIndicator}
        <div class="story-list">
          ${stories.map(story => `
            <article class="story-item" tabindex="0"
                     data-lat="${story.lat}" data-lon="${story.lon}">

              <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}">

              <div class="story-info">
                <h2>${story.name}</h2>
                <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
                <p>${story.description.substring(0, 100)}...</p>

                <button class="save-button" data-story-id="${story.id}">Simpan ke Favorit</button>
              </div>
            </article>
          `).join('')}
        </div>
        <div id="map"></div>
      </section>
    `;
  }

  static getLoadingTemplate() {
    return `<div class="loading-spinner"><p>Sedang memuat cerita...</p></div>`;
  }
  static getErrorTemplate(message) {
    return `<div class="error-message"><p>Maaf, terjadi kesalahan: ${message}</p></div>`;
  }
}
export default HomeView;