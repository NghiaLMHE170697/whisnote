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
  Progress,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';


import img1 from '../../assets/images/users/user1.jpg';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [posts, setPosts] = useState([]);
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId');

  const fetchProfilePost = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/profile/${userId}/${currentUserId}`);
      setPosts(response.data.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleLike = async (postId) => {
    try {

      // Send API request to update like status
      await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/like/${postId}`, {
        userId: currentUserId
      });
      fetchProfilePost();
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  useEffect(() => {
    fetchProfilePost();
  }, []);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <>

      <Row>
        <Col xs="12" md="12" lg="4">
          <Card>
            <CardBody className="p-4">
              <div className="text-center mt-4">
                <img src={img1} className="rounded-circle" width="150" alt="" />
                <CardTitle tag="h4" className="mt-2 mb-0">
                  Hanna Gover
                </CardTitle>
                <CardSubtitle className="text-muted">Accounts Manager</CardSubtitle>
                <Row className="text-center justify-content-md-center mt-3">
                  <Col xs="4">
                    <a href="/" className="text-dark fw-bold text-decoration-none">
                      <i className="bi bi-person text-muted"></i>
                      <span className="font-medium ms-2">254</span>
                    </a>
                  </Col>
                  <Col xs="4">
                    <a href="/" className="text-dark fw-bold text-decoration-none">
                      <i className="bi bi-columns text-muted"></i>
                      <span className="font-medium ms-2">54</span>
                    </a>
                  </Col>
                </Row>
              </div>
            </CardBody>
            <CardBody className="border-top p-4">
              <div>
                <CardSubtitle className="text-muted fs-5">Email address</CardSubtitle>
                <CardTitle tag="h4">hannagover@gmail.com</CardTitle>

                <CardSubtitle className="text-muted fs-5 mt-3">Phone</CardSubtitle>
                <CardTitle tag="h4">+91 654 784 547</CardTitle>

                <CardSubtitle className="text-muted fs-5 mt-3">Address</CardSubtitle>
                <CardTitle tag="h4">71 Pilgrim Avenue Chevy Chase, MD 20815</CardTitle>
                <div>
                  <Iframe
                    className="position-relative"
                    url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d470029.1604841957!2d72.29955005258641!3d23.019996818380896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C+Gujarat!5e0!3m2!1sen!2sin!4v1493204785508"
                    width="280"
                    height="150"
                    frameborder="0"
                    allowfullscreen
                  />
                </div>

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
              <NavItem>
                <NavLink
                  className={activeTab === '2' ? 'active bg-transparent' : 'cursor-pointer'}
                  onClick={() => {
                    toggle('2');
                  }}
                >
                  Profile
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === '3' ? 'active bg-transparent' : 'cursor-pointer'}
                  onClick={() => {
                    toggle('3');
                  }}
                >
                  Setting
                </NavLink>
              </NavItem>
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
                                  <Row className="ms-1">
                                    {post.medias.map((media) => (
                                      <Col lg="3" md="6" className="mb-3">
                                        <img
                                          src={media.url}
                                          className="img-fluid rounded"
                                          alt="Post media"
                                        />
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
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <div className="p-4">
                      <Row>
                        <Col md="3" xs="6" className="border-end">
                          <strong>Full Name</strong>
                          <br />
                          <p className="text-muted">Johnathan Deo</p>
                        </Col>
                        <Col md="3" xs="6" className="border-end">
                          <strong>Mobile</strong>
                          <br />
                          <p className="text-muted">(123) 456 7890</p>
                        </Col>
                        <Col md="3" xs="6" className="border-end">
                          <strong>Email</strong>
                          <br />
                          <p className="text-muted">johnathan@admin.com</p>
                        </Col>
                        <Col md="3" xs="6" className="border-end">
                          <strong>Location</strong>
                          <br />
                          <p className="text-muted">London</p>
                        </Col>
                      </Row>
                      <p className="mt-4">
                        Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim
                        justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis
                        eu pede mollis pretium. Integer tincidunt.Cras dapibus. Vivamus elementum
                        semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor
                        eu, consequat vitae, eleifend ac, enim.
                      </p>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        Lorem Ipsum has been the industry&apos;s standard dummy text ever since the
                        1500s, when an unknown printer took a galley of type and scrambled it to
                        make a type specimen book. It has survived not only five centuries
                      </p>
                      <p>
                        It was popularised in the 1960s with the release of Letraset sheets
                        containing Lorem Ipsum passages, and more recently with desktop publishing
                        software like Aldus PageMaker including versions of Lorem Ipsum.
                      </p>
                      <h4 className="font-medium mt-4">Skill Set</h4>
                      <hr />
                      <h5 className="mt-4">
                        Wordpress <span className="float-end">80%</span>
                      </h5>
                      <Progress value={2 * 5} />
                      <h5 className="mt-4">
                        HTML 5 <span className="float-end">90%</span>
                      </h5>
                      <Progress color="success" value="25" />
                      <h5 className="mt-4">
                        jQuery <span className="float-end">50%</span>
                      </h5>
                      <Progress color="info" value={50} />
                      <h5 className="mt-4">
                        Photoshop <span className="float-end">70%</span>
                      </h5>
                      <Progress color="warning" value={75} />
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    <div className="p-4">
                      <Form>
                        <FormGroup>
                          <Label>Full Name</Label>
                          <Input type="text" placeholder="Shaina Agrawal" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Email</Label>
                          <Input type="email" placeholder="Jognsmith@cool.com" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Password</Label>
                          <Input type="password" placeholder="Password" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Phone No</Label>
                          <Input type="text" placeholder="123 456 1020" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Message</Label>
                          <Input type="textarea" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Select Country</Label>
                          <Input type="select">
                            <option>USA</option>
                            <option>India</option>
                            <option>America</option>
                          </Input>
                        </FormGroup>
                        <Button color="primary">Update Profile</Button>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Profile;
