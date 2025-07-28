import axios from 'axios';

const baseUrl = 'http://localhost:8081/proveedores';

export const proveedorService = {
  listarProveedores: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
      throw error;
    }
  },

  obtenerProveedorPorId: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el proveedor:', error);
      throw error;
    }
  },

  crearProveedor: async (proveedorData) => {
    try {
      const response = await axios.post(`${baseUrl}/crear`, proveedorData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear el proveedor:', error);
      throw error;
    }
  },

  actualizarProveedor: async (id, proveedorData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, proveedorData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el proveedor:', error);
      throw error;
    }
  },

  desactivarProveedor: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/desactivar/${id}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al desactivar el proveedor:', error);
      throw error;
    }
  }
};