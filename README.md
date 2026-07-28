<div align="center">

  <!-- 3D Glow Hero Banner -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=220&section=header&text=ORDR%20Smart%20OS&fontSize=65&fontColor=D4AF37&animation=twinkling&desc=Next-Gen%20Digital%20Nervous%20System%20for%20Azzurro%20Caffè&descSize=20&descAlign=50&descAlignY=70" width="100%" alt="ORDR Banner" />

  <br />

  <h1>✨ ORDR — Smart Restaurant Operating System</h1>
  <p><strong>Azzurro Caffè Flagship Digital Ecosystem & Real-Time POS Engine</strong></p>

  <br />

  <!-- Team & Institution Spotlight -->
  <table>
    <tr>
      <td align="center" width="50%">
        🧙‍♂️ <strong>Team Name</strong><br />
        <a href="#"><img src="https://img.shields.io/badge/TEAM-CODE_WIZARDS-FFD700?style=for-the-badge&logo=codeforces&logoColor=000" alt="Code Wizards" /></a>
      </td>
      <td align="center" width="50%">
        🏛️ <strong>Institution</strong><br />
        <a href="#"><img src="https://img.shields.io/badge/COLLEGE-IIT_MANDI-0066CC?style=for-the-badge&logo=academic-tree&logoColor=white" alt="IIT Mandi" /></a>
      </td>
    </tr>
  </table>

  <br />

  <!-- Animated Tech Badges -->
  <div>
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Vite_5-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
    <img src="https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Express_API-000000?style=for-the-badge&logo=express&logoColor=gold" />
    <img src="https://img.shields.io/badge/Redis_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase_OAuth-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" />
    <img src="https://img.shields.io/badge/Vercel_Deploys-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </div>

</div>

<br />

---

## 💎 Executive Summary

> [!IMPORTANT]
> **ORDR** is an enterprise-grade, real-time operating system engineered for fine-dining restaurants. Built with a bespoke dark-gold glassmorphism aesthetic, it integrates table booking, LAN IP mobile QR scanning, Kitchen KDS ticket dispatching, Waiter delivery routing, and live Redis analytics into a zero-latency digital pipeline.

---

## 🔐 Staff Portal Quick-Access & Demo Credentials

| Portal | Demo Login Email | Primary Role & Capabilities | Access Route |
| :--- | :--- | :--- | :---: |
| 👑 **Admin / Manager** | `admin@azzurro.demo` | Real-time revenue telemetry, menu pricing, inventory thresholds, ETL sales velocity | `/login.html` |
| 🍳 **Kitchen KDS** | `kitchen@azzurro.demo` | Real-time order queue bump system, prep timer countdowns, itemized order tickets | `/login.html` |
| 🛎️ **Waiter Panel** | `waiter@azzurro.demo` | Ready order dispatching, table delivery status updates, customer waiter call alerts | `/login.html` |
| 🪑 **Host Stand** | `host@azzurro.demo` | 12-table floor plan status grid, automated queue allotment, waitlist management | `/login.html` |

---

## 🏗️ 3D Architectural Pipeline & Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 📱 Customer Phone
    participant Auth as 🔑 Supabase / Google OAuth
    participant Core as ⚡ Express + Redis Engine
    participant KDS as 🍳 Kitchen Display (KDS)
    participant Waiter as 🛎️ Waiter Dispatch
    participant Admin as 📊 Admin Telemetry

    Customer->>Auth: 1-Click Google Sign-In
    Auth-->>Customer: Authenticated Session Token
    Customer->>Core: Scan Table QR & Submit Order
    Core->>Core: Persist to Disk DB & Warm Redis Cache
    Core->>KDS: Dispatch Order Ticket via Real-Time Socket
    KDS->>Core: Update Status ➔ "Ready"
    Core->>Waiter: Alert Waiter for Table Delivery
    Waiter->>Customer: Order Served & Generate Itemized GST Bill
    Core->>Admin: Recompute Real-Time ETL Pipeline Metrics
```

---

## 🌟 Modern UI/UX Feature Showcase

### 🎨 Design System Tokens
- **Theme Palette**: Deep Space Obsidian (`#0F172A`), Onyx Black (`#0b0d11`), Metallic Gold (`#D4AF37`), Emerald Green (`#10B981`), Radiant Ruby (`#EF4444`).
- **Typography**: Space Grotesk (Headers), JetBrains Mono (Prices & Quantities), Times New Roman (Cinematic Intro Overlay).
- **Micro-Animations**: Shimmering CTAs, card lift hover effects, 5-second floor plan scanning overlay, floating Swiggy/Zomato style marketing side toasts.

### 🍃 Strict Dietary Filter Engine
- **Pure Vegetarian (100% Pure Veg)**: Guaranteed non-veg item exclusion with custom sourcing assurances.
- **Pure Non-Veg**: High-protein seafood, poultry, and meat selections.
- **Vegan**: 100% plant-based dairy-free dishes.

---

## ⚡ Technical Infrastructure & Performance

| Architecture Layer | Technology Stack | Operational Advantage |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Lightning fast HMR & 2-second Vercel serverless builds |
| **Styling Architecture** | Custom CSS3 + Design Tokens | Pure CSS flexibility with zero runtime CSS-in-JS overhead |
| **Caching Layer** | Redis + Memory TTL LRU | Ephemeral cart state & sub-5ms query response times |
| **Persistence Storage** | Disk JSON + Supabase Postgres | Dual disk fallback durability on server reboots |
| **ETL Analytics** | Custom Pipeline Engine | Computes peak hourly velocity, dish popularity, low-stock alerts |

---

## 🚀 Quick Start Guide

### 1. Repository Setup
```bash
git clone https://github.com/mohammed-shaz9/Vibeathon6.0.git
cd Vibeathon6.0
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root folder:
```env
VITE_SUPABASE_URL=https://zfxsekabuepovpcaqkyz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=20077486817-9jmnutqdia6icck1q2p8utto6e9qngl3.apps.googleusercontent.com
REDIS_URL=redis://localhost:6379
```

### 3. Launch Development Server
```bash
# Start Vite Frontend (Port 5173) & Express Backend (Port 3000)
npm run dev
```

---

<div align="center">
  <br />
  <p><strong>Crafted with passion by Team Code Wizards — IIT Mandi</strong></p>
  <img src="https://capsule-render.vercel.app/api?type=rect&color=auto&height=4&section=footer" width="100%" />
</div>
