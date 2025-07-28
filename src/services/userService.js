import axios from 'axios';

const baseUrl = 'http://localhost:8081/usuarios';

export const usuarioService = {
  getAllUsuarios: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      throw error;
    }
  },

  getUsuarioById: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      throw error;
    }
  },

  createUsuario: async (usuarioData) => {
    try {
      const response = await axios.post(`${baseUrl}/registrar`, usuarioData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error al agregar el usuario:', error);
      throw error;
    }
  },

  updateUsuario: async (id, usuarioData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, usuarioData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  },

  changeStateUsuario: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/cambiar-estado/${id}`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      throw error;
    }
  }
};
