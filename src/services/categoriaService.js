import axios from 'axios';

const baseUrl = 'http://localhost:8081/categorias-medicamento';

export const categoriaService = {
  listarCategorias: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las categorías de medicamentos:', error);
      throw error;
    }
  },

  obtenerCategoriaPorId: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la categoría de medicamento:', error);
      throw error;
    }
  },

  crearCategoria: async (categoriaData) => {
    try {
      const response = await axios.post(`${baseUrl}/crear`, categoriaData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear la categoría de medicamento:', error);
      throw error;
    }
  },

  actualizarCategoria: async (id, categoriaData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, categoriaData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la categoría de medicamento:', error);
      throw error;
    }
  },

  desactivarCategoria: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/desactivar/${id}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al desactivar la categoría de medicamento:', error);
      throw error;
    }
  }
};