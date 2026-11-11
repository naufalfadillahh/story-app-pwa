// src/views/register-view.js
class RegisterView {
  static getTemplate() {
    return `
      <section class="auth-page">
        <h1 id="main-content">Register</h1>
        <form id="register-form">
            <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" minlength="8" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <div id="error-message" class="error-message"></div>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }
}
export default RegisterView;