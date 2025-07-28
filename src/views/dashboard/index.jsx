import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';
import { listarUltimosExamenesService, contarExamenesPendientesService, contarExamenesCompletadosService, contarPacientesConExamenService } from 'services/examenService';
import { set } from 'immutable';
import { despachoService } from 'services/despachoService';
import { dashboardService } from 'services/dashboardService';
import VerDespachoModal from 'views/Farmacia/components/VerDespachoModal'

// Componentes específicos para cada rol
const LaboratoristasDashboard = () => {
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  const [examenesCompletados, setExamenesCompletados] = useState(0);
  const [pacientesConExamen, setPacientesConExamen] = useState(0);
  const [ultimosExamenes, setUltimosExamenes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pendientes = await contarExamenesPendientesService.contarExamenesPendientes();
        const completados = await contarExamenesCompletadosService.contarExamenesCompletados();
        const ultimos = await listarUltimosExamenesService.getUltimosExamenes();
        const pacientesConExamen = await contarPacientesConExamenService.contarPacientesConExamen();


        setPacientesConExamen(pacientesConExamen.length);
        setExamenesPendientes(pendientes);
        setExamenesCompletados(completados);
        setUltimosExamenes(ultimos);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Row>
        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Pacientes Registrados</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-user text-c-blue f-30 m-r-5" />
                    {pacientesConExamen}
                  </h3>
                  <p className='mt-2'>Total de Pacientes con Examen</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/pacientes-historial" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Exámenes Pendientes</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-clock text-warning f-30 m-r-5" />
                    {examenesPendientes}
                  </h3>
                  <p className='mt-2'>Total de Resultados Pendientes</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/examenes-pendientes" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Exámenes Completados</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-check-circle text-success f-30 m-r-5" />
                    {examenesCompletados}
                  </h3>
                  <p className='mt-2'>Total de Examenes Completados</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/gestion-reportes" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Últimos 5 Exámenes Registrados</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Expediente</th>
                    <th>Teléfono</th>
                    <th>Examen</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosExamenes.length > 0 ? (
                    ultimosExamenes.map((examen) => (
                      <tr key={examen.id_examen}>
                        <td>{`${examen.nombre_paciente} ${examen.apellido_paciente}`}</td>
                        <td>{examen.n_expediente}</td>
                        <td>{examen.telefono_paciente}</td>
                        <td>{examen.nombre_examen}</td>
                        <td>{examen.estado}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No hay exámenes recientes.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};


const Jefe_FarmaciaDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    // Métricas de inventario
    totalMedicamentos: 0,
    medicamentosStockBajo: 0,
    lotesProximosVencer: 0,
    medicamentosAgotados: 0,

    // Métricas de despacho
    recetasPendientes: 0,
    despachosHoy: 0,
    despachosParciales: 0,
    despachosCancelados: 0,

    // Datos para tablas
    medicamentosStockBajoDetalle: [],
    proximosVencimientos: [],
    ultimasRecetas: [],
    ultimosDespachos: [],

    loading: true,
    error: null
  });

  const [showVerDespachoModal, setShowVerDespachoModal] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Usar el servicio unificado
        const estadisticas = await dashboardService.obtenerEstadisticasCompletas();

        setDashboardData({
          ...estadisticas,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Badge bg="info">Pendiente</Badge>;
      case 'despachada':
        return <Badge bg="success">Despachada</Badge>;
      case 'despachada_parcial':
        return <Badge bg="warning">Parcial</Badge>;
      case 'cancelada':
        return <Badge bg="danger">Cancelada</Badge>;
      case 'completo':
        return <Badge bg="success">Completo</Badge>;
      case 'parcial':
        return <Badge bg="warning">Parcial</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const getStockBadge = (stockActual, stockMinimo) => {
    if (stockActual === 0) {
      return <Badge bg="danger">Agotado</Badge>;
    } else if (stockActual <= stockMinimo) {
      return <Badge bg="warning">Stock Bajo</Badge>;
    } else {
      return <Badge bg="success">Normal</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDespacho = async (idDespacho) => {
    try {
      const response = await despachoService.obtenerDetalleDespacho(idDespacho);
      if (response.success) {
        setDespachoSeleccionado(response.data);
        setShowVerDespachoModal(true);
      } else {
        alert("Error al obtener los detalles del despacho");
      }
    } catch (err) {
      console.error("Error al obtener detalle de despacho:", err);
      alert("Error al obtener los detalles del despacho");
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <Alert variant="danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {dashboardData.error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Métricas de Inventario */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-pills text-primary me-2"></i>
              Gestión de Inventario
            </h5>
            <Link to="/inventario-medicamentos" className="btn btn-outline-primary btn-sm">
              <i className="fas fa-external-link-alt me-1"></i>
              Ver Inventario
            </Link>
          </div>

          <Row>
            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Total Medicamentos</h6>
                    <h3 className="mb-0">{dashboardData.totalMedicamentos}</h3>
                  </div>
                  <div className="text-primary">
                    <i className="fas fa-pills fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Medicamentos activos</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Stock Bajo</h6>
                    <h3 className="mb-0 text-warning">{dashboardData.medicamentosStockBajo}</h3>
                  </div>
                  <div className="text-warning">
                    <i className="fas fa-exclamation-triangle fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Requieren reposición</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Próximos a Vencer</h6>
                    <h3 className="mb-0 text-danger">{dashboardData.lotesProximosVencer}</h3>
                  </div>
                  <div className="text-danger">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Próximos 90 días</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Agotados</h6>
                    <h3 className="mb-0 text-secondary">{dashboardData.medicamentosAgotados}</h3>
                  </div>
                  <div className="text-secondary">
                    <i className="fas fa-ban fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Sin stock disponible</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Métricas de Despacho */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-shipping-fast text-info me-2"></i>
              Control de Despachos
            </h5>
            <Link to="/despacho-medicamentos" className="btn btn-outline-info btn-sm">
              <i className="fas fa-external-link-alt me-1"></i>
              Ver Despachos
            </Link>
          </div>

          <Row>
            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Recetas Pendientes</h6>
                    <h3 className="mb-0 text-info">{dashboardData.recetasPendientes}</h3>
                  </div>
                  <div className="text-info">
                    <i className="fas fa-prescription-bottle-alt fa-2x"></i>
                  </div>
                </div>
                <small className="text-muted">Esperando despacho</small>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Despachos Hoy</h6>
                    <h3 className="mb-0 text-success">{dashboardData.despachosHoy}</h3>
                  </div>
                  <div className="text-success">
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
                <small className="text-muted">Completados hoy</small>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Despachos Parciales</h6>
                    <h3 className="mb-0 text-warning">{dashboardData.despachosParciales}</h3>
                  </div>
                  <div className="text-warning">
                    <i className="fas fa-exclamation-circle fa-2x"></i>
                  </div>
                </div>
                <small className="text-muted">Este mes</small>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Cancelaciones</h6>
                    <h3 className="mb-0 text-danger">{dashboardData.despachosCancelados}</h3>
                  </div>
                  <div className="text-danger">
                    <i className="fas fa-times-circle fa-2x"></i>
                  </div>
                </div>
                <small className="text-muted">Este mes</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tablas de Información */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  Medicamentos con Stock Bajo
                </h6>
                <Link
                  to="/inventario-medicamentos?tab=stockBajo"
                  className="btn btn-outline-warning btn-sm"
                >
                  Ver todos
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Medicamento</th>
                      <th className="text-center">Stock</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.medicamentosStockBajoDetalle && dashboardData.medicamentosStockBajoDetalle.length > 0 ? (
                      dashboardData.medicamentosStockBajoDetalle.map((medicamento, index) => (
                        <tr key={medicamento.id_medicamento || index}>
                          <td>
                            <div>
                              <strong>{medicamento.nombre || 'N/A'}</strong>
                              {medicamento.concentracion && (
                                <div>
                                  <small className="text-muted">{medicamento.concentracion}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <div>
                              <span className="fw-bold">{medicamento.stock_actual || 0}</span>
                              <small className="text-muted">/{medicamento.stock_minimo || 0}</small>
                            </div>
                          </td>
                          <td className="text-center">
                            {getStockBadge(medicamento.stock_actual || 0, medicamento.stock_minimo || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          No hay medicamentos con stock bajo
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-clock text-danger me-2"></i>
                  Lotes Próximos a Vencer
                </h6>
                <Link
                  to="/inventario-medicamentos?tab=vencimiento"
                  className="btn btn-outline-danger btn-sm"
                >
                  Ver todos
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Medicamento</th>
                      <th>Lote</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-center">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.proximosVencimientos && dashboardData.proximosVencimientos.length > 0 ? (
                      dashboardData.proximosVencimientos.map((lote, index) => (
                        <tr key={lote.id_stock || index}>
                          <td>
                            <div>
                              <strong>{lote.nombre || 'N/A'}</strong>
                              {lote.concentracion && (
                                <div>
                                  <small className="text-muted">{lote.concentracion}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <code>{lote.numero_lote || 'N/A'}</code>
                          </td>
                          <td className="text-center">
                            <span className="fw-bold">{lote.cantidad_disponible || 0}</span>
                          </td>
                          <td className="text-center">
                            <small className="text-danger fw-bold">
                              {lote.fecha_caducidad ? formatDate(lote.fecha_caducidad) : 'N/A'}
                            </small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          No hay lotes próximos a vencer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-prescription-bottle-alt text-info me-2"></i>
                  Recetas Pendientes
                </h6>
                <Link
                  to="/despacho-medicamentos"
                  className="btn btn-outline-info btn-sm"
                >
                  Ver todas
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Paciente</th>
                      <th>Expediente</th>
                      <th>Médico</th>
                      <th className="text-center">Fecha</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ultimasRecetas && dashboardData.ultimasRecetas.length > 0 ? (
                      dashboardData.ultimasRecetas.map((receta, index) => (
                        <tr key={receta.id_receta || index}>
                          <td>
                            <strong>{receta.nombre_paciente || 'N/A'}</strong>
                          </td>
                          <td>
                            <Badge bg="info" text="dark">
                              {receta.n_expediente || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            <small>{receta.nombre_medico || 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            <small>{receta.fecha_receta ? formatDateTime(receta.fecha_receta) : 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            {getEstadoBadge(receta.estado_receta || 'pendiente')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          No hay recetas pendientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-history text-success me-2"></i>
                Últimos Despachos
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Paciente</th>
                      <th>Expediente</th>
                      <th className="text-center">Fecha</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ultimosDespachos && dashboardData.ultimosDespachos.length > 0 ? (
                      dashboardData.ultimosDespachos.map((despacho, index) => (
                        <tr key={despacho.id_despacho || index}>
                          <td>
                            <strong>{despacho.nombre_paciente || 'N/A'}</strong>
                          </td>
                          <td>
                            <Badge bg="info" text="dark">
                              {despacho.n_expediente || 'N/A'}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <small>{despacho.fecha_despacho ? formatDateTime(despacho.fecha_despacho) : 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            {getEstadoBadge(despacho.estado_despacho || 'pendiente')}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleVerDespacho(despacho.id_despacho)}
                              title="Ver detalle"
                            >
                              <i className="feather icon-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          <i className="fas fa-info-circle me-2"></i>
                          No hay despachos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para ver despacho */}
      {despachoSeleccionado && (
        <VerDespachoModal
          show={showVerDespachoModal}
          onHide={() => setShowVerDespachoModal(false)}
          despacho={despachoSeleccionado}
        />
      )}
    </div>
  );
};

const DespachadorMedicamentos_FarmaciaDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    recetasPendientes: 0,
    despachosHoy: 0,
    despachosParciales: 0,
    despachosCancelados: 0,
    ultimasRecetas: [],
    ultimosDespachos: [],
    loading: true,
    error: null
  });

  const [showVerDespachoModal, setShowVerDespachoModal] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Obtener recetas pendientes
        const recetasPendientesResponse = await despachoService.listarRecetasPendientes();
        const recetasPendientes = recetasPendientesResponse.data || [];

        // Obtener historial de despachos de hoy
        const today = new Date().toISOString().split('T')[0];
        const historialResponse = await despachoService.listarHistorialDespachos(1, 100, {
          fechaInicio: today,
          fechaFin: today
        });
        const despachosHoy = historialResponse.data || [];

        // Obtener últimos despachos (últimos 5)
        const ultimosDespachos = await despachoService.listarHistorialDespachos(1, 5);

        // Obtener despachos parciales del mes actual
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const despachosParciales = await despachoService.listarHistorialDespachos(1, 100, {
          estado: 'parcial',
          fechaInicio: firstDayOfMonth,
          fechaFin: today
        });

        // Obtener despachos cancelados del mes actual
        const despachosCancelados = await despachoService.listarHistorialDespachos(1, 100, {
          estado: 'cancelado',
          fechaInicio: firstDayOfMonth,
          fechaFin: today
        });

        setDashboardData({
          recetasPendientes: recetasPendientes.length,
          despachosHoy: despachosHoy.length,
          despachosParciales: (despachosParciales.data || []).length,
          despachosCancelados: (despachosCancelados.data || []).length,
          ultimasRecetas: recetasPendientes.slice(0, 5),
          ultimosDespachos: ultimosDespachos.data || [],
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Badge bg="info">Pendiente</Badge>;
      case 'despachada':
        return <Badge bg="success">Despachada</Badge>;
      case 'despachada_parcial':
        return <Badge bg="warning">Parcial</Badge>;
      case 'cancelada':
        return <Badge bg="danger">Cancelada</Badge>;
      case 'completo':
        return <Badge bg="success">Completo</Badge>;
      case 'parcial':
        return <Badge bg="warning">Parcial</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerDespacho = async (idDespacho) => {
    try {
      const response = await despachoService.obtenerDetalleDespacho(idDespacho);
      if (response.success) {
        setDespachoSeleccionado(response.data);
        setShowVerDespachoModal(true);
      } else {
        alert("Error al obtener los detalles del despacho");
      }
    } catch (err) {
      console.error("Error al obtener detalle de despacho:", err);
      alert("Error al obtener los detalles del despacho");
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <Alert variant="danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {dashboardData.error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Métricas de Despacho */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-shipping-fast text-info me-2"></i>
              Control de Despachos
            </h5>
            <Link to="/despacho-medicamentos" className="btn btn-outline-info btn-sm">
              <i className="fas fa-external-link-alt me-1"></i>
              Ver Despachos
            </Link>
          </div>

          <Row>
            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Recetas Pendientes</h6>
                    <h3 className="mb-0 text-info">{dashboardData.recetasPendientes}</h3>
                  </div>
                  <div className="text-info">
                    <i className="fas fa-prescription-bottle-alt fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Esperando despacho</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Despachos Hoy</h6>
                    <h3 className="mb-0 text-success">{dashboardData.despachosHoy}</h3>
                  </div>
                  <div className="text-success">
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Completados hoy</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Despachos Parciales</h6>
                    <h3 className="mb-0 text-warning">{dashboardData.despachosParciales}</h3>
                  </div>
                  <div className="text-warning">
                    <i className="fas fa-exclamation-circle fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Este mes</small>
                </div>
              </div>
            </Col>

            <Col xl={3} md={6} className="mb-3">
              <div className="p-3 border rounded bg-light h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                  <div>
                    <h6 className="text-muted mb-1">Cancelaciones</h6>
                    <h3 className="mb-0 text-danger">{dashboardData.despachosCancelados}</h3>
                  </div>
                  <div className="text-danger">
                    <i className="fas fa-times-circle fa-2x"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">Este mes</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tablas de Información */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-prescription-bottle-alt text-info me-2"></i>
                  Recetas Pendientes
                </h6>
                <Link
                  to="/despacho-medicamentos"
                  className="btn btn-outline-info btn-sm"
                >
                  Ver todas
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Paciente</th>
                      <th>Expediente</th>
                      <th>Médico</th>
                      <th className="text-center">Fecha</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ultimasRecetas && dashboardData.ultimasRecetas.length > 0 ? (
                      dashboardData.ultimasRecetas.map((receta, index) => (
                        <tr key={receta.id_receta || index}>
                          <td>
                            <strong>{receta.nombre_paciente || 'N/A'}</strong>
                          </td>
                          <td>
                            <Badge bg="info" text="dark">
                              {receta.n_expediente || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            <small>{receta.nombre_medico || 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            <small>{receta.fecha_receta ? formatDateTime(receta.fecha_receta) : 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            {getEstadoBadge(receta.estado_receta || 'pendiente')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          No hay recetas pendientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-history text-success me-2"></i>
                  Últimos Despachos
                </h6>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Paciente</th>
                      <th>Expediente</th>
                      <th className="text-center">Fecha</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ultimosDespachos && dashboardData.ultimosDespachos.length > 0 ? (
                      dashboardData.ultimosDespachos.map((despacho, index) => (
                        <tr key={despacho.id_despacho || index}>
                          <td>
                            <strong>{despacho.nombre_paciente || 'N/A'}</strong>
                          </td>
                          <td>
                            <Badge bg="info" text="dark">
                              {despacho.n_expediente || 'N/A'}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <small>{despacho.fecha_despacho ? formatDateTime(despacho.fecha_despacho) : 'N/A'}</small>
                          </td>
                          <td className="text-center">
                            {getEstadoBadge(despacho.estado_despacho || 'pendiente')}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleVerDespacho(despacho.id_despacho)}
                              title="Ver detalle"
                            >
                              <i className="feather icon-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          <i className="fas fa-info-circle me-2"></i>
                          No hay despachos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para ver despacho */}
      {despachoSeleccionado && (
        <VerDespachoModal
          show={showVerDespachoModal}
          onHide={() => setShowVerDespachoModal(false)}
          despacho={despachoSeleccionado}
        />
      )}
    </div>
  );
};

const DefaultDashboard = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '15%' }}>
      <h2 style={{ color: "#9a2921" }}>{time.toLocaleTimeString()}</h2>
      <h3 className='mt-3'>
        Bienvenido {user?.rol}: {user?.nombre} {user?.apellido}
      </h3>
    </div>
  );
};

const DashDefault = () => {
  const { user } = useAuth();

  // Renderizar dashboard específico según el rol
  if (user?.rol === 'Laboratorista') {
    return (
      <>
        <h3 className='mb-4'>Panel de Control - Laboratorio</h3>
        <LaboratoristasDashboard />
      </>
    );
  } else if (user?.rol === 'Jefe de Farmacia') {
    return (
      <div>
        {/* Header*/}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
          <div>
            <h2 className="mb-1 text-primary">
              <i className="fas fa-pills mr-2"></i>
              Panel de Control - Farmacia
            </h2>
            <p className="mb-0 text-muted">
              Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong> - {user?.rol}
            </p>
          </div>
          <div className="text-right">
            <small className="text-muted">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </small>
          </div>
        </div>

        <Jefe_FarmaciaDashboard />
      </div>
    );
  } else if (user?.rol === 'Despachador de Medicamentos') {
    return (
      <div>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
          <div>
            <h2 className="mb-1 text-primary">
              <i className="fas fa-pills mr-2"></i>
              Panel de Control - Farmacia
            </h2>
            <p className="mb-0 text-muted">
              Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong> - {user?.rol}
            </p>
          </div>
          <div className="text-right">
            <small className="text-muted">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </small>
          </div>
        </div>

        <DespachadorMedicamentos_FarmaciaDashboard />
      </div>
    );
  }
  else {
    return <DefaultDashboard />;
  }
};

export default DashDefault;