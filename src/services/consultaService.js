import axios from 'axios';

const baseUrl = 'http://localhost:8081/consultas';



export const consultaService = {
    getAllConsultas: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listar`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener las consultas:', error);
          throw error;
        }
      },



      getConsutasById: async (id) => {
        try {
          const response = await axios.get(`${baseUrl}/listar/${id}`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener las consultas:', error);
          throw error;
        }
      },


      createConsulta: async (consultaData) => {
        try {
            const response = await axios.post(`${baseUrl}/registrar`, consultaData, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error('Error al agregar la consulta:', error);
            throw error;
        }
    },


    takeConsulta: async (idConsulta, idUsuario) => {
      try {
          const response = await axios.put(`${baseUrl}/tomar-consulta/${idConsulta}`, { id_usuario: idUsuario }, { withCredentials: true });
          return response.data;
      } catch (error) {
          console.error('Error al tomar la consulta:', error);
          throw error;
      }
  },

  //Consultas realizadas
  getConsultasRealizadas: async () => {
    try {
      const response = await axios.get(`${baseUrl}/consultas-realizadas`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las consultas realizadas:', error);
      throw error;
    }
  },


};