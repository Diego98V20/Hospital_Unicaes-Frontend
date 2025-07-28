import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Spinner, Button  } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { consultaService } from '../../services/consultaService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';

const DetallesConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const data = await consultaService.getConsultasRealizadas();
        setConsultas(data);
      } catch (error) {
        console.error('Error al cargar las consultas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  if (loading) {
    return <p>Cargando tus consultas...</p>;
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card title="Consultas Realizadas" isOption>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Expediente</th>
                    <th>Paciente</th>
                    <th>Motivo de Consulta</th>
                    <th>Fecha de la Consulta</th>
                    <th>Especialidad</th>
                    <th>Tipo de Consulta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.length > 0 ? (
                    consultas.map((consulta, index) => (
                      
                      <tr key={index}>
                        <td>{consulta.n_expediente}</td>
                        <td>{consulta.nombre_paciente}</td>
                        <td>{consulta.motivo_consulta}</td>
                        <td>
                          {new Date(consulta.fecha_consulta).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td>{consulta.nombre_especialidad}</td>
                        <td>{consulta.nombre_tipo_consulta}</td>
                        <td>
                          {console.log("Consulta:", consulta)}
                        <Button
                          className="bg-blue-600 text-white px-3 py-1 rounded-md"
                          
                          onClick={() => navigate(`/seguimiento-consulta/${consulta.id_consulta}`)}
                        >
                          Seguimiento
                        </Button>
                      </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No hay consultas realizadas.</td>
                    </tr>
                  )}
                </tbody>


              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DetallesConsultas;
