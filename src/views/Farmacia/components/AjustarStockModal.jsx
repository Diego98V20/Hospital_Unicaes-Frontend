// AjustarStockModal.jsx solo se utilozo para prueba, de momento no se usa
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { stockService } from '../../../services/stockService';

const AjustarStockModal = ({ show, onHide, lote, onSuccess }) => {
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (lote && lote.cantidad_disponible !== undefined) {
      setCantidad(lote.cantidad_disponible.toString());
    }
    // Limpiar mensajes al abrir el modal
    setError('');
    setSuccessMessage('');
  }, [lote, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cantidad || cantidad === '') {
      setError('La cantidad es obligatoria');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const cantidadNum = parseFloat(cantidad);
      const stockData = {
        id_medicamento: lote.id_medicamento,
        numero_lote: lote.numero_lote,
        fecha_fabricacion: lote.fecha_fabricacion,
        fecha_caducidad: lote.fecha_caducidad,
        cantidad_disponible: cantidadNum
      };

      const response = await stockService.actualizarStock(lote.id_stock, stockData);

      if (response.success) {
        setSuccessMessage('Cantidad de stock ajustada correctamente');
        
        // Si hay una alerta en la respuesta, mostrarla
        if (response.alerta) {
          setError(response.alerta); // Mostrar como advertencia
        }
        
        // Esperar 1.5 segundos para mostrar el mensaje de éxito antes de cerrar
        setTimeout(() => {
          onSuccess();
          onHide();
        }, 1500);
      } else {
        setError(response.message || 'Error al ajustar el stock');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al realizar el ajuste');
      console.error('Error al ajustar stock:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!lote) return null;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajustar Stock</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          <div className="mb-3">
            <h6>Información del Medicamento:</h6>
            <Row className="mb-2">
              <Col sm={4} className="text-muted">Medicamento:</Col>
              <Col sm={8} className="fw-bold">{lote.nombre}</Col>
            </Row>
            {lote.concentracion && (
              <Row className="mb-2">
                <Col sm={4} className="text-muted">Concentración:</Col>
                <Col sm={8}>{lote.concentracion}</Col>
              </Row>
            )}
            <Row className="mb-2">
              <Col sm={4} className="text-muted">Lote:</Col>
              <Col sm={8}>{lote.numero_lote}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4} className="text-muted">Vencimiento:</Col>
              <Col sm={8}>{formatDate(lote.fecha_caducidad)}</Col>
            </Row>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Cantidad Actual: {lote.cantidad_disponible}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ingrese la cantidad correcta"
              required
            />
            <Form.Text className="text-muted">
              Ingrese la cantidad correcta. Este cambio quedará registrado en el sistema.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AjustarStockModal;