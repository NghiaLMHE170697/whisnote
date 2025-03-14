import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'
import {
  Row,
  Col,
  Card,
  CardBody,
  Media,
  Badge,
  Carousel,
  CarouselControl,
  CarouselItem,
  Input,
} from 'reactstrap';
import { motion } from 'framer-motion';
import img1 from '../assets/images/users/user1.jpg';

import './PostDetail.css';

function PostDetail() {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [input, setInput] = useState("");
  const { postId } = useParams();
  const userId = localStorage.getItem('userId');

  const fetchPostDetail = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/${postId}/${userId}`);
      setPost(response.data.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchPostComment = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/comments/${postId}`);
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments: ", err);
    }
  }

  const handleLike = async () => {
    try {
      //Update post UI
      setPost(prev => ({
        ...prev,
        liked: !prev.liked,
        likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1
      }))
      // Send API request to update like status
      await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/like/${postId}`, {
        userId
      });
    } catch (err) {
      console.error("Error updating like:", err);
      setPost(prev => ({
        ...prev,
        liked: !prev.liked,
        likesCount: prev.liked ? prev.likesCount + 1 : prev.likesCount - 1
      }));
    }
  };

  const handleSendComment = async () => {
    try {
      if (!input.trim()) return;
      await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/comments/add/${postId}`, {
        content: input,
        author: userId
      }).then(res => {
        setInput("");
        fetchPostComment();
      })
    } catch (err) {

    }
  }

  useEffect(() => {
    fetchPostDetail();
    fetchPostComment();
  }, []);


  const items = post.medias || [];

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 1 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const renderMedia = () => {
    if (items.length === 0) return null;

    if (items.length === 1) {
      return (
        <Col lg="6">
          <img
            src={items[0].url}
            alt={items[0].altText}
            style={{ width: '100%', height: '550px', objectFit: 'cover' }}
          />
        </Col>
      );
    }

    return (
      <Col lg="6">
        <Carousel
          activeIndex={activeIndex}
          next={next}
          previous={previous}
          interval={false} // Disable auto-rotation
        >
          {items.map((item) => (
            <CarouselItem
              key={item.url}
              onExiting={() => setAnimating(true)}
              onExited={() => setAnimating(false)}
            >
              <img
                src={item.url}
                alt={item.altText}
                style={{ width: '100%', height: '550px', objectFit: 'cover' }}
              />
            </CarouselItem>
          ))}
          <CarouselControl
            direction="prev"
            directionText="Previous"
            onClickHandler={previous}
          />
          <CarouselControl
            direction="next"
            directionText="Next"
            onClickHandler={next}
          />
        </Carousel>
      </Col>
    );
  };

  return (
    <div>
      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <Row>
                {renderMedia()}
                <Col lg={items.length > 0 ? '6' : '12'}>
                  <div className="sl-item my-3 pb-3 border-bottom profile-user-note">
                    <div className="sl-left float-start text-center rounded-circle text-white ms-n3 me-3 bg-success">
                      <img src={post?.avatar} width="40" alt="user" className="rounded-circle" />
                    </div>
                    <div className="sl-right ps-4">
                      <div>
                        <a href="/" className="text-dark fs-4 text-decoration-none fw-bold">
                          {post.username}
                        </a>
                        <span className="ms-2 text-muted">{post.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <p className="py-3 mb-3 profile-content">
                    {post.content}
                  </p>

                  <div className="mt-3 profile-note-more-info">
                    <div
                      className="profile-love-info-wrapper"
                      onClick={handleLike}
                    >
                      <motion.i
                        className={`bi ${post.liked ? 'bi-heart-fill' : 'bi-heart'
                          } me-2 text-danger profile-love-icon`}
                        initial={{ scale: 1 }}
                        animate={{ scale: post.liked ? [1, 1.3, 1] : [1, 0.8, 1] }}
                        transition={{ duration: 0.3 }}
                      ></motion.i>
                      <span className="text-muted profile-love-info-content">{post.likesCount} Love</span>
                    </div>
                    <Badge color="primary" className="category-badge">
                      {post.category}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h5 className="mb-4">Replies</h5>
              <Input
                type="textarea"
                rows="5"
                // value={noteDetails?.title}
                style={{ marginBottom: '40px' }}
                placeholder="Write a reply..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              {comments.map(c => (
                <Media className="d-flex py-3">
                  <Media left href="#">
                    <Media object src={c.author.avatar} alt="Generic placeholder image" width="100" />
                  </Media>
                  <Media body className="ms-3">
                    <Media heading className="d-flex align-items-center">
                      <span className="fw-bold me-2">{c.author.username}</span>
                      <small className="text-muted">{c.createdAt}</small>
                    </Media>
                    {c.content}
                  </Media>
                </Media>
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PostDetail;
