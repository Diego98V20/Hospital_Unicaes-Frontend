import axios from 'axios';

const API_URL = 'http://localhost:8081/api/rayosx';

export const obtenerSolicitudesRayosX = async () => {
  const response = await fetch('http://localhost:8081/api/rayosx/pendientes', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al obtener solicitudes pendientes');
  return await response.json();
};

export const obtenerSolicitudesDelTecnico = async () => {
  const response = await fetch('http://localhost:8081/api/rayosx/mis-solicitudes', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al obtener solicitudes del técnico');
  return await response.json();
};

export const obtenerTodosLosPacientes = async () => {
  const res = await fetch('http://localhost:8081/pacientes', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Error al obtener pacientes');
  return await res.json();
};

export const eliminarSolicitudRayosX = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return response.data;
};

export async function actualizarSolicitudRayosX(id, data) {
  const response = await fetch(`http://localhost:8081/api/rayosx/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function crearSolicitudRayosX(data) {
  const response = await fetch('http://localhost:8081/api/rayosx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return await response.json();
}

// Buscar pacientes por texto
export async function buscarPacientes(q) {
  const res = await fetch(`http://localhost:8081/api/pacientes/buscar?q=${q}`, {
    credentials: 'include'
  });
  return res.json();
}

// Obtener técnicos (enfermeros)
export const obtenerTecnicos = async () => {
  const res = await fetch('http://localhost:8081/usuarios/tecnicos', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Error al obtener técnicos');
  return await res.json();
};

// Obtener equipos de rayos X
export const obtenerEquiposRayosX = async () => {
  const response = await fetch('http://localhost:8081/equipos', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al obtener equipos');
  return await response.json();
};

// Crear informe de rayos X
export const crearInformeRayosX = async (datos) => {
  console.log('📤 Enviando informe al backend:', datos);
  const response = await fetch('http://localhost:8081/api/informes-rayosx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(datos)
  });
  return await response.json();
};

// Subir imagen de rayos X
export const subirImagenRayosX = async (formData) => {
  const response = await fetch('http://localhost:8081/api/imagenes-rayosx/subir', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return await response.json();
};

// Obtener todas las solicitudes sin filtrar por técnico
export const obtenerTodasLasSolicitudesParaTecnicos = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/rayosx/todas-solicitudes', {
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    return [];
  }
};

// Obtener solicitudes pendientes
export const obtenerSolicitudesPendientes = async () => {
  const response = await fetch('http://localhost:8081/api/rayosx/pendientes', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al obtener solicitudes pendientes');
  return await response.json();
};

// Completar solicitud (cambiar estado a 'completado' y registrar fecha)
export const completarSolicitudRayosX = async (id) => {
  const response = await fetch(`http://localhost:8081/api/rayosx/${id}/completar`, {
    method: 'PUT',
    credentials: 'include'
  });

  if (!response.ok) throw new Error('Error al completar solicitud');
  return await response.json();
};
