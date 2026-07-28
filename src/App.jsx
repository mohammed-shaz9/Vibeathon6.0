import React, { useEffect, useMemo, useState } from 'react';
import LandingPage from './features/landing/LandingPage';
import AboutPage from './features/landing/AboutPage';
import LoginPage from './features/auth/LoginPage';
import CustomerMenuPage from './features/customer/CustomerMenuPage';
import CustomerTrackerPage from './features/customer/CustomerTrackerPage';
import CustomerReviewPage from './features/customer/CustomerReviewPage';
import KitchenPage from './features/kitchen/KitchenPage';
import WaiterPage from './features/waiter/WaiterPage';
import HostPage from './features/host/HostPage';
import AdminPage from './features/admin/AdminPage';

function routeFromLocation() {
  const { pathname, hash, search } = window.location;
  if (pathname === '/about.html') return { view: 'about', search };
  if (pathname === '/order.html') return { view: 'customer-menu', search };
  if (pathname === '/tracker.html' || pathname === '/order-tracker.html') return { view: 'customer-tracker', search };
  if (pathname === '/review.html') return { view: 'customer-review', search };
  if (pathname === '/login.html' || pathname === '/features/auth/login.html') return { view: 'login', search };
  if (pathname === '/features/customer/order.html') return { view: 'customer-menu', search };
  if (pathname === '/features/customer/tracker.html') return { view: 'customer-tracker', search };
  if (pathname === '/features/customer/review.html') return { view: 'customer-review', search };
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

  switch (route.view) {
    case 'login':
      return <LoginPage {...pageProps} />;
    case 'customer-menu':
      return <CustomerMenuPage {...pageProps} />;
    case 'customer-tracker':
      return <CustomerTrackerPage {...pageProps} />;
    case 'customer-review':
      return <CustomerReviewPage {...pageProps} />;
    case 'kitchen':
      return <KitchenPage {...pageProps} />;
    case 'waiter':
      return <WaiterPage {...pageProps} />;
    case 'host':
      return <HostPage {...pageProps} />;
    case 'admin':
      return <AdminPage {...pageProps} />;
    case 'about':
      return <AboutPage {...pageProps} />;
    default:
      return <LandingPage {...pageProps} />;
  }
}
