import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import NavGroup from './NavGroup';
import { useAuth } from 'components/AuthContext';


const NavContent = ({ navigation }) => {
  const { user } = useAuth(); 

  const filterNavItems = (items) => {
    return items.reduce((filteredItems, item) => {
    
      if (item.roles && (!user || !item.roles.includes(user.rol))) {
        return filteredItems; 
      }

    
      if (item.children) {
        const filteredChildren = filterNavItems(item.children);
        if (filteredChildren.length > 0) {
     
          filteredItems.push({ ...item, children: filteredChildren });
        }
      } else {
     
        filteredItems.push(item);
      }

      return filteredItems;
    }, []);
  };

  const navItems = filterNavItems(navigation).map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={'nav-group-' + item.id} group={item} />;
      default:
        return null; // Devuelve null si no es un tipo conocido
    }
  });

  return (
    <div className="navbar-content datta-scroll">
      <PerfectScrollbar>
        <ListGroup variant="flush" as="ul" bsPrefix=" " className="nav pcoded-inner-navbar" id="nav-ps-next">
          {navItems}
        </ListGroup>
      </PerfectScrollbar>
    </div>
  );
};

NavContent.propTypes = {
  navigation: PropTypes.array
};

export default NavContent;