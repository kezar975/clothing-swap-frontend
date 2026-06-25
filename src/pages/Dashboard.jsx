import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clothingAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../services/api';

const API_BASE = 'https://clothing-swap-backend.onrender.com';
const clothingTypes = ['T-Shirt', 'Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Other'];

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'T-Shirt', brand: '', size: '',
    condition: 'Good', estimatedValue: '', description: '', city: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const fetchItems = async () => {
    try {
      const res = await clothingAPI.getAll();
      setItems(res.data.clothes.filter(i => i.owner?._id === user?._id));
    } catch { }
  };

  useEffect(() => { fetchItems(); }, [user]);

  const validate = (isEdit = false) => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.size.trim()) e.size = 'Size required';
    if (!form.estimatedValue) e.estimatedValue = 'Value required';
    if (!form.description.trim()) e.description = 'Description required';
    if (!form.city.trim()) e.city = 'City required';
    if (!isEdit && !imageFile) e.image = 'Image required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate(false)) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);
      await api.post('/clothes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg({ type: 'success', text: 'Item listed!' });
      setShowAdd(false);
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      fetchItems();
    } catch {
      setMsg({ type: 'danger', text: 'Failed to create listing' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validate(true)) return;
    try {
      if (editImageFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        formData.append('image', editImageFile);
        await api.put(`/clothes/${editItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await clothingAPI.update(editItem._id, { ...form, images: editItem.images });
      }
      setMsg({ type: 'success', text: 'Item updated!' });
      setShowEdit(false);
      setErrors({});
      fetchItems();
    } catch {
      setMsg({ type: 'danger', text: 'Failed to update' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await clothingAPI.delete(id);
      setMsg({ type: 'success', text: 'Listing removed' });
      fetchItems();
    } catch {
      setMsg({ type: 'danger', text: 'Failed to delete' });
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title, type: item.type, brand: item.brand || '',
      size: item.size, condition: item.condition,
      estimatedValue: item.estimatedValue, description: item.description || '',
      city: item.location?.city || ''
    });
    setEditImageFile(null);
    setEditImagePreview(null);
    setErrors({});
    setShowEdit(true);
  };

  const renderFormFields = (isEdit) => (
    <>
      <Form.Group className="mb-2">
        <Form.Label>Title *</Form.Label>
        <Form.Control
          placeholder="e.g. Blue Denim Jacket"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          isInvalid={!!errors.title}
        />
        <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Type *</Form.Label>
        <Form.Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {clothingTypes.map(t => <option key={t}>{t}</option>)}
        </Form.Select>
      </Form.Group>

      <Row className="mb-2">
        <Col>
          <Form.Group>
            <Form.Label>Brand</Form.Label>
            <Form.Control
              placeholder="Nike, Zara..."
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Size *</Form.Label>
            <Form.Control
              placeholder="S, M, L, XL..."
              value={form.size}
              onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
              isInvalid={!!errors.size}
            />
            <Form.Control.Feedback type="invalid">{errors.size}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col>
          <Form.Group>
            <Form.Label>Condition *</Form.Label>
            <Form.Select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Value (₹) *</Form.Label>
            <Form.Control
              type="number"
              placeholder="500"
              value={form.estimatedValue}
              onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))}
              isInvalid={!!errors.estimatedValue}
            />
            <Form.Control.Feedback type="invalid">{errors.estimatedValue}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-2">
        <Form.Label>Description *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Describe your item — fabric, condition details, why swapping..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>City *</Form.Label>
        <Form.Control
          placeholder="Mumbai, Delhi..."
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          isInvalid={!!errors.city}
        />
        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Image * {isEdit && '(Upload new to replace)'}</Form.Label>
        {isEdit && editItem?.images?.[0] && !editImagePreview && (
          <div className="mb-2">
            <img
              src={editItem.images[0].startsWith('http') ? editItem.images[0] : `${API_BASE}${editItem.images[0]}`}
              alt="Current"
              style={{ height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <small className="d-block text-muted mt-1">Current image</small>
          </div>
        )}
        <Form.Control
          type="file"
          accept="image/*"
          onChange={isEdit
            ? (e) => {
              const file = e.target.files[0];
              if (file) {
                setEditImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setEditImagePreview(reader.result);
                reader.readAsDataURL(file);
              }
            }
            : (e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
              }
            }
          }
          isInvalid={!!errors.image}
        />
        <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
        <Form.Text className="text-muted">JPEG, PNG, WebP (Max 5MB)</Form.Text>

        {(isEdit ? editImagePreview : imagePreview) && (
          <img
            src={isEdit ? editImagePreview : imagePreview}
            alt="Preview"
            className="mt-2 d-block"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
          />
        )}
      </Form.Group>
    </>
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name} 👋</h2>
        <Button onClick={() => {
          setForm({ title: '', type: 'T-Shirt', brand: '', size: '', condition: 'Good', estimatedValue: '', description: '', city: '' });
          setImageFile(null); setImagePreview(null); setErrors({});
          setShowAdd(true);
        }}>+ Add New Item</Button>
      </div>

      {msg.text && <Alert variant={msg.type} dismissible onClose={() => setMsg({})}>{msg.text}</Alert>}

      <Row xs={1} md={3} className="g-4">
        {items.map(item => (
          <Col key={item._id}>
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${API_BASE}${item.images[0]}`}
                style={{ height: '150px', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'; }}
              />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Badge bg={item.status === 'Available' ? 'success' : 'secondary'}>{item.status}</Badge>
                <div className="d-flex gap-2 mt-2">
                  <Button size="sm" variant="outline-primary" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item._id)}>Delete</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {items.length === 0 && <p className="text-center mt-4 text-muted">No items yet. Add your first item!</p>}

      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>List New Item</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            {renderFormFields(false)}
            <Button type="submit" className="w-100">Publish Listing</Button>
          </Form>
        </Modal.Body>
      </Modal>

      
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Edit Item</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            {renderFormFields(true)}
            <Button type="submit" className="w-100">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}