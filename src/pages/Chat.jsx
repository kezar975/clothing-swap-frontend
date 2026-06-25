import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { swapAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';

export default function Chat() {
  const { swapId } = useParams();
  const [swap, setSwap] = useState(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSwap = async () => {
    try {
      const res = await swapAPI.getById(swapId); 
      setSwap(res.data.swap || res.data);
    } catch {
      setMsg('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSwap(); }, [swapId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await swapAPI.sendMessage(swapId, text);
      setText('');
      fetchSwap(); 
    } catch {
      setMsg('Failed to send message');
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-2">Loading chat...</p>
    </Container>
  );

  if (!swap) return (
    <Container className="text-center mt-5">
      <Alert variant="danger">{msg || 'Chat not found'}</Alert>
    </Container>
  );

  return (
    <Container style={{ maxWidth: '600px' }} className="mt-4">
      <h4 className="mb-3">
        💬 {swap.item1?.title || 'Item 1'} ↔ {swap.item2?.title || 'Item 2'}
      </h4>
      
      {msg && <Alert variant="danger">{msg}</Alert>}
      
      <Card className="mb-3" style={{ height: '400px', overflowY: 'auto' }}>
        <ListGroup variant="flush">
          {swap.messages?.length === 0 ? (
            <ListGroup.Item className="text-center text-muted py-4">
              No messages yet. Start the conversation!
            </ListGroup.Item>
          ) : (
            swap.messages?.map((m, i) => (
              <ListGroup.Item
                key={i}
                className={m.sender === user._id ? 'text-end bg-light' : ''}
              >
                <strong>{m.sender === user._id ? 'You' : 'Other'}:</strong> {m.text}
                <div className="text-muted small">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>

      <Form onSubmit={handleSend} className="d-flex gap-2">
        <Form.Control
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </Form>
    </Container>
  );
}