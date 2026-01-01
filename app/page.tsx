'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'https://uxjprzqkuyrvqclktcat.supabase.co/rest/v1/products?select=*',
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );

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
  }, []);

  if (loading) {
    return <div className="products-container"><p className="loading">Cargando productos...</p></div>;
  }

  if (error) {
    return <div className="products-container"><p className="error">Error: {error}</p></div>;
  }

  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="product-link">
            <div className="product-card">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
