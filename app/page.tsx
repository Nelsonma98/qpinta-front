'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: number;
  created_at: string;
  price: number;
  size: string;
  categoryId: number;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
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
