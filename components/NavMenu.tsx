'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';

interface Category {
  id: string | number;
  name: string;
}

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    if (!isHome) return;
    const fetchCategories = async () => {
      if (!supabaseUrl || !supabaseKey) {
        setError('Falta configuración de Supabase');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const url = `${supabaseUrl}/rest/v1/categories?select=*`;
        const res = await fetch(url, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (!res.ok) {
          throw new Error('No se pudieron obtener las categorías');
        }
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Error cargando categorías');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [pathname, supabaseKey, supabaseUrl]);

  if (!isHome && !isAdmin) return null;

  if (isAdmin) {
    if (isAdminLogin) return null;
    return (
      <div className="admin-logout-wrapper">
        <button
          className="admin-logout-btn"
          aria-label="Cerrar sesión"
          onClick={() => {
            logout();
          }}
        >
          <img src="/logout.svg" alt="Cerrar sesión" className="admin-logout-icon" />
        </button>
      </div>
    );
  }

  return (
    <div className="menu-wrapper">
      <button
        className="menu-toggle"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((prev) => !prev)}
      >
        <img src="/menu.svg" alt="Menú" className="menu-icon" />
      </button>

      <div className={`side-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="side-menu-header">
          <span>Categorías</span>
          <button
            className="menu-close"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="side-menu-content">
          {loading && <p className="side-menu-status">Cargando...</p>}
          {error && <p className="side-menu-status error">{error}</p>}
          {!loading && !error && (
            <div className="category-buttons">
              <button
                className="category-btn"
                onClick={() => {
                  setOpen(false);
                  router.push('/');
                }}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="category-btn"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/?category=${cat.id}`);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="side-menu-footer">
          <Link
            href="/admin/login"
            className="side-menu-login"
            onClick={() => setOpen(false)}
          >
            <img src="/account_circle.svg" alt="Login" className="side-menu-login-icon" />
            <span>Login administrador</span>
          </Link>
        </div>
      </div>

      {open && <div className="menu-backdrop" onClick={() => setOpen(false)} />}
    </div>
  );
}
