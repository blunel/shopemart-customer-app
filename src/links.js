import { Linking } from 'react-native';
import { SITE_URL } from './config';

/** A banner's link as the website writes it ("/category/saree", "/product/red-saree", or a full address): open the matching screen of the app, else the website. */
export function openLink(router, link) {
  if (!link) return;
  const cat = String(link).match(/^\/category\/([^/?#]+)/);
  if (cat) { router.push({ pathname: '/(tabs)/shop', params: { category: decodeURIComponent(cat[1]) } }); return; }
  const prod = String(link).match(/^\/product\/([^/?#]+)/);
  if (prod) { router.push({ pathname: '/product/[slug]', params: { slug: decodeURIComponent(prod[1]) } }); return; }
  const url = /^https?:\/\//i.test(link) ? link : `${SITE_URL}${link.startsWith('/') ? '' : '/'}${link}`;
  Linking.openURL(url).catch(() => {});
}
