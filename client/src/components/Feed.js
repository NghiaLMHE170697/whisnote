import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,

} from 'reactstrap';
import axios from "axios";
import img2 from '../assets/images/users/user2.jpg';
import LoadingOverlay from './LoadingOverlay';


const Feed = () => {
    const [posts, setPosts] = useState([]);
    const userId = localStorage.getItem('userId');
    const [isLoading, setIsLoading] = useState(false);

    const fetchPublicPosts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/public/${userId}`);
            setPosts(response.data.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    const handleLike = async (postId) => {
        try {
            //Update the UI
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
                userId
            });
            setIsLoading(false);

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
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchPublicPosts();
        setIsLoading(false);
    }, []);



    return (
        <Card style={{
            maxHeight: "80vh", // Fixed pixel height
            overflowY: "scroll", // Always show scrollbar
            scrollbarWidth: "thin", // For Firefox
            paddingRight: "8px" // Prevent content clipping
        }}>
            {isLoading ? <LoadingOverlay /> : null}
            <Col sm="12">
                <div className="p-4">
                    <div className="steamline position-relative border-start ms-4 mt-0">
                        {posts.map((post) => (
                            <div className="sl-item my-3 pb-3 border-bottom" key={post.id}>
                                <div className="sl-left float-start text-center rounded-circle text-white ms-n3 me-3 bg-success">
                                    <img src={post.avatar ? post.avatar : img2} width="40" alt="user" className="rounded-circle" />
                                </div>
                                <div className="sl-right ps-4">
                                    <div>
                                        <a href={`/profile/${post.userId}`} className="text-dark fs-4 text-decoration-none fw-bold">
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
                                            <button
                                                type="button" // Add explicit type
                                                className="text-decoration-none text-dark me-2 bg-transparent border-0 p-0"
                                                onClick={() => handleLike(post.id)}
                                            >
                                                <i className={`bi ${post?.liked ? "bi-heart-fill" : "bi-heart"} me-2 text-danger`}></i>
                                                {post?.likesCount || ''} Love
                                            </button>
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
        </Card>
    );
};

export default Feed;