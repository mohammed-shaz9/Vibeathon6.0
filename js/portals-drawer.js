/**
 * ORDR Floating Portals Tree Navigation Drawer
 * Injected on all pages to provide instant 1-click access to all 5 system portals + guest portal + home + about.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('ordrPortalsWidget')) return;

  const widgetHTML = `
    <div id="ordrPortalsWidget">
      <div id="ordrTreeDrawer" class="ordr-drawer-content ordr-glass">
        <div class="ordr-drawer-header">
          <h4><i class="fa-solid fa-sitemap"></i> ORDR Portals Tree</h4>
          <button id="closeOrdrDrawer" class="ordr-drawer-close">&times;</button>
        </div>

        <!-- Section 1: Customer / Guest -->
        <div class="ordr-tree-section">
          <div class="ordr-tree-title">📱 Guest Portal</div>
          <a href="order.html?table=1" class="ordr-tree-node">
            <i class="fa-solid fa-qrcode"></i> Guest QR Table Ordering <span class="ordr-badge-mini">Table 01-12</span>
          </a>
          <a href="order-tracker.html?id=ORD-101" class="ordr-tree-node">
            <i class="fa-solid fa-route"></i> Live Order Tracker <span class="ordr-badge-mini">5 Stages</span>
          </a>
          <a href="review.html" class="ordr-tree-node">
            <i class="fa-solid fa-star"></i> Post-Dining Review & AI <span class="ordr-badge-mini">Gemini</span>
          </a>
        </div>

        <!-- Section 2: Kitchen & Operations -->
        <div class="ordr-tree-section">
          <div class="ordr-tree-title">👨‍🍳 Kitchen & Line</div>
          <a href="kitchen.html" class="ordr-tree-node">
            <i class="fa-solid fa-kitchen-set"></i> Sub-50ms KDS Display <span class="ordr-badge-mini">Touch KDS</span>
          </a>
        </div>

        <!-- Section 3: Staff & Service -->
        <div class="ordr-tree-section">
          <div class="ordr-tree-title">🛎️ Staff & Front-of-House</div>
          <a href="waiter.html" class="ordr-tree-node">
            <i class="fa-solid fa-bell-concierge"></i> Waiter Mobile Panel <span class="ordr-badge-mini">12 Tables</span>
          </a>
          <a href="host.html" class="ordr-tree-node">
            <i class="fa-solid fa-chair"></i> Host Stand & Waitlist <span class="ordr-badge-mini">FIFO Engine</span>
          </a>
        </div>

        <!-- Section 4: Management & Admin -->
        <div class="ordr-tree-section">
          <div class="ordr-tree-title">📊 Management & Auth</div>
          <a href="admin.html" class="ordr-tree-node">
            <i class="fa-solid fa-chart-line"></i> Admin AI Intelligence <span class="ordr-badge-mini">EOD AI</span>
          </a>
          <a href="login.html" class="ordr-tree-node">
            <i class="fa-solid fa-shield-halved"></i> Multi-Role SSO Auth <span class="ordr-badge-mini">Google SSO</span>
          </a>
          <a href="lounge.html" class="ordr-tree-node">
            <i class="fa-solid fa-couch"></i> The VIP Lounge <span class="ordr-badge-mini">Lounge</span>
          </a>
        </div>

        <!-- Section 5: Website Core -->
        <div class="ordr-tree-section">
          <div class="ordr-tree-title">🌐 Main Website</div>
          <a href="index.html" class="ordr-tree-node">
            <i class="fa-solid fa-house"></i> Home Landing Page
          </a>
          <a href="about.html" class="ordr-tree-node">
            <i class="fa-solid fa-circle-info"></i> About Azzurro Caffè
          </a>
        </div>
      </div>

      <button id="toggleOrdrDrawer" class="ordr-drawer-btn">
        <i class="fa-solid fa-layer-group"></i> Portals Tree
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const toggleBtn = document.getElementById('toggleOrdrDrawer');
  const drawerContent = document.getElementById('ordrTreeDrawer');
  const closeBtn = document.getElementById('closeOrdrDrawer');

  if (toggleBtn && drawerContent) {
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      drawerContent.classList.toggle('active');
    });

    closeBtn.addEventListener('click', function () {
      drawerContent.classList.remove('active');
    });

    document.addEventListener('click', function (e) {
      if (!document.getElementById('ordrPortalsWidget').contains(e.target)) {
        drawerContent.classList.remove('active');
      }
    });
  }
});
