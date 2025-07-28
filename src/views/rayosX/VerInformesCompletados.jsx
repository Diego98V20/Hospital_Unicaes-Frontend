import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './verInformesCompletados.css';
import { useNavigate } from 'react-router-dom';

const VerInformesCompletados = () => {
  const [informes, setInformes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const informesPorPagina = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/rayosx/completados');
        setInformes(res.data);
      } catch (error) {
        console.error('Error al cargar informes:', error);
      }
    };

    fetchInformes();
  }, []);

  // Búsqueda por nombre completo o expediente
const informesFiltrados = informes.filter((i) => {
  const textoBusqueda = busqueda.toLowerCase();
  const nombreCompleto = `${i.nombre_paciente} ${i.apellido_paciente}`.toLowerCase();
  const expediente = (i.n_expediente || '').toLowerCase();
  return nombreCompleto.includes(textoBusqueda) || expediente.includes(textoBusqueda);
});

  const totalPaginas = Math.ceil(informesFiltrados.length / informesPorPagina);
  const indiceInicio = (paginaActual - 1) * informesPorPagina;
  const informesPagina = informesFiltrados.slice(indiceInicio, indiceInicio + informesPorPagina);

  return (
    <div className="informes-container">
      <h2>📄 Informes de Imágenes Completados</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o expediente del paciente..."
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setPaginaActual(1);
        }}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <table className="tabla-informes">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Expediente</th>
            <th>Tipo de Estudio</th>
            <th>Fecha</th>
            <th>Equipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {informesPagina.map((info) => (
            <tr key={info.id_rayos_x}>
              <td>{info.nombre_paciente} {info.apellido_paciente}</td>
              <td>{info.n_expediente || '—'}</td>
              <td>{info.tipo_estudio}</td>
              <td>{new Date(info.fecha_estudio).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
              <td>{info.nombre_equipo || '—'}</td>
              <td>
                <button className="btn-ver" onClick={() => navigate(`/rayosx/ver/${info.id_rayos_x}`)}>Ver informe</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Navegación de páginas */}
      {totalPaginas > 1 && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: paginaActual === i + 1 ? '#3498db' : '#ecf0f1',
                color: paginaActual === i + 1 ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerInformesCompletados;
