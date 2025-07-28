import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Container, Row, Modal, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import Select from 'react-select';
import Card from '../../components/Card/MainCard';
import { mostrarResultadosExamenService } from 'services/examenService';
import { plantillaCompleteService } from 'services/plantillaExamenService';
import Swal from 'sweetalert2';

const ResultadosExamen = () => {
  const { id_examen } = useParams();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para selección múltiple
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  
  // Estados para modales básicos
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResultData, setNewResultData] = useState({});
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [showConfirmDeleteMultipleModal, setShowConfirmDeleteMultipleModal] = useState(false);
  const [showConfirmCompleteModal, setShowConfirmCompleteModal] = useState(false);
  
  // Estados para plantillas y edición masiva
  const [showPlantillaModal, setShowPlantillaModal] = useState(false);
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [showParametrosModal, setShowParametrosModal] = useState(false);
  const [parametrosPlantilla, setParametrosPlantilla] = useState([]);
  const [valoresParametros, setValoresParametros] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [infoExamen, setInfoExamen] = useState({});

  const cargarResultados = async () => {
    setLoading(true);
    try {
      const data = await mostrarResultadosExamenService.getResultadosExamen(id_examen);
      const resultadosValidos = data.filter(item => item.id_resultado !== null);
      setResultados(resultadosValidos);
      
      if (data.length > 0) {
        setInfoExamen({
          nombre_paciente: data[0].nombre_paciente,
          apellido_paciente: data[0].apellido_paciente,
          nombre_muestra: data[0].nombre_muestra,
          nombre_examen: data[0].nombre_examen
        });
        
        buscarPlantillasParaExamen(data[0].nombre_examen);
      }
    } catch (error) {
      console.error('Error al cargar los resultados del examen:', error);
      Swal.fire('Error', 'No se pudieron cargar los resultados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const buscarPlantillasParaExamen = async (nombreExamen) => {
    try {
      const tipos = await plantillaCompleteService.listarTiposExamen();
      const tipoEncontrado = tipos.find(tipo => 
        tipo.nombre.toLowerCase() === nombreExamen.toLowerCase()
      );
      
      if (tipoEncontrado) {
        const plantillas = await plantillaCompleteService.listarPlantillasPorTipo(tipoEncontrado.id_tipo_examen);
        setPlantillasDisponibles(plantillas);
      }
    } catch (error) {
      console.error('Error al buscar plantillas:', error);
    }
  };

  useEffect(() => {
    cargarResultados();
  }, [id_examen]);

  // === FUNCIONES PARA SELECCIÓN MÚLTIPLE ===
  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === resultados.length && resultados.length > 0) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
    } else {
      // Seleccionar todos
      setSelectedRows([...resultados]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      Swal.fire('Aviso', 'Debe seleccionar al menos un resultado para eliminar.', 'warning');
      return;
    }
    setShowConfirmDeleteMultipleModal(true);
  };

  const handleConfirmDeleteMultiple = async () => {
    try {
      setLoading(true);
      
      // Eliminar todos los resultados seleccionados
      const promesasEliminacion = selectedRows.map(row => 
        mostrarResultadosExamenService.eliminarResultadoExamen(row.id_resultado)
      );
      
      await Promise.all(promesasEliminacion);
      
      Swal.fire(
        'Éxito', 
        `Se eliminaron ${selectedRows.length} resultado${selectedRows.length > 1 ? 's' : ''} correctamente.`, 
        'success'
      );
      
      // Limpiar selección y recargar datos
      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
      setShowConfirmDeleteMultipleModal(false);
      cargarResultados();
      
    } catch (error) {
      console.error('Error al eliminar resultados:', error);
      Swal.fire('Error', 'No se pudieron eliminar algunos resultados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSelected = () => {
    if (selectedRows.length === 0) {
      Swal.fire('Aviso', 'Debe seleccionar al menos un resultado para editar.', 'warning');
      return;
    }

    setModoEdicion(true);
    setParametrosPlantilla(selectedRows.map(row => ({
      nombre_parametro: row.nombre_parametro,
      unidad: row.unidad,
      id_resultado: row.id_resultado
    })));

    // Cargar valores actuales de los resultados seleccionados
    const valoresActuales = {};
    selectedRows.forEach(resultado => {
      valoresActuales[resultado.nombre_parametro] = {
        valor: resultado.valor || '',
        rango_referencia: resultado.rango_referencia || ''
      };
    });
    setValoresParametros(valoresActuales);
    
    setShowParametrosModal(true);
  };

  // === FUNCIONES PARA PLANTILLAS ===
  const handleOpenPlantillaModal = () => {
    setModoEdicion(false);
    setShowPlantillaModal(true);
  };

  const handleSeleccionarPlantilla = async () => {
    if (!plantillaSeleccionada) {
      Swal.fire('Error', 'Debe seleccionar una plantilla.', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const plantillaCompleta = await plantillaCompleteService.obtenerPlantillaCompleta(plantillaSeleccionada);
      const parametros = plantillaCompleta.parametros;
      
      const parametrosExistentes = resultados.map(r => r.nombre_parametro.toLowerCase());
      const parametrosNuevos = parametros.filter(p => 
        !parametrosExistentes.includes(p.nombre_parametro.toLowerCase())
      );
      const parametrosConflicto = parametros.filter(p => 
        parametrosExistentes.includes(p.nombre_parametro.toLowerCase())
      );

      if (parametrosConflicto.length > 0 && parametrosNuevos.length === 0) {
        Swal.fire('Información', 'Todos los parámetros de esta plantilla ya existen en el examen.', 'info');
        setShowPlantillaModal(false);
        return;
      }

      setParametrosPlantilla(parametrosNuevos);
      
      const valoresIniciales = {};
      parametrosNuevos.forEach(param => {
        valoresIniciales[param.nombre_parametro] = {
          valor: param.valor_por_defecto || '',
          rango_referencia: param.rango_referencia || ''
        };
      });
      setValoresParametros(valoresIniciales);
      
      setShowPlantillaModal(false);
      setShowParametrosModal(true);
      
      if (parametrosConflicto.length > 0) {
        Swal.fire('Aviso', `${parametrosConflicto.length} parámetro(s) ya existe(n) y se omitirán.`, 'warning');
      }
      
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      Swal.fire('Error', 'No se pudo cargar la plantilla.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarResultados = () => {
    if (resultados.length === 0) {
      Swal.fire('Error', 'No hay resultados para editar.', 'error');
      return;
    }

    setModoEdicion(true);
    setParametrosPlantilla(resultados.map(r => ({
      nombre_parametro: r.nombre_parametro,
      unidad: r.unidad,
      id_resultado: r.id_resultado
    })));

    const valoresActuales = {};
    resultados.forEach(resultado => {
      valoresActuales[resultado.nombre_parametro] = {
        valor: resultado.valor || '',
        rango_referencia: resultado.rango_referencia || ''
      };
    });
    setValoresParametros(valoresActuales);
    
    setShowParametrosModal(true);
  };

  const handleParametroChange = (nombreParametro, campo, valor) => {
    setValoresParametros(prev => ({
      ...prev,
      [nombreParametro]: {
        ...prev[nombreParametro],
        [campo]: valor
      }
    }));
  };

  const handleGuardarParametros = async () => {
    try {
      setLoading(true);

      if (modoEdicion) {
        for (const parametro of parametrosPlantilla) {
          const valores = valoresParametros[parametro.nombre_parametro];
          const datosActualizados = {
            nombre_parametro: parametro.nombre_parametro,
            valor: valores.valor,
            unidad: parametro.unidad,
            rango_referencia: valores.rango_referencia
          };
          
          await mostrarResultadosExamenService.actualizarResultadoExamen(parametro.id_resultado, datosActualizados);
        }
        
        Swal.fire('Éxito', 'Todos los resultados han sido actualizados.', 'success');
      } else {
        for (const parametro of parametrosPlantilla) {
          const valores = valoresParametros[parametro.nombre_parametro];
          const nuevoResultado = {
            nombre_parametro: parametro.nombre_parametro,
            valor: valores.valor,
            unidad: parametro.unidad,
            rango_referencia: valores.rango_referencia
          };
          
          await mostrarResultadosExamenService.crearResultadoExamen(id_examen, nuevoResultado);
        }
        
        Swal.fire('Éxito', `Se crearon ${parametrosPlantilla.length} resultados desde la plantilla.`, 'success');
      }

      setShowParametrosModal(false);
      setParametrosPlantilla([]);
      setValoresParametros({});
      setPlantillaSeleccionada('');
      setSelectedRows([]);
      setToggleCleared(!toggleCleared);
      cargarResultados();
      
    } catch (error) {
      console.error('Error al guardar resultados:', error);
      Swal.fire('Error', 'No se pudieron guardar los resultados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // === FUNCIONES EXISTENTES ===
  const handleOpenAddModal = () => {
    setNewResultData({
      nombre_parametro: '',
      valor: '',
      unidad: '',
      rango_referencia: ''
    });
    setShowAddModal(true);
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewResultData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewResult = async () => {
    if (!newResultData.nombre_parametro?.trim()) {
      Swal.fire('Error', 'El nombre del resultado es requerido.', 'error');
      return;
    }

    try {
      await mostrarResultadosExamenService.crearResultadoExamen(id_examen, newResultData);
      Swal.fire('Éxito', 'Resultado agregado correctamente.', 'success');
      setShowAddModal(false);
      cargarResultados();
    } catch (error) {
      console.error('Error al guardar el nuevo resultado:', error);
      Swal.fire('Error', 'No se pudo agregar el resultado.', 'error');
    }
  };

  const handleDeleteResult = async () => {
    try {
      await mostrarResultadosExamenService.eliminarResultadoExamen(deleteRowId);
      Swal.fire('Éxito', 'Resultado eliminado correctamente.', 'success');
      setShowConfirmDeleteModal(false);
      setDeleteRowId(null);
      cargarResultados();
    } catch (error) {
      console.error('Error al eliminar el resultado:', error);
      Swal.fire('Error', 'No se pudo eliminar el resultado.', 'error');
    }
  };

  const handleMarcarComoCompletado = async () => {
    try {
      await mostrarResultadosExamenService.marcarExamenComoCompletadoService(id_examen);
      Swal.fire('Éxito', 'Examen marcado como completado.', 'success').then(() => {
        navigate('/examenes-pendientes'); 
      });
    } catch (error) {
      console.error('Error al marcar el examen como completado:', error);
      Swal.fire('Error', 'No se pudo marcar el examen como completado.', 'error');
    }
  };

  // === COMPONENTE PARA INFORMACIÓN DE SELECCIÓN ===
  const SelectionInfo = () => {
    if (selectedRows.length === 0) return null;

    return (
      <div className="mb-3 p-2 bg-light rounded border">
        <Badge bg="primary" className="me-2">
          {selectedRows.length} seleccionado{selectedRows.length > 1 ? 's' : ''}
        </Badge>
        <span className="text-muted small">
          {selectedRows.map(row => row.nombre_parametro).join(', ')}
        </span>
      </div>
    );
  };

  // === COLUMNAS DE LA TABLA ===
  const columns = [
    { 
      name: 'Resultado', 
      selector: row => row.nombre_parametro, 
      sortable: true,
      grow: 2
    },
    { 
      name: 'Valor', 
      selector: row => row.valor, 
      sortable: true,
      cell: row => (
        <span className={!row.valor || row.valor.trim() === '' ? 'text-muted fst-italic' : ''}>
          {row.valor || 'Sin valor'}
        </span>
      )
    },
    { 
      name: 'Unidad', 
      selector: row => row.unidad, 
      sortable: true 
    },
    { 
      name: 'Rango Referencia', 
      selector: row => row.rango_referencia, 
      sortable: true,
      cell: row => (
        <span className={!row.rango_referencia || row.rango_referencia.trim() === '' ? 'text-muted fst-italic' : ''}>
          {row.rango_referencia || 'Sin rango'}
        </span>
      )
    }
  ];

  if (loading) return <p>Cargando resultados...</p>;

  return (
    <Row>
      <Card title="Resultados del Examen">
        {/* Información del examen */}
        <div className="mb-3 p-3 bg-light rounded">
          <p className="mb-1"><strong>Paciente:</strong> {infoExamen.nombre_paciente} {infoExamen.apellido_paciente}</p>
          <p className="mb-1"><strong>Muestra:</strong> {infoExamen.nombre_muestra}</p>
          <p className="mb-0"><strong>Tipo de Examen:</strong> {infoExamen.nombre_examen}</p>
        </div>

        {/* Botones de acción principales */}
        <div className="mb-3 d-flex flex-wrap gap-2">
          {plantillasDisponibles.length > 0 && (
            <Button 
              variant="info" 
              onClick={handleOpenPlantillaModal} 
              disabled={loading}
            >
              <i className="fas fa-file-medical me-2"></i>
              Usar Plantilla ({plantillasDisponibles.length} disponible{plantillasDisponibles.length !== 1 ? 's' : ''})
            </Button>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleOpenAddModal} 
            disabled={loading}
          >
            <i className="fas fa-plus me-2"></i>
            Agregar Individual
          </Button>
          
          <Button 
            variant="success" 
            onClick={() => {
              if (resultados.length === 0) {
                Swal.fire('Error', 'Debe agregar al menos un resultado antes de completar el examen.', 'error');
                return;
              }
              setShowConfirmCompleteModal(true);
            }} 
            disabled={loading}
            className="ms-auto"
          >
            <i className="fas fa-check me-2"></i>
            Marcar como Completado
          </Button>
        </div>

        {/* Información sobre plantillas */}
        {plantillasDisponibles.length > 0 && resultados.length === 0 && (
          <Alert variant="info" className="mb-3">
            <i className="fas fa-lightbulb me-2"></i>
            <strong>Sugerencia:</strong> Use una plantilla para agregar rápidamente todos los parámetros estándar de este tipo de examen.
          </Alert>
        )}

        {/* Barra de información de selección */}
        <SelectionInfo />

        {/* Tabla de resultados */}
        <Container className="mb-3">
          <DataTable
            columns={columns}
            data={resultados}
            pagination
            striped
            highlightOnHover
            responsive
            dense
            progressPending={loading}
            selectableRows
            onSelectedRowsChange={handleRowSelected}
            clearSelectedRows={toggleCleared}
            selectableRowsHighlight
            selectableRowsNoSelectAll={true}
            selectableRowsComponent="input"
            selectableRowsComponentProps={{ 
              type: 'checkbox',
              style: { cursor: 'pointer' }
            }}
            selectableRowsSingle={false}
            noDataComponent={
              <div className="text-center p-4">
                <i className="fas fa-flask fa-3x text-muted mb-3"></i>
                <h5>No hay resultados registrados</h5>
                <p className="text-muted mb-3">Comience agregando resultados para este examen</p>
                <div>
                  {plantillasDisponibles.length > 0 && (
                    <Button 
                      variant="info" 
                      className="me-2" 
                      onClick={handleOpenPlantillaModal}
                    >
                      <i className="fas fa-file-medical me-2"></i>
                      Usar Plantilla
                    </Button>
                  )}
                  <Button 
                    variant="primary" 
                    onClick={handleOpenAddModal}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Agregar Primer Resultado
                  </Button>
                </div>
              </div>
            }
          />
        </Container>

        {/* Acciones para elementos seleccionados */}
        {resultados.length > 0 && (
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="checkbox"
                id="select-all-checkbox"
                label="Seleccionar Todo"
                checked={selectedRows.length === resultados.length && resultados.length > 0}
                onChange={handleSelectAll}
                disabled={loading}
              />
              
              {selectedRows.length > 0 && (
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedRows([]);
                    setToggleCleared(!toggleCleared);
                  }}
                >
                  <i className="fas fa-times me-1"></i>
                  Limpiar Selección
                </Button>
              )}
            </div>

            <div className="d-flex gap-2">
              <Button 
                variant="warning" 
                onClick={handleEditSelected}
                disabled={loading || selectedRows.length === 0}
              >
                <i className="fas fa-edit me-2"></i>
                Editar Resultado{selectedRows.length > 1 ? 's' : ''} 
                {selectedRows.length > 0 && `(${selectedRows.length})`}
              </Button>
              
              <Button 
                variant="danger" 
                onClick={handleDeleteSelected}
                disabled={loading || selectedRows.length === 0}
              >
                <i className="fas fa-trash me-2"></i>
                Eliminar Resultado{selectedRows.length > 1 ? 's' : ''} 
                {selectedRows.length > 0 && `(${selectedRows.length})`}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal para seleccionar plantilla */}
      <Modal show={showPlantillaModal} onHide={() => setShowPlantillaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Plantilla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Seleccione una plantilla para agregar los resultados predefinidos:</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Plantillas Disponibles</Form.Label>
            <Select
              options={plantillasDisponibles.map(plantilla => ({
                value: plantilla.id_plantilla,
                label: `${plantilla.nombre_plantilla}${plantilla.descripcion ? ` - ${plantilla.descripcion}` : ''}`
              }))}
              placeholder="Seleccionar plantilla..."
              value={plantillasDisponibles
                .map(plantilla => ({
                  value: plantilla.id_plantilla,
                  label: `${plantilla.nombre_plantilla}${plantilla.descripcion ? ` - ${plantilla.descripcion}` : ''}`
                }))
                .find(option => option.value === plantillaSeleccionada) || null
              }
              onChange={(option) => setPlantillaSeleccionada(option ? option.value : '')}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </Form.Group>

          {plantillaSeleccionada && (
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Próximo paso:</strong> Se mostrarán todos los resultados de la plantilla para que complete los valores y rangos de referencia.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlantillaModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSeleccionarPlantilla} 
            disabled={!plantillaSeleccionada || loading}
          >
            <i className="fas fa-arrow-right me-2"></i>
            Continuar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para completar parámetros */}
      <Modal show={showParametrosModal} onHide={() => setShowParametrosModal(false)} size="xl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Resultados' : 'Completar Resultados de la Plantilla'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {modoEdicion ? (
            <Alert variant="warning">
              <i className="fas fa-edit me-2"></i>
              <strong>Modo Edición:</strong> Modifique los valores y rangos de referencia según sea necesario.
            </Alert>
          ) : (
            <Alert variant="info">
              <i className="fas fa-magic me-2"></i>
              <strong>Complete los valores:</strong> Los nombres y unidades ya están predefinidos. Solo necesita llenar los valores y rangos de referencia.
            </Alert>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{width: '25%'}}>Resultado</th>
                <th style={{width: '15%'}}>Unidad</th>
                <th style={{width: '25%'}}>Valor</th>
                <th style={{width: '35%'}}>Rango de Referencia</th>
              </tr>
            </thead>
            <tbody>
              {parametrosPlantilla.map((parametro, index) => (
                <tr key={index}>
                  <td className="align-middle">
                    <strong>{parametro.nombre_parametro}</strong>
                  </td>
                  <td className="align-middle">
                    <small className="text-muted">{parametro.unidad}</small>
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Ingrese el valor"
                      value={valoresParametros[parametro.nombre_parametro]?.valor || ''}
                      onChange={(e) => handleParametroChange(parametro.nombre_parametro, 'valor', e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Ej: 13.0 - 17.0, < 100, Normal"
                      value={valoresParametros[parametro.nombre_parametro]?.rango_referencia || ''}
                      onChange={(e) => handleParametroChange(parametro.nombre_parametro, 'rango_referencia', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Tip: Puede dejar campos vacíos y completarlos después si es necesario.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowParametrosModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleGuardarParametros} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {modoEdicion ? 'Actualizar Resultados' : 'Crear Resultados'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Agregar Resultado Individual */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Resultado Individual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Resultado *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Hemoglobina, Glucosa, etc."
                name="nombre_parametro"
                value={newResultData.nombre_parametro || ''}
                onChange={handleAddInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: 14.5, 95, Normal"
                name="valor"
                value={newResultData.valor || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unidad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: g/dL, mg/dL, %, UI/L"
                name="unidad"
                value={newResultData.unidad || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rango de Referencia</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: 13.0 - 17.0, < 100, Normal"
                name="rango_referencia"
                value={newResultData.rango_referencia || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveNewResult} disabled={loading}>
            <i className="fas fa-save me-2"></i>
            Guardar Resultado
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Eliminar Uno */}
      <Modal show={showConfirmDeleteModal} onHide={() => setShowConfirmDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <i className="fas fa-exclamation-triangle text-warning me-2"></i>
          ¿Estás seguro de que deseas eliminar este resultado?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteResult} disabled={loading}>
            <i className="fas fa-trash me-2"></i>
            Sí, Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Eliminar Múltiples */}
      <Modal show={showConfirmDeleteMultipleModal} onHide={() => setShowConfirmDeleteMultipleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación Múltiple</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            ¿Estás seguro de que deseas eliminar <strong>{selectedRows.length}</strong> resultado{selectedRows.length > 1 ? 's' : ''}?
          </div>
          
          <div className="bg-light p-3 rounded">
            <h6 className="mb-2">Resultados a eliminar:</h6>
            <ul className="mb-0">
              {selectedRows.map((row, index) => (
                <li key={index}>{row.nombre_parametro}</li>
              ))}
            </ul>
          </div>
          
          <Alert variant="warning" className="mt-3 mb-0">
            <small>
              <i className="fas fa-info-circle me-1"></i>
              Esta acción no se puede deshacer.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDeleteMultipleModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteMultiple} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Eliminando...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i>
                Sí, Eliminar {selectedRows.length} Resultado{selectedRows.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Completar */}
      <Modal show={showConfirmCompleteModal} onHide={() => setShowConfirmCompleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Completar Examen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <i className="fas fa-check-circle text-success me-2"></i>
          ¿Estás seguro de que el examen está completo y listo para ser reportado?
          <hr />
          <small className="text-muted">
            Una vez marcado como completado, el examen aparecerá en la lista de exámenes terminados 
            y se podrá generar el reporte final.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmCompleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleMarcarComoCompletado} disabled={loading}>
            <i className="fas fa-check me-2"></i>
            Sí, Completar Examen
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos adicionales */}
      <style jsx>{`
        .rdt_TableRow[aria-selected="true"] {
          background-color: #e3f2fd !important;
        }
        
        .rdt_TableRow[aria-selected="true"]:hover {
          background-color: #bbdefb !important;
        }
        
        .actions-toolbar {
          transition: all 0.3s ease;
        }
        
        .badge {
          font-size: 0.75em;
        }
        
        .table-responsive {
          border-radius: 0.375rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        /* Estilos para react-select */
        .react-select-container .react-select__control {
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          min-height: 38px;
        }
        
        .react-select-container .react-select__control:hover {
          border-color: #86b7fe;
        }
        
        .react-select-container .react-select__control--is-focused {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .react-select-container .react-select__option--is-selected {
          background-color: #0d6efd;
        }
        
        .react-select-container .react-select__option--is-focused {
          background-color: #e7f1ff;
        }
        
        .react-select-container .react-select__placeholder {
          color: #6c757d;
        }
        
        .react-select-container .react-select__single-value {
          color: #212529;
        }
      `}</style>
    </Row>
  );
};

export default ResultadosExamen;