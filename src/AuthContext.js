import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, getToken, setToken, registerCustomer } from './api';
import { getDeviceId, getDeviceLabel } from './deviceId';

const AuthContext = createContext(null);

/** Who is signed in (a CUSTOMER login), if anyone: the shop itself needs no login. Wraps the whole app. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        try {
          const d = await apiFetch('/api/auth/me');
          if (d.user.role === 'CUSTOMER') setUser(d.user); else await setToken(null);
        } catch (err) {
          if (err.status === 401 || err.status === 403) await setToken(null); // an expired or revoked login: back to a guest
        }
      }
      setReady(true);
    })();
  }, []);

  const login = useCallback(async (phone, password) => {
    const deviceId = await getDeviceId();
    const d = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password, deviceId, deviceLabel: getDeviceLabel() }) });
    if (d.user.role !== 'CUSTOMER') throw new Error('This app is for ShopeMart shoppers. Vendors, resellers and staff have their own apps.');
    await setToken(d.token);
    const me = await apiFetch('/api/auth/me');
    setUser(me.user);
    return me.user;
  }, []);

  const register = useCallback(async (body) => {
    const d = await registerCustomer(body);
    await setToken(d.token);
    const me = await apiFetch('/api/auth/me');
    setUser(me.user);
    return me.user;
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
