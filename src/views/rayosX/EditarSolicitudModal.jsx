import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { actualizarSolicitudRayosX } from '../../services/rayosxService';

const EditarSolicitudModal = ({ show, onClose, solicitud, onActualizar }) => {
  const [formData, setFormData] = useState({
    ...solicitud,
    fecha_estudio: solicitud.fecha_estudio?.split('T')[0] || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      await actualizarSolicitudRayosX(formData.id_rayos_x, formData);
      alert('✅ Solicitud actualizada');
      onActualizar();
      onClose();
    } catch (err) {
      alert('❌ Error al actualizar');
      console.error(err);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Paciente</Form.Label>
            <Form.Control
              type="text"
              value={`${formData.nombre_paciente || ''} ${formData.apellido_paciente || ''}`}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Técnico</Form.Label>
            <Form.Control
              type="text"
              value={`${formData.nombre_tecnico || ''} ${formData.apellido_tecnico || ''}`}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Equipo</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre_equipo || ''}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fecha Estudio</Form.Label>
            <Form.Control
              type="date"
              name="fecha_estudio"
              value={formData.fecha_estudio}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Tipo Estudio</Form.Label>
            <Form.Control
              as="select"
              name="tipo_estudio"
              value={formData.tipo_estudio}
              onChange={handleChange}
            >
              <option>Radiografía de tórax</option>
              <option>Radiografía dental</option>
              <option>Resonancia magnética</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option>pendiente</option>
              <option>completado</option>
              <option>cancelado</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={handleGuardar}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditarSolicitudModal;