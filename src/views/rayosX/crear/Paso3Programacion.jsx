import React, { useEffect, useState } from 'react';
import './Paso3Programacion.css';
import { useAuth } from 'components/AuthContext';

const Paso3Programacion = ({ formData, setFormData, onNext, onBack, equipos }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // Asigna el técnico desde sesión
    if (user?.id_usuario) {
      setFormData((prev) => ({
        ...prev,
        id_tecnico: user.id_usuario,
        nombre_tecnico: user.nombre,
        apellido_tecnico: user.apellido
      }));
    }

    // Asigna la fecha y hora actual (local) en ISO
    const ahora = new Date();
    const fechaFormateada = ahora.toISOString(); // Ej: 2025-07-02T22:17:00.000Z

    setFormData((prev) => ({
      ...prev,
      fecha_estudio: fechaFormateada
    }));
  }, [user, setFormData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleContinuar = () => {
    if (!formData.id_equipo) {
      setError('⚠️ Debes seleccionar un equipo antes de continuar.');
      return;
    }
    onNext();
  };

  // Formatea ISO a fecha legible local
  const formatearFechaHora = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="paso3-container">
      <h3>🗓️ Programación</h3>

      <div className="campo-formulario">
        <label>Técnico:</label>
        <input
          type="text"
          value={
            user?.nombre && user?.apellido
              ? `${user.nombre} ${user.apellido}`
              : 'Técnico no identificado'
          }
          readOnly
          className="readonly-input"
        />
      </div>

      <div className="campo-formulario">
        <label>Equipo:</label>
        <select name="id_equipo" value={formData.id_equipo || ''} onChange={handleChange}>
          <option value="">Seleccionar equipo</option>
          {Array.isArray(equipos) && equipos.length > 0 ? (
            equipos.map((e) => {
              const nombreEquipo = e?.nombre_equipo || e?.nombre || 'Equipo sin nombre';
              return (
                <option key={e.id_equipo} value={e.id_equipo}>
                  {nombreEquipo}
                </option>
              );
            })
          ) : (
            <option disabled>(Sin equipos disponibles)</option>
          )}
        </select>
      </div>

      <div className="campo-formulario">
        <label>Fecha del estudio:</label>
        <input
          type="text"
          value={formatearFechaHora(formData.fecha_estudio)}
          readOnly
          className="readonly-input"
        />
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <div className="paso3-botones">
        <button className="btn-atras" onClick={onBack}>Atrás</button>
        <button className="btn-siguiente" onClick={handleContinuar}>Siguiente</button>
      </div>
    </div>
  );
};

export default Paso3Programacion;
