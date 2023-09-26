import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Figure } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner, Post, AvatarPicker } from "../components";
import { useProvideAuth } from "../hooks/useAuth";
import { useRequireAuth } from "../hooks/useRequireAuth";
import api from "../utils/api.utils.js";

const profileImages = [
  "/ww1.png",
  "/bk3.png",
  "/bm1.png",
  "/boy1.png",
  "/ww5.png"

];

const UserDetailPage = () => {
  const { state } = useProvideAuth();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    password: "",
    isSubmitting: false,
    errorMessage: null,
  });

  const [selectedAvatar, setSelectedAvatar] = useState(user.profile_image);
  const [avatarUpdating, setAvatarUpdating] = useState(false);


  let navigate = useNavigate();
  let params = useParams();
  const {
    state: { isAuthenticated },
  } = useRequireAuth();
  //............................................
  useEffect(() => {
    const getUser = async () => {
      try {
        const userResponse = await api.get(`/users/${params.uname}`);
        setUser(userResponse.data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
      }
    };
    isAuthenticated && getUser();
  }, [params.uname, isAuthenticated]);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };
  //...............................................
  //function to handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleAvatarUpdate = async () => {
    setAvatarUpdating(true);
    try {

      const endpoint = `/users/${user.username}/avatar`;

      // Send a PUT request to update the user's avatar
      const response = await api.put(endpoint, {
        profile_image: selectedAvatar,
      });

      if (response.status === 200) {
        // Handle success, update user's avatar in the state or any other actions
        console.log("Avatar updated successfully");
      } else {
        // Handle other response statuses or errors
        console.error("Avatar update failed");
      }
    } catch (error) {
      // Handle errors, such as displaying an error message
      console.error("Error updating avatar:", error.message);
    } finally {
      setAvatarUpdating(false);
    }
  };

  //.....................................................

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });
    try {
      // Call edit user endpoint here and handle the update
      const {
        user: { uid, username },
      } = state;
      console.log(data.password, uid, username);
      setValidated(false);
      // Update the loading state and display a success message if needed
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message,
      });
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner full />;
  }

  if (loading) {
    return <LoadingSpinner full />;
  }

  return (
    <>
      <Container className="clearfix">
        <Button
          variant="outline-info"
          onClick={() => {
            navigate(-1);
          }}
          style={{ border: "none", color: "#E5E1DF" }}
          className="mt-3 mb-3"
        >
          Go Back
        </Button>
        <Card bg="header" className="text-center">
          <Card.Body>
            <Figure
              className="bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1"
              style={{
                height: "50px",
                width: "50px",
                backgroundColor: "white",
              }}
            >
              <Figure.Image src={selectedAvatar} className="w-100 h-100" />
            </Figure>
            <Card.Title>{params.uname}</Card.Title>
            {state.user.username === params.uname && (
              <div
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Password
              </div>
            )}
            {/* Display the email here */}
            {isAuthenticated && <div className="user-email">{user.email}</div>}
            {isAuthenticated && (
              <AvatarPicker
                avatars={profileImages}
                selectedAvatar={selectedAvatar}
                onSelect={handleAvatarSelect}
              />
            )}
            {isAuthenticated && (
              <Button
                variant="primary"
                onClick={handleAvatarUpdate}
                disabled={avatarUpdating}
              >
                {avatarUpdating ? "Updating..." : "Update Avatar"}
              </Button>
            )}
          </Card.Body>
        </Card>
      </Container>
      {open && (
        <Container animation="false">
          <div className="row justify-content-center p-4">
            <div className="col text-center">
              <Form
                noValidate
                validated={validated}
                onSubmit={handleUpdatePassword}
              >
                <Form.Group>
                  <Form.Label htmlFor="password">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    required
                    value={data.password}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    New Password is required
                  </Form.Control.Feedback>
                  <Form.Text id="passwordHelpBlock" muted>
                    Must be 8-20 characters long.
                  </Form.Text>
                </Form.Group>

                {data.errorMessage && (
                  <span className="form-error">{data.errorMessage}</span>
                )}
                <Button type="submit" disabled={data.isSubmitting}>
                  {data.isSubmitting ? <LoadingSpinner /> : "Update"}
                </Button>
              </Form>
            </div>
          </div>
        </Container>
      )}
      <Container className="pt-3 pb-3">
        {user && user.posts && user.posts.length !== 0 ? (
          user.posts.map((post) => (
            <Post key={post._id} post={post} userDetail />
          ))
        ) : (
          <div
            style={{
              marginTop: "75px",
              textAlign: "center",
            }}
          >
            No User Posts
          </div>
        )}
      </Container>
    </>
  );
};

export default UserDetailPage;