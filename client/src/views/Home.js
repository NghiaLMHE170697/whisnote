import { Row, Col } from "reactstrap";
import Feed from "../components/Feed"

const Home = () => {
  return (
    <>
      <Row>
        <Col lg="12">
          <Feed />
        </Col>
      </Row>
    </>
  );
};

export default Home;