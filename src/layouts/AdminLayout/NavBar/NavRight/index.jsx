import React, { useEffect, useState } from 'react';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';

import axios from 'axios';
import Swal from 'sweetalert2';

import avatar2 from '../../../../assets/images/user/avatar-2.jpg';

const NavRight = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8081/auth/logout',
        {},
        {
          withCredentials: true
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada con éxito',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión',
        position: 'top-end',
        timer: 1500
      });
    }
  };

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown align={'end'} className="drp-user">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="icon feather icon-settings" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head">
                <img src={avatar2} className="img-radius" alt="User Profile" />
                {user ? (
                  <>
                 
                    <span style={{color: "white"}}>
                      {user.nombre} {user.apellido} </span>                   
                  </>
                ) : (
                  <span>Cargando...</span>
                )}

              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="/perfil" className="dropdown-item" style={{ color: '#3f4d67' }}>
                    <i className="feather icon-user" /> Perfil
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" style={{ color: '#3f4d67' }} title="Salir" onClick={handleLogout}>
                    <i className="feather icon-log-out" />
                    Cerrar Sesión
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>
    </React.Fragment>
  );
};

export default NavRight;
