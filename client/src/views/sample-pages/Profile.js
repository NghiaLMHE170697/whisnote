import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import Iframe from 'react-iframe';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  // Progress,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import './Profile.css'
import LoadingOverlay from '../../components/LoadingOverlay';

import img1 from '../../assets/images/users/user1.jpg';

const validationSchema = yup.object().shape({
  username: yup.string().required('Username không được bỏ trống'),
  phone: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test(
      'phone-format',
      'Sai định dạng số điện thoại',
      (value) => !value || /^\+?\d{10,15}$/.test(value)
    ),
  social: yup.object().shape({
    facebook: yup.string().url('Sai định dạng URL Facebook').nullable(),
    twitter: yup.string().url('Sai định dạng URL Twitter').nullable(),
    tiktok: yup.string().url('Sai định dạng URL Tiktok').nullable(),
  }),
  avatar: yup.mixed().nullable(), // Optional file field
});

const Profile = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [fileError, setFileError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);  // Instead of imagePreviews array
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({});
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    social: {
      facebook: '',
      twitter: '',
      tiktok: ''
    },
    avatar: null // Store actual files for upload
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {  // 5MB limit
      setFileError('File ảnh không được vượt quá 5MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setFormData(prev => ({
      ...prev,
      avatar: file
    }));
    setFileError('');
  };

  const fetchProfilePost = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/profile/${userId}/${currentUserId}`);
      setPosts(response.data.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users/${userId}`);
      setProfile(response.data.data);
      setFormData({
        username: response.data.data.username || '',
        phone: response.data.data.phone || '',
        social: response.data.data.social || { facebook: '', twitter: '', tiktok: '' },
        avatar: null // We'll use avatar only when the user selects a new image
      });
    } catch (err) {
      console.log("Error fetching user detail: ", err);
    }
  }

  const handleLike = async (postId) => {
    try {
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const newLiked = !post.liked;
          return {
            ...post,
            liked: newLiked,
            likesCount: newLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      }))
      // Send API request to update like status
      setIsLoading(true);
      await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/like/${postId}`, {
        userId: currentUserId
      });
    } catch (err) {
      console.error("Error updating like:", err);
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1
          };
        }
        return post;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      // If valid, build your FormData for submission
      setIsLoading(true);
      const updatedData = new FormData();
      updatedData.append('username', formData.username);
      updatedData.append('phone', formData.phone);
      updatedData.append('facebook', formData.social?.facebook || '');
      updatedData.append('twitter', formData.social?.twitter || '');
      updatedData.append('tiktok', formData.social?.tiktok || '');

      if (formData.avatar) {
        updatedData.append('avatar', formData.avatar);
      }
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/users/update-profile/${currentUserId}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setIsLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật hồ sơ thành công',
        text: response.message,
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then(() => {
        setProfile(response.data.data);
        localStorage.setItem('username', response.data.data.username);
        if (response.data.data.avatar) {
          localStorage.setItem('avatar', response.data.data.avatar);
        }
        window.location.reload();
      })
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Gather all error messages into one string
        const errorMessages = error.inner.map((err) => err.message).join(', ');
        Swal.fire({
          icon: 'error',
          title: 'Cập nhật hồ sơ thất bại',
          text: errorMessages,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Cập nhật hồ sơ thất bại',
          text: error.message,
        });
        console.error('Error updating profile:', error);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        fetchProfilePost();
        fetchUserProfile();
      } catch (error) {
        console.log("Error fetching data: ", error)
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000)
      }
    }
    fetchData();
  }, [userId]);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <>
      {isLoading ? <LoadingOverlay /> : null}
      <Row>
        <Col xs="12" md="12" lg="4">
          <Card>
            <CardBody className="p-4">
              <div className="text-center mt-4">
                <img src={profile.avatar} className="rounded-circle" width="150" alt="" />
                <CardTitle tag="h4" className="mt-2 mb-0">
                  {profile.username}
                </CardTitle>
                <CardSubtitle className="text-muted">{profile.role === "free" ? "Free Member" : "Premium Member"}</CardSubtitle>
              </div>
            </CardBody>
            <CardBody className="border-top p-4">
              <div>
                <CardSubtitle className="text-muted fs-5">Email address</CardSubtitle>
                <CardTitle tag="h4">{profile.email}</CardTitle>
                <CardSubtitle className="text-muted fs-5 mt-3">Phone</CardSubtitle>
                <CardTitle tag="h4">
                  {profile.phone ? profile.phone : <span className='text-muted fs-5 mt-3'>Không khả dụng</span>}
                </CardTitle>
                {profile.role === "premium" && (
                  <>
                    <CardSubtitle className="text-muted fs-5 mt-3">Ngày hết hạn Premium</CardSubtitle>
                    <CardTitle tag="h4">{new Date(profile.premium_expiry).toLocaleDateString('vi-VN')}</CardTitle>
                  </>
                )}
              </div>
              <CardSubtitle className="text-muted fs-5 mt-3 mb-2">Social Profile</CardSubtitle>
              <div className="d-flex align-items-center gap-2">
                <Button className="btn-circle" color="info" onClick={() => window.open(profile.social?.facebook, '_blank')}>
                  <i className="bi bi-facebook"></i>
                </Button>
                <Button className="btn-circle" color="success" onClick={() => window.open(profile.social?.twitter, '_blank')}>
                  <i className="bi bi-twitter"></i>
                </Button>
                <Button className="btn-circle" color="dark" onClick={() => window.open(profile.social?.tiktok, '_blank')}>
                  <i className="bi bi-tiktok"></i>
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs="12" md="12" lg="8">
          <Card>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={activeTab === '1' ? 'active bg-transparent' : 'cursor-pointer'}
                  onClick={() => {
                    toggle('1');
                  }}
                >
                  Timeline
                </NavLink>
              </NavItem>
              {currentUserId === userId && (
                <NavItem>
                  <NavLink
                    className={activeTab === '2' ? 'active bg-transparent' : 'cursor-pointer'}
                    onClick={() => {
                      toggle('2');
                    }}
                  >
                    Setting
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row style={{
                  maxHeight: "80vh", // Fixed pixel height
                  overflowY: "scroll", // Always show scrollbar
                  scrollbarWidth: "thin", // For Firefox
                  paddingRight: "8px" // Prevent content clipping
                }}>
                  <Col sm="12">
                    <div className="p-4">
                      <div className="steamline position-relative border-start ms-4 mt-0">
                        {posts.map((post) => (
                          <div className="sl-item my-3 pb-3 border-bottom" key={post.id}>
                            <div className="sl-left float-start text-center rounded-circle text-white ms-n3 me-3 bg-success">
                              <img src={post.avatar ? post.avatar : img1} width="40" alt="user" className="rounded-circle" />
                            </div>
                            <div className="sl-right ps-4">
                              <div>
                                <a className="text-dark fs-4 text-decoration-none fw-bold">
                                  {post.username}
                                </a>
                                <span className="ms-2 text-muted">{post.createdAt}</span>
                                <p className="mt-2 ms-3">
                                  {post.content}
                                </p>
                                {post.medias.length > 0 && (
                                  <Row className="ms-1 g-2" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                                    {post.medias.map((media) => (
                                      <Col lg="3" md="6" className="mb-3" key={media.url}>
                                        <div style={{
                                          aspectRatio: '1/1',
                                          position: 'relative',
                                          overflow: 'hidden',
                                          borderRadius: '8px'
                                        }}>
                                          <img
                                            src={media.url}
                                            className="img-fluid"
                                            alt="Post media"
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              position: 'absolute',
                                              top: 0,
                                              left: 0
                                            }}
                                          />
                                        </div>
                                      </Col>
                                    ))}
                                  </Row>
                                )}
                                <div className="desc ms-3">
                                  <a className="text-decoration-none text-dark me-2" onClick={() => handleLike(post.id)}>
                                    <i className={`bi ${post?.liked ? "bi-heart-fill" : "bi-heart"} me-2 text-danger`}></i>
                                    {post?.likesCount !== 0 ? post?.likesCount : ""} Love
                                  </a>
                                  <a href={`/post/${post.id}`} className="text-decoration-none text-dark me-2" >
                                    <i className="bi bi-chat-square-dots me-2 text-danger"></i>
                                    Comment
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              {currentUserId === userId && (
                <TabPane tabId="2">
                  <Row>
                    <Col sm="12">
                      <div className="p-4">
                        <Form onSubmit={handleUpdateProfile}>
                          <FormGroup>
                            <Label>Username</Label>
                            <Input type="text" defaultValue={profile.username} onChange={(e) =>
                              setFormData((prev) => ({ ...prev, username: e.target.value }))
                            } />
                          </FormGroup>
                          <FormGroup>
                            <Label>Phone No</Label>
                            <Input type="text" defaultValue={profile.phone} onChange={(e) =>
                              setFormData((prev) => ({ ...prev, phone: e.target.value }))
                            } />
                          </FormGroup>
                          <div className="social-links">
                            <FormGroup>
                              <Label>
                                <i className="bi bi-facebook me-2"></i>
                                Facebook
                              </Label>
                              <Input
                                type="text"
                                name="facebook"
                                value={formData.social.facebook}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    social: { ...prev.social, facebook: e.target.value },
                                  }))
                                }
                                placeholder="https://facebook.com/username"
                              />
                            </FormGroup>

                            <FormGroup>
                              <Label>
                                <i className="bi bi-twitter me-2"></i>
                                Twitter
                              </Label>
                              <Input
                                type="text"
                                name="twitter"
                                value={formData.social.twitter}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    social: { ...prev.social, twitter: e.target.value },
                                  }))
                                }
                                placeholder="https://x.com/username"
                              />
                            </FormGroup>

                            <FormGroup>
                              <Label>
                                <i className="bi bi-tiktok me-2"></i>
                                TikTok
                              </Label>
                              <Input
                                type="text"
                                name="tiktok"
                                value={formData.social.tiktok}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    social: { ...prev.social, tiktok: e.target.value },
                                  }))
                                }
                                placeholder="https://tiktok.com/@username"
                              />
                            </FormGroup>
                          </div>
                          <FormGroup>
                            <Label htmlFor="avatarUpload">
                              Ảnh Đại Diện
                            </Label>
                            <Input
                              type="file"
                              id="avatarUpload"
                              name="avatar"  // Changed to match backend field name
                              accept="image/*"
                              onChange={handleFileChange}
                              // Removed multiple attribute
                              disabled={!!imagePreview}  // Changed to boolean check
                            />
                            {fileError && <div style={{ color: 'red' }}>{fileError}</div>}
                            {imagePreview && (
                              <div style={{ color: 'green' }}>Ảnh đã được chọn</div>
                            )}
                          </FormGroup>

                          {imagePreview && (
                            <FormGroup>
                              <Label>Xem trước ảnh đại diện</Label>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <img
                                    src={imagePreview}
                                    alt="Preview avatar"
                                    className="image-preview show"
                                  />
                                  <button
                                    type="button"
                                    className="postForm-closeBtn"
                                    onClick={() => {
                                      setImagePreview(null);
                                      setFormData(prev => ({
                                        ...prev,
                                        avatar: null
                                      }));
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            </FormGroup>
                          )}
                          <Button type="submit" color="primary">Cập Nhật Hồ Sơ</Button>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </TabPane>
              )}
            </TabContent>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Profile;
