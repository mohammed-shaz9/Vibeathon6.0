document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  const roleParam = new URLSearchParams(location.search).get('role') || 'customer';
  const roleInput = document.getElementById('roleInput');
  let supabaseUrl = '';

  const routes = {
    customer: '/features/customer/order.html',
    admin: '/features/admin/admin.html',
    kitchen: '/features/kitchen/kitchen.html',
    waiter: '/features/waiter/waiter.html',
    host: '/features/host/host.html',
    inventory: '/features/admin/admin.html'
  };

  function go(role) {
    window.location.href = routes[role] || '/index.html';
  }

  fetch('/api/config')
    .then((res) => res.json())
    .then((cfg) => { supabaseUrl = cfg.supabaseUrl || ''; })
    .catch(() => {});

  roleInput.value = roleParam;

  document.querySelectorAll('.portal-choice').forEach((btn) => {
    if (btn.dataset.role === roleParam) btn.classList.add('active');
    btn.addEventListener('click', () => {
      roleInput.value = btn.dataset.role;
      document.querySelectorAll('.portal-choice').forEach((b) => b.classList.toggle('active', b === btn));
      if (btn.dataset.role === 'customer') {
        document.getElementById('googleLoginBtn').textContent = 'Continue with Google';
      }
    });
  });

  const saved = localStorage.getItem('ordr_user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user?.role) go(user.role);
    } catch {}
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';
    const role = roleInput.value;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('ordr_user', JSON.stringify(data.user));
      go(data.user.role || role);
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });

  document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    const selectedRole = roleInput.value;
    if (selectedRole === 'customer') {
      const redirectTo = encodeURIComponent(`${window.location.origin}/features/customer/order.html`);
      if (supabaseUrl) {
        window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
        return;
      }
      errorBox.textContent = 'Supabase Google OAuth is not configured.';
      return;
    }
    window.location.href = '/api/auth/google';
  });

  if (roleParam) {
    localStorage.setItem('ordr_role_hint', roleParam);
  }
});
