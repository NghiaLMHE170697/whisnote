import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardGroup,
    Button,
    Row,
    Col,
    Badge
} from 'reactstrap';
import Swal from 'sweetalert2';

const PricingData = [
    {
        title: 'Gói 1 Tháng',
        price: '25,000',
        originalPrice: null,
        billingPeriod: 'hàng tháng',
        discount: 0,
        features: ['Không giới hạn bài đăng 1 ngày', 'Không giới hạn số từ và ký tự', 'Tuỳ chỉnh giao diện website', 'Sử dụng giọng nói để viết bài'],
        btnbg: 'primary'
    },
    {
        title: 'Gói 6 Tháng',
        price: '125,000',
        originalPrice: '150,000', // 25,000 x 6 = 150,000
        billingPeriod: '20,833₫/tháng', // 125,000 ÷ 6 ≈ 20,833
        discount: 17, // (25,000 discount ÷ 150,000 original) ≈ 16.67%
        features: ['Không giới hạn bài đăng 1 ngày', 'Không giới hạn số từ và ký tự', 'Tuỳ chỉnh giao diện website', 'Sử dụng giọng nói để viết bài'],
        btnbg: 'success'
    },
    {
        title: 'Gói 1 Năm',
        price: '200,000',
        originalPrice: '300,000', // 25,000 x 12 = 300,000
        billingPeriod: '16,667₫/tháng', // 200,000 ÷ 12 ≈ 16,667
        discount: 33, // (100,000 discount ÷ 300,000 original) ≈ 33.33%
        features: ['Không giới hạn bài đăng 1 ngày', 'Không giới hạn số từ và ký tự', 'Tuỳ chỉnh giao diện website', 'Sử dụng giọng nói để viết bài'],
        btnbg: 'info'
    }
];

const ViewPricing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createPaymentLink = async (plan) => {
        setLoading(true);
        setError(null);

        try {
            // Store plan data in localStorage before payment
            localStorage.setItem('selectedPlan', JSON.stringify({
                title: plan.title,
                duration: plan.title.includes('Tháng') ?
                    parseInt(plan.title.match(/\d+/)[0], 10) :
                    parseInt(plan.title.match(/\d+/)[0], 10) * 12,
            }));
            const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/create-payment-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi kết nối');
            }

            const data = await response.json();

            // Handle redirect on client side
            window.location.href = data.checkoutUrl;

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);

        const handlePaymentSuccess = async () => {
            try {
                // Retrieve stored plan data
                const storedPlan = JSON.parse(localStorage.getItem('selectedPlan'));

                if (!storedPlan) {
                    throw new Error('Không tìm thấy thông tin gói dịch vụ');
                }

                // Call backend to upgrade plan
                const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users/upgrade-plan`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem('userId'),
                        plan: storedPlan.title
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Lỗi nâng cấp gói dịch vụ');
                }

                const data = await response.json();

                Swal.fire({
                    icon: 'success',
                    title: 'Thanh toán thành công',
                    html: `${storedPlan.title} đã được kích hoạt!<br>
                           Hết hạn: ${new Date(data.premium_expiry).toLocaleDateString('vi-VN')}`,
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                }).then(() => {
                    // Update local storage
                    localStorage.setItem('role', 'premium');
                    localStorage.setItem('premiumExpiry', data.premium_expiry);
                    localStorage.removeItem('selectedPlan'); // Cleanup
                    window.dispatchEvent(new Event('storage'));
                    window.location.href = '/';
                });

            } catch (err) {  // Rename 'error' to 'err'
                Swal.fire('Lỗi', err.message, 'error');  // Update variable name here
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        if (query.get("success")) {
            handlePaymentSuccess();
        }

        if (query.get("canceled")) {
            Swal.fire({
                icon: 'error',
                title: 'Thanh toán thất bại',
                html: 'Vui lòng thử lại hoặc liên hệ hỗ trợ <a href="mailto:support@whisnote.com">support@whisnote.com</a>',
                confirmButtonText: 'Thử lại',
                showCancelButton: true,
                cancelButtonText: 'Về trang chủ',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Retry logic if needed
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = '/';
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
    }, []);

    return (
        <div>
            {/* --------------------------------------------------------------------------------*/}
            {/* Card Group with Pricing Plans */}
            {/* --------------------------------------------------------------------------------*/}
            <Row>
                <h5 className="mb-3 mt-3">Các gói trả phí</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                <Col>
                    <CardGroup>
                        {PricingData.map((plan) => (
                            <Card key={plan.title} className="text-center h-100">
                                <CardBody className="d-flex flex-column">
                                    <div style={{ minHeight: '38px' }}>
                                        {plan.discount > 0 ? (
                                            <Badge color="success" className="mb-3">
                                                Giảm {plan.discount}%
                                            </Badge>
                                        ) : (
                                            <div className="mb-3" style={{ visibility: 'hidden' }}>
                                                Placeholder
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle tag="h3">{plan.title}</CardTitle>
                                    <div className="mt-2">
                                        <s className="text-muted" style={{ opacity: 0.7, fontSize: '1.9rem' }}>
                                            {plan.originalPrice ? `${plan.originalPrice}đ` : <div style={{ visibility: 'hidden' }}>
                                                Placeholder
                                            </div>}
                                        </s>
                                    </div>
                                    <div className="my-4">
                                        <h2>{plan.price}₫</h2>
                                        <CardSubtitle className="text-muted">
                                            {plan.billingPeriod}
                                        </CardSubtitle>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        {plan.features.map((feature) => (
                                            <li className="mb-2">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="text-center"> {/* Added wrapper div for centering */}
                                        <Button
                                            color={plan.btnbg}
                                            className="mt-auto"
                                            onClick={() => createPaymentLink(plan)}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <i className="bi bi-credit-card" />
                                                    Thanh toán
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </CardGroup>
                </Col>
            </Row>
        </div>
    )
}

export default ViewPricing;