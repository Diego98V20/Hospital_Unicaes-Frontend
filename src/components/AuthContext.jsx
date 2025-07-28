import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Crea el contexto
const AuthContext = createContext();

// Hook para usar el contexto en otros componentes
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Solo verificar si hay indicios de autenticación
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8081/auth/user", {
          withCredentials: true
        });
        
        if (!response.data.success) {
          // Sesión inválida en el servidor
          localStorage.removeItem('isAuthenticated');
          setUser(null);
          navigate('/login');
          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          // Sesión válida
          setUser(response.data.user);
          localStorage.setItem('isAuthenticated', 'true');
        }
        
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Solo limpiar si es un error de autenticación
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('isAuthenticated');
          setUser(null);
          navigate('/login');
        }
        // Para otros errores (red, servidor), mantener el estado actual
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [navigate]);

  // Función para hacer logout
  const logout = async () => {
    try {
      await axios.post("http://localhost:8081/auth/logout", {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      setUser(null);
      navigate('/login');
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada exitosamente',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};