// src/views/favorites-view.js
class FavoritesView {
  static getTemplate() {
    return `
      <section class="home-page">
        <h1 id="main-content">Cerita Favorit</h1>
        
        <div class="search-container">
          <label for="search-favorite">Cari Favorit:</label>
          <input type="search" id="search-favorite" placeholder="Cari berdasarkan nama...">
        </div>
        
        <div id="favorites-list" class="story-list">
          </div>
      </section>
    `;
  }

  static getStoryListTemplate(stories) {
    if (stories.length === 0) {
      return '<p class="error-message">Anda belum memiliki cerita favorit.</p>';
    }
    return stories.map(story => `
      <article class="story-item" tabindex="0">
        <img src="${story.photoUrl}" alt="Cerita oleh ${story.name}">
        <div class="story-info">
          <h2>${story.name}</h2>
          <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
          <p>${story.description.substring(0, 100)}...</p>
          <button class="delete-button" data-story-id="${story.id}">Hapus Favorit</button>
        </div>
      </article>
    `).join('');
  }
}
export default FavoritesView;