import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Form, Button, Nav, Tab, Table, Badge, ProgressBar, InputGroup, FormControl, Alert, Pagination, ButtonGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainCard from '../../components/Card/MainCard';
import { medicamentoService } from '../../services/medicamentoService';
import { categoriaService } from '../../services/categoriaService';
import { presentacionService } from '../../services/presentacionService';
import { stockService } from '../../services/stockService';
import { notificacionesService } from '../../services/notificacionesService';
import MedicamentoModal from './components/MedicamentoModal';
import LoteModal from './components/LoteModal';
import VerMedicamentoModal from './components/VerMedicamentoModal';
import VerLoteModal from './components/VerLoteModal';
import CategoriasYPresentacionesModal from './components/CategoriasYPresentacionesModal';
import ProveedoresModal from './components/ProveedoresModal';

// Estilos personalizados para la paginación
const customStyles = `
  .pagination-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }
  
  .pagination-info {
    color: #6c757d;
  }
  
  .filter-controls {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid #dee2e6;
  }
`;

const InventarioMedicamentos = () => {
  // Estados para almacenar datos
  const [medicamentos, setMedicamentos] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState({
    stockBajo: [],
    stockVencimiento: [],
    totalNotificaciones: 0
  });

  // Estado para controlar cuándo se deben recargar los datos
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Estados para filtrar lotes 
  const [lotesAgotados, setLotesAgotados] = useState([]);
  const [lotesVencidos, setLotesVencidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('activos'); // 'activos', 'agotados', 'vencidos', 'todos'
  const [filtroFecha, setFiltroFecha] = useState({
    desde: '',
    hasta: '',
    tipo: 'caducidad' // 'caducidad', 'fabricacion', 'ingreso'
  });

  // Estados para modales
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showVerMedicamentoModal, setShowVerMedicamentoModal] = useState(false);
  const [showVerLoteModal, setShowVerLoteModal] = useState(false);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);
  
  // Estados para edición
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [medicamentoParaLote, setMedicamentoParaLote] = useState(null);

  // Estado para búsqueda GLOBAL (una sola búsqueda para todas las tablas)
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para paginación de cada pestaña
  const [pagGeneral, setPagGeneral] = useState({ current: 1, itemsPerPage: 10 });
  const [pagStockBajo, setPagStockBajo] = useState({ current: 1, itemsPerPage: 10 });
  const [pagVencimiento, setPagVencimiento] = useState({ current: 1, itemsPerPage: 10 });
  const [pagLotes, setPagLotes] = useState({ current: 1, itemsPerPage: 10 });

  // Estado para carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para pestaña activa
  const [activeTab, setActiveTab] = useState('general');

  const navigate = useNavigate();
  const location = useLocation();

  // Agregar estilos personalizados al documento
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Cargar parámetros de URL si existen
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (tab && ['general', 'stockBajo', 'vencimiento', 'lotes'].includes(tab)) {
      setActiveTab(tab);
    }

    if (action === 'addLote' && id) {
      // Buscar el medicamento por ID y abrir modal de lote
      const fetchMedicamento = async () => {
        try {
          const response = await medicamentoService.obtenerMedicamentoPorId(id);
          if (response.data) {
            setMedicamentoParaLote(response.data);
            setShowLoteModal(true);
          }
        } catch (error) {
          console.error("Error al obtener medicamento:", error);
        }
      };

      fetchMedicamento();
    }
  }, [location]);

  // Función para cargar lotes vencidos
  const cargarLotesVencidos = async () => {
    try {
      const response = await stockService.listarLotesVencidos();
      if (response && response.data) {
        setLotesVencidos(response.data);
      } else {
        setLotesVencidos([]);
      }
    } catch (error) {
      console.error("Error al cargar lotes vencidos:", error);
      setLotesVencidos([]);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar categorías primero para evitar errores en los modales
        const categoriasResponse = await categoriaService.listarCategorias();
        if (categoriasResponse && categoriasResponse.data) {
          setCategorias(categoriasResponse.data);
        } else {
          setCategorias([]);
        }

        // Cargar presentaciones
        const presentacionesResponse = await presentacionService.listarPresentaciones();
        if (presentacionesResponse && presentacionesResponse.data) {
          setPresentaciones(presentacionesResponse.data);
        } else {
          setPresentaciones([]);
        }

        // Cargar medicamentos
        const medicamentosResponse = await medicamentoService.listarMedicamentos();
        if (medicamentosResponse && medicamentosResponse.data) {
          setMedicamentos(medicamentosResponse.data);
        } else {
          setMedicamentos([]);
        }

        // Cargar medicamentos con stock bajo
        const stockBajoResponse = await medicamentoService.verificarStockBajo();
        if (stockBajoResponse && stockBajoResponse.data) {
          setStockBajo(stockBajoResponse.data);
        } else {
          setStockBajo([]);
        }

        // Cargar lotes próximos a vencer
        const proximosVencerResponse = await stockService.verificarStockProximoVencer();
        if (proximosVencerResponse && proximosVencerResponse.data) {
          setProximosVencer(proximosVencerResponse.data);
        } else {
          setProximosVencer([]);
        }

        // Cargar todos los lotes activos
        const lotesResponse = await stockService.listarStock();
        if (lotesResponse && lotesResponse.data) {
          setLotes(lotesResponse.data);
        } else {
          setLotes([]);
        }

        // Cargar lotes agotados
        const lotesAgotadosResponse = await stockService.listarLotesAgotados();
        if (lotesAgotadosResponse && lotesAgotadosResponse.data) {
          setLotesAgotados(lotesAgotadosResponse.data);
        } else {
          setLotesAgotados([]);
        }

        // Cargar lotes vencidos
        await cargarLotesVencidos();

        // Cargar notificaciones
        const notificacionesResponse = await notificacionesService.obtenerNotificaciones();
        if (notificacionesResponse && notificacionesResponse.data) {
          setNotificaciones(notificacionesResponse.data);
        } else {
          setNotificaciones({
            stockBajo: [],
            stockVencimiento: [],
            totalNotificaciones: 0
          });
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Ocurrió un error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
        // Resetear el flag de actualización después de cargar
        setShouldRefresh(false);
      }
    };

    fetchData();
  }, [shouldRefresh]);

  // Función para aplicar filtros de fecha
  const aplicarFiltroFecha = (lote) => {
    if (!filtroFecha.desde && !filtroFecha.hasta) return true;

    let fechaComparar;
    switch (filtroFecha.tipo) {
      case 'fabricacion':
        fechaComparar = new Date(lote.fecha_fabricacion);
        break;
      case 'ingreso':
        fechaComparar = new Date(lote.fecha_ingreso);
        break;
      case 'caducidad':
      default:
        fechaComparar = new Date(lote.fecha_caducidad);
        break;
    }

    const fechaDesde = filtroFecha.desde ? new Date(filtroFecha.desde) : null;
    const fechaHasta = filtroFecha.hasta ? new Date(filtroFecha.hasta) : null;

    if (fechaDesde && fechaComparar < fechaDesde) return false;
    if (fechaHasta && fechaComparar > fechaHasta) return false;

    return true;
  };

  // Lógica para filtrar medicamentos en todas las pestañas usando searchTerm global
  const filteredMedicamentosGeneral = useMemo(() => {
    return medicamentos.filter(med =>
      (med.codigo && med.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.nombre && med.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.nombre_categoria && med.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.concentracion && med.concentracion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.via_administracion && med.via_administracion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [medicamentos, searchTerm]);

  // Lógica para filtrar medicamentos con stock bajo usando searchTerm global
  const filteredStockBajo = useMemo(() => {
    return stockBajo.filter(med =>
      (med.codigo && med.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.nombre && med.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.nombre_categoria && med.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (med.concentracion && med.concentracion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [stockBajo, searchTerm]);

  // Lógica para filtrar lotes próximos a vencer usando searchTerm global
  const filteredVencimiento = useMemo(() => {
    return proximosVencer.filter(lote =>
      (lote.numero_lote && lote.numero_lote.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lote.nombre && lote.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lote.id_stock && lote.id_stock.toString().includes(searchTerm.toLowerCase())) ||
      (lote.codigo && lote.codigo.toString().includes(searchTerm.toLowerCase())) ||
      (lote.concentracion && lote.concentracion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [proximosVencer, searchTerm]);

  // Lógica para filtrar lotes usando searchTerm global y filtros mejorados
  const filteredLotes = useMemo(() => {
    let lotesData = [];

    // Seleccionar los lotes según el filtro de estado
    switch (filtroEstado) {
      case 'activos':
        lotesData = [...lotes];
        break;
      case 'agotados':
        lotesData = [...lotesAgotados];
        break;
      case 'vencidos':
        lotesData = [...lotesVencidos];
        break;
      case 'todos':
        lotesData = [...lotes, ...lotesAgotados, ...lotesVencidos];
        break;
      default:
        lotesData = [...lotes];
    }

    // Aplicar filtro de búsqueda
    lotesData = lotesData.filter(lote =>
      (lote.numero_lote && lote.numero_lote.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lote.nombre && lote.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lote.id_stock && lote.id_stock.toString().includes(searchTerm.toLowerCase())) ||
      (lote.codigo && lote.codigo.toString().includes(searchTerm.toLowerCase()))
    );

    // Aplicar filtro de fecha
    lotesData = lotesData.filter(aplicarFiltroFecha);

    return lotesData;
  }, [lotes, lotesAgotados, lotesVencidos, filtroEstado, searchTerm, filtroFecha]);

  // Función para calcular paginación
  const getPaginatedData = (data, paginationState) => {
    const { current, itemsPerPage } = paginationState;
    const indexOfLastItem = current * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    return {
      items: currentItems,
      totalPages,
      indexOfFirstItem,
      indexOfLastItem,
    };
  };

  // Función para cambiar de página
  const paginate = (pageNumber, setPaginationState) => {
    setPaginationState(prev => ({ ...prev, current: pageNumber }));
  };

  // Renderizar paginación
  const renderPagination = (currentPage, totalPages, paginate, setPaginationState, itemsPerPage, totalItems, firstIndex, lastIndex) => {
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
                setPaginationState(prev => ({ 
                  ...prev, 
                  itemsPerPage: Number(e.target.value), 
                  current: 1 
                }));
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
                onClick={() => paginate(1, setPaginationState)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage - 1, setPaginationState)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
            </li>
            
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button
                  onClick={() => paginate(number, setPaginationState)}
                  className="page-link"
                >
                  {number}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage + 1, setPaginationState)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &gt;
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(totalPages, setPaginationState)}
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

  // Efecto para resetear paginación cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    setPagGeneral(prev => ({ ...prev, current: 1 }));
    setPagStockBajo(prev => ({ ...prev, current: 1 }));
    setPagVencimiento(prev => ({ ...prev, current: 1 }));
    setPagLotes(prev => ({ ...prev, current: 1 }));
  }, [searchTerm, filtroEstado, filtroFecha]);

  // Obtener datos paginados para cada pestaña
  const paginatedGeneral = getPaginatedData(filteredMedicamentosGeneral, pagGeneral);
  const paginatedStockBajo = getPaginatedData(filteredStockBajo, pagStockBajo);
  const paginatedVencimiento = getPaginatedData(filteredVencimiento, pagVencimiento);
  const paginatedLotes = getPaginatedData(filteredLotes, pagLotes);

  // Abrir modal para crear nuevo medicamento
  const handleNuevoMedicamento = () => {
    setMedicamentoSeleccionado(null);
    setShowMedicamentoModal(true);
  };

  // Abrir modal para editar medicamento
  const handleEditarMedicamento = (medicamento) => {
    setMedicamentoSeleccionado(medicamento);
    setShowMedicamentoModal(true);
  };
  
  // Abrir modal para ver detalles de medicamento
  const handleVerMedicamento = async (id) => {
    try {
      const response = await medicamentoService.obtenerMedicamentoPorId(id);
      if (!response || !response.data) {
        throw new Error("No se pudo obtener información del medicamento");
      }

      const stockResponse = await stockService.obtenerStockPorMedicamento(id);

      setMedicamentoSeleccionado({
        ...response.data,
        lotes: stockResponse && stockResponse.data ? stockResponse.data : []
      });

      setShowVerMedicamentoModal(true);
    } catch (error) {
      console.error("Error al obtener detalles del medicamento:", error);
      alert("No se pudo obtener la información del medicamento");
    }
  };

  // Abrir modal para crear nuevo lote
  const handleNuevoLote = (medicamento = null) => {
    setMedicamentoParaLote(medicamento);
    setLoteSeleccionado(null);
    setShowLoteModal(true);
  };

  // Abrir modal para ver detalles de lote
  const handleVerLote = async (id) => {
    try {
      const response = await stockService.obtenerStockPorId(id);
      if (!response || !response.data) {
        throw new Error("No se pudo obtener información del lote");
      }

      setLoteSeleccionado(response.data);
      setShowVerLoteModal(true);
    } catch (error) {
      console.error("Error al obtener detalles del lote:", error);
      alert("No se pudo obtener la información del lote");
    }
  };

  // Manejar guardado de nuevo medicamento o actualización
  const handleGuardarMedicamento = async (medicamentoData) => {
    try {
      if (medicamentoSeleccionado) {
        // Actualizar medicamento existente
        await medicamentoService.actualizarMedicamento(medicamentoSeleccionado.id_medicamento, medicamentoData);
      } else {
        // Crear nuevo medicamento
        await medicamentoService.crearMedicamento(medicamentoData);
      }

      // Solicitar actualización de datos
      setShouldRefresh(true);

      setShowMedicamentoModal(false);
    } catch (error) {
      console.error("Error al guardar medicamento:", error);
      alert("Error al guardar el medicamento");
    }
  };

  // Manejar guardado de nuevo lote
  const handleGuardarLote = async (loteData) => {
    try {
      await stockService.crearStock(loteData);

      // Solicitar actualización de datos
      setShouldRefresh(true);

      setShowLoteModal(false);
    } catch (error) {
      console.error("Error al guardar lote:", error);
      alert("Error al guardar el lote");
    }
  };

  // Manejar cambio de estado de medicamento
  const handleDesactivarMedicamento = async (id) => {
    if (window.confirm("¿Está seguro que desea desactivar este medicamento?")) {
      try {
        await medicamentoService.desactivarMedicamento(id);

        // Solicitar actualización de datos
        setShouldRefresh(true);
      } catch (error) {
        console.error("Error al desactivar medicamento:", error);
        alert("Error al desactivar el medicamento");
      }
    }
  };

  // Manejar cambio de estado de lote
  const handleDesactivarLote = async (id, estado) => {
    if (window.confirm(`¿Está seguro que desea marcar este lote como ${estado}?`)) {
      try {
        await stockService.cambiarEstadoStock(id, estado);

        // Solicitar actualización de datos
        setShouldRefresh(true);
      } catch (error) {
        console.error("Error al cambiar estado del lote:", error);
        alert("Error al cambiar el estado del lote");
      }
    }
  };

  // Función para limpiar filtros de fecha
  const limpiarFiltros = () => {
    setFiltroFecha({
      desde: '',
      hasta: '',
      tipo: 'caducidad'
    });
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <Row>
        <Col>
          <MainCard title="Inventario de Medicamentos">
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando inventario...</p>
            </div>
          </MainCard>
        </Col>
      </Row>
    );
  }

  // Mostrar mensaje de error si ocurrió alguno
  if (error) {
    return (
      <Row>
        <Col>
          <MainCard title="Inventario de Medicamentos">
            <Alert variant="danger">
              {error}
            </Alert>
          </MainCard>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col>
        <MainCard title="Inventario de Medicamentos">
          {/* Barra de búsqueda GLOBAL y botones de acción */}
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Buscar en todas las pestañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={handleNuevoMedicamento} className="me-2">
                <i className="fas fa-plus-circle me-1"></i> Nuevo Medicamento
              </Button>
              <Button variant="outline-secondary" onClick={() => handleNuevoLote()}>
                <i className="fas fa-box me-1"></i> Nuevo Lote
              </Button>
              <Button variant="outline-info" onClick={() => setShowProveedoresModal(true)}>
                <i className="fas fa-truck me-1"></i> Proveedores
              </Button>
            </Col>
          </Row>

          {/* Pestañas para navegar entre diferentes vistas */}
          <Tab.Container id="inventario-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="pills" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="general">
                  <i className="fas fa-list me-1"></i> Listado General
                  {filteredMedicamentosGeneral.length > 0 && searchTerm && (
                    <Badge bg="primary" className="ms-1">{filteredMedicamentosGeneral.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stockBajo">
                  <i className="fas fa-exclamation-triangle me-1"></i> Stock Bajo
                  {stockBajo.length > 0 && (
                    <Badge bg="danger" className="ms-1">{stockBajo.length}</Badge>
                  )}
                  {filteredStockBajo.length > 0 && searchTerm && (
                    <Badge bg="primary" className="ms-1">{filteredStockBajo.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="vencimiento">
                  <i className="fas fa-clock me-1"></i> Próximos a Vencer
                  {proximosVencer.length > 0 && (
                    <Badge bg="warning" className="ms-1">{proximosVencer.length}</Badge>
                  )}
                  {filteredVencimiento.length > 0 && searchTerm && (
                    <Badge bg="primary" className="ms-1">{filteredVencimiento.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lotes">
                  <i className="fas fa-boxes me-1"></i> Lotes
                  {filteredLotes.length > 0 && searchTerm && (
                    <Badge bg="primary" className="ms-1">{filteredLotes.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="ms-auto">
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => setShowCategoriasModal(true)}
                >
                  <i className="fas fa-cog me-1"></i> Categorías y Presentaciones
                </Button>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Pestaña: Listado General */}
              <Tab.Pane eventKey="general">
                <Card>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Presentación</th>
                            <th>Concentración</th>
                            <th>Vía Admin.</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedGeneral.items.length > 0 ? (
                            paginatedGeneral.items.map((med) => {
                              // Calcular porcentaje de stock
                              const stockActual = med.stock_actual || 0;
                              const stockMinimo = med.stock_minimo || 10;
                              const mitadStockMinimo = stockMinimo / 2;
                              const porcentajeStock = Math.min(100, Math.floor((stockActual / stockMinimo) * 100));

                              // Determinar estado y variante de progreso según los nuevos criterios
                              let estadoStock = "Normal";
                              let variantProgress = "success";

                              if (stockActual <= mitadStockMinimo) {
                                // Stock actual es menor o igual a la mitad del stock mínimo
                                estadoStock = "Stock Crítico";
                                variantProgress = "danger";
                              } else if (stockActual <= stockMinimo) {
                                // Stock actual es menor o igual al stock mínimo pero mayor que la mitad
                                estadoStock = "Stock Bajo";
                                variantProgress = "warning";
                              } else {
                                // Stock actual es mayor que el stock mínimo
                                estadoStock = "Stock Normal";
                                variantProgress = "success";
                              }

                              return (
                                <tr key={med.id_medicamento}>
                                  <td>{med.codigo}</td>
                                  <td>{med.nombre}</td>
                                  <td>{med.nombre_categoria}</td>
                                  <td>{med.nombre_presentacion}</td>
                                  <td>{med.concentracion}</td>
                                  <td>{med.via_administracion}</td>
                                  <td>{stockActual}</td>
                                  <td>{med.stock_minimo}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle me-1"
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                         backgroundColor: variantProgress === 'danger' ? '#dc3545' :
                                            variantProgress === 'warning' ? '#ffc107' : '#28a745'
                                        }}
                                      />
                                      <span>{estadoStock}</span>
                                    </div>
                                    <ProgressBar
                                      variant={variantProgress}
                                      now={porcentajeStock}
                                      style={{ height: '5px' }}
                                      className="mt-1"
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => handleVerMedicamento(med.id_medicamento)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleEditarMedicamento(med)}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="10" className="text-center">
                                {searchTerm ? 
                                  `No se encontraron medicamentos que coincidan con "${searchTerm}"` :
                                  "No se encontraron medicamentos"
                                }
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      pagGeneral.current,
                      paginatedGeneral.totalPages,
                      paginate,
                      setPagGeneral,
                      pagGeneral.itemsPerPage,
                      filteredMedicamentosGeneral.length,
                      paginatedGeneral.indexOfFirstItem,
                      paginatedGeneral.indexOfLastItem
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Stock Bajo */}
              <Tab.Pane eventKey="stockBajo">
                <Card>
                  <Card.Body>
                    <Alert variant="warning" className="mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Se muestran medicamentos cuyo stock actual es menor o igual al stock mínimo establecido.
                    </Alert>
                    
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Concentración</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Nivel de Stock</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStockBajo.items.length > 0 ? (
                            paginatedStockBajo.items.map((med) => {
                              const stockActual = med.stock_actual || 0;
                              const stockMinimo = med.stock_minimo || 10;
                              const porcentajeStock = Math.min(100, Math.floor((stockActual / stockMinimo) * 100));

                              let variantProgress = "danger";
                              if (porcentajeStock > 70) {
                                variantProgress = "warning";
                              }

                              return (
                                <tr key={med.id_medicamento}>
                                  <td>{med.codigo}</td>
                                  <td>{med.nombre}</td>
                                  <td>{med.nombre_categoria}</td>
                                  <td>{med.concentracion}</td>
                                  <td>{stockActual}</td>
                                  <td>{stockMinimo}</td>
                                  <td>
                                    <ProgressBar
                                      variant={variantProgress}
                                      now={porcentajeStock}
                                      label={`${porcentajeStock}%`}
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleNuevoLote(med)}
                                    >
                                      <i className="fas fa-plus-circle me-1"></i> Añadir Lote
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">
                                {searchTerm ? 
                                  `No se encontraron medicamentos con stock bajo que coincidan con "${searchTerm}"` :
                                  <Alert variant="success" className="m-0">
                                    No hay medicamentos con stock bajo
                                  </Alert>
                                }
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      pagStockBajo.current,
                      paginatedStockBajo.totalPages,
                      paginate,
                      setPagStockBajo,
                      pagStockBajo.itemsPerPage,
                      filteredStockBajo.length,
                      paginatedStockBajo.indexOfFirstItem,
                      paginatedStockBajo.indexOfLastItem
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Próximos a Vencer */}
              <Tab.Pane eventKey="vencimiento">
                <Card>
                  <Card.Body>
                    <Alert variant="warning" className="mb-3">
                      <i className="fas fa-clock me-2"></i>
                      Se muestran lotes que caducarán en los próximos 90 días.
                    </Alert>
                    
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>ID Stock</th>
                            <th>Número Lote</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Concentración</th>
                            <th>Fecha Caducidad</th>
                            <th>Días Restantes</th>
                            <th>Cantidad Inicial</th>
                            <th>Cantidad Disponible</th>
                            <th>Stock Consumido</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedVencimiento.items.length > 0 ? (
                            paginatedVencimiento.items.map((lote) => {
                              // Calcular días restantes
                              const fechaCaducidad = new Date(lote.fecha_caducidad);
                              const hoy = new Date();
                              const diferenciaTiempo = fechaCaducidad.getTime() - hoy.getTime();
                              const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                              // Calcular stock consumido
                              const cantidadInicial = lote.cantidad_inicial || 0;
                              const cantidadDisponible = lote.cantidad_disponible || 0;
                              const stockConsumido = cantidadInicial - cantidadDisponible;

                              let badgeVariant = "warning";
                              if (diasRestantes <= 30) {
                                badgeVariant = "danger";
                              }

                              return (
                                <tr key={lote.id_stock}>
                                  <td>{lote.id_stock}</td>
                                  <td>{lote.numero_lote}</td>
                                  <td>{lote.nombre}</td>
                                  <td>{lote.nombre_categoria}</td>
                                  <td>{lote.concentracion}</td>
                                  <td>
                                    {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>
                                    <Badge bg={badgeVariant}>
                                      {diasRestantes} días
                                    </Badge>
                                  </td>
                                  <td>{cantidadInicial}</td>
                                  <td>{cantidadDisponible}</td>
                                  <td>{stockConsumido}</td>
                                  <td>
                                    <Badge bg="warning">
                                      Próximo a vencer
                                    </Badge>
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => handleVerLote(lote.id_stock)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDesactivarLote(lote.id_stock, 'vencido')}
                                    >
                                      <i className="fas fa-trash me-1"></i> Descartar
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="12" className="text-center">
                                {searchTerm ? 
                                  `No se encontraron lotes próximos a vencer que coincidan con "${searchTerm}"` :
                                  <Alert variant="success" className="m-0">
                                    No hay lotes próximos a vencer
                                  </Alert>
                                }
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      pagVencimiento.current,
                      paginatedVencimiento.totalPages,
                      paginate,
                      setPagVencimiento,
                      pagVencimiento.itemsPerPage,
                      filteredVencimiento.length,
                      paginatedVencimiento.indexOfFirstItem,
                      paginatedVencimiento.indexOfLastItem
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Lotes - MEJORADA */}
              <Tab.Pane eventKey="lotes">
                <Card>
                  <Card.Body>
                    {/* Controles de filtro mejorados */}
                    <div className="filter-controls">
                      <Row>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Filtrar por estado:</Form.Label>
                            <ButtonGroup className="w-100">
                              <Button
                                variant={filtroEstado === 'activos' ? 'primary' : 'outline-primary'}
                                onClick={() => setFiltroEstado('activos')}
                                size="sm"
                              >
                                <i className="fas fa-check-circle me-1"></i>
                                Activos ({lotes.length})
                              </Button>
                              <Button
                                variant={filtroEstado === 'agotados' ? 'secondary' : 'outline-secondary'}
                                onClick={() => setFiltroEstado('agotados')}
                                size="sm"
                              >
                                <i className="fas fa-box-open me-1"></i>
                                Agotados ({lotesAgotados.length})
                              </Button>
                              <Button
                                variant={filtroEstado === 'vencidos' ? 'danger' : 'outline-danger'}
                                onClick={() => setFiltroEstado('vencidos')}
                                size="sm"
                              >
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Vencidos ({lotesVencidos.length})
                              </Button>
                              <Button
                                variant={filtroEstado === 'todos' ? 'dark' : 'outline-dark'}
                                onClick={() => setFiltroEstado('todos')}
                                size="sm"
                              >
                                <i className="fas fa-list me-1"></i>
                                Todos
                              </Button>
                            </ButtonGroup>
                          </Form.Group>
                        </Col>
                        <Col md={8}>
                          <Form.Group>
                            <Form.Label>Filtrar por fechas:</Form.Label>
                            <Row>
                              <Col md={3}>
                                <Form.Select
                                  size="sm"
                                  value={filtroFecha.tipo}
                                  onChange={(e) => setFiltroFecha(prev => ({ ...prev, tipo: e.target.value }))}
                                >
                                  <option value="caducidad">Fecha de caducidad</option>
                                  <option value="fabricacion">Fecha de fabricación</option>
                                  <option value="ingreso">Fecha de ingreso</option>
                                </Form.Select>
                              </Col>
                              <Col md={3}>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  placeholder="Desde"
                                  value={filtroFecha.desde}
                                  onChange={(e) => setFiltroFecha(prev => ({ ...prev, desde: e.target.value }))}
                                />
                              </Col>
                              <Col md={3}>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  placeholder="Hasta"
                                  value={filtroFecha.hasta}
                                  onChange={(e) => setFiltroFecha(prev => ({ ...prev, hasta: e.target.value }))}
                                />
                              </Col>
                              <Col md={3}>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={limpiarFiltros}
                                  className="w-100"
                                >
                                  <i className="fas fa-times me-1"></i>
                                  Limpiar
                                </Button>
                              </Col>
                            </Row>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>ID Stock</th>
                            <th>Número Lote</th>
                            <th>Medicamento</th>
                            <th>Fecha Fabricación</th>
                            <th>Fecha Caducidad</th>
                            <th>Cantidad Inicial</th>
                            <th>Cantidad Disponible</th>
                            <th>Stock Consumido</th>
                            <th>Fecha Ingreso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLotes.items.length > 0 ? (
                            paginatedLotes.items.map((lote) => {
                              let badgeVariant = "success";
                              let estadoTexto = "Activo";

                              if (lote.estado === 'agotado') {
                                badgeVariant = "secondary";
                                estadoTexto = "Agotado";
                              } else if (lote.estado === 'vencido') {
                                badgeVariant = "danger";
                                estadoTexto = "Vencido";
                              }

                              // Calcular días hasta vencimiento
                              const fechaCaducidad = new Date(lote.fecha_caducidad);
                              const hoy = new Date();
                              const diferenciaTiempo = fechaCaducidad.getTime() - hoy.getTime();
                              const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                              if (diasRestantes <= 90 && lote.estado === 'activo') {
                                badgeVariant = "warning";
                                estadoTexto = "Próximo a vencer";
                              }

                              // Calcular cantidad consumida
                              const cantidadInicial = lote.cantidad_inicial || 0;
                              const cantidadDisponible = lote.cantidad_disponible || 0;
                              const cantidadConsumida = cantidadInicial - cantidadDisponible;

                              return (
                                <tr key={lote.id_stock}>
                                  <td>{lote.id_stock}</td>
                                  <td>{lote.numero_lote}</td>
                                  <td>{lote.nombre}</td>
                                  <td>
                                    {new Date(lote.fecha_fabricacion).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>
                                    {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>{cantidadInicial}</td>
                                  <td>{cantidadDisponible}</td>
                                  <td>{cantidadConsumida}</td>
                                  <td>
                                    {new Date(lote.fecha_ingreso).toLocaleString('es-ES')}
                                  </td>
                                  <td>
                                    <Badge bg={badgeVariant}>
                                      {estadoTexto}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleVerLote(lote.id_stock)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="11" className="text-center">
                                {searchTerm || filtroFecha.desde || filtroFecha.hasta ? 
                                  `No se encontraron lotes que coincidan con los filtros aplicados` :
                                  "No se encontraron lotes"
                                }
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      pagLotes.current,
                      paginatedLotes.totalPages,
                      paginate,
                      setPagLotes,
                      pagLotes.itemsPerPage,
                      filteredLotes.length,
                      paginatedLotes.indexOfFirstItem,
                      paginatedLotes.indexOfLastItem
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </MainCard>
      </Col>

      {/* Modales */}
      <MedicamentoModal
        show={showMedicamentoModal}
        onHide={() => setShowMedicamentoModal(false)}
        medicamento={medicamentoSeleccionado}
        categorias={categorias}
        presentaciones={presentaciones}
        onGuardar={handleGuardarMedicamento}
      />

      <LoteModal
        show={showLoteModal}
        onHide={() => setShowLoteModal(false)}
        medicamentos={medicamentos}
        medicamentoPreseleccionado={medicamentoParaLote}
        onGuardar={handleGuardarLote}
      />

      {medicamentoSeleccionado && (
        <VerMedicamentoModal
          show={showVerMedicamentoModal}
          onHide={() => setShowVerMedicamentoModal(false)}
          medicamento={medicamentoSeleccionado}
          onAddLote={() => {
            setShowVerMedicamentoModal(false);
            setMedicamentoParaLote(medicamentoSeleccionado);
            setTimeout(() => {
              setShowLoteModal(true);
            }, 500);
          }}
          onEdit={() => {
            setShowVerMedicamentoModal(false);
            setTimeout(() => {
              setShowMedicamentoModal(true);
            }, 500);
          }}
        />
      )}

      {loteSeleccionado && (
        <VerLoteModal
          show={showVerLoteModal}
          onHide={() => setShowVerLoteModal(false)}
          lote={loteSeleccionado}
          onDescartar={(id, estado) => {
            setShowVerLoteModal(false);
            setTimeout(() => {
              handleDesactivarLote(id, estado);
            }, 500);
          }}
        />
      )}

      <CategoriasYPresentacionesModal
        show={showCategoriasModal}
        onHide={() => setShowCategoriasModal(false)}
        categorias={categorias}
        presentaciones={presentaciones}
        onAddCategoria={async (categoria) => {
          try {
            await categoriaService.crearCategoria(categoria);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al guardar categoría:", error);
            alert("Error al guardar la categoría");
          }
        }}
        onUpdateCategoria={async (id, categoria) => {
          try {
            await categoriaService.actualizarCategoria(id, categoria);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al actualizar categoría:", error);
            alert("Error al actualizar la categoría");
          }
        }}
        onDeleteCategoria={async (id) => {
          try {
            await categoriaService.desactivarCategoria(id);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al desactivar categoría:", error);
            alert("Error al desactivar la categoría");
          }
        }}
        onAddPresentacion={async (presentacion) => {
          try {
            await presentacionService.crearPresentacion(presentacion);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al guardar presentación:", error);
            alert("Error al guardar la presentación");
          }
        }}
        onUpdatePresentacion={async (id, presentacion) => {
          try {
            await presentacionService.actualizarPresentacion(id, presentacion);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al actualizar presentación:", error);
            alert("Error al actualizar la presentación");
          }
        }}
        onDeletePresentacion={async (id) => {
          try {
            await presentacionService.desactivarPresentacion(id);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al desactivar presentación:", error);
            alert("Error al desactivar la presentación");
          }
        }}
      />
    
      <ProveedoresModal
        show={showProveedoresModal}
        onHide={() => setShowProveedoresModal(false)}
      />
    </Row>
  );
};

export default InventarioMedicamentos;