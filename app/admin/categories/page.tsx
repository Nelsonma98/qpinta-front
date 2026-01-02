'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken, isAdminAuthenticated } from '@/lib/auth';
import '../../styles/admin-categories.css';

interface Category {
  id: number;
  name: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const token = getAuthToken() || supabaseKey;
        const res = await fetch(`${supabaseUrl}/rest/v1/categories?select=*`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Error al obtener categorías');
        }
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(`¿Eliminar categoría ${id}?`);
    if (!confirmDelete) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;
      const res = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('No se pudo eliminar la categoría');
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando categoría');
    }
  };

  if (loading) return <div className="admin-categories-container">Cargando categorías...</div>;
  if (error) return <div className="admin-categories-container">Error: {error}</div>;

  return (
    <div className="admin-categories-container">
      <div className="admin-categories-grid">
        <Link href="/admin/categories/new" className="category-card add-card">
          <div className="add-icon-wrapper">
            <img src="/add.svg" alt="Agregar categoría" className="add-icon" />
            <span>Agregar categoría</span>
          </div>
        </Link>

        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <div className="category-body">
              <p className="category-name">{cat.name}</p>
              <p className="category-id">ID.{cat.id}</p>
            </div>
            <button
              className="delete-btn"
              aria-label={`Eliminar categoría ${cat.id}`}
              onClick={() => handleDelete(cat.id)}
            >
              <img src="/delete.svg" alt="Eliminar" className="delete-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
