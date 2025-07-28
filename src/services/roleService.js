import axios from 'axios';

const baseUrl = 'http://localhost:8081/roles';



export const roleService = {
    getRoles: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listar`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los roles:', error);
          throw error;
        }
      }

}