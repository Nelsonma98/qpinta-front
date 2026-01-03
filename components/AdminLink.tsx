'use client';

import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';

export default function AdminLink() {
  const router = useRouter();

  const handleAdminClick = () => {
    if (isAdminAuthenticated()) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  };

  return (
    <button
      onClick={handleAdminClick}
      className="admin-link-btn"
      aria-label="Panel de Administración"
    >
      Panel de Administración
    </button>
  );
}
