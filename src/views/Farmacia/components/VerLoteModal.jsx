import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge, Spinner, ProgressBar, Form, InputGroup } from 'react-bootstrap';
import { inventarioMovimientosService } from '../../../services/inventarioMovimientosService';

// Estilos personalizados
const customStyles = `
  .search-container {
    margin-bottom: 15px;
  }
  
  .pagination-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }
  
  .pagination-info {
    color: #6c757d;
  }
  
  .info-item {
    margin-bottom: 16px;
  }
  
  .info-label {
    display: flex;
    align-items: center;
    color: #6c757d;
    font-size: 13px;
    margin-bottom: 4px;
    font-weight: 500;
  }
  
  .info-value {
    font-weight: 600;
    color: #495057;
  }
  
  .stat-box {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px 16px;
    min-width: 100px;
    text-align: center;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 13px;
    color: #6c757d;
  }
  
  .movement-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .movement-entry {
    background-color: #d4edda;
    color: #155724;
  }
  
  .movement-exit {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .table th {
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    color: #6c757d;
    border-bottom: 2px solid #dee2e6;
  }
  
  .table td {
    vertical-align: middle;
    font-size: 14px;
  }
  
  .card-header-custom {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 12px 20px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0;
  }
  
  .stats-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  
  .progress-container {
    position: relative;
  }
  
  .progress-percentage {
    position: absolute;
    width: 100%;
    text-align: center;
    line-height: 25px;
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  }
`;

const VerLoteModal = ({ show, onHide, lote, onDescartar }) => {
  // Si no hay lote seleccionado, no mostramos el modal
  if (!lote) {
    return null;
  }

  // Estados para el historial de movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState(null);
  
  // Estados para búsqueda y paginación
  const [searchMovimientos, setSearchMovimientos] = useState('');
  const [currentPageMovimientos, setCurrentPageMovimientos] = useState(1);
  const [itemsPerPageMovimientos, setItemsPerPageMovimientos] = useState(10);

  // Agregar estilos personalizados al documento
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Cargar historial de movimientos cuando se abre el modal
  useEffect(() => {
    if (show && lote && lote.id_stock) {
      cargarHistorialMovimientos();
    }
  }, [show, lote]);

  // Función para cargar el historial de movimientos
  const cargarHistorialMovimientos = async () => {
    setLoadingMovimientos(true);
    setErrorMovimientos(null);
    try {
      const response = await inventarioMovimientosService.obtenerMovimientosPorLote(lote.id_stock);
      setMovimientos(response.data || []);
    } catch (error) {
      console.error("Error al cargar historial de movimientos:", error);
      setErrorMovimientos("No se pudo cargar el historial de movimientos");
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  // Calcular porcentaje de consumo
  const calcularPorcentajeConsumo = (cantidadInicial, cantidadDisponible) => {
    if (cantidadInicial === 0) return 0;
    return Math.round(((cantidadInicial - cantidadDisponible) / cantidadInicial) * 100);
  };

  // Determinar si el lote está vencido o próximo a vencer
  const fechaCaducidad = new Date(lote.fecha_caducidad);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));

  let estadoLote = lote.estado;
  let badgeVariant = "success";
  let estadoTexto = "Activo";
  let estadoIcon = "fa-check-circle";

  if (estadoLote === 'agotado') {
    badgeVariant = "secondary";
    estadoTexto = "Agotado";
    estadoIcon = "fa-ban";
  } else if (estadoLote === 'vencido' || diasRestantes <= 0) {
    badgeVariant = "danger";
    estadoTexto = "Vencido";
    estadoIcon = "fa-times-circle";
  } else if (diasRestantes <= 90) {
    badgeVariant = "warning";
    estadoTexto = "Próximo a vencer";
    estadoIcon = "fa-exclamation-triangle";
  }

  // Texto para la fecha de caducidad según estado
  const getFechaCaducidadTexto = () => {
    if (estadoLote === 'agotado') {
      return formatDate(lote.fecha_caducidad);
    } else if (diasRestantes <= 0) {
      return `${formatDate(lote.fecha_caducidad)} (Lote vencido)`;
    } else if (diasRestantes <= 90) {
      return `${formatDate(lote.fecha_caducidad)} (${diasRestantes} días restantes)`;
    } else {
      return formatDate(lote.fecha_caducidad);
    }
  };

  // Filtrar movimientos
  const filteredMovimientos = movimientos.filter(movimiento => {
    return (
      formatDateTime(movimiento.fecha_hora).toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.tipo || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.cantidad || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.usuario || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.origen_destino || '').toLowerCase().includes(searchMovimientos.toLowerCase())
    );
  });

  // Calcular índices para paginación
  const indexOfLastMovimiento = currentPageMovimientos * itemsPerPageMovimientos;
  const indexOfFirstMovimiento = indexOfLastMovimiento - itemsPerPageMovimientos;
  const currentMovimientos = filteredMovimientos.slice(indexOfFirstMovimiento, indexOfLastMovimiento);
  
  // Calcular total de páginas
  const totalPagesMovimientos = Math.ceil(filteredMovimientos.length / itemsPerPageMovimientos);
  
  // Calcular estadísticas de movimientos
  const entradas = movimientos.filter(m => m.tipo === 'Entrada').length;
  const salidas = movimientos.filter(m => m.tipo === 'Salida').length;
  const totalEntradas = movimientos.filter(m => m.tipo === 'Entrada').reduce((sum, m) => sum + m.cantidad, 0);
  const totalSalidas = movimientos.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);
  
  // Funciones para cambiar de página
  const paginate = (pageNumber, setPage) => setPage(pageNumber);
  
  // Renderizar paginación
  const renderPagination = (currentPage, totalPages, paginate, setPage, itemsPerPage, setItemsPerPage, totalItems, firstIndex, lastIndex) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination-custom">
        <div className="pagination-info">
          Mostrando {totalItems === 0 ? 0 : Math.min(firstIndex + 1, totalItems)} - {Math.min(lastIndex, totalItems)} de {totalItems} registros
        </div>
        
        <div className="d-flex align-items-center">
          <div className="me-3">
            <Form.Select 
              size="sm" 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
            </Form.Select>
          </div>
          
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(1, setPage)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage - 1, setPage)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
            </li>
            
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button
                  onClick={() => paginate(number, setPage)}
                  className="page-link"
                >
                  {number}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage + 1, setPage)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &gt;
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(totalPages, setPage)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="fas fa-layer-group me-2 text-primary"></i>
          Detalle de Lote
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información Principal */}
        <Card className="mb-4">
          <Card.Header className="card-header-custom">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="section-title">
                <i className="fas fa-info-circle"></i>
                Información del Lote
              </h6>
              <Badge bg={badgeVariant} pill>
                <i className={`fas ${estadoIcon} me-1`}></i>
                {estadoTexto}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-hashtag me-2"></i>
                    ID Stock
                  </div>
                  <div className="info-value">{lote.id_stock}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-barcode me-2"></i>
                    Número de Lote
                  </div>
                  <div className="info-value">{lote.numero_lote}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-clock me-2"></i>
                    Fecha de Ingreso
                  </div>
                  <div className="info-value">{formatDateTime(lote.fecha_ingreso)}</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Información del Medicamento */}
        <Card className="mb-4">
          <Card.Header className="card-header-custom">
            <h6 className="section-title">
              <i className="fas fa-prescription-bottle"></i>
              Información del Medicamento
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-pills me-2"></i>
                    Medicamento
                  </div>
                  <div className="info-value">{lote.nombre}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-code me-2"></i>
                    Código
                  </div>
                  <div className="info-value">{lote.codigo}</div>
                </div>
              </Col>
              {lote.concentracion && (
                <Col md={4}>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-flask me-2"></i>
                      Concentración
                    </div>
                    <div className="info-value">{lote.concentracion}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Fechas */}
        <Card className="mb-4">
          <Card.Header className="card-header-custom">
            <h6 className="section-title">
              <i className="fas fa-calendar"></i>
              Fechas
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Fecha de Fabricación
                  </div>
                  <div className="info-value">{formatDate(lote.fecha_fabricacion)}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-calendar-times me-2"></i>
                    Fecha de Caducidad
                  </div>
                  <div className={`info-value ${(diasRestantes <= 90 && estadoLote !== 'agotado') ? "text-danger" : ""}`}>
                    {getFechaCaducidadTexto()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Estadísticas de Inventario */}
        <Card className="mb-4">
          <Card.Header className="card-header-custom">
            <h6 className="section-title">
              <i className="fas fa-chart-bar"></i>
              Estadísticas de Inventario
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-plus-circle me-2"></i>
                    {lote.cantidad_inicial || 0}
                  </div>
                  <div className="stat-label">Cantidad Inicial</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-box">
                  <div className="stat-value" style={{color: lote.cantidad_disponible === 0 ? '#dc3545' : '#495057'}}>
                    <i className="fas fa-boxes me-2"></i>
                    {lote.cantidad_disponible || 0}
                  </div>
                  <div className="stat-label">Cantidad Disponible</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-minus-circle me-2"></i>
                    {(lote.cantidad_inicial || 0) - (lote.cantidad_disponible || 0)}
                  </div>
                  <div className="stat-label">Cantidad Consumida</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-percentage me-2"></i>
                    {calcularPorcentajeConsumo(lote.cantidad_inicial, lote.cantidad_disponible)}%
                  </div>
                  <div className="stat-label">Porcentaje Consumido</div>
                </div>
              </Col>
            </Row>

            {/* Barra de progreso del consumo */}
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="info-label">
                  <i className="fas fa-chart-line me-2"></i>
                  Consumo del lote
                </div>
                <span className="badge bg-light text-dark">
                  {calcularPorcentajeConsumo(lote.cantidad_inicial, lote.cantidad_disponible)}%
                </span>
              </div>
              <div className="progress-container">
                <ProgressBar 
                  now={calcularPorcentajeConsumo(lote.cantidad_inicial, lote.cantidad_disponible)}
                  variant={lote.cantidad_disponible === 0 ? "danger" : 
                           calcularPorcentajeConsumo(lote.cantidad_inicial, lote.cantidad_disponible) >= 90 ? "warning" : 
                           "success"}
                  style={{ height: '25px' }}
                />
              </div>
              <small className="text-muted mt-1 d-block">
                {lote.cantidad_inicial - lote.cantidad_disponible} de {lote.cantidad_inicial} unidades consumidas
              </small>
            </div>
          </Card.Body>
        </Card>

        {/* Historial de Movimientos */}
        <Card>
          <Card.Header className="card-header-custom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="section-title">
                  <i className="fas fa-history"></i>
                  Historial de Movimientos
                </h6>
                <div className="stats-container">
                  <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                    <div className="stat-value" style={{fontSize: '16px', color: '#28a745'}}>
                      <i className="fas fa-arrow-down me-1"></i>
                      {entradas}
                    </div>
                    <div className="stat-label">Entradas</div>
                  </div>
                  <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                    <div className="stat-value" style={{fontSize: '16px', color: '#dc3545'}}>
                      <i className="fas fa-arrow-up me-1"></i>
                      {salidas}
                    </div>
                    <div className="stat-label">Salidas</div>
                  </div>
                  <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                    <div className="stat-value" style={{fontSize: '16px', color: '#495057'}}>
                      <i className="fas fa-calculator me-1"></i>
                      {movimientos.length}
                    </div>
                    <div className="stat-label">Total Movimientos</div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {loadingMovimientos ? (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0 text-muted">Cargando historial de movimientos...</p>
              </div>
            ) : errorMovimientos ? (
              <div className="alert alert-danger d-flex align-items-center">
                <i className="fas fa-exclamation-circle me-2"></i>
                {errorMovimientos}
              </div>
            ) : (
              <>
                {movimientos.length > 0 ? (
                  <>
                    <div className="search-container">
                      <InputGroup size="sm">
                        <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Buscar movimientos..."
                          value={searchMovimientos}
                          onChange={(e) => {
                            setSearchMovimientos(e.target.value);
                            setCurrentPageMovimientos(1);
                          }}
                        />
                      </InputGroup>
                    </div>
                    
                    <div className="table-responsive">
                      <Table hover>
                        <thead className="table-light">
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th className="text-end">Cantidad</th>
                            <th>Usuario</th>
                            <th>Origen/Destino</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMovimientos.length > 0 ? (
                            currentMovimientos.map((movimiento, index) => (
                              <tr key={index}>
                                <td>{formatDateTime(movimiento.fecha_hora)}</td>
                                <td>
                                  <span className={`movement-type-badge ${movimiento.tipo === 'Entrada' ? 'movement-entry' : 'movement-exit'}`}>
                                    <i className={`fas ${movimiento.tipo === 'Entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                    {movimiento.tipo}
                                  </span>
                                </td>
                                <td className="text-end">{movimiento.cantidad}</td>
                                <td>
                                  <i className="fas fa-user me-1"></i>
                                  {movimiento.usuario}
                                </td>
                                <td>
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {movimiento.origen_destino}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center text-muted py-4">
                                No se encontraron movimientos con el criterio de búsqueda
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      currentPageMovimientos,
                      totalPagesMovimientos,
                      paginate,
                      setCurrentPageMovimientos,
                      itemsPerPageMovimientos,
                      setItemsPerPageMovimientos,
                      filteredMovimientos.length,
                      indexOfFirstMovimiento,
                      indexOfLastMovimiento
                    )}
                  </>
                ) : (
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="fas fa-info-circle me-2"></i>
                    No hay movimientos registrados para este lote
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Cerrar
        </Button>
        {estadoLote === 'activo' && (
          <>
            {diasRestantes <= 0 && (
              <Button
                variant="danger"
                onClick={() => onDescartar(lote.id_stock, 'vencido')}
              >
                <i className="fas fa-exclamation-triangle me-2"></i>
                Marcar como Vencido
              </Button>
            )}
            {lote.cantidad_disponible === 0 && (
              <Button
                variant="warning"
                onClick={() => onDescartar(lote.id_stock, 'agotado')}
              >
                <i className="fas fa-ban me-2"></i>
                Marcar como Agotado
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default VerLoteModal;