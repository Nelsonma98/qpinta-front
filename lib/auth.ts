export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

export const getAdminUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/';
  }
};

export const setAuthData = (accessToken: string, refreshToken: string, user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
};
