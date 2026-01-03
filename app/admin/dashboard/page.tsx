'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated, getAdminUser, logout } from '@/lib/auth';
import '../../styles/admin-dashboard.css';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    setIsAuthenticated(true);
    const user = getAdminUser();
    if (user?.email) {
      setAdminEmail(user.email);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel de Administración Q'Pinta</h1>
        <div className="admin-user-info">
          <span className="admin-email">{adminEmail}</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Productos</h2>
            <p>Administra los productos</p>
            <button onClick={() => router.push('/admin/products')}>Ver Productos</button>
          </div>
          
          <div className="dashboard-card">
            <h2>Categorías</h2>
            <p>Administra las categorías</p>
            <button onClick={() => router.push('/admin/categories')}>Ver Categorías</button>
          </div>
        </div>
      </div>
    </div>
  );
}
