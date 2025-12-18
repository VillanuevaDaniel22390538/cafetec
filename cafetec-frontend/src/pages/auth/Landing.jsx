import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png'; 

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-blue-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <img src={Logo} alt="Instituto Tecnológico de Chetumal" className="h-12" />
          <Link
            to="/login"
            className="bg-primary hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full transition"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Bienvenido a <span className="text-primary">CaféTec</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10">
            El sistema de pedidos para la cafetería del Instituto Tecnológico de Chetumal.  
            Ahorra tiempo, evita filas y disfruta tu comida sin estrés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-primary hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-full text-lg transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-secondary font-medium py-3 px-8 rounded-full text-lg transition"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-blue-200">
        <p>© {new Date().getFullYear()} Instituto Tecnológico de Chetumal – Proyecto Académico</p>
      </footer>
    </div>
  );
}