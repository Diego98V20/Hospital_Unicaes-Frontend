import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Alert, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { proveedorService } from '../../../services/proveedorService';
import ProveedorModal from './ProveedorModal';

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
`;

const ProveedoresModal = ({ show, onHide }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  // Estados para paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Cargar proveedores al montar el componente o mostrar el modal
  useEffect(() => {
    if (show) {
      fetchProveedores();
    }
  }, [show]);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await proveedorService.listarProveedores();
      setProveedores(response && response.data ? response.data : []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setError("Error al cargar la lista de proveedores. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProveedor = () => {
    setProveedorSeleccionado(null);
    setShowProveedorModal(true);
  };

  const handleEditarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setShowProveedorModal(true);
  };

  const handleGuardarProveedor = async (proveedorData) => {
    try {
      if (proveedorSeleccionado) {
        // Actualizar proveedor existente
        await proveedorService.actualizarProveedor(proveedorSeleccionado.id_proveedor, proveedorData);
      } else {
        // Crear nuevo proveedor
        await proveedorService.crearProveedor(proveedorData);
      }
      
      // Cerrar modal y recargar la lista
      setShowProveedorModal(false);
      fetchProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      alert(error.response?.data?.message || "Error al guardar el proveedor");
    }
  };

  const handleDesactivarProveedor = async (id) => {
    if (window.confirm("¿Está seguro que desea desactivar este proveedor?")) {
      try {
        await proveedorService.desactivarProveedor(id);
        fetchProveedores();
      } catch (error) {
        console.error("Error al desactivar proveedor:", error);
        alert("Error al desactivar el proveedor");
      }
    }
  };

  // Filtrar proveedores solo por búsqueda
  const filteredProveedores = proveedores.filter(prov => {
    const matchesSearch = (
      String(prov.id_proveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(prov.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(prov.persona_contacto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(prov.telefono || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(prov.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return matchesSearch;
  });
  
  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProveedores = filteredProveedores.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  
  // Funciones para cambiar de página
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
      <div className="pagination-custom">
        <div className="pagination-info">
          Mostrando {filteredProveedores.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProveedores.length)} de {filteredProveedores.length} proveedores
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

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" className="modal-extra-wide">
        <Modal.Header closeButton>
          <Modal.Title>Gestión de Proveedores</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={9} className="mb-2 mb-md-0">
              <InputGroup>
                <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={3} className="text-md-end">
              <Button variant="primary" onClick={handleNuevoProveedor}>
                <i className="fas fa-plus-circle me-1"></i> Nuevo Proveedor
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando proveedores...</p>
            </div>
          ) : (
            <div className="table-container">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProveedores.length > 0 ? (
                    currentProveedores.map((prov) => (
                      <tr key={prov.id_proveedor}>
                        <td>{prov.id_proveedor}</td>
                        <td>{prov.nombre}</td>
                        <td>{prov.persona_contacto || '-'}</td>
                        <td>{prov.telefono || '-'}</td>
                        <td>{prov.correo || '-'}</td>
                        <td>
                          <Badge bg={prov.estado === 'activo' ? 'success' : 'danger'}>
                            {prov.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditarProveedor(prov)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          {prov.estado === 'activo' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDesactivarProveedor(prov.id_proveedor)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        {searchTerm 
                          ? 'No se encontraron proveedores con los criterios de búsqueda' 
                          : 'No hay proveedores registrados'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
          
          {/* Mostrar paginación solo si hay datos y no está cargando */}
          {!loading && proveedores.length > 0 && renderPagination()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear/editar proveedores */}
      <ProveedorModal 
        show={showProveedorModal}
        onHide={() => setShowProveedorModal(false)}
        proveedor={proveedorSeleccionado}
        onGuardar={handleGuardarProveedor}
      />
    </>
  );
};

export default ProveedoresModal;