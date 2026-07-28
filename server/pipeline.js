// ETL Data Pipeline for Restaurant Analytics & Velocity
function computeAnalyticsPipeline(orders, inventory, waitlist, reviews) {
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Dish popularity & sales breakdown
  const dishCounts = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const name = item.name || 'Menu Item';
      dishCounts[name] = (dishCounts[name] || 0) + (item.qty || item.quantity || 1);
    });
  });

  const topDishes = Object.entries(dishCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hourly velocity pipeline
  const hourlySales = Array(24).fill(0);
  orders.forEach(o => {
    if (o.created_at) {
      const hour = new Date(o.created_at).getHours();
      hourlySales[hour] += Number(o.total_amount || 0);
    }
  });

  // Low stock inventory alert pipeline
  const lowStockItems = inventory.filter(i => i.current_stock <= i.min_threshold);

  // Customer satisfaction score
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + ((r.dish_rating + r.chef_rating + r.waiter_rating) / 3), 0) / reviews.length).toFixed(1)
    : '5.0';

  return {
    pipeline_timestamp: new Date().toISOString(),
    metrics: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      avg_order_value: avgOrderValue.toFixed(2),
      customer_rating: avgRating,
      active_waitlist: waitlist.length,
      low_stock_count: lowStockItems.length
    },
    top_dishes: topDishes,
    hourly_sales: hourlySales,
    low_stock_items: lowStockItems
  };
}

module.exports = { computeAnalyticsPipeline };
