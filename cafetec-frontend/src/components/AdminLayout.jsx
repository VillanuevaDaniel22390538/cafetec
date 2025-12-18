// src/components/AdminLayout.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Outlet } from 'react-router-dom';
import Logo from '../assets/logo.png';

const navItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Productos', path: '/admin/products' },
  { name: 'Pedidos', path: '/admin/orders' },
  { name: 'Usuarios', path: '/admin/users' },
  { name: 'Reportes', path: '/admin/reports' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth(); 

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static z-50 h-full w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-200">
          <img src={Logo} alt="CaféTec Admin" className="h-10" />
          <h2 className="text-lg font-semibold text-secondary mt-2">Panel de Administración</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition"
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <button
      className="md:hidden text-gray-700"
      onClick={() => setSidebarOpen(true)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="text-xl font-bold text-secondary hidden md:block">CaféTec Admin</h1>
    
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 hidden sm:block">
        Hola, {user?.nombre || 'Admin'}
      </span>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 font-medium"
        title="Cerrar sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>
    </div>
  </div>
</header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}