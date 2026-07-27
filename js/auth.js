document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  const googleBtn = document.getElementById('googleLoginBtn');
  const roleChip = document.getElementById('roleChip');
  const params = new URLSearchParams(window.location.search);
  const requestedRole = params.get('role') || 'customer';
  const routes = {
    customer: '/features/customer/order.html',
    kitchen: '/features/kitchen/kitchen.html',
    waiter: '/features/waiter/waiter.html',
    host: '/features/host/host.html',
    admin: '/features/admin/admin.html',
    inventory: '/features/admin/admin.html'
  };

  if (roleChip) {
    roleChip.textContent = `Role: ${requestedRole}`;
  }

  if (form) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    if (email) email.value = `${requestedRole}@azzurro.demo`;
    if (password) password.value = 'password123';
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Login failed');
      localStorage.setItem('ordr_user', JSON.stringify(data.user));
      window.location.href = routes[data.user.role] || '/features/customer/order.html';
    } catch (err) {
      if (errorBox) errorBox.textContent = err.message;
    }
  });

  googleBtn?.addEventListener('click', async () => {
    if (errorBox) errorBox.textContent = '';
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectTo: `${window.location.origin}/login.html?role=${requestedRole}` })
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.user) {
        localStorage.setItem('ordr_user', JSON.stringify(data.user));
        window.location.href = routes[data.user.role] || routes[requestedRole] || '/features/customer/order.html';
      }
    } catch (err) {
      if (errorBox) errorBox.textContent = err.message;
    }
  });
});
