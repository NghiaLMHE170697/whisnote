import { Row, Col } from "reactstrap";
import PostDetail from "../components/PostDetail"

const ViewPostDetail = () => {
    return (
        <>
            <Row>
                <Col lg="12">
                    <PostDetail />
                </Col>
            </Row>
        </>
    );
};

export default ViewPostDetail;