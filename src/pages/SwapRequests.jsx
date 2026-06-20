import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { swapAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Col, Row, Button, Badge, Alert, Spinner } from 'react-bootstrap';

export default function SwapRequests() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await swapAPI.getAll();
        setSwaps(res.data || []);
      } catch {
        setMsg({ type: 'danger', text: 'Failed to load swaps' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await swapAPI.updateStatus(id, status);
      
      
      setSwaps(prev => prev.map(s => 
        s._id === id ? { ...s, status } : s
      ));

      if (status === 'Accepted') {
        setMsg({ type: 'success', text: '✅ Swap accepted! Now you can chat.' });
      } else if (status === 'Rejected') {
        setMsg({ type: 'warning', text: '❌ Swap rejected.' });
      } else if (status === 'Completed') {
        setMsg({ type: 'success', text: '🎉 Swap completed!' });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Action failed';
      setMsg({ type: 'danger', text: errMsg });
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-2 text-muted">Loading swaps...</p>
    </Container>
  );

  return (
    <Container>
      <h3 className="mb-4">My Swap Requests</h3>
      {msg.text && (
        <Alert variant={msg.type} dismissible onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      {swaps.length === 0 ? (
        <p className="text-center text-muted">No swap requests yet.</p>
      ) : (
        <Row className="g-3">
          {swaps.map(s => {
            const item1 = s.item1 || { title: 'Unknown Item', estimatedValue: 0 };
            const item2 = s.item2 || { title: 'Unknown Item', estimatedValue: 0 };
            const sender = s.sender || { name: 'Unknown' };
            const receiver = s.receiver || { name: 'Unknown' };

           
            const isReceiver = user?._id === receiver?._id;
            const isSender = user?._id === sender?._id;

            return (
              <Col key={s._id} xs={12}>
                <Card className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <Badge bg={
                      s.status === 'Pending' ? 'warning' :
                      s.status === 'Accepted' ? 'success' :
                      s.status === 'Completed' ? 'info' : 'secondary'
                    }>
                      {s.status || 'Unknown'}
                    </Badge>
                    <small className="text-muted">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                    </small>
                  </div>

                  <p className="mb-2">
                    <strong>Item 1:</strong> {item1.title} (₹{item1.estimatedValue}) ↔
                    <strong> Item 2:</strong> {item2.title} (₹{item2.estimatedValue})
                  </p>

                  <p className="mb-2 text-muted small">
                    {isSender ? '📤 You sent this request' : '📥 You received this request'}
                  </p>

                  <p className="mb-3 text-muted small">
                    {sender.name} ↔ {receiver.name}
                  </p>

                 
                  {s.status === 'Rejected' && (
                    <Alert variant="danger" className="mb-0 small py-2">
                      {isSender 
                        ? '❌ Your swap request was rejected.' 
                        : '❌ You rejected this swap request.'}
                    </Alert>
                  )}

                  
                  {s.status === 'Pending' && (
                    <div className="d-flex gap-2 flex-wrap">
                      {isReceiver ? (
                        <>
                          <Button size="sm" variant="success" onClick={() => handleAction(s._id, 'Accepted')}>
                            ✅ Accept
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleAction(s._id, 'Rejected')}>
                            ❌ Reject
                          </Button>
                        </>
                      ) : (
                        <Badge bg="warning" text="dark">⏳ Waiting for response...</Badge>
                      )}
                    </div>
                  )}

                
                  {s.status === 'Accepted' && (
                    <div className="d-flex gap-2 flex-wrap">
                      <Button size="sm" variant="primary" onClick={() => navigate(`/chat/${s._id}`)}>
                        💬 Open Chat
                      </Button>
                      <Button size="sm" variant="success" onClick={() => handleAction(s._id, 'Completed')}>
                        ✅ Mark Completed
                      </Button>
                      <Link to={`/courier/${s._id}`} className="btn btn-sm btn-info">
                        📦 Courier
                      </Link>
                    </div>
                  )}

                  {s.status === 'Completed' && (
                    <Badge bg="success">🎉 Completed</Badge>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}