import React from 'react';
import { Button, Label, FormGroup, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import AuthLogo from "../../layouts/logo/AuthLogo";
import { ReactComponent as LeftBg } from '../../assets/images/bg/login-bgleft.svg';
import { ReactComponent as RightBg } from '../../assets/images/bg/login-bg-right.svg';

const RegisterFormik = () => {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('User Name is required'),
    email: Yup.string().email('Email is invalid').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    acceptTerms: Yup.bool().oneOf([true], 'Accept Terms & Conditions is required'),
  });

  const handleRegister = async (fields) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: fields.username,
          password: fields.password,
          email: fields.email,
        }),
      });
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created.',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/login');
          }
        });
      } else {
        const errorData = await response.json();
        console.log(errorData)
        Swal.fire('Register Failed', errorData.error, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Register Failed', error.error, 'error');

    }
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
                <h5 className="mb-0">Register</h5>
                <small className="pb-4 d-block">
                  Already have an account? <Link to="/auth/login">Login</Link>
                </small>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleRegister}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <FormGroup>
                        <Label htmlFor="username">Username</Label>
                        <Field
                          name="username"
                          type="text"
                          className={`form-control ${errors.username && touched.username ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="invalid-feedback"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Field
                          name="email"
                          type="text"
                          className={`form-control ${errors.email && touched.email ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="password">Password</Label>
                        <Field
                          name="password"
                          type="password"
                          className={`form-control ${errors.password && touched.password ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Field
                          name="confirmPassword"
                          type="password"
                          className={`form-control ${errors.confirmPassword && touched.confirmPassword ? ' is-invalid' : ''
                            }`}
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="invalid-feedback"
                        />
                      </FormGroup>
                      <FormGroup inline className="form-check">
                        <Field
                          type="checkbox"
                          name="acceptTerms"
                          id="acceptTerms"
                          className={`form-check-input ${errors.acceptTerms && touched.acceptTerms ? ' is-invalid' : ''
                            }`}
                        />
                        <Label htmlFor="acceptTerms" className="form-check-label">
                          Accept Terms & Conditions
                        </Label>
                        <ErrorMessage
                          name="acceptTerms"
                          component="div"
                          className="invalid-feedback"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Button type="submit" color="primary" className="me-2">
                          Register
                        </Button>
                        <Button type="reset" color="secondary">
                          Reset
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

export default RegisterFormik;
