import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,

} from 'reactstrap';
import axios from "axios";
import img2 from '../assets/images/users/user2.jpg';



const Feed = () => {
    const [posts, setPosts] = useState([]);

    const fetchPublicPosts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/posts/public`);
            setPosts(response.data.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    useEffect(() => {
        fetchPublicPosts();
    }, []);



    return (
        <Card style={{
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
                                    <img src={post.avatar ? post.avatar : img2} width="40" alt="user" className="rounded-circle" />
                                </div>
                                <div className="sl-right ps-4">
                                    <div>
                                        <a href={`/profile/${post.userId}`} className="text-dark fs-4 text-decoration-none fw-bold">
                                            {post.username}
                                        </a>
                                        <span className="ms-2 text-muted">5 minutes ago</span>
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
                                            <a href="/" className="text-decoration-none text-dark me-2">
                                                <i className="bi bi-heart-fill me-2 text-danger"></i>
                                                5 Love
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