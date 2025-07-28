import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './informesMedico.css';

const InformesMedico = () => {
  const [informes, setInformes] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/rayosx/completados');
        setInformes(res.data);
      } catch (err) {
        console.error('Error al obtener informes:', err);
      }
    };
    fetchInformes();
  }, []);

  const informesFiltrados = informes.filter((informe) => {
  const nombreCompleto = `${informe.nombre_paciente} ${informe.apellido_paciente}`.toLowerCase();
  const expediente = informe.n_expediente?.toLowerCase() || '';
  const busquedaLower = busqueda.toLowerCase();

  return (
    nombreCompleto.includes(busquedaLower) ||
    expediente.includes(busquedaLower)
  );
});

  return (
    <div className="informes-container">
      <h2>📄 Informes de Imágenes</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o expediente"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="buscador-input"
      />
      <table className="tabla-informes">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Paciente</th>
            <th>Fecha Estudio</th>
            <th>Tipo Estudio</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {informesFiltrados.map((inf) => (
            <tr key={inf.id_rayos_x}>
              <td>{inf.n_expediente}</td>
              <td>{inf.nombre_paciente} {inf.apellido_paciente}</td>
              <td>{new Date(inf.fecha_estudio).toLocaleDateString('es-SV')}</td>
              <td>{inf.tipo_estudio}</td>
              <td>
                <Link to={`/rayosx/ver/${inf.id_rayos_x}`} className="boton-ver">Ver informe</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InformesMedico;