import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Alert, Form, ProgressBar, Row, Col, Card } from 'react-bootstrap';
import { despachoService } from '../../../services/despachoService';

const DespachoModal = ({ show, onHide, receta, onDespachoCompletado }) => {
  const [informacionReceta, setInformacionReceta] = useState(null);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paso, setPaso] = useState(1);
  const [lotesSeleccionados, setLotesSeleccionados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [tipoDespacho, setTipoDespacho] = useState('completo');
  const [razonCancelacion, setRazonCancelacion] = useState('');

  useEffect(() => {
    if (show && receta) {
      cargarInformacionCompleta();
      // Resetear estados
      setPaso(1);
      setTipoDespacho('completo');
      setRazonCancelacion('');
      setObservaciones('');
    }
  }, [show, receta]);

  const cargarInformacionCompleta = async () => {
    try {
      setLoading(true);
      const response = await despachoService.obtenerInformacionCompletaReceta(receta.id_receta);
      if (response.success) {
        setInformacionReceta(response.data);
        setMedicamentos(response.data.medicamentos);

        // Inicializar lotes seleccionados
        const lotesInicial = {};
        response.data.medicamentos.forEach(med => {
          lotesInicial[med.id_detalle_receta] = [];
        });
        setLotesSeleccionados(lotesInicial);
      }
    } catch (err) {
      console.error("Error al cargar información completa de receta:", err);
      setError("Error al cargar la información de la receta");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarLote = (idDetalleReceta, lote, cantidad) => {
    setLotesSeleccionados(prev => {
      const lotes = [...(prev[idDetalleReceta] || [])];
      const indexExistente = lotes.findIndex(l => l.id_stock === lote.id_stock);

      if (indexExistente >= 0) {
        if (cantidad === 0) {
          lotes.splice(indexExistente, 1);
        } else {
          lotes[indexExistente].cantidad = cantidad;
        }
      } else if (cantidad > 0) {
        lotes.push({ ...lote, cantidad });
      }

      return { ...prev, [idDetalleReceta]: lotes };
    });
  };

  const calcularTotalSeleccionado = (idDetalleReceta) => {
    return (lotesSeleccionados[idDetalleReceta] || []).reduce(
      (sum, lote) => sum + (parseInt(lote.cantidad) || 0),
      0
    );
  };

  const validarSeleccionLotes = () => {
    if (tipoDespacho === 'cancelado') {
      return razonCancelacion.trim() !== '';
    }

    if (tipoDespacho === 'completo') {
      for (let medicamento of medicamentos) {
        const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
        if (totalSeleccionado !== medicamento.cantidad) {
          return false;
        }
      }
      return true;
    }

    if (tipoDespacho === 'parcial') {
      let hayAlgunLoteSeleccionado = false;

      for (let medicamento of medicamentos) {
        const lotesDelMedicamento = lotesSeleccionados[medicamento.id_detalle_receta] || [];

        if (lotesDelMedicamento.length > 0) {
          hayAlgunLoteSeleccionado = true;

          for (let lote of lotesDelMedicamento) {
            if (lote.cantidad > lote.cantidad_disponible) {
              return false;
            }
          }

          const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
          if (totalSeleccionado > medicamento.cantidad) {
            return false;
          }
        }
      }

      return hayAlgunLoteSeleccionado;
    }

    return false;
  };

  const esPosibleDespachoCompleto = () => {
    for (let medicamento of medicamentos) {
      if (medicamento.stock_disponible < medicamento.cantidad) {
        return false;
      }
    }
    return true;
  };

  const handleConfirmarDespacho = async () => {
    if (!validarSeleccionLotes()) {
      if (tipoDespacho === 'cancelado' && razonCancelacion.trim() === '') {
        alert("Por favor, ingrese la razón de cancelación");
      } else {
        alert("Por favor, revise la selección de lotes para los medicamentos");
      }
      return;
    }

    try {
      setProcesando(true);

      if (tipoDespacho === 'cancelado') {
        const cancelacionData = {
          id_receta: receta.id_receta,
          razon_cancelacion: razonCancelacion,
          observaciones
        };

        const response = await despachoService.cancelarDespacho(cancelacionData);
        if (response.success) {
          alert("Despacho cancelado exitosamente");
          onDespachoCompletado();
          onHide();
        }
      } else {
        const detalles = medicamentos.map(med => ({
          id_detalle_receta: med.id_detalle_receta,
          lotes: lotesSeleccionados[med.id_detalle_receta].map(lote => ({
            id_stock: lote.id_stock,
            cantidad: parseInt(lote.cantidad)
          }))
        }));

        const despachoData = {
          id_receta: receta.id_receta,
          tipo_despacho: tipoDespacho,
          detalles,
          observaciones
        };

        const response = await despachoService.realizarDespacho(despachoData);
        if (response.success) {
          alert(`Despacho ${tipoDespacho === 'parcial' ? 'parcial' : 'completo'} realizado exitosamente`);
          onDespachoCompletado();
          onHide();
        }
      }
    } catch (err) {
      console.error("Error al procesar despacho:", err);
      alert("Error al procesar el despacho");
    } finally {
      setProcesando(false);
    }
  };

  const haySuficienteStock = esPosibleDespachoCompleto();

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="fas fa-prescription-bottle-alt me-2"></i>
          Despacho de Receta #{receta?.id_receta}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Información del paciente - Destacada */}
            <Card className="mb-3 border-primary">
              <Card.Body className="py-3">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '50px', height: '50px' }}>
                        <i className="fas fa-user fa-lg"></i>
                      </div>
                      <div>
                        <h5 className="mb-1 text-primary">{informacionReceta?.nombre_paciente}</h5>
                        <div className="text-muted">
                          <strong>Expediente:</strong> {informacionReceta?.n_expediente} |
                          <strong> DUI:</strong> {informacionReceta?.dui_paciente} |
                          <strong> Sexo:</strong> {informacionReceta?.sexo_paciente}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="text-muted small">
                      <div><strong>Dr.</strong> {informacionReceta?.nombre_medico}</div>
                      <div>{informacionReceta?.especialidad}</div>
                      <div>{informacionReceta?.fecha_receta &&
                        new Date(informacionReceta.fecha_receta).toLocaleString('es-ES')}</div>
                    </div>
                  </Col>
                </Row>
                {informacionReceta?.observaciones_receta && (
                  <Row>
                    <Col md={12}>
                      <div className="mt-2 p-3 bg-light rounded">
                        <strong>Observaciones de la receta:</strong>
                        <p className="mb-0 mt-1">{informacionReceta.observaciones_receta}</p>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Progreso y tipo de despacho */}
            <Card className="mb-3">
              <Card.Body className="py-3">
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <span className="me-3 text-muted">Paso:</span>
                      <ProgressBar className="flex-grow-1" style={{ height: '8px' }}>
                        <ProgressBar
                          variant={paso === 1 ? "primary" : "success"}
                          now={paso === 1 ? 50 : 100}
                        />
                      </ProgressBar>
                      <span className="ms-3 small text-muted">
                        {paso === 1 ? "Selección de Lotes" : "Confirmación"}
                      </span>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    {paso === 1 && (
                      <Form.Select
                        value={tipoDespacho}
                        onChange={(e) => setTipoDespacho(e.target.value)}
                        className="w-auto d-inline-block"
                        size="sm"
                      >
                        <option value="completo" disabled={!haySuficienteStock}>
                          {haySuficienteStock ? 'Despacho Completo' : 'Despacho Completo (No disponible)'}
                        </option>
                        <option value="parcial">Despacho Parcial</option>
                        <option value="cancelado">Cancelar Despacho</option>
                      </Form.Select>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Alerta de stock si es necesaria */}
            {!haySuficienteStock && paso === 1 && (
              <Alert variant="warning" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Stock insuficiente.</strong> No hay suficiente inventario para el despacho completo.
              </Alert>
            )}

            {paso === 1 ? (
              <>
                {tipoDespacho === 'cancelado' ? (
                  <Card className="mb-4">
                    <Card.Header className="bg-danger text-white">
                      <h6 className="mb-0">Cancelación de Despacho</h6>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label>Razón de Cancelación *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={razonCancelacion}
                          onChange={(e) => setRazonCancelacion(e.target.value)}
                          placeholder="Especifique la razón por la cual se cancela este despacho"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ) : (
                  <>
                    {medicamentos.map((medicamento, index) => (
                      <Card key={medicamento.id_detalle_receta} className="mb-3">
                        <Card.Header className="bg-light">
                          <Row className="align-items-center">
                            <Col md={8}>
                              <div className="d-flex align-items-center">
                                <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                <div>
                                  <h6 className="mb-0">{medicamento.nombre_medicamento}</h6>
                                  <small className="text-muted">
                                    {medicamento.concentracion} - {medicamento.nombre_presentacion}
                                  </small>
                                  <div className="mt-1">
                                    <small className="text-info">
                                      <i className="fas fa-map-marker-alt me-1"></i>
                                      <strong>Ubicación:</strong> {medicamento.ubicacion_almacen || 'No especificada'}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={4} className="text-end">
                              <div className="d-flex flex-column align-items-end gap-1">
                                <Badge bg={medicamento.stock_disponible >= medicamento.cantidad ? 'success' : 'danger'}>
                                  {medicamento.stock_disponible >= medicamento.cantidad ? 'Stock Disponible' : 'Stock Insuficiente'}
                                </Badge>
                                <small className="text-muted">
                                  <strong>Stock:</strong> {medicamento.stock_disponible}
                                </small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Header>
                        <Card.Body>
                          {/* Información de prescripción compacta */}
                          <Row className="mb-3 text-sm">
                            <Col md={3}>
                              <div className="text-center p-2 bg-primary text-white rounded">
                                <div className="h4 mb-0">{medicamento.cantidad}</div>
                                <small>Cantidad requerida</small>
                              </div>
                            </Col>
                            <Col md={9}>
                              <div className="ps-3">
                                <Row className="g-2">
                                  <Col md={3}>
                                    <small><strong>Dosis:</strong> {medicamento.dosis || 'No especificada'}</small>
                                  </Col>
                                  <Col md={3}>
                                    <small><strong>Frecuencia:</strong> {medicamento.frecuencia || 'No especificada'}</small>
                                  </Col>
                                  <Col md={3}>
                                    <small><strong>Duración:</strong> {medicamento.duracion || 'No especificada'}</small>
                                  </Col>
                                  <Col md={3}>
                                    <small><strong>Vía Admin.:</strong> {medicamento.via_administracion || 'No especificada'}</small>
                                  </Col>
                                  {medicamento.instrucciones && (
                                    <Col md={12}>
                                      <small><strong>Instrucciones:</strong> {medicamento.instrucciones}</small>
                                    </Col>
                                  )}
                                </Row>
                              </div>
                            </Col>
                          </Row>

                          <LoteSelectorComponent
                            medicamento={medicamento}
                            onSeleccionarLote={handleSeleccionarLote}
                            totalSeleccionado={calcularTotalSeleccionado(medicamento.id_detalle_receta)}
                            tipoDespacho={tipoDespacho}
                            lotesSeleccionados={lotesSeleccionados[medicamento.id_detalle_receta] || []}
                          />
                        </Card.Body>
                      </Card>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Confirmación */}
                <Card className="mb-4">
                  <Card.Header className="text-center">
                    <Badge bg={
                      tipoDespacho === 'completo' ? 'success' :
                        tipoDespacho === 'parcial' ? 'warning' : 'danger'
                    } className="fs-5 px-4 py-2">
                      {tipoDespacho === 'completo' ? 'Despacho Completo' :
                        tipoDespacho === 'parcial' ? 'Despacho Parcial' : 'Despacho Cancelado'}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    {tipoDespacho === 'cancelado' ? (
                      <div className="text-center">
                        <h6>Razón de Cancelación:</h6>
                        <div className="p-3 bg-light rounded">{razonCancelacion}</div>
                      </div>
                    ) : (
                      <>
                        {tipoDespacho === 'parcial' && (
                          <Alert variant="warning" className="mb-3">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Despacho parcial: No se entregarán todos los medicamentos prescritos.
                          </Alert>
                        )}

                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Medicamento</th>
                                <th className="text-center">Cantidad</th>
                                <th>Lotes a Despachar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicamentos.map((medicamento) => {
                                const lotesDelMedicamento = lotesSeleccionados[medicamento.id_detalle_receta] || [];
                                const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
                                const cantidadFaltante = medicamento.cantidad - totalSeleccionado;

                                return (
                                  <tr key={medicamento.id_detalle_receta} className={cantidadFaltante > 0 ? 'table-warning' : ''}>
                                    <td>
                                      <div>
                                        <strong>{medicamento.nombre_medicamento}</strong>
                                        <br />
                                        <small className="text-muted">
                                          {medicamento.concentracion} - {medicamento.nombre_presentacion}
                                        </small>
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      <div className="d-flex justify-content-center align-items-center">
                                        <div className="text-center">
                                          <div className="h5 mb-0 text-primary">{totalSeleccionado}</div>
                                          <small className="text-muted">de {medicamento.cantidad}</small>
                                          {cantidadFaltante > 0 && (
                                            <div>
                                              <Badge bg="warning" className="mt-1">
                                                Faltan {cantidadFaltante}
                                              </Badge>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      {lotesDelMedicamento.length > 0 ? (
                                        <div className="small">
                                          {lotesDelMedicamento.map(lote => (
                                            <div key={lote.id_stock} className="mb-1">
                                              <strong>{lote.numero_lote}</strong> → {lote.cantidad} unidades
                                              <div className="text-muted">
                                                Vence: {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-muted">Sin selección</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </>
                    )}

                    <div className="mt-4">
                      <Form.Group>
                        <Form.Label>Observaciones de la receta</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Observaciones adicionales (opcional)"
                        />
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        {paso === 1 ? (
          <>
            <Button variant="outline-secondary" onClick={onHide} disabled={procesando}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => setPaso(2)}
              disabled={!validarSeleccionLotes() || procesando}
              className="px-4"
            >
              Continuar <i className="fas fa-arrow-right ms-1"></i>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={() => setPaso(1)} disabled={procesando}>
              <i className="fas fa-arrow-left me-1"></i> Volver
            </Button>
            <Button
              variant={tipoDespacho === 'cancelado' ? 'danger' : 'success'}
              onClick={handleConfirmarDespacho}
              disabled={procesando}
              className="px-4"
            >
              {procesando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-1"></i>
                  {tipoDespacho === 'cancelado' ? 'Confirmar Cancelación' :
                    tipoDespacho === 'parcial' ? 'Confirmar Despacho Parcial' : 'Confirmar Despacho'}
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// Componente para seleccionar lotes - Simplificado
const LoteSelectorComponent = ({ medicamento, onSeleccionarLote, totalSeleccionado, tipoDespacho, lotesSeleccionados }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await despachoService.obtenerLotesDisponibles(medicamento.id_medicamento);
        if (response.success) {
          const lotesOrdenados = response.data.sort((a, b) => {
            return new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad);
          });
          setLotes(lotesOrdenados);
        }
      } catch (err) {
        console.error("Error al cargar lotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, [medicamento.id_medicamento]);

  const cantidadRestante = medicamento.cantidad - totalSeleccionado;
  const porcentajeSeleccionado = Math.min((totalSeleccionado / medicamento.cantidad) * 100, 100);
  const excedido = totalSeleccionado > medicamento.cantidad;

  if (tipoDespacho === 'cancelado') {
    return null;
  }

  if (loading) {
    return <div className="text-center py-2 text-muted">Cargando lotes disponibles...</div>;
  }

  if (lotes.length === 0) {
    return (
      <Alert variant="warning" className="mb-0">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Sin lotes disponibles
      </Alert>
    );
  }

  return (
    <div>
      {/* Indicador de progreso más destacado */}
      <div className="mb-3 p-3 bg-light rounded">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <span className="me-2">Progreso:</span>
              <div className="flex-grow-1 me-3">
                <ProgressBar>
                  <ProgressBar
                    variant={excedido ? 'danger' : cantidadRestante === 0 ? 'success' : 'primary'}
                    now={porcentajeSeleccionado}
                  />
                </ProgressBar>
              </div>
            </div>
          </Col>
          <Col md={4} className="text-end">
            <div className="h6 mb-0">
              <span className={excedido ? 'text-danger' : cantidadRestante === 0 ? 'text-success' : 'text-primary'}>
                {totalSeleccionado}
              </span>
              <span className="text-muted"> / {medicamento.cantidad}</span>
            </div>
            {cantidadRestante > 0 && (
              <small className="text-muted">Faltan {cantidadRestante}</small>
            )}
            {excedido && (
              <small className="text-danger">Cantidad excedida</small>
            )}
          </Col>
        </Row>
      </div>

      <div className="table-responsive">
        <Table hover size="sm" className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Lote</th>
              <th className="text-center">Disponible</th>
              <th className="text-center">Vencimiento</th>
              <th className="text-center" style={{ width: '120px' }}>Cantidad a Despachar</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => {
              const loteSeleccionado = lotesSeleccionados.find(l => l.id_stock === lote.id_stock);
              const cantidadSeleccionada = loteSeleccionado ? loteSeleccionado.cantidad : 0;

              const maxCantidad = tipoDespacho === 'completo'
                ? Math.min(lote.cantidad_disponible, cantidadRestante + cantidadSeleccionada)
                : lote.cantidad_disponible;

              const fechaCaducidad = new Date(lote.fecha_caducidad);
              const hoy = new Date();
              const diasHastaCaducidad = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
              const estaProximoAVencer = diasHastaCaducidad <= 90;
              const estaVencido = diasHastaCaducidad <= 0;

              return (
                <tr key={lote.id_stock} className={cantidadSeleccionada > 0 ? 'table-success' : ''}>
                  <td>
                    <strong>{lote.numero_lote}</strong>
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">{lote.cantidad_disponible}</Badge>
                  </td>
                  <td className="text-center">
                    <div className={estaVencido ? 'text-danger' : estaProximoAVencer ? 'text-warning' : ''}>
                      <small>{fechaCaducidad.toLocaleDateString('es-ES')}</small>
                      {estaVencido && <div><Badge bg="danger" className="mt-1">Vencido</Badge></div>}
                      {!estaVencido && estaProximoAVencer && <div><Badge bg="warning" className="mt-1">Próximo</Badge></div>}
                    </div>
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      size="sm"
                      min="0"
                      max={maxCantidad}
                      value={cantidadSeleccionada}
                      onChange={(e) => {
                        const cantidad = parseInt(e.target.value) || 0;
                        if (cantidad >= 0 && cantidad <= lote.cantidad_disponible) {
                          onSeleccionarLote(medicamento.id_detalle_receta, lote, cantidad);
                        }
                      }}
                      disabled={tipoDespacho === 'completo' && cantidadRestante === 0 && cantidadSeleccionada === 0}
                      className="text-center"
                      style={{ width: '80px' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default DespachoModal;