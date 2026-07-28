import React, { useState } from 'react';

export default function ScanPage({ nav }) {
  const [tableNum, setTableNum] = useState(1);
  const [scanning, setScanning] = useState(true);

  const handleSimulatedScan = (tbl) => {
    setTableNum(tbl);
    setScanning(false);
    setTimeout(() => {
      nav.go(`/order.html?table=${tbl}`);
    }, 1200);
  };

  return (
    <div className="portal-page" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC', padding: '120px 24px 48px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '24px', marginBottom: '28px', backdropFilter: 'blur(16px)' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'gold', margin: 0, fontSize: '26px' }}>📷 Table QR Code Scanner</h1>
          <p style={{ color: '#94A3B8', margin: '6px 0 0', fontSize: '14px' }}>Point your camera at the dining table QR code for instant menu access</p>
        </div>

        {/* Camera View Finder */}
        <div style={{
          position: 'relative',
          height: '380px',
          background: 'rgba(0,0,0,0.8)',
          border: '2px dashed gold',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)'
        }}>
          {scanning ? (
            <>
              <div style={{
                position: 'absolute',
                inset: '40px',
                border: '3px solid gold',
                borderRadius: '16px',
                animation: 'pulse 1.5s infinite'
              }} />
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
              <h3 style={{ color: 'gold', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>Scanning Table QR...</h3>
              <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Align QR code within the viewfinder frame</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', color: '#10B981', marginBottom: '16px' }}>✓</div>
              <h3 style={{ color: '#10B981', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>Table #{tableNum} Identified!</h3>
              <p style={{ color: 'gold', fontSize: '14px', margin: 0 }}>Opening live table ordering session...</p>
            </>
          )}
        </div>

        {/* Quick Simulator Buttons for Demo */}
        <div style={{ marginTop: '28px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ color: '#94A3B8', margin: '0 0 16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simulate Table QR Scan</h4>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
              <button
                key={n}
                onClick={() => handleSimulatedScan(n)}
                style={{
                  background: tableNum === n ? 'gold' : 'rgba(255,255,255,0.05)',
                  color: tableNum === n ? '#000' : '#F8FAFC',
                  border: '1px solid rgba(212,175,55,0.3)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Table {n}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
