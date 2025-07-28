import React, { useState } from 'react';
import './Paso5Observaciones.css'; // ✅ Usa el CSS que ya está funcionando
import {
  crearInformeRayosX,
  subirImagenRayosX
} from '../../../services/rayosxService';

const Paso6Informe = ({ idRayosX, onBack, onSubmitFinal }) => {
  const [diagnostico, setDiagnostico] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [fechaInforme, setFechaInforme] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleImagenChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!diagnostico || !recomendaciones || !fechaInforme || !imagen) {
      setMensaje('⚠️ Todos los campos y la imagen son obligatorios.');
      return;
    }

    try {
      await crearInformeRayosX({
        id_rayos_x: idRayosX,
        diagnostico,
        recomendaciones,
        fecha_informe: fechaInforme
      });

      const formData = new FormData();
      formData.append('imagen', imagen);
      formData.append('id_rayos_x', idRayosX);
      await subirImagenRayosX(formData);

      await fetch(`http://localhost:8081/api/rayosx/asignar-estudio/${idRayosX}`, {
        method: 'PUT',
        credentials: 'include'
      });

      setMensaje('✅ Informe, imagen y estado guardados correctamente');
      setTimeout(() => {
        onSubmitFinal();
      }, 1500);
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setMensaje('❌ Ocurrió un error al guardar los datos.');
    }
  };

  return (
    <div className="wizard-step">
      <h3 className="title">📄 Informe e Imagen</h3>

      <label className="label">Diagnóstico:</label>
      <textarea
        className="textarea"
        value={diagnostico}
        onChange={(e) => setDiagnostico(e.target.value)}
        placeholder="Describa el diagnóstico del estudio"
      />

      <label className="label">Recomendaciones:</label>
      <textarea
        className="textarea"
        value={recomendaciones}
        onChange={(e) => setRecomendaciones(e.target.value)}
        placeholder="Ingrese recomendaciones clínicas"
      />

      <label className="label">Fecha del Informe:</label>
      <input
        type="date"
        className="textarea"
        value={fechaInforme}
        onChange={(e) => setFechaInforme(e.target.value)}
      />

      <label className="label">Subir Imagen:</label>
      <input
        type="file"
        accept="image/*"
        className="textarea"
        onChange={handleImagenChange}
      />

      {mensaje && <p className="paso6-error">{mensaje}</p>}

      <div className="wizard-buttons">
        <button className="btn-secondary" onClick={onBack}>Atrás</button>
        <button className="btn-primary" onClick={handleSubmit}>Finalizar</button>
      </div>
    </div>
  );
};

export default Paso6Informe;
