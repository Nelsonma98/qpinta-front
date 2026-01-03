'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, isAdminAuthenticated } from '@/lib/auth';
import '../../styles/admin-products.css';
import { supabase } from '@/lib/supabaseClient';

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
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, size: '', categoryId: 0 });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createForm, setCreateForm] = useState({ price: 0, size: '', categoryId: 0, image: null as File | null });
  const [showCreateCategoryPicker, setShowCreateCategoryPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const imageBaseUrl = process.env.SUPABESE_IMAGE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co/storage/v1/object/public/images/';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const token = getAuthToken() || supabaseKey;

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${supabaseUrl}/rest/v1/categories?select=*`, {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Error al obtener datos');
        }
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts([...productsData].reverse());
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}_${randomStr}.${fileExt}`;

    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(fileName, file);

    if (error) {
      throw new Error('Error subiendo imagen: ' + error.message);
    }

    return fileName;
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(`¿Eliminar producto ${id}?`);
    if (!confirmDelete) return;
    
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;

      // Eliminar imagen de Storage
      if (product.image) {
        const { data, error } = await supabase
          .storage
          .from('images')
          .remove([product.image]);

        if (error) {
          console.error('Error eliminando imagen:', error.message)
        } else {
          console.log('Imagen eliminada correctamente', data)
        }
      }

      // Eliminar producto de la base de datos
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

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditForm({ 
      price: product.price, 
      size: product.size, 
      categoryId: product.categoryId 
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxjprzqkuyrvqclktcat.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const token = getAuthToken() || supabaseKey;
      
      const res = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          price: editForm.price,
          size: editForm.size,
          categoryId: editForm.categoryId,
        }),
      });

      if (!res.ok) {
        throw new Error('No se pudo actualizar el producto');
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, price: editForm.price, size: editForm.size, categoryId: editForm.categoryId }
            : p
        )
      );
      setEditingProduct(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error actualizando producto');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.image) {
      alert('Debes seleccionar una imagen');
      return;
    }

    try {
      setUploading(true);
      
      // Subir imagen
      const imageName = await uploadImage(createForm.image);
      
      // Crear producto
      const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          price: createForm.price,
          size: createForm.size,
          categoryId: createForm.categoryId,
          image: imageName,
        }),
      });

      if (!res.ok) {
        throw new Error('No se pudo crear el producto');
      }

      const [newProduct] = await res.json();
      setProducts((prev) => [newProduct, ...prev]);
      setCreatingProduct(false);
      setCreateForm({ price: 0, size: '', categoryId: 0, image: null });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creando producto');
    } finally {
      setUploading(false);
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
      {creatingProduct && (
        <div className="edit-modal-backdrop" onClick={() => setCreatingProduct(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Producto</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="create-image">Imagen</label>
                <input
                  type="file"
                  id="create-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCreateForm({ ...createForm, image: file });
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-price">Precio</label>
                <input
                  type="number"
                  id="create-price"
                  step="0.01"
                  value={createForm.price || ''}
                  onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-size">Talla</label>
                <input
                  type="text"
                  id="create-size"
                  value={createForm.size}
                  onChange={(e) => setCreateForm({ ...createForm, size: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <button
                  type="button"
                  className="category-selector-btn"
                  onClick={() => setShowCreateCategoryPicker(!showCreateCategoryPicker)}
                >
                  {categories.find(c => c.id === createForm.categoryId)?.name || 'Seleccionar categoría'}
                </button>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setCreatingProduct(false)} disabled={uploading}>
                  Cancelar
                </button>
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Subiendo...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="edit-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Producto ID.{editingProduct.id}</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="price">Precio</label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="size">Talla</label>
                <input
                  type="text"
                  id="size"
                  value={editForm.size}
                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <button
                  type="button"
                  className="category-selector-btn"
                  onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  {categories.find(c => c.id === editForm.categoryId)?.name || 'Seleccionar categoría'}
                </button>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingProduct(null)}>
                  Cancelar
                </button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryPicker && (
        <div className="category-modal-backdrop" onClick={() => setShowCategoryPicker(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Categoría</h3>
            <div className="category-list">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-item ${editForm.categoryId === cat.id ? 'selected' : ''}`}
                  onClick={() => {
                    setEditForm({ ...editForm, categoryId: cat.id });
                    setShowCategoryPicker(false);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreateCategoryPicker && (
        <div className="category-modal-backdrop" onClick={() => setShowCreateCategoryPicker(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Categoría</h3>
            <div className="category-list">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-item ${createForm.categoryId === cat.id ? 'selected' : ''}`}
                  onClick={() => {
                    setCreateForm({ ...createForm, categoryId: cat.id });
                    setShowCreateCategoryPicker(false);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="admin-products-grid">
        <button className="product-card add-card" onClick={() => setCreatingProduct(true)}>
          <div className="add-icon-wrapper">
            <img src="/add.svg" alt="Agregar producto" className="add-icon" />
            <span>Agregar producto</span>
          </div>
        </button>

        {products.map((product) => (
          <div key={product.id} className="product-card">
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
            <button
              className="edit-btn"
              aria-label={`Editar producto ${product.id}`}
              onClick={() => handleEditClick(product)}
            >
              <img src="/edit_square.svg" alt="Editar" className="edit-icon" />
            </button>
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
