import React, { useState, useEffect } from 'react';
import Paso1 from './Paso1SeleccionarPaciente';
import Paso2 from './Paso2Detalles';
import Paso3 from './Paso3Programacion';
import Paso4 from './Paso4Confirmacion';
import Paso5Observaciones from './Paso5Observaciones';
import Paso6Informe from './Paso6Informe';

import {
  crearSolicitudRayosX,
  obtenerTecnicos,
  obtenerEquiposRayosX,
  completarSolicitudRayosX
} from '../../../services/rayosxService';

import { useNavigate } from 'react-router-dom';

const CrearSolicitudWizard = () => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({ estado: 'pendiente' });
  const [tecnicos, setTecnicos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [idRayosX, setIdRayosX] = useState(null);
  const [reloadSolicitudes, setReloadSolicitudes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerTecnicos().then(setTecnicos).catch(console.error);
    obtenerEquiposRayosX().then(setEquipos).catch(console.error);
  }, []);

  const handleSubmit = async (dataFinal) => {
    if (dataFinal.id_rayos_x) {
      console.log('ℹ️ Usando solicitud ya existente:', dataFinal.id_rayos_x);
      setIdRayosX(dataFinal.id_rayos_x);
      setPaso(6);
      return;
    }

    const { id_paciente, id_equipo, tipo_estudio, fecha_estudio } = dataFinal;

    if (!id_paciente || !id_equipo || !tipo_estudio || !fecha_estudio) {
      alert('⚠️ Faltan datos obligatorios: paciente, equipo, tipo de estudio o fecha.');
      return;
    }

    try {
      const response = await crearSolicitudRayosX(dataFinal);
      const idGenerado = response.id || response.insertId;
      setIdRayosX(idGenerado);
      setPaso(6);
    } catch (error) {
      console.error('❌ Error al crear solicitud:', error);
      alert('❌ Hubo un error al crear la solicitud');
    }
  };

  const handleFinalizar = async () => {
    if (!idRayosX) return;

    try {
      await completarSolicitudRayosX(idRayosX);
      setPaso(1);
      setIdRayosX(null);
      setFormData({ estado: 'pendiente' });
      setReloadSolicitudes(prev => !prev); // 🔁 fuerza recarga
    } catch (error) {
      console.error('❌ Error al completar la solicitud:', error);
      alert('❌ No se pudo completar la solicitud');
    }
  };

  return (
    <div className="wizard-container">
      {paso === 1 && (
        <Paso1
          reload={reloadSolicitudes}
          formData={formData}
          setFormData={setFormData}
          onNext={() => setPaso(2)}
        />
      )}

      {paso === 2 && (
        <Paso2
          formData={formData}
          setFormData={setFormData}
          onNext={() => setPaso(3)}
          onBack={() => setPaso(1)}
        />
      )}

      {paso === 3 && (
        <Paso3
          formData={formData}
          setFormData={setFormData}
          tecnicos={tecnicos}
          equipos={equipos}
          onNext={() => setPaso(4)}
          onBack={() => setPaso(2)}
        />
      )}

      {paso === 4 && (
        <Paso4
          formData={formData}
          onBack={() => setPaso(3)}
          onNext={() => setPaso(5)}
        />
      )}

      {paso === 5 && (
        <Paso5Observaciones
          formData={formData}
          setFormData={setFormData}
          onBack={() => setPaso(4)}
          onSubmit={(dataFinal) => handleSubmit(dataFinal || formData)}
        />
      )}

      {paso === 6 && (
        <Paso6Informe
          idRayosX={idRayosX}
          onBack={() => setPaso(5)}
          onSubmitFinal={handleFinalizar}
        />
      )}
    </div>
  );
};

export default CrearSolicitudWizard;
