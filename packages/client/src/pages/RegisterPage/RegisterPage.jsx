import React, { useState } from "react";
import { Container, Row, Col, InputGroup, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.scss";
import { useProvideAuth } from "../../hooks/useAuth";
import { LandingHeader, LoadingSpinner, AvatarPicker } from "../../components";
import { setAuthToken } from "../../utils/api.utils";

const profileImages = [
  "/ww1.png",
  "/bk3.png",
  "/bm1.png",
  "/boy1.png",
  "/ww5.png"

];

const initialState = {
  username: "",
  email: "",
  password: "",
  selectedAvatar: profileImages[0], // Initialize with the first image
  isSubmitting: false,
  errorMessage: null,
};

const RegisterPage = () => {
  const [data, setData] = useState(initialState);
  const auth = useProvideAuth();

  let navigate = useNavigate();





  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };
  //..................................
  const handleAvatarSelect = (avatar) => {
    // Handle the avatar selection from AvatarPicker
    setData({
      ...data,
      selectedAvatar: avatar,
    });
  };


  const handleSignup = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });
    try {
      const res = await auth.signup(
        data.username,
        data.email,
        data.password,
        data.selectedAvatar // Use the selected avatar from the state
      );
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: null,
      });
      setAuthToken(res.token);
      navigate("/");
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error ? error.message || error.statusText : null,
      });
    }
  };

  return (
    <div style={{ overflow: "auto", height: "100vh" }}>
      <LandingHeader />
      <Container className="mb-5">
        <Row className="pt-5 justify-content-center">
          <Form
            noValidate
            validated
            style={{ width: "350px" }}
            onSubmit={handleSignup}
          >
            <h3 className="mb-3">Join Us!</h3>
            <Form.Group controlId="username-register">
              <Form.Label>Username</Form.Label>
              <InputGroup>
                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Username"
                  aria-describedby="inputGroupPrepend"
                  required
                  value={data.username}
                  onChange={handleInputChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="email-register">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name="email"
                placeholder="Email"
                required
                value={data.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="Register">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                required
                id="inputPasswordRegister"
                value={data.password}
                onChange={handleInputChange}
              />
            </Form.Group>
            {data.errorMessage && (
              <span className="form-error text-warning">
                {data.errorMessage}
              </span>
            )}
            <AvatarPicker
              avatars={profileImages}
              selectedAvatar={data.selectedAvatar}
              onSelect={handleAvatarSelect}
              className="custom-avatar-picker" // Add this line
            />
            <Row className="mr-0">
              <Col>
                Already Registered?
                <Button
                  as="a"
                  variant="link"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </Col>
              <Button type="submit" disabled={data.isSubmitting}>
                {data.isSubmitting ? <LoadingSpinner /> : "Sign up"}
              </Button>
            </Row>
          </Form>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;