'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken, isAdminAuthenticated } from '@/lib/auth';
import '../../styles/admin-products.css';

interface Product {
  id: number;
  created_at: string;
  price: number;
  size: string;
  categoryId: number;
  image: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    const fetchProducts = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const token = getAuthToken() || supabaseKey;
        const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [router]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(`¿Eliminar producto ${id}?`);
    if (!confirmDelete) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('No se pudo eliminar el producto');
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando producto');
    }
  };

  if (loading) {
    return <div className="admin-products-container">Cargando productos...</div>;
  }

  if (error) {
    return <div className="admin-products-container">Error: {error}</div>;
  }

  return (
    <div className="admin-products-container">
      <div className="admin-products-grid">
        <Link href="/admin/products/new" className="product-card add-card">
          <div className="add-icon-wrapper">
            <img src="/add.svg" alt="Agregar producto" className="add-icon" />
            <span>Agregar producto</span>
          </div>
        </Link>

        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={product.image} alt={`Producto ${product.id}`} className="product-image" />
            </div>
            <div className="product-details">
              <div className="product-price-row">
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-id">ID.{product.id}</p>
              </div>
              <p className="product-size">Talla: {product.size}</p>
            </div>
            <button
              className="delete-btn"
              aria-label={`Eliminar producto ${product.id}`}
              onClick={() => handleDelete(product.id)}
            >
              <img src="/delete.svg" alt="Eliminar" className="delete-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
