import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { supabase } from '../../shared/supabase';
import JarvisChat from '../../shared/JarvisChat';
import { safeStorage } from '../../shared/storage';

function MenuCardImage({ item }) {
  const [error, setError] = React.useState(false);
  
  if (error || !item.image_url) {
    return (
      <div style={{
        width: '100%',
        height: '160px',
        borderRadius: '10px',
        marginBottom: '12px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(212, 175, 55, 0.06))',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.12)', filter: 'blur(15px)' }} />
        <span>{item.is_veg ? '🥬' : '🍗'}</span>
      </div>
    );
  }

  return (
    <img 
      src={item.image_url} 
      alt={item.name} 
      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px', display: 'block' }}
      onError={() => setError(true)}
    />
  );
}

export default function CustomerMenuPage({ nav }) {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [food, setFood] = useState('all');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [lanConfig, setLanConfig] = useState({ lanIp: '', port: '' });

  // Simulation steps for Judge Walkthrough
  const [simStep, setSimStep] = useState(0); // 0: Welcome, 1: Checking Tables (5s animation), 2: Allotted Table, 3: Menu Active
  const [guestName, setGuestName] = useState(safeStorage.getItem('azzurro_customer_name') || 'Alex');
  const [partySize, setPartySize] = useState(2);
  const [preference, setPreference] = useState('veg');
  const [allottedTable, setAllottedTable] = useState(null);

  useEffect(() => {
    apiGet('/api/menu').then(d => setMenu(d.categories || []));
    apiGet('/api/config').then(d => setLanConfig(d)).catch(() => {});

    // Retrieve real name from Supabase OAuth session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0];
          setGuestName(name);
          safeStorage.setItem('azzurro_customer_name', name);
        }
      });
    }
  }, []);

  // Synchronize name from storage if updated by top-level OAuth interceptor
  useEffect(() => {
    const storedName = safeStorage.getItem('azzurro_customer_name');
    if (storedName && storedName !== guestName) {
      setGuestName(storedName);
    }
  }, [guestName]);

  const handleLogout = async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    safeStorage.removeItem('azzurro_customer_name');
    safeStorage.removeItem('azzurro_customer_email');
    nav.go('/login.html');
  };

  const handleStartSimulation = (e) => {
    e.preventDefault();
    setSimStep(1);
    // 5-second animated waiting check
    setTimeout(() => {
      const generatedTable = Math.floor(Math.random() * 8) + 1;
      setAllottedTable(generatedTable);
      setSimStep(2);
    }, 5000);
  };

  const handleProceedToMenu = () => {
    safeStorage.setItem('azzurro_table_id', allottedTable);
    setFood(preference);
    setSimStep(3);
  };

  const categories = ['All', ...menu.map(c => c.name)];
  
  const dishes = useMemo(() => {
    return menu
      .filter(c => category === 'All' || c.name === category)
      .flatMap(c => c.items || [])
      .filter(i => {
        if (food === 'all') return true;
        if (food === 'veg') return i.is_veg === true;
        if (food === 'nonveg') return i.is_veg === false;
        if (food === 'vegan') return i.is_vegan === true;
        return true;
      });
  }, [menu, category, food]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const add = (i) => {
    if (!i.is_available) {
      setToast('Item is out of stock!');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    setCart(p => {
      const old = p.find(x => x.id === i.id);
      return old 
        ? p.map(x => x.id === i.id ? { ...x, qty: x.qty + 1 } : x)
        : [...p, { ...i, qty: 1, special_instructions: '' }];
    });
    setToast('Added to cart');
    setTimeout(() => setToast(''), 2000);
  };

  const submit = async (e) => {
    e.preventDefault();
    const r = await apiPost('/api/orders', {
      tableId: allottedTable || 4,
      table_number: allottedTable || 4,
      guestName: guestName,
      customer_name: guestName,
      items: cart.map(i => ({
        id: i.id,
        menu_item_id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        special_instructions: ''
      }))
    });
    nav.go(`/tracker.html?orderId=${encodeURIComponent(r.orderId)}`);
  };

  // Step 0: Welcome & Allotment Form
  if (simStep === 0) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', background: '#0b0d11', color: '#fff', paddingTop: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ordr-card ordr-glass" style={{ width: 'min(520px, 90%)', padding: '36px', borderRadius: '24px', position: 'relative' }}>
          <button 
            onClick={handleLogout}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i>Logout
          </button>

          <h2 style={{ color: 'gold', textAlign: 'center', margin: '0 0 8px 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px' }}>
            Hello {guestName}, how are you feeling today?
          </h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '14px', marginBottom: '28px' }}>
            Welcome to Azzurro Caffè! Please enter your dining party size and dietary choice so we can allot a table:
          </p>

          <form onSubmit={handleStartSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Number of Guests in Party</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={partySize} 
                onChange={(e) => setPartySize(Number(e.target.value))} 
                style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b0d11', color: '#fff', fontSize: '15px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Dietary Preference</label>
              <select 
                value={preference} 
                onChange={(e) => setPreference(e.target.value)}
                style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0b0d11', color: '#fff', fontSize: '15px' }}
              >
                <option value="veg">Pure Veg</option>
                <option value="nonveg">Non-Veg</option>
                <option value="vegan">Vegan</option>
                <option value="all">Any / Both</option>
              </select>
            </div>
            <button style={{ background: 'linear-gradient(135deg, #d4af37, #f5d060)', color: '#000', fontWeight: '800', padding: '16px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', marginTop: '10px', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}>
              Check Available Tables
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 1: 5-second Animated Floor Map Scanning
  if (simStep === 1) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', background: '#0b0d11', color: '#fff', paddingTop: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="ordr-card ordr-glass" style={{ width: 'min(520px, 90%)', padding: '48px 36px', borderRadius: '24px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
            <i className="fa-solid fa-compass-drafting fa-spin fa-3x" style={{ color: 'gold' }}></i>
          </div>
          <h2 style={{ color: '#fff', margin: '0 0 14px 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px' }}>
            Scanning Dining Floor Plan...
          </h2>
          <p style={{ color: 'gold', fontSize: '16px', lineHeight: '1.7', margin: 0, fontWeight: '600' }}>
            "Can you please wait for a few seconds? We are checking our floor map for an empty table for {partySize} persons..."
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Table Allotted & Virtual QR Code Display
  if (simStep === 2) {
    const liveProductionQrUrl = `https://vibeathon6-0-one.vercel.app/order.html?table=${allottedTable}&name=${encodeURIComponent(guestName)}`;
    return (
      <div className="app-shell" style={{ minHeight: '100vh', background: '#090b0e', color: '#fff', paddingTop: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 'min(640px, 92%)',
          background: 'rgba(15, 17, 21, 0.95)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '24px',
          padding: '36px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(212, 175, 55, 0.25)',
          textAlign: 'center'
        }}>
          <span style={{ background: 'rgba(212,175,55,0.15)', color: 'gold', border: '1px solid rgba(212,175,55,0.4)', padding: '8px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>
            📱 INSTANT PHONE DEMO FOR JUDGES
          </span>

          <h2 style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 8px' }}>
            Scan Table QR with Your Phone
          </h2>
          <p style={{ color: 'gold', fontSize: '20px', fontWeight: '800', margin: '0 0 16px' }}>
            ✓ Dining Table #{allottedTable} Assigned to {guestName}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Point your mobile phone camera at the QR code below to open the live <strong>Azzurro Caffè Digital Menu & Ordering System</strong> directly on your smartphone in real-time!
          </p>

          {/* QR Code Container */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            display: 'inline-block',
            marginBottom: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(liveProductionQrUrl)}`} 
              alt={`Table ${allottedTable} QR Code`}
              style={{ display: 'block', width: '220px', height: '220px', borderRadius: '12px' }}
            />
            <div style={{ color: '#000', fontWeight: '800', fontSize: '15px', marginTop: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>
              TABLE #{allottedTable} QR CODE
            </div>
            <small style={{ color: '#64748B', fontSize: '12px', fontWeight: '600' }}>Scan with Phone Camera</small>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleProceedToMenu}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                color: '#000',
                fontWeight: '800',
                padding: '16px',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 20px rgba(212,175,55,0.4)'
              }}
            >
              Proceed to Menu on Screen →
            </button>
            <a href={liveProductionQrUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'gold', fontSize: '13px', textDecoration: 'none', marginTop: '4px' }}>
              Open in new browser tab (Simulate Phone Scan) →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Interactive Menu Portal View
  return (
    <div className="customer-page" style={{ background: '#0b0d11', color: '#fff', minHeight: '100vh', paddingTop: '90px' }}>
      <header className="customer-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0b0d11', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <b className="customer-title" style={{ color: '#fff' }}>AZZURRO CAFFE</b>
          <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'gold', padding: '6px 14px', borderRadius: '20px', fontWeight: '700' }}>
            Table {allottedTable || 4}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i>Logout
        </button>
      </header>

      <main className="customer-main" style={{ padding: '24px' }}>
        {/* Floating Side Popup Banner (Swiggy/Zomato Style) */}
        <div style={{
          position: 'fixed',
          top: '86px',
          right: '24px',
          maxWidth: '380px',
          zIndex: 9999,
          background: '#0f172a',
          border: `1px solid ${food === 'veg' ? 'rgba(16, 185, 129, 0.4)' : food === 'nonveg' ? 'rgba(239, 68, 68, 0.4)' : food === 'vegan' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(212, 175, 55, 0.4)'}`,
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          animation: 'slideInLeft 0.4s ease-out'
        }}>
          <div style={{
            fontSize: '24px',
            background: food === 'veg' ? 'rgba(16, 185, 129, 0.15)' : food === 'nonveg' ? 'rgba(239, 68, 68, 0.15)' : food === 'vegan' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.15)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            {food === 'veg' ? '🥬' : food === 'nonveg' ? '🥩' : food === 'vegan' ? '🌱' : '✨'}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', color: food === 'veg' ? '#10b981' : food === 'nonveg' ? '#ef4444' : food === 'vegan' ? '#22c55e' : 'gold', fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
              {food === 'veg' && '100% Pure Veg Assurance'}
              {food === 'nonveg' && '100% Fresh Cut & Halal'}
              {food === 'vegan' && '100% Plant-Based Guarantee'}
              {food === 'all' && 'Segregated Kitchen Assurance'}
            </h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
              {food === 'veg' && 'Cooked in 100% dedicated green cookware with zero cross-contamination guaranteed!'}
              {food === 'nonveg' && 'Fresh farm-raised meats tenderized daily over authentic charcoal tandoors!'}
              {food === 'vegan' && 'Zero animal products, cold-pressed botanical oils, and dairy-free milks only.'}
              {food === 'all' && 'Separate kitchen workstations, fryers, and grills for complete dietary purity.'}
            </p>
          </div>
        </div>

        {/* Preference Filters — Only show if user selected 'all' (Both) initially */}
        {preference === 'all' && (
          <div className="filter-bar" style={{ gap: '8px', marginBottom: '20px' }}>
            {[
              ['all', 'Both (Veg & Non-Veg)'],
              ['veg', 'Pure Veg 🥬'],
              ['nonveg', 'Pure Non-Veg 🥩'],
              ['vegan', 'Vegan 🌱']
            ].map(([v, l]) => (
              <button 
                className={food === v ? 'active' : ''} 
                key={v} 
                onClick={() => setFood(v)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: food === v ? '2px solid gold' : '1px solid rgba(255,255,255,0.1)',
                  background: food === v ? 'linear-gradient(135deg, #d4af37, #f5d060)' : 'rgba(255,255,255,0.03)',
                  color: food === v ? '#000' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: food === v ? '0 4px 14px rgba(212,175,55,0.3)' : 'none'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Categories — Sticky at the top so Starters, Mains, Desserts, Beverages are always visible */}
        <div className="category-tabs" style={{ position: 'sticky', top: '70px', zIndex: 90, background: '#0b0d11', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 0', marginBottom: '24px' }}>
          {categories.map(c => (
            <button 
              className={category === c ? 'active' : ''} 
              onClick={() => setCategory(c)} 
              key={c}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: category === c ? '2px solid gold' : '2px solid transparent',
                color: category === c ? 'gold' : '#94a3b8',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <section className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {dishes.map(i => (
            <article 
              className="menu-card" 
              key={i.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                opacity: i.is_available ? 1 : 0.5
              }}
            >
              <MenuCardImage item={i} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{i.name}</h3>
                {i.is_chef_special && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'gold', background: 'rgba(212,175,55,0.15)', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>⭐ CHEF'S SPECIAL</span>
                )}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', flexGrow: 1, margin: '4px 0 16px 0' }}>{i.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: i.is_veg ? '#10b981' : '#ef4444' }}>
                    {i.is_veg ? '● VEG' : '● NON-VEG'}
                  </span>
                  {i.prep_time_minutes && (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>⏱ {i.prep_time_minutes}min</span>
                  )}
                </div>
                <span style={{ color: 'gold', fontWeight: '700', fontFamily: 'monospace' }}>₹{i.price}</span>
                <button 
                  onClick={() => add(i)}
                  disabled={!i.is_available}
                  style={{
                    background: i.is_available ? 'gold' : '#475569',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: '700',
                    cursor: i.is_available ? 'pointer' : 'not-allowed'
                  }}
                >
                  {i.is_available ? 'Add' : 'Out of Stock'}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Cart Drawer */}
      {cart.length > 0 && (
        <div className="cart-bar" style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: '1px solid rgba(212, 175, 55, 0.25)' }}>
          <span style={{ color: '#fff' }}>
            {cart.reduce((s, i) => s + i.qty, 0)} items · <b style={{ color: 'gold' }}>₹{total.toFixed(2)}</b>
          </span>
          <button className="btn" onClick={() => setModal(true)} style={{ background: 'gold', color: '#000' }}>
            Confirm Order
          </button>
        </div>
      )}

      {/* Modal for Cart Confirmation */}
      {modal && (
        <div className="cart-modal">
          <form className="card" onSubmit={submit} style={{ background: '#0f1115', color: '#fff', border: '1px solid rgba(212, 175, 55, 0.25)', padding: '24px' }}>
            <h2 className="customer-title" style={{ color: 'gold' }}>Confirm Your Order</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
              {cart.map(i => (
                <div className="item-row" key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{i.name} x{i.qty}</span>
                  <span style={{ color: 'gold' }}>₹{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="divider" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>Total amount:</span>
              <b style={{ color: 'gold', fontSize: '18px' }}>₹{total.toFixed(2)}</b>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-full" style={{ background: 'gold', color: '#000' }}>Send to Kitchen</button>
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Back</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast" style={{ background: '#0f1115', borderLeft: '3px solid gold', color: '#fff' }}>{toast}</div>}

      {/* Floating Jarvis AI Virtual Waiter Assistant */}
      <JarvisChat onAddToCart={(rec) => {
        add({ id: `rec-${Date.now()}`, name: rec.name, price: rec.price, is_veg: true });
        setToast(`Added ${rec.name} to cart via Jarvis AI!`);
        setTimeout(() => setToast(''), 3000);
      }} />
    </div>
  );
}
