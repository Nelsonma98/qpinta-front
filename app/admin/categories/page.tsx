'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
        setCategories([...data].reverse());
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

      // Buscar productos con esta categoría
      const productsRes = await fetch(`${supabaseUrl}/rest/v1/products?category_id=eq.${id}&select=id`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productsRes.ok) {
        throw new Error('Error al verificar productos');
      }

      const products = await productsRes.json();

      if (products.length > 0) {
        alert(`No se puede eliminar esta categoría. Hay ${products.length} producto(s) asignado(s) a ella.`);
        return;
      }

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

  const handleEdit = async (category: Category) => {
    const newName = window.prompt('Nuevo nombre de categoría', category.name);
    if (!newName || newName.trim() === category.name) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;

      const res = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${category.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        throw new Error('No se pudo actualizar la categoría');
      }

      setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, name: newName.trim() } : c)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error actualizando categoría');
    }
  };

  const handleCreate = async () => {
    const name = window.prompt('Nombre de la nueva categoría');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;

      const res = await fetch(`${supabaseUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        throw new Error('No se pudo crear la categoría');
      }

      const [created] = await res.json();
      if (created) {
        setCategories((prev) => [created, ...prev]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creando categoría');
    }
  };

  if (loading) return <div className="admin-categories-container">Cargando categorías...</div>;
  if (error) return <div className="admin-categories-container">Error: {error}</div>;

  return (
    <div className="admin-categories-container">
      <div className="admin-categories-grid">
        <button type="button" className="category-card add-card" onClick={handleCreate}>
          <div className="add-icon-wrapper">
            <img src="/add.svg" alt="Agregar categoría" className="add-icon" />
            <span>Agregar categoría</span>
          </div>
        </button>

        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <div className="category-body">
              <p className="category-name">{cat.name}</p>
              <p className="category-id">ID.{cat.id}</p>
            </div>
            <button
              className="edit-btn"
              aria-label={`Editar categoría ${cat.id}`}
              onClick={() => handleEdit(cat)}
            >
              <img src="/edit_square.svg" alt="Editar" className="edit-icon" />
            </button>
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
