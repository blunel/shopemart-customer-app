import { API_BASE_URL } from './config';
import { getItem, setItem, removeItem } from './storage';

const TOKEN_KEY = 'shopemart_customer_token';

// Some phone networks sit behind a filter that refuses a request that does not look like it came from a web browser (the answer is a bare 403 that
// is not ours). The app says who it is the way a browser does, plus its own name, so those networks let it through.
const APP_USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 ShopeMartApp/1.0';

export const getToken = () => getItem(TOKEN_KEY);
export const setToken = (t) => (t ? setItem(TOKEN_KEY, t) : removeItem(TOKEN_KEY));

// A phone with no signal never reaches the server at all: fetch() itself rejects. Turn that one rejection into a clear sentence for every screen.
const describeNetworkError = (err) => (err instanceof TypeError ? new Error('No internet connection. Check your network and try again.') : err);

/** JSON in, JSON out, throws with the server's own error message (its `code`, when it sends one, is on err.code). The login token goes along when there is one. */
export async function apiFetch(path, options = {}) {
  const token = await getToken();
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': APP_USER_AGENT,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    throw describeNetworkError(err);
  }
  const raw = await res.text().catch(() => '');
  let data = {};
  try { data = JSON.parse(raw); } catch (err) { data = {}; }
  if (!data || typeof data !== 'object') data = {};
  if (!res.ok) {
    const peek = data.error ? '' : ` (${raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) || 'no message'})`;
    const err = new Error(data.error || `Request failed: ${res.status}${peek}`);
    err.status = res.status;
    if (data.code) err.code = data.code;
    throw err;
  }
  return data;
}

const qs = (params) => {
  const p = new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const s = p.toString();
  return s ? `?${s}` : '';
};

const json = (method, body) => ({ method, body: JSON.stringify(body || {}) });

/** A picture address from the server: a few are stored as "/uploads/…" without the host. */
export const picture = (url) => (!url ? null : (/^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`));

// ---- the shop (public: no login needed)
export const home = () => apiFetch('/api/site/home');
export const products = (params) => apiFetch(`/api/products${qs(params)}`);
export const product = (slug) => apiFetch(`/api/products/${encodeURIComponent(slug)}`);
export const related = (slug) => apiFetch(`/api/products/${encodeURIComponent(slug)}/related`);
export const feedback = (slug) => apiFetch(`/api/site/products/${encodeURIComponent(slug)}/feedback`);
export const categories = () => apiFetch('/api/categories?store=1');
export const checkoutOptions = () => apiFetch('/api/site/checkout');
export const quote = (body) => apiFetch('/api/site/quote', json('POST', body));

// ---- an account
export const authConfig = () => apiFetch('/api/auth/config');
export const sendOtp = (phone) => apiFetch('/api/auth/otp/send', json('POST', { phone }));
export const registerCustomer = (body) => apiFetch('/api/auth/register/customer', json('POST', body));
export const forgotPassword = (phone) => apiFetch('/api/auth/password/forgot', json('POST', { phone }));

// ---- orders: signed in uses the account, otherwise a guest order
export const placeOrder = (body, signedIn) => apiFetch(signedIn ? '/api/orders' : '/api/orders/guest', json('POST', body));
export const myOrders = () => apiFetch('/api/orders/my');
export const getOrder = (id) => apiFetch(`/api/orders/${id}`);
export const cancelOrder = (id) => apiFetch(`/api/orders/${id}/cancel`, json('POST'));
export const myPoints = () => apiFetch('/api/customer/points');
