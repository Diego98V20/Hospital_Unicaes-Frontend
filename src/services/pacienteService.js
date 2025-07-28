import axios from 'axios';

const baseUrl = 'http://localhost:8081/pacientes';



export const pacienteService = {
    getPacientes: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listar`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los pacientes:', error);
          throw error;
        }
      },

      getPacienteById: async (id) => {
        try {
          const response = await axios.get(`${baseUrl}/listar/${id}`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener el paciente:', error);
          throw error;
        }
      },

      createPaciente: async (pacienteData) => {
        try {
            const response = await axios.post(`${baseUrl}/registrar`, pacienteData, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error('Error al agregar el paciente:', error);
            throw error;
        }
    },

    updatePaciente: async (id, pacienteData) => {
        try {
            const response = await axios.put(`${baseUrl}/actualizar/${id}`, pacienteData, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el paciente:', error);
            throw error;
        }
    },


      changeStatePaciente: async (id) => {
        try {
          const response = await axios.put(
            `${baseUrl}/cambiar-estado/${id}`,
            {},
            { withCredentials: true }
          );
          return response.data; 
        } catch (error) {
          console.error('Error al cambiar el estado del paciente:', error);
          throw error;
        }
      },


}