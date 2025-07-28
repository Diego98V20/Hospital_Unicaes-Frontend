import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge, Spinner, Form, InputGroup } from 'react-bootstrap';
import { inventarioMovimientosService } from '../../../services/inventarioMovimientosService';

// Estilos personalizados para el modal más ancho
const customStyles = `
  .modal-extra-wide .modal-xl {
    max-width: 95%;
  }
  
  @media (min-width: 1200px) {
    .modal-extra-wide .modal-xl {
      max-width: 1400px;
    }
  }
  
  .table-container {
    overflow-x: auto;
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
  
  .search-container {
    margin-bottom: 15px;
  }
  
  .text-overflow-ellipsis {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .info-section {
    margin-bottom: 24px;
  }
  
  .card-header-custom {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 12px 20px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
  }
  
  @media (max-width: 992px) {
    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .info-item {
    margin-bottom: 12px;
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
  
  .stats-container {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  
  .stat-box {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px 16px;
    min-width: 100px;
    text-align: center;
    flex: 1;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .stat-value.success {
    color: #28a745;
  }
  
  .stat-value.danger {
    color: #dc3545;
  }
  
  .stat-label {
    font-size: 13px;
    color: #6c757d;
  }
  
  .stock-alert {
    margin-top: 16px;
    padding: 10px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  
  .stock-alert.warning {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
  }
  
  .stock-alert.danger {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }
  
  .card-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
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
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0;
  }
`;

const VerMedicamentoModal = ({ show, onHide, medicamento, onAddLote, onEdit }) => {
  // Si no hay medicamento seleccionado, no mostramos el modal
  if (!medicamento) {
    return null;
  }
  
  // Agregar estilos personalizados al documento
  useEffect(() => {
    // Crear elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Estados para el historial de movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState(null);
  
  // Estados para paginación y búsqueda
  const [searchLotes, setSearchLotes] = useState('');
  const [searchMovimientos, setSearchMovimientos] = useState('');
  const [currentPageLotes, setCurrentPageLotes] = useState(1);
  const [currentPageMovimientos, setCurrentPageMovimientos] = useState(1);
  const [itemsPerPageLotes, setItemsPerPageLotes] = useState(5);
  const [itemsPerPageMovimientos, setItemsPerPageMovimientos] = useState(10);

  // Cargar historial de movimientos cuando se abre el modal
  useEffect(() => {
    if (show && medicamento && medicamento.id_medicamento) {
      cargarHistorialMovimientos();
    }
  }, [show, medicamento]);

  // Función para cargar el historial de movimientos
  const cargarHistorialMovimientos = async () => {
    setLoadingMovimientos(true);
    setErrorMovimientos(null);
    try {
      const response = await inventarioMovimientosService.obtenerMovimientosPorMedicamento(medicamento.id_medicamento);
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
  
  // Filtrar lotes
  const filteredLotes = medicamento.lotes ? medicamento.lotes.filter(lote => {
    return (
      String(lote.id_stock || '').toLowerCase().includes(searchLotes.toLowerCase()) ||
      String(lote.numero_lote || '').toLowerCase().includes(searchLotes.toLowerCase()) ||
      formatDate(lote.fecha_caducidad).toLowerCase().includes(searchLotes.toLowerCase())
    );
  }) : [];
  
  // Filtrar movimientos
  const filteredMovimientos = movimientos.filter(movimiento => {
    return (
      formatDateTime(movimiento.fecha_hora).toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.tipo || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.cantidad || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.numero_lote || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.usuario || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.origen_destino || '').toLowerCase().includes(searchMovimientos.toLowerCase())
    );
  });
  
  // Calcular índices para paginación de lotes
  const indexOfLastLote = currentPageLotes * itemsPerPageLotes;
  const indexOfFirstLote = indexOfLastLote - itemsPerPageLotes;
  const currentLotes = filteredLotes.slice(indexOfFirstLote, indexOfLastLote);
  
  // Calcular índices para paginación de movimientos
  const indexOfLastMovimiento = currentPageMovimientos * itemsPerPageMovimientos;
  const indexOfFirstMovimiento = indexOfLastMovimiento - itemsPerPageMovimientos;
  const currentMovimientos = filteredMovimientos.slice(indexOfFirstMovimiento, indexOfLastMovimiento);
  
  // Calcular total de páginas
  const totalPagesLotes = Math.ceil(filteredLotes.length / itemsPerPageLotes);
  const totalPagesMovimientos = Math.ceil(filteredMovimientos.length / itemsPerPageMovimientos);
  
  // Funciones para cambiar de página
  const paginate = (pageNumber, setPage) => setPage(pageNumber);
  
  // Calcular estadísticas de lotes
  const lotesActivos = filteredLotes.filter(lote => lote.estado === 'activo').length;
  const lotesPróximosVencer = filteredLotes.filter(lote => {
    const hoy = new Date();
    const fechaCaducidad = new Date(lote.fecha_caducidad);
    const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 90 && diasRestantes > 0;
  }).length;
  
  // Calcular estadísticas de movimientos
  const entradas = filteredMovimientos.filter(m => m.tipo === 'Entrada').length;
  const salidas = filteredMovimientos.filter(m => m.tipo === 'Salida').length;
  
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
    <Modal show={show} onHide={onHide} size="xl" className="modal-extra-wide">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="fas fa-pills me-2 text-primary"></i>
          Detalle de Medicamento
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Información General */}
        <div className="info-section">
          <Card>
            <Card.Header className="card-header-custom">
              <div className="card-section-header">
                <h6 className="section-title">
                  <i className="fas fa-info-circle"></i>
                  Información General
                </h6>
                <Badge bg={medicamento.estado === 'activo' ? 'success' : 'danger'} pill>
                  {medicamento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="info-grid">
                <div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-barcode me-2"></i>
                      Código
                    </div>
                    <div className="info-value">{medicamento.codigo}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-tag me-2"></i>
                      Categoría
                    </div>
                    <div className="info-value">{medicamento.nombre_categoria}</div>
                  </div>
                </div>
                <div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-prescription-bottle me-2"></i>
                      Nombre
                    </div>
                    <div className="info-value">{medicamento.nombre}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-box me-2"></i>
                      Presentación
                    </div>
                    <div className="info-value">{medicamento.nombre_presentacion}</div>
                  </div>
                </div>
                <div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-flask me-2"></i>
                      Concentración
                    </div>
                    <div className="info-value">{medicamento.concentracion}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-syringe me-2"></i>
                      Vía de Administración
                    </div>
                    <div className="info-value">{medicamento.via_administracion}</div>
                  </div>
                </div>
                <div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Ubicación
                    </div>
                    <div className="info-value">{medicamento.ubicacion_almacen || 'No especificada'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <i className="fas fa-prescription me-2"></i>
                       Requiere Receta Médica Controlada
                    </div>
                    <div className="info-value">
                      <Badge bg={medicamento.requiere_receta ? "info" : "secondary"} pill>
                        {medicamento.requiere_receta ? "Sí" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas de Stock */}
              <div className="stats-container" style={{padding: '0 20px 20px'}}>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-boxes me-2"></i>
                    {medicamento.stock_actual || 0}
                  </div>
                  <div className="stat-label">Stock Actual</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-exclamation me-2"></i>
                    {medicamento.stock_minimo}
                  </div>
                  <div className="stat-label">Stock Mínimo</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    <i className="fas fa-weight me-2"></i>
                    {medicamento.unidad_medida}
                  </div>
                  <div className="stat-label">Unidad de Medida</div>
                </div>
              </div>
              
              {/* Alerta de Stock */}
              {medicamento.stock_actual < medicamento.stock_minimo && (
                <div className="stock-alert danger" style={{margin: '0 20px 20px'}}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Stock crítico: Por debajo del mínimo requerido
                </div>
              )}
              {medicamento.stock_actual >= medicamento.stock_minimo && medicamento.stock_actual < medicamento.stock_minimo * 1.5 && (
                <div className="stock-alert warning" style={{margin: '0 20px 20px'}}>
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Precaución: Stock bajo
                </div>
              )}
              
              {medicamento.descripcion && (
                <div className="info-item" style={{padding: '0 20px 20px'}}>
                  <div className="info-label">
                    <i className="fas fa-file-text me-2"></i>
                    Descripción
                  </div>
                  <div className="info-value">{medicamento.descripcion}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Lotes Disponibles */}
        <div className="info-section">
          <Card>
            <Card.Header className="card-header-custom">
              <div className="card-section-header">
                <div>
                  <h6 className="section-title">
                    <i className="fas fa-layer-group"></i>
                    Lotes Disponibles
                  </h6>
                  <div className="stats-container">
                    <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                      <div className="stat-value success">{lotesActivos}</div>
                      <div className="stat-label">Lotes Activos</div>
                    </div>
                    <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                      <div className="stat-value danger">{lotesPróximosVencer}</div>
                      <div className="stat-label">Próximos a Vencer</div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={onAddLote}>
                  <i className="fas fa-plus-circle me-1"></i> Nuevo Lote
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {medicamento.lotes && medicamento.lotes.length > 0 ? (
                <>
                  <div className="search-container">
                    <InputGroup size="sm">
                      <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Buscar lotes..."
                        value={searchLotes}
                        onChange={(e) => {
                          setSearchLotes(e.target.value);
                          setCurrentPageLotes(1);
                        }}
                      />
                    </InputGroup>
                  </div>
                  
                  <div className="table-container">
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>ID Stock</th>
                          <th>Número de Lote</th>
                          <th>Fecha de Caducidad</th>
                          <th>Cantidad Disponible</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentLotes.map(lote => {
                          // Determinar estado del lote
                          let badgeVariant = "success";
                          let estadoText = "Activo";
                          let icon = "fas fa-check-circle";

                          if (lote.estado === 'agotado') {
                            badgeVariant = "secondary";
                            estadoText = "Agotado";
                            icon = "fas fa-ban";
                          } else if (lote.estado === 'vencido') {
                            badgeVariant = "danger";
                            estadoText = "Vencido";
                            icon = "fas fa-times-circle";
                          } else {
                            // Calcular si está próximo a vencer
                            const hoy = new Date();
                            const fechaCaducidad = new Date(lote.fecha_caducidad);
                            const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));

                            if (diasRestantes <= 90 && diasRestantes > 0) {
                              badgeVariant = "warning";
                              estadoText = "Próximo a vencer";
                              icon = "fas fa-exclamation-triangle";
                            }
                          }

                          return (
                            <tr key={lote.id_stock}>
                              <td>{lote.id_stock}</td>
                              <td>{lote.numero_lote}</td>
                              <td>{formatDate(lote.fecha_caducidad)}</td>
                              <td>
                                <strong>{lote.cantidad_disponible}</strong>
                              </td>
                              <td>
                                <Badge bg={badgeVariant} pill>
                                  <i className={`${icon} me-1`}></i>
                                  {estadoText}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                        {currentLotes.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center">No se encontraron lotes con el criterio de búsqueda</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  
                  {renderPagination(
                    currentPageLotes,
                    totalPagesLotes,
                    paginate,
                    setCurrentPageLotes,
                    itemsPerPageLotes,
                    setItemsPerPageLotes,
                    filteredLotes.length,
                    indexOfFirstLote,
                    indexOfLastLote
                  )}
                </>
              ) : (
                <div className="alert alert-info d-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i>
                  No hay lotes disponibles para este medicamento
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Historial de Movimientos */}
        <div className="info-section">
          <Card>
            <Card.Header className="card-header-custom">
              <div className="card-section-header">
                <div>
                  <h6 className="section-title">
                    <i className="fas fa-history"></i>
                    Historial de Movimientos
                  </h6>
                  <div className="stats-container">
                    <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                      <div className="stat-value success">
                        <i className="fas fa-arrow-down me-1"></i>
                        {entradas}
                      </div>
                      <div className="stat-label">Entradas</div>
                    </div>
                    <div className="stat-box" style={{padding: '8px 12px', minWidth: 'auto'}}>
                      <div className="stat-value danger">
                        <i className="fas fa-arrow-up me-1"></i>
                        {salidas}
                      </div>
                      <div className="stat-label">Salidas</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingMovimientos ? (
                <div className="text-center p-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 mb-0">Cargando historial de movimientos...</p>
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
                      
                      <div className="table-container">
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Fecha y Hora</th>
                              <th>Tipo</th>
                              <th>Cantidad</th>
                              <th>Lote</th>
                              <th>Usuario</th>
                              <th>Origen/Destino</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMovimientos.map((movimiento, index) => (
                              <tr key={index}>
                                <td>{formatDateTime(movimiento.fecha_hora)}</td>
                                <td>
                                  <span className={`movement-type-badge ${movimiento.tipo === 'Entrada' ? 'movement-entry' : 'movement-exit'}`}>
                                    <i className={`fas ${movimiento.tipo === 'Entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                    {movimiento.tipo}
                                  </span>
                                </td>
                                <td>
                                  <strong>{movimiento.cantidad}</strong>
                                </td>
                                <td>{movimiento.numero_lote}</td>
                                <td>
                                  <i className="fas fa-user me-1"></i>
                                  {movimiento.usuario}
                                </td>
                                <td className="text-overflow-ellipsis" title={movimiento.origen_destino}>
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {movimiento.origen_destino}
                                </td>
                              </tr>
                            ))}
                            {currentMovimientos.length === 0 && (
                              <tr>
                                <td colSpan="6" className="text-center">No se encontraron movimientos con el criterio de búsqueda</td>
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
                      No hay movimientos registrados para este medicamento
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Cerrar
        </Button>
        <Button variant="primary" onClick={onEdit}>
          <i className="fas fa-edit me-2"></i>
          Editar Medicamento
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerMedicamentoModal;