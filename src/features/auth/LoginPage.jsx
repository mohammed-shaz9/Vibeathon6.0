import React from 'react';

export default function LoginPage() {
  return (
    <div className="portal-shell">
      <div className="portal-card">
        <h1>Azzurro Caffè</h1>
        <p>Choose your portal</p>
        <div className="portal-grid">
          {[
            ['customer', 'Customer', 'Browse menu, order, and track live.'],
            ['admin', 'Admin', 'Dashboard, inventory, staff, AI.'],
            ['waiter', 'Waiter', 'Serve ready orders.'],
            ['kitchen', 'Kitchen', 'Accept and prepare orders.'],
            ['host', 'Host', 'Seat customers and manage waitlist.'],
            ['inventory', 'Inventory', 'Stock and restock management.']
          ].map(([role, title, text]) => (
            <button key={role} className="portal-choice" data-role={role} onClick={() => window.location.href = `/login.html?role=${role}`}>
              <strong>{title}</strong>
              <span>{text}</span>
            </button>
          ))}
        </div>
        <div className="demo-box">
          <strong>Demo Credentials</strong>
          <ul>
            <li>Admin: admin@azzurro.demo / password123</li>
            <li>Kitchen: kitchen@azzurro.demo / password123</li>
            <li>Waiter: waiter@azzurro.demo / password123</li>
            <li>Host: host@azzurro.demo / password123</li>
            <li>Inventory: inventory@azzurro.demo / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
