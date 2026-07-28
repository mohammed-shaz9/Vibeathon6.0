import React, { useEffect, useMemo, useState } from 'react';
import LandingPage from './features/landing/LandingPage';
import AboutPage from './features/landing/AboutPage';
import LoginPage from './features/auth/LoginPage';
import CustomerMenuPage from './features/customer/CustomerMenuPage';
import CustomerTrackerPage from './features/customer/CustomerTrackerPage';
import CustomerReviewPage from './features/customer/CustomerReviewPage';
import BillPage from './features/customer/BillPage';
import KitchenPage from './features/kitchen/KitchenPage';
import WaiterPage from './features/waiter/WaiterPage';
import HostPage from './features/host/HostPage';
import AdminPage from './features/admin/AdminPage';
import ScanPage from './features/scan/ScanPage';
import JarvisChat from './shared/JarvisChat';
import { supabase } from './shared/supabase';

function parseUserFromHash(hash) {
  try {
    if (!hash || !hash.includes('access_token=')) return null;
    const params = new URLSearchParams(hash.replace(/^#/, '?'));
    const token = params.get('access_token');
    if (token) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadStr = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(payloadStr);
        const meta = payload.user_metadata || {};
        const fullName = meta.full_name || meta.name || payload.email?.split('@')[0] || 'Guest';
        const email = payload.email || '';
        return { fullName, email };
      }
    }
  } catch (err) {}
  return null;
}

function routeFromLocation() {
  const { pathname, hash, search } = window.location;
  if (hash && hash.includes('access_token=')) return { view: 'customer-menu', search };
  if (pathname === '/scan.html') return { view: 'scan', search };
  if (pathname === '/about.html') return { view: 'about', search };
  if (pathname === '/order.html') return { view: 'customer-menu', search };
  if (pathname === '/tracker.html' || pathname === '/order-tracker.html') return { view: 'customer-tracker', search };
  if (pathname === '/review.html') return { view: 'customer-review', search };
  if (pathname === '/login.html' || pathname === '/features/auth/login.html') return { view: 'login', search };
  if (pathname === '/features/customer/order.html') return { view: 'customer-menu', search };
  if (pathname === '/features/customer/tracker.html') return { view: 'customer-tracker', search };
  if (pathname === '/features/customer/review.html') return { view: 'customer-review', search };
  if (pathname === '/bill.html') return { view: 'bill', search };
  if (pathname === '/features/kitchen/kitchen.html') return { view: 'kitchen', search };
  if (pathname === '/features/waiter/waiter.html') return { view: 'waiter', search };
  if (pathname === '/features/host/host.html') return { view: 'host', search };
  if (pathname === '/features/admin/admin.html') return { view: 'admin', search };
  if (hash === '#login') return { view: 'login', search };
  return { view: 'landing', search };
}

export default function App() {
  const [route, setRoute] = useState(routeFromLocation());

  useEffect(() => {
    // Intercept Google OAuth access_token hash from Supabase redirect immediately
    const hash = window.location.hash;
    const parsedUser = parseUserFromHash(hash);
    if (parsedUser) {
      localStorage.setItem('azzurro_customer_name', parsedUser.fullName);
      localStorage.setItem('azzurro_customer_email', parsedUser.email);
      window.history.replaceState({}, document.title, '/order.html');
      setRoute({ view: 'customer-menu', search: '' });
    } else if (hash && hash.includes('access_token=')) {
      if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const fullName = meta.full_name || meta.name || session.user.email.split('@')[0];
            const email = session.user.email;
            localStorage.setItem('azzurro_customer_name', fullName);
            localStorage.setItem('azzurro_customer_email', email);
          }
          window.history.replaceState({}, document.title, '/order.html');
          setRoute({ view: 'customer-menu', search: '' });
        });
      }
    }

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || session.user.email.split('@')[0];
          const email = session.user.email;
          localStorage.setItem('azzurro_customer_name', fullName);
          localStorage.setItem('azzurro_customer_email', email);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  const nav = useMemo(() => ({
    go: (path) => {
      window.history.pushState({}, '', path);
      setRoute(routeFromLocation());
    }
  }), []);

  const pageProps = { nav, route };

  const pageContent = (() => {
    switch (route.view) {
      case 'login':
        return <LoginPage {...pageProps} />;
      case 'customer-menu':
        return <CustomerMenuPage {...pageProps} />;
      case 'customer-tracker':
        return <CustomerTrackerPage {...pageProps} />;
      case 'customer-review':
        return <CustomerReviewPage {...pageProps} />;
      case 'bill':
        return <BillPage {...pageProps} />;
      case 'kitchen':
        return <KitchenPage {...pageProps} />;
      case 'waiter':
        return <WaiterPage {...pageProps} />;
      case 'host':
        return <HostPage {...pageProps} />;
      case 'admin':
        return <AdminPage {...pageProps} />;
      case 'scan':
        return <ScanPage {...pageProps} />;
      case 'about':
        return <AboutPage {...pageProps} />;
      default:
        return <LandingPage {...pageProps} />;
    }
  })();

  return (
    <>
      {pageContent}
      <JarvisChat onAddToCart={() => nav.go('/order.html')} />
    </>
  );
}
