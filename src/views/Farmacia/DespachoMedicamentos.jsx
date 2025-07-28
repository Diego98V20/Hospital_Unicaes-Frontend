import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tab, Nav, Button, Table, Badge, Alert, InputGroup, FormControl, Form } from 'react-bootstrap';
import MainCard from '../../components/Card/MainCard';
import { despachoService } from '../../services/despachoService';
import { notificacionesService } from '../../services/notificacionesService';
import DespachoModal from './components/DespachoModal';
import VerDespachoModal from './components/VerDespachoModal';

const DespachoMedicamentos = () => {
    // Estados
    const [recetasPendientes, setRecetasPendientes] = useState([]);
    const [historialDespachos, setHistorialDespachos] = useState([]);
    const [activeTab, setActiveTab] = useState('recetas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDespachoModal, setShowDespachoModal] = useState(false);
    const [showVerDespachoModal, setShowVerDespachoModal] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [vistaRecetas, setVistaRecetas] = useState('cards'); // 'cards' o 'tabla'

    // Estados para paginación del historial
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchHistorial, setSearchHistorial] = useState('');

    // Estado para filtros
    const [filtros, setFiltros] = useState({
        estado: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Cargar historial cuando cambia el tab
    useEffect(() => {
        if (activeTab === 'historial') {
            cargarHistorial();
        }
    }, [activeTab]);

    // Recargar historial cuando cambian los filtros
    useEffect(() => {
        if (activeTab === 'historial') {
            // Resetear a la primera página cuando cambian los filtros
            setCurrentPage(1);
            cargarHistorial();
        }
    }, [filtros]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar recetas pendientes
            const recetasResponse = await despachoService.listarRecetasPendientes();
            if (recetasResponse.success) {
                setRecetasPendientes(recetasResponse.data);
            }

            // Obtener notificaciones
            const notificacionesResponse = await notificacionesService.obtenerNotificaciones();
            if (notificacionesResponse.success) {
                // Aquí manejar las notificaciones si es necesario
            }

        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("Error al cargar los datos. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            // Cargar todos los registros para hacer paginación local
            const response = await despachoService.listarHistorialDespachos(1, 1000, filtros);
            if (response.success) {
                setHistorialDespachos(response.data);
            }
        } catch (err) {
            console.error("Error al cargar historial:", err);
            setError("Error al cargar el historial de despachos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDespachar = (receta) => {
        setRecetaSeleccionada(receta);
        setShowDespachoModal(true);
    };

    const handleVerDespacho = async (idDespacho) => {
        try {
            const response = await despachoService.obtenerDetalleDespacho(idDespacho);
            if (response.success) {
                setDespachoSeleccionado(response.data);
                setShowVerDespachoModal(true);
            }
        } catch (err) {
            console.error("Error al obtener detalle de despacho:", err);
            alert("Error al obtener los detalles del despacho");
        }
    };

    const handleDespachoCompletado = () => {
        setShowDespachoModal(false);
        cargarDatos();
        if (activeTab === 'historial') {
            cargarHistorial();
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            estado: '',
            fechaInicio: '',
            fechaFin: ''
        });
        setSearchHistorial('');
        setCurrentPage(1);
    };

    const filteredRecetas = recetasPendientes.filter(receta =>
        receta.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receta.nombre_medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receta.id_receta.toString().includes(searchTerm) ||
        (receta.n_expediente && receta.n_expediente.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Función para calcular tiempo transcurrido
    const calcularTiempoTranscurrido = (fechaReceta) => {
        const ahora = new Date();
        const fecha = new Date(fechaReceta);
        const diferencia = ahora - fecha;
        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const dias = Math.floor(horas / 24);
        
        if (dias > 0) {
            return `${dias} día${dias > 1 ? 's' : ''}`;
        } else if (horas > 0) {
            return `${horas} hora${horas > 1 ? 's' : ''}`;
        } else {
            const minutos = Math.floor(diferencia / (1000 * 60));
            return `${minutos} min`;
        }
    };

    // Función para obtener el color de prioridad basado en el tiempo
    const obtenerPrioridad = (fechaReceta) => {
        const ahora = new Date();
        const fecha = new Date(fechaReceta);
        const horas = Math.floor((ahora - fecha) / (1000 * 60 * 60));
        
        if (horas >= 24) return { color: 'danger', texto: 'Urgente', icon: 'fas fa-exclamation-triangle' };
        if (horas >= 12) return { color: 'warning', texto: 'Prioridad Alta', icon: 'fas fa-clock' };
        if (horas >= 6) return { color: 'info', texto: 'Prioridad Media', icon: 'fas fa-hourglass-half' };
        return { color: 'success', texto: 'Reciente', icon: 'fas fa-check-circle' };
    };

    // Vista en tarjetas mejorada
    const renderVistaCards = () => (
        <Row>
            {filteredRecetas.length > 0 ? (
                filteredRecetas.map((receta) => {
                    const prioridad = obtenerPrioridad(receta.fecha_receta);
                    const tiempoTranscurrido = calcularTiempoTranscurrido(receta.fecha_receta);
                    
                    return (
                        <Col xl={4} lg={6} md={6} key={receta.id_receta} className="mb-4">
                            <Card className={`h-100 shadow-sm border-0 border-start border-4 border-${prioridad.color}`} 
                                  style={{ transition: 'all 0.3s ease' }}>
                                <Card.Header className="bg-transparent border-0 pb-0">
                                    <Row className="align-items-start">
                                        <Col>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                <Badge bg={prioridad.color} className="d-flex align-items-center gap-1">
                                                    <i className={prioridad.icon}></i>
                                                    {prioridad.texto}
                                                </Badge>
                                                <Badge bg="secondary" variant="outline">
                                                    <i className="fas fa-file-medical me-1"></i>
                                                    #{receta.id_receta}
                                                </Badge>
                                            </div>
                                        </Col>
                                        <Col xs="auto">
                                            <div className="text-end">
                                                <small className="text-muted d-block">
                                                    <i className="fas fa-clock me-1"></i>
                                                    Hace {tiempoTranscurrido}
                                                </small>                                             
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Header>
                                
                                <Card.Body className="pt-0">
                                    <div className="mb-3">
                                        <h5 className="card-title mb-3 text-primary fw-bold">
                                            <i className="fas fa-user me-2"></i>
                                            {receta.nombre_paciente}
                                        </h5>
                                        
                                        <div className="info-grid">
                                            <div className="info-item mb-2 p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-wrapper me-2" style={{ 
                                                        width: '32px', 
                                                        height: '32px', 
                                                        backgroundColor: '#e3f2fd',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <i className="fas fa-id-card text-primary"></i>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="text-muted d-block">Expediente</small>
                                                        <strong className="text-dark">
                                                            {receta.n_expediente || 'No asignado'}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="info-item mb-2 p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-wrapper me-2" style={{ 
                                                        width: '32px', 
                                                        height: '32px', 
                                                        backgroundColor: '#e8f5e8',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <i className="fas fa-user-md text-success"></i>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="text-muted d-block">Médico</small>
                                                        <strong className="text-dark">{receta.nombre_medico}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="info-item mb-3 p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                <div className="d-flex align-items-center">
                                                    <div className="icon-wrapper me-2" style={{ 
                                                        width: '32px', 
                                                        height: '32px', 
                                                        backgroundColor: '#fff3e0',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <i className="fas fa-stethoscope text-warning"></i>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="text-muted d-block">Especialidad</small>
                                                        <strong className="text-dark">
                                                            {receta.especialidad || 'Medicina General'}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <small className="text-muted">
                                                <i className="fas fa-calendar-alt me-1"></i>
                                                {new Date(receta.fecha_receta).toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                <br />
                                                <i className="fas fa-clock me-1"></i>
                                                {new Date(receta.fecha_receta).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </small>
                                        </div>
                                    </div>
                                </Card.Body>
                                
                                <Card.Footer className="bg-transparent border-0 pt-0">
                                    <Button
                                        variant="primary"
                                        className="w-100 py-2 fw-bold"
                                        onClick={() => handleDespachar(receta)}
                                        style={{
                                            background: 'linear-gradient(45deg, #007bff, #0056b3)',
                                            border: 'none',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <i className="fas fa-pills me-2"></i> 
                                        Procesar Despacho
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })
            ) : (
                <Col>
                    <div className="text-center py-5">
                        <div className="empty-state">
                            <div className="mb-4">
                                <i className="fas fa-prescription-bottle-alt fa-4x text-muted"></i>
                            </div>
                            <h4 className="text-muted mb-2">
                                {searchTerm ? 'Sin resultados' : 'No hay recetas pendientes'}
                            </h4>
                            <p className="text-muted">
                                {searchTerm ? 
                                    'No se encontraron recetas que coincidan con su búsqueda' : 
                                    'Todas las recetas han sido procesadas'
                                }
                            </p>
                            {searchTerm && (
                                <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                                    <i className="fas fa-times me-1"></i> Limpiar búsqueda
                                </Button>
                            )}
                        </div>
                    </div>
                </Col>
            )}
        </Row>
    );

    // Vista en tabla
    const renderVistaTabla = () => (
        <div className="table-responsive">
            <Table hover className="table-modern">
                <thead className="table-dark">
                    <tr>
                        <th>Prioridad</th>
                        <th>Receta</th>
                        <th>Paciente</th>
                        <th>Expediente</th>
                        <th>Médico</th>
                        <th>Especialidad</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRecetas.length > 0 ? (
                        filteredRecetas.map((receta) => {
                            const prioridad = obtenerPrioridad(receta.fecha_receta);
                            const tiempoTranscurrido = calcularTiempoTranscurrido(receta.fecha_receta);
                            
                            return (
                                <tr key={receta.id_receta} className="align-middle">
                                    <td>
                                        <Badge bg={prioridad.color} className="d-flex align-items-center gap-1 w-auto">
                                            <i className={prioridad.icon}></i>
                                            <span className="d-none d-md-inline">{prioridad.texto}</span>
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg="secondary" className="fs-6">
                                            #{receta.id_receta}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div>
                                            <strong className="text-primary">{receta.nombre_paciente}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="info" text="dark">
                                            {receta.n_expediente || 'N/A'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <small>{receta.nombre_medico}</small>
                                    </td>
                                    <td>
                                        <small>{receta.especialidad || 'N/A'}</small>
                                    </td>
                                    <td>
                                        <div>
                                            <small className="d-block">
                                                {new Date(receta.fecha_receta).toLocaleDateString('es-ES')}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-clock me-1"></i>
                                                {new Date(receta.fecha_receta).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </small>
                                            <br />
                                            <small className="text-muted">
                                                <i className="fas fa-hourglass-half me-1"></i>
                                                Hace {tiempoTranscurrido}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleDespachar(receta)}
                                            className="btn-sm"
                                        >
                                            <i className="fas fa-pills me-1"></i>
                                            <span className="d-none d-lg-inline">Despachar</span>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-4">
                                <div className="text-muted">
                                    <i className="fas fa-search fa-2x mb-2"></i>
                                    <br />
                                    {searchTerm ? 
                                        'No se encontraron recetas que coincidan con su búsqueda' : 
                                        'No hay recetas pendientes para despachar'
                                    }
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    // Filtrar historial con buscador
    const filteredHistorial = historialDespachos.filter(despacho => {
        const matchesSearch = (
            String(despacho.id_despacho || '').toLowerCase().includes(searchHistorial.toLowerCase()) ||
            String(despacho.id_receta || '').toLowerCase().includes(searchHistorial.toLowerCase()) ||
            String(despacho.nombre_paciente || '').toLowerCase().includes(searchHistorial.toLowerCase()) ||
            String(despacho.nombre_despachador || '').toLowerCase().includes(searchHistorial.toLowerCase()) ||
            String(despacho.medicamentos || '').toLowerCase().includes(searchHistorial.toLowerCase()) ||
            String(despacho.n_expediente || '').toLowerCase().includes(searchHistorial.toLowerCase())
        );
        return matchesSearch;
    });

    // Cálculos para paginación del historial
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistorial = filteredHistorial.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistorial.length / itemsPerPage);

    // Función para cambiar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Renderizar paginación
    const renderPagination = () => {
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
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                    Mostrando {filteredHistorial.length === 0 ? 0 : Math.min(indexOfFirstItem + 1, filteredHistorial.length)} - {Math.min(indexOfLastItem, filteredHistorial.length)} de {filteredHistorial.length} registros
                </div>
                
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        <Form.Select 
                            size="sm" 
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
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
                                onClick={() => paginate(1)}
                                className="page-link"
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                className="page-link"
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                        </li>
                        
                        {pageNumbers.map(number => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <button
                                    onClick={() => paginate(number)}
                                    className="page-link"
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                className="page-link"
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                &gt;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                            <button
                                onClick={() => paginate(totalPages)}
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

    const getBadgeVariant = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'completo':
                return 'success';
            case 'parcial':
                return 'warning';
            case 'cancelado':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    if (loading && historialDespachos.length === 0 && recetasPendientes.length === 0) {
        return (
            <MainCard title="Despacho de Medicamentos">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <div className="mt-3">
                        <h5 className="text-muted">Cargando información...</h5>
                    </div>
                </div>
            </MainCard>
        );
    }

    if (error && historialDespachos.length === 0 && recetasPendientes.length === 0) {
        return (
            <MainCard title="Despacho de Medicamentos">
                <Alert variant="danger" className="text-center">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Error al cargar datos</h4>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={cargarDatos}>
                        <i className="fas fa-redo me-1"></i> Reintentar
                    </Button>
                </Alert>
            </MainCard>
        );
    }

    return (
        <MainCard title="Despacho de Medicamentos">
            <style>{`
                .table-modern th {
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                
                .info-grid .info-item {
                    transition: all 0.2s ease;
                }
                
                .info-grid .info-item:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                }
                
                .empty-state {
                    max-width: 400px;
                    margin: 0 auto;
                }
                
                .pulse {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                
                .bg-gradient-primary {
                    background: linear-gradient(45deg, #007bff, #0056b3);
                }
            `}</style>
            
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="pills" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="recetas" className="d-flex align-items-center">
                            <i className="fas fa-clipboard-list me-2"></i> 
                            Recetas Pendientes
                            {recetasPendientes.length > 0 && (
                                <Badge bg="danger" className="ms-2 pulse">{recetasPendientes.length}</Badge>
                            )}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="historial" className="d-flex align-items-center">
                            <i className="fas fa-history me-2"></i> 
                            Historial de Despachos
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Tab de Recetas Pendientes - MEJORADO */}
                    <Tab.Pane eventKey="recetas">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                {/* Barra de herramientas mejorada */}
                                <Row className="mb-4">
                                    <Col lg={6}>
                                        <InputGroup size="lg">
                                            <InputGroup.Text className="bg-light border-end-0">
                                                <i className="fas fa-search text-muted"></i>
                                            </InputGroup.Text>
                                            <FormControl
                                                placeholder="Buscar por paciente, médico, expediente o número de receta..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="border-start-0 border-end-0"
                                                style={{ fontSize: '1rem' }}
                                            />
                                            {searchTerm && (
                                                <Button 
                                                    variant="outline-secondary"
                                                    onClick={() => setSearchTerm('')}
                                                    className="border-start-0"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </Button>
                                            )}
                                        </InputGroup>
                                    </Col>
                                    
                                    <Col lg={6} className="mt-3 mt-lg-0">
                                        <div className="d-flex justify-content-lg-end gap-2">
                                            <Button
                                                variant={vistaRecetas === 'cards' ? 'primary' : 'outline-primary'}
                                                onClick={() => setVistaRecetas('cards')}
                                                className="d-flex align-items-center"
                                            >
                                                <i className="fas fa-th-large me-1"></i>
                                                <span className="d-none d-sm-inline">Tarjetas</span>
                                            </Button>
                                            
                                            <Button
                                                variant={vistaRecetas === 'tabla' ? 'primary' : 'outline-primary'}
                                                onClick={() => setVistaRecetas('tabla')}
                                                className="d-flex align-items-center"
                                            >
                                                <i className="fas fa-list me-1"></i>
                                                <span className="d-none d-sm-inline">Tabla</span>
                                            </Button>
                                            
                                            <Button
                                                variant="outline-success"
                                                onClick={cargarDatos}
                                                disabled={loading}
                                                className="d-flex align-items-center"
                                            >
                                                <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i>
                                                <span className="d-none d-sm-inline">Actualizar</span>
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Indicador de resultados */}
                                {searchTerm && (
                                    <Row className="mb-3">
                                        <Col>
                                            <Alert variant="info" className="mb-0 py-2">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Mostrando {filteredRecetas.length} resultado{filteredRecetas.length !== 1 ? 's' : ''} 
                                                para "<strong>{searchTerm}</strong>"
                                            </Alert>
                                        </Col>
                                    </Row>
                                )}

                                {/* Mostrar loading solo si está cargando */}
                                {loading && (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando recetas...</span>
                                        </div>
                                        <div className="mt-2 text-muted">Cargando recetas pendientes...</div>
                                    </div>
                                )}

                                {/* Contenido principal */}
                                {!loading && (
                                    <>
                                        {vistaRecetas === 'cards' ? renderVistaCards() : renderVistaTabla()}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Tab de Historial - SIN CAMBIOS */}
                    <Tab.Pane eventKey="historial">
                        <Card>
                            <Card.Body>
                                {/* Filtros */}
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Estado</Form.Label>
                                            <Form.Select
                                                value={filtros.estado}
                                                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                                            >
                                                <option value="">Todos los estados</option>
                                                <option value="completo">Completo</option>
                                                <option value="parcial">Parcial</option>
                                                <option value="cancelado">Cancelado</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Fecha Inicio</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.fechaInicio}
                                                onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Fecha Fin</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.fechaFin}
                                                onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Buscar</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <i className="fas fa-search"></i>
                                                </InputGroup.Text>
                                                <FormControl
                                                    placeholder="Buscar en historial..."
                                                    value={searchHistorial}
                                                    onChange={(e) => {
                                                        setSearchHistorial(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2} className="d-flex align-items-end">
                                        <Button 
                                            variant="secondary" 
                                            onClick={limpiarFiltros}
                                            className="w-100"
                                        >
                                            <i className="fas fa-eraser me-1"></i> Limpiar
                                        </Button>
                                    </Col>
                                </Row>

                                {loading && (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="danger" className="mb-3">{error}</Alert>
                                )}

                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Fecha Despacho</th>
                                                <th>Receta</th>
                                                <th>Expediente</th>
                                                <th>Paciente</th>
                                                <th>Medicamentos</th>
                                                <th>Estado</th>
                                                <th>Despachado por</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentHistorial.length > 0 ? (
                                                currentHistorial.map((despacho) => (
                                                    <tr key={despacho.id_despacho}>
                                                        <td>
                                                            <div>
                                                                <strong>{new Date(despacho.fecha_despacho).toLocaleDateString('es-ES')}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Date(despacho.fecha_despacho).toLocaleTimeString('es-ES', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg="secondary" className="fs-6">
                                                                #{despacho.id_receta}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg="info" text="dark">
                                                                {despacho.n_expediente || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <strong>{despacho.nombre_paciente}</strong>
                                                        </td>
                                                        <td>
                                                            <div 
                                                                style={{ 
                                                                    maxWidth: '200px', 
                                                                    overflow: 'hidden', 
                                                                    textOverflow: 'ellipsis', 
                                                                    whiteSpace: 'nowrap' 
                                                                }} 
                                                                title={despacho.medicamentos}
                                                            >
                                                                <small>{despacho.medicamentos}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={getBadgeVariant(despacho.estado_despacho)}>
                                                                {despacho.estado_despacho === 'completo' ? (
                                                                    <>
                                                                        <i className="fas fa-check-circle me-1"></i>
                                                                        Completo
                                                                    </>
                                                                ) : despacho.estado_despacho === 'parcial' ? (
                                                                    <>
                                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                                        Parcial
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-times-circle me-1"></i>
                                                                        Cancelado
                                                                    </>
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <small>{despacho.nombre_despachador}</small>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleVerDespacho(despacho.id_despacho)}
                                                                title="Ver detalles del despacho"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        <div className="text-muted">
                                                            <i className="fas fa-search fa-2x mb-2"></i>
                                                            <br />
                                                            {!loading ? 
                                                                (searchHistorial || filtros.estado || filtros.fechaInicio || filtros.fechaFin
                                                                    ? 'No se encontraron despachos con los criterios de búsqueda'
                                                                    : 'No hay despachos registrados') 
                                                                : 'Cargando...'
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Paginación */}
                                {filteredHistorial.length > 0 && renderPagination()}
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Modales */}
            {recetaSeleccionada && (
                <DespachoModal
                    show={showDespachoModal}
                    onHide={() => setShowDespachoModal(false)}
                    receta={recetaSeleccionada}
                    onDespachoCompletado={handleDespachoCompletado}
                />
            )}

            {despachoSeleccionado && (
                <VerDespachoModal
                    show={showVerDespachoModal}
                    onHide={() => setShowVerDespachoModal(false)}
                    despacho={despachoSeleccionado}
                />
            )}
        </MainCard>
    );
};

export default DespachoMedicamentos;