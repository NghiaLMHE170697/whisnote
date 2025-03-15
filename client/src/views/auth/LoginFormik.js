import React from 'react';
import axios from 'axios';
import { Button, Label, FormGroup, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import AuthLogo from "../../layouts/logo/AuthLogo";
import { ReactComponent as LeftBg } from '../../assets/images/bg/login-bgleft.svg';
import { ReactComponent as RightBg } from '../../assets/images/bg/login-bg-right.svg';


const LoginFormik = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: '', // Lấy username từ localStorage nếu có
    password: '', // Lấy password từ localStorage nếu có
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Email is invalid').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleLogin = async (fields, { setSubmitting, setFieldError }) => {
    setSubmitting(true);
    try {

      await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users/login`, {
        email: fields.email,
        password: fields.password,
      }).then(res => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('avatar', res.data.avatar);
        localStorage.setItem('role', res.data.role);


        Swal.fire('Login Success', res.message, 'success');

        navigate('/');
      })
    } catch (error) {
      console.log(error.response.data)
      Swal.fire('Login Failed', error.response.data.error, 'error');
      setFieldError('password', error.response.data.error);
    }
    setSubmitting(false);
  };



  return (
    <div className="loginBox">
      <LeftBg className="position-absolute left bottom-0" />
      <RightBg className="position-absolute end-0 top" />
      <Container fluid className="h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col lg="12" className="loginContainer">
            <AuthLogo />
            <Card>
              <CardBody className="p-4 m-1">
                <h5 className="mb-0">Login</h5>
                <small className="pb-4 d-block">
                  Do not have an account? <Link to="/auth/registerformik">Sign Up</Link>
                </small>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleLogin}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Field
                          name="email"
                          type="text"
                          className={`form-control${errors.email && touched.email ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage name="username" component="div" className="invalid-feedback" />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="password">Password</Label>
                        <Field
                          name="password"
                          type="password"
                          className={`form-control${errors.password && touched.password ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback"
                        />
                      </FormGroup>
                      <FormGroup className="form-check d-flex">
                        <Link className="ms-auto text-decoration-none" to="/auth/forgotPwd">
                          <small>Forgot Pwd?</small>
                        </Link>
                      </FormGroup>
                      <FormGroup className="d-flex justify-content-center mt-3">
                        <Button
                          type="submit"
                          color="primary"
                          className="w-100"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                      </FormGroup>
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginFormik;
