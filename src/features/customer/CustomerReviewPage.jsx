import React, { useState } from 'react';
import { apiPost } from '../../shared/api';

export default function CustomerReviewPage() {
  const [dish, setDish] = useState(0);
  const [chef, setChef] = useState(0);
  const [waiter, setWaiter] = useState(0);
  const [comment, setComment] = useState('');
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  const submit = async () => {
    await apiPost('/api/reviews', { order_id: orderId, dish_rating: dish, chef_rating: chef, waiter_rating: waiter, comment, tip_amount: 0, tip_recipient: '' });
    window.location.href = '/index.html';
  };
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container"><div className="ordr-card"><h1>How was your experience?</h1><button onClick={submit}>Submit Review</button></div></div></main></div>;
}
