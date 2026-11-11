// src/presenters/auth-presenter.js
import StoryApi from '../api/story-api.js';
import LoginView from '../views/login-view.js';
import RegisterView from '../views/register-view.js';
import FavoriteStoryDB from '../utils/indexeddb-helper.js'; // (Untuk simpan token)

class AuthPresenter {
  async render(container) {
    const path = window.location.hash;
    if (path === '#/login') {
      container.innerHTML = LoginView.getTemplate();
      this.addLoginListener();
    } else if (path === '#/register') {
      container.innerHTML = RegisterView.getTemplate();
      this.addRegisterListener();
    }
  }

  addLoginListener() {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorMessage.textContent = '';
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Memproses...';
      try {
        const email = event.target.email.value;
        const password = event.target.password.value;
        const result = await StoryApi.login({ email, password });
        
        // Simpan token di 2 tempat
        this.saveTokenToLocalStorage(result.loginResult.token);
        await FavoriteStoryDB.saveAuthToken(result.loginResult.token); // (Kriteria 4 Advance)

        window.location.hash = '#/';
      } catch (error) {
        errorMessage.textContent = `Login gagal: ${error.message}`;
        button.disabled = false;
        button.textContent = 'Login';
      }
    });
  }

  addRegisterListener() {
    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorMessage.textContent = '';
      try {
        const name = event.target.name.value;
        const email = event.target.email.value;
        const password = event.target.password.value;
        await StoryApi.register({ name, email, password });
        alert('Registrasi Berhasil! Silakan login.');
        window.location.hash = '#/login';
      } catch (error) {
        errorMessage.textContent = `Registrasi Gagal: ${error.message}`;
      }
    });
  }

  saveTokenToLocalStorage(token) {
    localStorage.setItem('authToken', token);
  }
}
export default AuthPresenter;