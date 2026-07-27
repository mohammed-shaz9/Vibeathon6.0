(function () {
  const root = document.getElementById('reviewRoot');
  const orderId = new URLSearchParams(location.search).get('orderId');
  let dish = 0, chef = 0, waiter = 0, tipAmount = 0;

  function stars(section, value) {
    return Array.from({ length: 5 }, (_, i) => `
      <button type="button" class="star ${i < value ? 'filled' : ''}" data-section="${section}" data-value="${i + 1}">★</button>
    `).join('');
  }

  function render() {
    root.innerHTML = `
      <div class="review-card">
        <div id="err" class="error-inline"></div>
        <div class="rating-block"><label>Rate the Dish</label><div class="stars" data-section="dish">${stars('dish', dish)}</div></div>
        <div class="rating-block"><label>Rate the Chef</label><div class="stars" data-section="chef">${stars('chef', chef)}</div></div>
        <div class="rating-block"><label>Rate the Waiter</label><div class="stars" data-section="waiter">${stars('waiter', waiter)}</div></div>
        <textarea id="comment" placeholder="Tell us about your experience..."></textarea>
        <div class="tip-row"><label>Tip the Chef</label><input id="chefTip" type="number" min="0" step="10"><button id="addChefTip">Add</button></div>
        <div class="tip-row"><label>Tip the Waiter</label><input id="waiterTip" type="number" min="0" step="10"><button id="addWaiterTip">Add</button></div>
        <button id="submitReview" class="primary">Submit Review</button>
      </div>
    `;
    attachStarHandlers();
    document.getElementById('addChefTip').onclick = () => { tipAmount += Number(document.getElementById('chefTip').value || 0); document.getElementById('addChefTip').textContent = '✓'; setTimeout(() => document.getElementById('addChefTip').textContent = 'Add', 800); };
    document.getElementById('addWaiterTip').onclick = () => { tipAmount += Number(document.getElementById('waiterTip').value || 0); document.getElementById('addWaiterTip').textContent = '✓'; setTimeout(() => document.getElementById('addWaiterTip').textContent = 'Add', 800); };
    document.getElementById('submitReview').onclick = submitReview;
  }

  function attachStarHandlers() {
    root.querySelectorAll('.stars').forEach((wrap) => {
      const section = wrap.dataset.section;
      const buttons = [...wrap.querySelectorAll('.star')];
      const setValue = (v) => {
        if (section === 'dish') dish = v;
        if (section === 'chef') chef = v;
        if (section === 'waiter') waiter = v;
        buttons.forEach((b, idx) => b.classList.toggle('filled', idx < v));
      };
      buttons.forEach((btn, idx) => {
        btn.onmouseenter = () => buttons.forEach((b, i) => b.classList.toggle('hovered', i <= idx));
        btn.onmouseleave = () => buttons.forEach((b) => b.classList.remove('hovered'));
        btn.onclick = () => setValue(idx + 1);
      });
    });
  }

  function confetti() {
    return `<div class="confetti">${Array.from({ length: 20 }, (_, i) => `<span style="left:${(i * 5) % 100}%;animation-delay:${(i % 5) * 0.12}s"></span>`).join('')}</div>`;
  }

  async function submitReview() {
    const err = document.getElementById('err');
    if (!dish && !chef && !waiter) {
      err.textContent = 'Please rate at least one category.';
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          dish_rating: dish,
          chef_rating: chef,
          waiter_rating: waiter,
          comment: document.getElementById('comment').value,
          tip_amount: tipAmount,
          tip_recipient: tipAmount ? 'both' : ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review failed');
      root.innerHTML = `<div class="thanks">${confetti()}<h2>Thank you! Your feedback helps us improve.</h2></div>`;
      setTimeout(() => location.href = '/index.html', 3000);
    } catch {
      err.textContent = 'Failed to load. Please refresh.';
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();
