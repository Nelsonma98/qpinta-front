'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  created_at: string;
  price: number;
  size: string;
  categoryId: number;
  image: string;
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA';
  const imageBaseUrl = process.env.SUPABESE_IMAGE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co/storage/v1/object/public/images/';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const filter = categoryParam ? `&categoryId=eq.${categoryParam}` : '';
        const response = await fetch(
          `${supabaseUrl}/rest/v1/products?select=*${filter}`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }

        const data = await response.json();
        setProducts([...data].reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, supabaseKey, supabaseUrl]);

  if (loading) {
    return <div className="products-container"><p className="loading">Cargando productos...</p></div>;
  }

  if (error) {
    return <div className="products-container"><p className="error">Error: {error}</p></div>;
  }

  if (products.length === 0) {
    return <div className="products-container"><p className="loading">No hay productos disponibles</p></div>;
  }
  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="product-link">
            <div className="product-card">
              <div className="product-image-container">
                <img src={`${imageBaseUrl}${product.image}`} alt={`Producto ${product.id}`} className="product-image" />
              </div>
              <div className="product-details">
                <div className="product-price-row">
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <p className="product-id">ID.{product.id}</p>
                </div>
                <p className="product-size">Talla: {product.size}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="products-container"><p className="loading">Cargando productos...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
