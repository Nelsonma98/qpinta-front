'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Product {
  id: number;
  created_at: string;
  price: number;
  size: string;
  categoryId: number;
  image: string;
  categories?: {
    name: string;
  };
}

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://uxjprzqkuyrvqclktcat.supabase.co/rest/v1/products?select=*,categories(name)&id=eq.${id}`,
          {
            headers: {
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener el producto');
        }

        const data = await response.json();
        if (data.length > 0) {
          setProduct(data[0]);
        } else {
          throw new Error('Producto no encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-container">
        <p className="loading">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <p className="error">Error: {error || 'Producto no encontrado'}</p>
        <Link href="/" className="back-link">Volver a productos</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-content">
        <Link href="/" className="close-button" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>
        <div className="product-detail-image">
          <img src={product.image} alt={`Producto ${product.id}`} />
        </div>
        <div className="product-detail-info">
          <h1>Producto #{product.id}</h1>
          <p className="detail-category">
            Categoría: {product.categories?.name || 'Sin categoría'}
          </p>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <p className="detail-size">
            <strong>Talla:</strong> {product.size}
          </p>
        </div>
      </div>
    </div>
  );
}
