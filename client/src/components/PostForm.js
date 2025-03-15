import React, { useEffect, useState } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ComponentCard from './ComponentCard';
import './PostForm.css';

function PostForm() {
  const [fileError, setFileError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]); // State for image preview URLs
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    content: '',
    category: '',
    privacy: 'public',
    user_id: userId,
    medias: [] // Store actual files for upload
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/categories/`);
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup object URLs when the component unmounts
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleFileChange = (e) => {
    const { files } = e.target;
    console.log('Raw files:', files);
    if (files.length > 0) {
      const newImages = Array.from(files).slice(0, 3 - imagePreviews.length);
      console.log('New images:', newImages);

      if (newImages.length === 0) {
        setFileError('You can only upload up to 3 images.');
        return;
      }

      const validImages = newImages.filter((file) => file.type.startsWith('image/'));
      if (validImages.length === 0) {
        setFileError('Please upload valid image files.');
        return;
      }

      const newPreviews = validImages.map((file) => URL.createObjectURL(file));

      // Update both previews and form data
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setFormData(prev => ({
        ...prev,
        medias: [...prev.medias, ...validImages] // Add the actual File objects
      }));

      setFileError('');
      console.log('Updated formData.images:', [...formData.medias, ...validImages]); // Add this

    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('user_id', formData.user_id);

      // Append each image file
      formData.medias.forEach((file) => {
        formDataToSend.append('medias', file);
      });

      console.log('Form Data:', {
        content: formData.content,
        category: formData.category,
        privacy: formData.privacy,
        user_id: formData.user_id,
        medias: formData.medias
      });
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/create`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        Swal.fire('Success', "Đăng bài thành công!", 'success');
        // Reset form
        setFormData({
          content: '',
          category: '',
          privacy: 'public',
          user_id: '',
          medias: []
        });
        setImagePreviews([]);
        navigate('/');
      }

    } catch (error) {
      console.error('Error creating post:', error);
      Swal.fire('Đăng bài thất bại', error.response?.data?.message || error.message, 'error');
    }
  };

  return (
    <div>
      <Row>
        <ComponentCard>
          <Col md="12">
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Content</Label>
                <Input
                  type="textarea"
                  name="content"
                  rows="5"
                  value={formData.content}
                  onChange={handleInputChange}

                />
              </FormGroup>
              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}

                >
                  <option value="">Select Post Category</option>
                  {categories.map((c) => (
                    <option value={c.name}>{c.name}</option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="exampleFile">Choose image File</Label>
                <Input
                  type="file"
                  id="exampleFile"
                  name="medias" // Make sure this matches
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple
                  disabled={imagePreviews.length >= 3}
                />
                {fileError && <div style={{ color: 'red' }}>{fileError}</div>}
                {imagePreviews.length >= 3 && (
                  <div style={{ color: 'green' }}>Maximum of 3 images reached.</div>
                )}
              </FormGroup>
              {imagePreviews.length > 0 && (
                <FormGroup>
                  <Label>Image Previews</Label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {imagePreviews.map((preview) => (
                      <div key={preview} style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={preview}
                          alt="Preview"
                          className="image-preview show"
                        />
                        <button
                          type="button"
                          className="postForm-closeBtn"
                          onClick={() => {
                            const index = imagePreviews.indexOf(preview);
                            setImagePreviews(prev => prev.filter((p) => p !== preview));
                            setFormData(prev => ({
                              ...prev,
                              medias: prev.medias.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </FormGroup>
              )}
              <Col md="6">
                <Label>Privacy</Label>
                <FormGroup>
                  <FormGroup check inline>
                    <Input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={formData.privacy === 'public'}
                      onChange={handleInputChange}
                    />
                    <Label check>Public</Label>
                  </FormGroup>
                  <FormGroup check inline>
                    <Input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={formData.privacy === 'private'}
                      onChange={handleInputChange}
                    />
                    <Label check>Private</Label>
                  </FormGroup>
                </FormGroup>
              </Col>
              <Button type="submit" color="primary">Submit</Button>
            </Form>
          </Col>
        </ComponentCard>
      </Row>
    </div>
  );
}

export default PostForm;
