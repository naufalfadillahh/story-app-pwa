// src/presenters/favorites-presenter.js
import FavoritesView from '../views/favorites-view.js';
import FavoriteStoryDB from '../utils/indexeddb-helper.js';

class FavoritesPresenter {
  constructor() {
    this.allFavorites = [];
    this.view = FavoritesView;
    this.listContainer = null;
  }

  async render(container) {
    container.innerHTML = this.view.getTemplate();
    this.listContainer = document.getElementById('favorites-list');
    await this._fetchAndRenderFavorites();
    this._addSearchListener();
    this._addDeleteListeners();
  }

  async _fetchAndRenderFavorites() {
    this.listContainer.innerHTML = '<p>Loading...</p>';
    try {
      this.allFavorites = await FavoriteStoryDB.getAllStories();
      this._renderList(this.allFavorites);
    } catch (error) {
      this.listContainer.innerHTML = '<p class="error-message">Gagal memuat data favorit.</p>';
    }
  }

  _addSearchListener() {
    const searchInput = document.getElementById('search-favorite');
    if (!searchInput) return;
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      const filteredStories = this.allFavorites.filter(story =>
        story.name.toLowerCase().includes(query) ||
        (story.description && story.description.toLowerCase().includes(query))
      );
      this._renderList(filteredStories);
    });
  }

  _addDeleteListeners() {
    this.listContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('delete-button')) {
        const storyId = event.target.dataset.storyId;
        try {
          await FavoriteStoryDB.deleteStory(storyId);
          alert('Berhasil dihapus dari favorit');
          await this._fetchAndRenderFavorites();
          // Panggil search lagi (jika ada isinya)
          const searchInput = document.getElementById('search-favorite');
          if (searchInput && searchInput.value) {
            searchInput.dispatchEvent(new Event('input'));
          }
        } catch (error) {
          alert('Gagal menghapus data.');
        }
      }
    });
  }

  _renderList(stories) {
    this.listContainer.innerHTML = this.view.getStoryListTemplate(stories);
  }
}
export default FavoritesPresenter;