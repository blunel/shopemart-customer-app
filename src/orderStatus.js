import { colors } from './theme';

/** How the shopper sees an order's progress (the same words as the website's My Orders). */
export const CUSTOMER_LABEL = {
  PLACED: 'Order placed', VENDOR_PREPARING: 'Being prepared', READY_FOR_PICKUP: 'Being prepared', COLLECTED_BY_ADMIN: 'Being packed', PACKED: 'Being packed',
  SHIPPED: 'On its way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', RETURNED: 'Returned', CONFIRMED: 'Order confirmed', ON_HOLD: 'On hold',
};
export const STATUS_TONE = {
  PLACED: 'warning', CONFIRMED: 'info', ON_HOLD: 'muted', VENDOR_PREPARING: 'info', READY_FOR_PICKUP: 'info', COLLECTED_BY_ADMIN: 'info', PACKED: 'info',
  SHIPPED: 'brand', DELIVERED: 'success', CANCELLED: 'error', RETURNED: 'error',
};
export const STEPS = ['Order placed', 'Being prepared', 'On its way', 'Delivered'];

export function stepIndex(status) {
  switch (status) {
    case 'PLACED': case 'CONFIRMED': case 'ON_HOLD': return 0;
    case 'VENDOR_PREPARING': case 'READY_FOR_PICKUP': return 1;
    case 'COLLECTED_BY_ADMIN': case 'PACKED': case 'SHIPPED': return 2;
    case 'DELIVERED': return 3;
    default: return -1;
  }
}

export const ORDER_TABS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'active', label: 'Active', match: (o) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status) },
  { key: 'delivered', label: 'Delivered', match: (o) => o.status === 'DELIVERED' },
  { key: 'cancelled', label: 'Cancelled', match: (o) => o.status === 'CANCELLED' || o.status === 'RETURNED' },
];

export const PAY_LABEL = { COD: 'Cash on delivery', BKASH: 'bKash', NAGAD: 'Nagad', ROCKET: 'Rocket' };
export const optionsText = (i) => [i.color, i.size].filter(Boolean).join(' · ');
export const stepColor = (done) => (done ? colors.primary : colors.border);
