(function () {
  const root = document.getElementById('hostRoot');
  async function load() {
    try {
      const [tablesRes, waitRes] = await Promise.all([fetch('/api/tables'), fetch('/api/waitlist')]);
      const tables = (await tablesRes.json()).tables || [];
      const waitlist = (await waitRes.json()).waitlist || [];
      const available = tables.filter(t => t.status === 'available').length;
      const avg = waitlist.length * 5;
      root.innerHTML = `
        <div class="host-stats">${available} tables available | ${waitlist.length} customers waiting | Avg wait: ${avg} min</div>
        <div class="host-grid">
          <section>
            <h2>WAITLIST QUEUE</h2>
            <button id="addWaitBtn">Add to Waitlist</button>
            <div class="queue-list">${waitlist.sort((a,b)=>a.position-b.position).map((p,i)=>`<div class="queue-row ${i===0?'next':''}"><strong>#${p.position}</strong> ${p.customer_name || p.name} (${p.party_size || p.partySize}) <span>${p.customer_phone || p.phone}</span><span>Estimated wait: ${(p.position || i+1)*5} min</span></div>`).join('') || '<div>No one waiting.</div>'}</div>
          </section>
          <section>
            <h2>TABLE FLOOR PLAN</h2>
            <div class="floor-grid">${tables.map(t=>`<button class="table-card ${t.status}" data-id="${t.id}"><div class="num">Table ${t.table_number || t.id}</div><div class="cap">${t.capacity}</div><div class="label">${String(t.status).replace('_',' ').toUpperCase()}</div></button>`).join('')}</div>
          </section>
        </div>`;
    } catch {
      root.innerHTML = `<div class="error-inline">Failed to load. Please refresh.</div>`;
    }
  }
  document.addEventListener('DOMContentLoaded', load);
})();
