import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { swapAPI } from '../services/api';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      swapAPI.getAll()
        .then(res => {
          const pending = (res.data || []).filter(s => 
            s.status === 'Pending' && s.receiver?._id === user._id
          ).length;
          setPendingCount(pending);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm mb-4" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">🔄 SwapStyle</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/listings">Browse</Nav.Link>
            <Nav.Link as={Link} to="/community">Community</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

                
                <Nav.Link as={Link} to="/swaps">
                  Swaps {pendingCount > 0 && (
                    <Badge bg="danger" pill>{pendingCount}</Badge>
                  )}
                </Nav.Link>

               
                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin">
                    Admin
                  </Nav.Link>
                )}

                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}