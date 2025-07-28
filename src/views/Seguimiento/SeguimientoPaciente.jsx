import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Table, Spinner } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { useAuth } from 'components/AuthContext';
import { seguimientoService } from '../../services/seguimientoService';

const SeguimientoPaciente = () => {
  const { id_paciente } = useParams();
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  const [filtroNombreMed, setFiltroNombreMed] = useState('');
  const [filtroNombreExamen, setFiltroNombreExamen] = useState('');
  const [filtroFechaExamen, setFiltroFechaExamen] = useState('');

  useEffect(() => {
    const fetchSeguimiento = async () => {
      try {
        const data = await seguimientoService.getSeguimientoPaciente(id_paciente);
        setSeguimiento(data);
      } catch (err) {
        console.error('Error al obtener datos del paciente:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id_paciente) {
      fetchSeguimiento();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [id_paciente]);

  if (loading) return <p>Cargando datos del paciente...</p>;
  if (error || !seguimiento) return <p>No se pudo cargar la información del paciente.</p>;

  const medicamentosFiltrados = seguimiento.medicamentos?.filter((med) =>
    med.nombre_medicamento.toLowerCase().includes(filtroNombreMed.toLowerCase())
  ) || [];

  const examenesFiltrados = seguimiento.examenes?.filter((ex) => {
    const coincideNombre = ex.nombre_examen?.toLowerCase().includes(filtroNombreExamen.toLowerCase());
    const coincideFecha = !filtroFechaExamen || (ex.fecha_solicitud && ex.fecha_solicitud.startsWith(filtroFechaExamen));
    return coincideNombre && coincideFecha;
  }) || [];

  const fechaNacimiento = seguimiento.fecha_nacimiento_paciente
    ? new Date(seguimiento.fecha_nacimiento_paciente).toLocaleDateString('es-ES')
    : 'N/A';

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Seguimiento del Paciente" isOption>
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
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosFiltrados.map((med, idx) => (
                    <tr key={idx}>
                      <td>{med.nombre_medicamento}</td>
                      <td>{med.dosis}</td>
                      <td>{med.frecuencia}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No se encontraron medicamentos.</p>
            )}

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
              <p>No se encontraron exámenes.</p>
            )}
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SeguimientoPaciente;
