import { Row, Col } from "reactstrap";
import ViewPricing from "../components/ViewPricing"

const Pricing = () => {
    return (
        <>
            <Row>
                <Col lg="12">
                    <ViewPricing />
                </Col>
            </Row>
        </>
    );
};

export default Pricing;