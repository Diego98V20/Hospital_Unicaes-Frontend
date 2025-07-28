import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const JWTLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar u ocultar la contraseña

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await axios.post('http://localhost:8081/auth/login', values, {
        withCredentials: true
      });

      if (res.status === 200 && res.data.message === 'Success') {
        Swal.fire({
          title: 'Éxito',
          text: 'Inicio de sesión exitoso!',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Credenciales incorrectas!',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        setErrors({ submit: 'Credenciales incorrectas' });
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        Swal.fire({
          title: 'Error',
          text: 'Credenciales incorrectas!',
          icon: 'error',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        setErrors({ submit: 'Credenciales incorrectas' });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar tu solicitud.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        console.error("Error en la solicitud:", err);
        setErrors({ submit: 'Ocurrió un error al procesar tu solicitud' });
      }
    } finally {
      setSubmitting(false);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Debe ser un email válido').max(255).required('El email es requerido'),
        password: Yup.string().max(255).required('La contraseña es requerida')
      })}
      onSubmit={handleSubmit}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              placeholder="usuario@gmail.com"
              value={values.email}
            />
            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
          </div>
          <div className="form-group mb-4 position-relative">
          <input
            className="form-control"
            name="password"
            onBlur={handleBlur}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={values.password}
          />
          
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="position-absolute"
            style={{
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)', 
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer' 
            }}
          >
            {showPassword ? (
              <i className="fa fa-eye-slash" aria-hidden="true"></i> 
            ) : (
              <i className="fa fa-eye" aria-hidden="true"></i>
            )}
          </button>
          {touched.password && errors.password && (
            <small className="text-danger form-text">{errors.password}</small>
          )}
        </div>


          {errors.submit && (
            <Col sm={12}>
              <Alert variant="danger">{errors.submit}</Alert>
            </Col>
          )}

          <Row>
            <Col>
              <Button
                className="btn-block mb-4"
                color="primary"
                disabled={isSubmitting}
                size="large"
                type="submit"
                variant="primary"
              >
                Iniciar Sesión
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;
