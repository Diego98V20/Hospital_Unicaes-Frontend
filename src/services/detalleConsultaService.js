import axios from 'axios';

const baseUrl = 'http://localhost:8081/detalles-consultas';



export const detalleConsultaService = {


  getDetalleConsutasById: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los detalles de las consultas:', error);
      throw error;
    }
  },


  getDetalleConsutasByIdDetallePDF: async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/listar-detalle/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Service: Error al obtener el detalle:', error);
      throw error;
    }
  },


  createDetalleConsulta: async (detalleConsultaData) => {
    try {
      const response = await axios.post(`${baseUrl}/registrar`, detalleConsultaData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error al agregar el detalle de la consulta:', error);
      throw error;
    }
  },


};