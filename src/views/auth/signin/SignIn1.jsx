import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import AuthLogin from './JWTLogin';
import { color } from 'd3';

const Signin1 = () => {
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <div className="mb-3">
               
                <img src="./src/assets/images/UNICAES_Logo.png" alt="Logo" style={{ width: '160px', height: '160px' }} />
              </div>
              <p className="mb-4 fw-bold" style={{color: '#9a2921'}}>
                Hospital Unicaes{' '}
              </p>
              <AuthLogin />
           
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
