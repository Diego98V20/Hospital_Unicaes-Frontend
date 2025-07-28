import axios from 'axios';

const baseUrl = 'http://localhost:8081/estados-consulta';



export const estadoConsultaService = {
    getEstados: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listar`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los estados de la consulta:', error);
          throw error;
        }
      },

      getExamenes: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listarExamenes`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los examenes disponibles:', error);
          throw error;
        }
      },

      getMedicamentos: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listarMedicamentos`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los medicamentos disponibles:', error);
          throw error;
        }
      }, 

      getRayosX: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listarRayosX`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los examanes rayos X disponibles:', error);
          throw error;
        }
      }


}