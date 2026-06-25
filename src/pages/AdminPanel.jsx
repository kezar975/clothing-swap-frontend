import { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Alert, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { adminAPI } from '../services/api';

export default function AdminPanel() {
  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [l, s, u, a] = await Promise.all([
          adminAPI.getListings(),
          adminAPI.getSwaps(),
          adminAPI.getUsers(),
          adminAPI.getAnalytics()
        ]);
        setListings(l.data.listings);
        setSwaps(s.data.swaps);
        setUsers(u.data.users);
        setAnalytics(a.data);
      } catch {
        setMsg({ type: 'danger', text: 'Failed to load data' });
      }
    };
    fetchAll();
  }, []);

  const handleRemoveListing = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    try {
      await adminAPI.removeListing(id);
      setListings(prev => prev.filter(i => i._id !== id));
      setMsg({ type: 'success', text: 'Listing removed successfully' });
    } catch {
      setMsg({ type: 'danger', text: 'Failed to remove listing' });
    }
  };

  const handleBanUser = async (id, isBanned) => {
    try {
      await adminAPI.banUser(id, isBanned);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned } : u));
      setMsg({ type: 'success', text: `User ${isBanned ? 'banned' : 'unbanned'} successfully` });
    } catch {
      setMsg({ type: 'danger', text: 'Failed to update user' });
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🛡️ Admin Dashboard</h2>
      
      {msg.text && (
        <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      <Row className="mb-4 g-3">
        <Col md={2} sm={4}>
          <Card className="p-3 text-center bg-primary text-white">
            <h3>{analytics?.totalUsers || 0}</h3>
            <p className="mb-0 small">Total Users</p>
          </Card>
        </Col>
        <Col md={2} sm={4}>
          <Card className="p-3 text-center bg-info text-white">
            <h3>{analytics?.totalListings || 0}</h3>
            <p className="mb-0 small">Total Listings</p>
          </Card>
        </Col>
        <Col md={2} sm={4}>
          <Card className="p-3 text-center bg-warning text-white">
            <h3>{analytics?.totalSwaps || 0}</h3>
            <p className="mb-0 small">Total Swaps</p>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="p-3 text-center bg-success text-white">
            <h3>{analytics?.completedSwaps || 0}</h3>
            <p className="mb-0 small">Completed</p>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="p-3 text-center bg-secondary text-white">
            <h3>{analytics?.pendingSwaps || 0}</h3>
            <p className="mb-0 small">Pending</p>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="listings" className="mb-4">
        
        <Tab eventKey="listings" title="📦 Listings">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>City</th>
                <th>Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(i => (
                <tr key={i._id}>
                  <td>{i.title}</td>
                  <td>{i.owner?.name || 'N/A'}<br/><small className="text-muted">{i.owner?.email}</small></td>
                  <td>{i.location?.city || 'N/A'}</td>
                  <td>₹{i.estimatedValue}</td>
                  <td><Badge bg={i.status === 'Available' ? 'success' : 'secondary'}>{i.status}</Badge></td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => handleRemoveListing(i._id)}>
                      🗑️ Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="users" title="👥 Users">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.location?.city || 'N/A'}</td>
                  <td><Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>{u.role}</Badge></td>
                  <td>
                    <Badge bg={u.isBanned ? 'danger' : 'success'}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant={u.isBanned ? 'success' : 'warning'}
                        onClick={() => handleBanUser(u._id, !u.isBanned)}
                      >
                        {u.isBanned ? '✅ Unban' : '🚫 Ban'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>


        <Tab eventKey="swaps" title="🔄 Swaps">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Items</th>
                <th>Users</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {swaps.map(s => (
                <tr key={s._id}>
                  <td>{s.item1?.title} ↔ {s.item2?.title}</td>
                  <td>{s.sender?.name} ↔ {s.receiver?.name}</td>
                  <td>
                    <Badge bg={
                      s.status === 'Completed' ? 'success' :
                      s.status === 'Pending' ? 'warning' :
                      s.status === 'Accepted' ? 'info' : 'secondary'
                    }>
                      {s.status}
                    </Badge>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

      </Tabs>
    </Container>
  );
}