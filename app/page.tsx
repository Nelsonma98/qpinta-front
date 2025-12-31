'use client';

import { useState, useEffect } from 'react';

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
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA',
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
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={product.image} alt={`Producto ${product.id}`} className="product-image" />
            </div>
            <div className="product-details">
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-size">Talla: {product.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
