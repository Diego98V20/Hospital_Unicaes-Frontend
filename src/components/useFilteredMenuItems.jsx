// useFilteredMenuItems.jsx
import { useContext } from 'react';
import { AuthProvider } from './AuthContext';
import menuItems from 'menu-items';

export const useFilteredMenuItems = () => {
  const { user } = useContext(AuthContext); // Obtener el usuario desde el contexto

  const filteredMenuItems = menuItems.items.filter(item => {
    if (item.roles) {
      return item.roles.includes(user?.rol); // Cambia 'rol' por la propiedad que almacena el rol del usuario
    }
    return true; // Si no hay roles definidos, incluir el elemento
  });

  return filteredMenuItems;
};
