// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { adminUserService } from '../../api/adminUserService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Simulación de datos (porque el backend no tiene el endpoint aún)
  useEffect(() => {
    const mockUsers = [
      {
        id_usuario: 1,
        nombre: 'Daniel Villanueva',
        email: 'daniel@cafetec.com',
        roles: [{ nombre_rol: 'administrador' }],
        activo: true
      },
      {
        id_usuario: 2,
        nombre: 'Usuario Estudiante',
        email: 'estudiante@cafetec.com',
        roles: [{ nombre_rol: 'estudiante' }],
        activo: true
      }
    ];
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    if (window.confirm(`¿${isCurrentlyAdmin ? 'Revocar' : 'Asignar'} rol de administrador?`)) {
      setActionLoading(prev => ({ ...prev, [`admin-${userId}`]: true }));
      try {
        // await adminUserService.toggleAdminRole(userId, !isCurrentlyAdmin);
        alert('Función de gestión de roles no implementada en backend (MVP)');
        // Actualizar localmente
        setUsers(prev =>
          prev.map(u =>
            u.id_usuario === userId
              ? { ...u, roles: [{ nombre_rol: isCurrentlyAdmin ? 'estudiante' : 'administrador' }] }
              : u
          )
        );
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setActionLoading(prev => ({ ...prev, [`admin-${userId}`]: false }));
      }
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    if (window.confirm(`¿${isActive ? 'Desactivar' : 'Activar'} esta cuenta?`)) {
      setActionLoading(prev => ({ ...prev, [`active-${userId}`]: true }));
      try {
        // await adminUserService.toggleActive(userId, !isActive);
        alert('Función de activación no implementada en backend (MVP)');
        setUsers(prev =>
          prev.map(u =>
            u.id_usuario === userId ? { ...u, activo: !isActive } : u
          )
        );
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setActionLoading(prev => ({ ...prev, [`active-${userId}`]: false }));
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando usuarios...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => {
              const isadmin = user.roles.some(r => r.nombre_rol === 'administrador');
              return (
                <tr key={user.id_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isadmin
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isadmin ? 'Administrador' : 'Estudiante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                    <div>
                      <button
                        onClick={() => handleToggleAdmin(user.id_usuario, isadmin)}
                        disabled={actionLoading[`admin-${user.id_usuario}`]}
                        className={`text-sm ${
                          isadmin
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-purple-600 hover:text-purple-900'
                        }`}
                      >
                        {actionLoading[`admin-${user.id_usuario}`]
                          ? '...'
                          : isadmin
                          ? 'Revocar Admin'
                          : 'Hacer Admin'}
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => handleToggleActive(user.id_usuario, user.activo)}
                        disabled={actionLoading[`active-${user.id_usuario}`]}
                        className={`text-sm ${
                          user.activo
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {actionLoading[`active-${user.id_usuario}`]
                          ? '...'
                          : user.activo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Nota para MVP:</strong> La gestión completa de usuarios requiere endpoints adicionales en el backend. 
              En esta versión, solo se muestra una simulación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}