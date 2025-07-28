import axios from 'axios';

const baseUrl = 'http://localhost:8081/areas';



export const areaService = {
  getAreas: async () => {
    try {
      const response = await axios.get(`${baseUrl}/listar`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las areas:', error);
      throw error;
    }
  },

  getAreaById: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data; // Devuelve directamente el objeto (o arreglo plano) desde el backend
    } catch (error) {
      console.error('Service: Error al obtener el Area:', error);
      throw error;
    }
  },

  createArea: async (area_Data) => {
    try {
      const response = await axios.post(`${baseUrl}/registrar`, area_Data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al agregar el area:', error);
      throw error;
    }
  },

  updateArea: async (id, AreaData) => {
    try {
      const response = await axios.put(`${baseUrl}/actualizar/${id}`, AreaData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al actualizar la especialidad:', error);
      throw error;
    }
  },
  //crear fun para cambiar el estado esp
  changeStateArea: async (id) => {
    try {
      const response = await axios.put(`${baseUrl}/cambiar-estado/${id}`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('service: Error al cambiar el estado', error);
      throw error;
    }
  }

}