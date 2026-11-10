// src/views/login-view.js
class LoginView {
  static getTemplate() {
    return `
      <section class="auth-page">
        <h1 id="main-content">Login</h1>
        <form id="login-form">
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" minlength="8" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <div id="error-message" class="error-message" style="color: red;"></div>
        <p>Belum punya akun? <a href="#/register">Register di sini</a></p>
      </section>
    `;
  }
}
export default LoginView;