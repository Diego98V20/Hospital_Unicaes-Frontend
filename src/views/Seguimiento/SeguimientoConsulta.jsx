import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Table, Spinner } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { useAuth } from 'components/AuthContext';
import { seguimientoService } from '../../services/seguimientoService';

const SeguimientoConsulta = () => {
  const { id_consulta } = useParams();
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Filtros
  const [filtroNombreMed, setFiltroNombreMed] = useState('');
  const [filtroNombreExamen, setFiltroNombreExamen] = useState('');
  const [filtroFechaExamen, setFiltroFechaExamen] = useState('');
  
  useEffect(() => {
    const fetchSeguimiento = async () => {
      try {
        const data = await seguimientoService.getSeguimientoConsulta(id_consulta);
        setSeguimiento(data);
      } catch (error) {
        console.error('Error al obtener datos de seguimiento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeguimiento();
  }, [id_consulta]);

  if (loading) {
    return <p>Cargando tus consultas...</p>;
  }

  // Aplicar filtros
  const medicamentosFiltrados = seguimiento.medicamentos?.filter((med) =>
    med.nombre_medicamento.toLowerCase().includes(filtroNombreMed.toLowerCase())
  ) || [];

  const examenesFiltrados = seguimiento.examenes?.filter((ex) => {
    const coincideNombre = ex.nombre_examen.toLowerCase().includes(filtroNombreExamen.toLowerCase());
    const coincideFecha = !filtroFechaExamen || (ex.fecha_solicitud && ex.fecha_solicitud.startsWith(filtroFechaExamen));
    return coincideNombre && coincideFecha;
  }) || [];

  //Fecha
  const fechaNacimiento = new Date(seguimiento.fecha_nacimiento_paciente);
  const fechaFormateada = fechaNacimiento.toLocaleDateString('es-ES');
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Seguimiento de la Consulta" isOption>
            <h5 className="mt-4">Información del Paciente</h5>
            <Table bordered responsive>
            <tbody>
              <tr>
                <th>Nombre</th>
                <td>{seguimiento.nombre_paciente}</td>
                <th>DUI</th>
                <td>{seguimiento.dui_paciente}</td>
              </tr>
              <tr>
                <th>Edad</th>
                <td>{seguimiento.edad}</td>
                <th>Sexo</th>
                <td>{seguimiento.sexo_paciente}</td>
              </tr>
              <tr>
                <th>Fecha de Nacimiento</th>
                <td>{fechaFormateada}</td>
                <th>Teléfono</th>
                <td>{seguimiento.telefono_paciente}</td>
              </tr>
              <tr>
                <th>Dirección</th>
                <td colSpan={3}>{seguimiento.direccion_paciente}</td>
              </tr>
            </tbody>
          </Table>

            {/* Filtro medicamentos */}
            <h6 className="mt-4">Medicamentos Recetados</h6>
            <input
              type="text"
              placeholder="Buscar medicamento"
              className="form-control mb-2 w-50"
              value={filtroNombreMed}
              onChange={(e) => setFiltroNombreMed(e.target.value)}
            />
            {medicamentosFiltrados.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Cantidad</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                     <th>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosFiltrados.map((med, idx) => (
                    <tr key={idx}>
                      <td>{med.nombre_medicamento}</td>
                      <td>{med.cantidad}</td>
                      <td>{med.dosis}</td>
                      <td>{med.frecuencia}</td>
                      <td>{med.duracion}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No se encontraron medicamentos con ese nombre.</p>
            )}

            {/* Filtro exámenes */}
            <h6 className="mt-4">Exámenes Realizados</h6>
            <div className="d-flex gap-3 flex-wrap mb-2">
              <input
                type="text"
                placeholder="Buscar examen"
                className="form-control"
                style={{ maxWidth: '250px' }}
                value={filtroNombreExamen}
                onChange={(e) => setFiltroNombreExamen(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: '200px' }}
                value={filtroFechaExamen}
                onChange={(e) => setFiltroFechaExamen(e.target.value)}
              />
            </div>
            {examenesFiltrados.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Examen</th>
                    <th>Parámetro</th>
                    <th>Valor</th>
                    <th>Unidad</th>
                    <th>Rango de Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {examenesFiltrados.map((ex, idx) => (
                    <tr key={idx}>
                      <td>{ex.nombre_examen}</td>
                      <td>{ex.nombre_parametro || 'Pendiente'}</td>
                      <td>{ex.valor || 'Pendiente'}</td>
                      <td>{ex.unidad || 'Pendiente'}</td>
                      <td>{ex.rango_referencia || 'Pendiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No se encontraron exámenes que coincidan con los filtros.</p>
            )}
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SeguimientoConsulta;

