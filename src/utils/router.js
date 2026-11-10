// src/utils/router.js
import HomePresenter from '../presenters/home-presenter.js';
import AddPresenter from '../presenters/add-presenter.js';
import AuthPresenter from '../presenters/auth-presenter.js';
import FavoritesPresenter from '../presenters/favorites-presenter.js';
import FavoriteStoryDB from '../utils/indexeddb-helper.js';

const appContainer = document.getElementById('app-container');

const routes = {
  '/': HomePresenter,
  '/add': AddPresenter,
  '/login': AuthPresenter,
  '/register': AuthPresenter,
  '/favorites': FavoritesPresenter,
};

/**
 * Memperbarui tampilan Navbar berdasarkan status login
 */
const updateNav = () => {
  const isLoggedIn = !!localStorage.getItem('authToken');

  document.getElementById('nav-home').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('nav-add').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('nav-favorites').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('nav-logout').style.display = isLoggedIn ? 'block' : 'none';

  document.getElementById('nav-login').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('nav-register').style.display = isLoggedIn ? 'none' : 'block';
};

/**
 * Menangani klik Logout
 */
document.getElementById('nav-logout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('authToken');
  // (Kriteria 4 Advance) Hapus token dari IDB saat logout
  FavoriteStoryDB.deleteAuthToken();
  window.location.hash = '#/login';
});

/**
 * Router utama
 */
const router = async () => {
  updateNav();

  // 1. Dapatkan path dan status login
  const path = window.location.hash.slice(1).toLowerCase() || '/';
  const isLoggedIn = !!localStorage.getItem('authToken');

  // 2. Auth Guard (Pelindung Rute)
  const protectedRoutes = ['/', '/add', '/favorites'];
  const authRoutes = ['/login', '/register'];

  if (protectedRoutes.includes(path) && !isLoggedIn) {
    window.location.hash = '#/login'; // Wajib login
    return;
  }
  if (authRoutes.includes(path) && isLoggedIn) {
    window.location.hash = '#/'; // Jika sudah login, lempar ke home
    return;
  }

  // 3. Tentukan Presenter
  const Presenter = routes[path] || routes['/'];
  const presenter = new Presenter();

  // 4. (Kriteria 1) Implementasi View Transition
  if (!document.startViewTransition) {
    // Fallback jika browser tidak mendukung
    await presenter.render(appContainer);
    if (typeof presenter.afterRender === 'function') {
      presenter.afterRender();
    }
    return;
  }

  // --- PERBAIKAN PETA LEAFLET (Timing) ---
  const transition = document.startViewTransition(async () => {
    // 1. Hanya render HTML-nya
    await presenter.render(appContainer);
  });

  // 2. Tunggu transisi SELESAI
  await transition.finished;

  // 3. BARU panggil inisialisasi peta dan DOM
  // Ini memastikan <div id="map"> sudah memiliki ukuran
  if (typeof presenter.afterRender === 'function') {
    presenter.afterRender();
  }
  // --- AKHIR PERBAIKAN ---
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);