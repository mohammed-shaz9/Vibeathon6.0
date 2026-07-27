document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  const googleBtn = document.getElementById('googleLoginBtn');
  const routes = { admin: 'admin.html', kitchen: 'kitchen.html', waiter: 'waiter.html', host: 'host.html' };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Login failed');
      localStorage.setItem('ordr_user', JSON.stringify({ email: data.user.email, role: data.role }));
      window.location.href = routes[data.role] || 'index.html';
    } catch (err) {
      if (errorBox) errorBox.textContent = err.message;
    }
  });

  googleBtn?.addEventListener('click', () => {
    window.location.href = '/api/auth/google';
  });
});
