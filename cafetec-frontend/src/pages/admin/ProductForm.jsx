// src/pages/admin/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductService } from '../../api/adminProductService';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion: '',
    precio: '',
    id_categoria: '',
    imagen_url: '',
    stock: 999
  });

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cargar categorías y (si es edición) el producto actual
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const cats = await adminProductService.getCategories();
        setCategorias(cats);

        // Si es edición, cargar el producto
        if (isEditing) {
          const response = await fetch(`http://localhost:5000/api/productos`);
          const productos = await response.json();
          const producto = productos.find(p => p.id_producto == id);
          
          if (producto) {
            setFormData({
              nombre_producto: producto.nombre_producto || '',
              descripcion: producto.descripcion || '',
              precio: producto.precio.toString() || '',
              id_categoria: producto.id_categoria?.toString() || '',
              imagen_url: producto.imagen_url || '',
              stock: producto.stock || 999
            });
          } else {
            alert('Producto no encontrado');
            navigate('/admin/products');
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        alert('Error al cargar los datos del producto');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditing, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        nombre_producto: formData.nombre_producto,
        descripcion: formData.descripcion || null,
        precio: parseFloat(formData.precio),
        id_categoria: parseInt(formData.id_categoria),
        imagen_url: formData.imagen_url || null
      };

      if (isEditing) {
        // Actualizar producto
        await adminProductService.update(id, productData);
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await adminProductService.create(productData);
        alert('Producto creado exitosamente');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      alert('Error: ' + (err.message || 'No se pudo guardar el producto'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Nombre del producto *</label>
              <input
                type="text"
                name="nombre_producto"
                value={formData.nombre_producto}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Precio ($ MXN) *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Categoría *</label>
              <select
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                URL de Imagen
                <span className="text-sm text-gray-500 block mt-1">
                  Sube tu imagen a un servicio como ImgBB o Cloudinary y pega la URL aquí.
                </span>
              </label>
              <input
                type="text"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div>

            <div>
  <label className="block text-gray-700 mb-2">
    O subir imagen desde tu computadora
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formDataImg = new FormData();
      formDataImg.append('imagen', file);

      try {
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formDataImg
        });

        const data = await res.json();
        if (res.ok) {
          setFormData(prev => ({ ...prev, imagen_url: data.url }));
          alert('Imagen subida correctamente ');
        } else {
          alert(data.msg || 'Error al subir imagen');
        }
      } catch (err) {
        console.error(err);
        alert('Error al subir imagen');
      }
    }}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
  />

  {formData.imagen_url && (
    <div className="mt-4">
      <p className="text-gray-600 mb-2">Vista previa:</p>
      <img
        src={formData.imagen_url}
        alt="Vista previa"
        className="w-40 h-40 object-cover rounded-lg border"
      />
    </div>
  )}
</div>

  <label className="block text-gray-700 mb-2">Stock</label>
  <input
    type="number"
    name="stock"
    value={formData.stock}
    onChange={handleChange}
    min="0"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
  />
</div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-70"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}