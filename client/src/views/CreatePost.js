import { Row, Col } from "reactstrap";
import PostForm from "../components/PostForm"

const CreatePost = () => {
    return (
        <>
            <Row>
                <Col lg="12">
                    <PostForm />
                </Col>
            </Row>
        </>
    );
};

export default CreatePost;