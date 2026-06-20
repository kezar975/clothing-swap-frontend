import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      const msg = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Login failed - Check email and password';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card className="p-4">
        <h3 className="text-center mb-4">Login</h3>


        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}


        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>


          <Button
            className="w-100"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>

        <p className="text-center mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p className="text-center mt-3">
          New here? <Link to="/register">Register</Link>
        </p>
      </Card>
    </Container>
  );
}