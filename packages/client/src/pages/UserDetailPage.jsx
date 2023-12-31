import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Figure } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner, Post, AvatarPicker } from "../components";
import { useProvideAuth } from "../hooks/useAuth";
import { useRequireAuth } from "../hooks/useRequireAuth";
import api from "../utils/api.utils.js";
import { toast } from "react-toastify"; // Import toast for displaying notifications

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
    currentPassword: "", // New field for current password
    password: "",
    confirmPassword: "", // New field for password confirmation
    isSubmitting: false,
    errorMessage: null,
  });

  const [selectedAvatar, setSelectedAvatar] = useState(user.profile_image);
  const [avatarUpdating, setAvatarUpdating] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  let navigate = useNavigate();
  let params = useParams();
  const {
    state: { isAuthenticated },
  } = useRequireAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userResponse = await api.get(`/users/${params.uname}`);
        setUser(userResponse.data);
        setLoading(false);

        // Check if the displayed user is the logged-in user
        setIsCurrentUser(userResponse.data.username === state.user.username);
      } catch (err) {
        console.error(err.message);
      }
    };
    // function is called to fetch user data only when the user is authenticated
    isAuthenticated && getUser();
  }, [params.uname, isAuthenticated, state.user.username]);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleAvatarUpdate = async () => {
    setAvatarUpdating(true);
    try {
      const endpoint = `/users/${user.username}/avatar`;

      const response = await api.put(endpoint, {
        profile_image: selectedAvatar,
      });

      if (response.status === 200) {
        console.log("Avatar updated successfully");
      } else {
        console.error("Avatar update failed");
      }
    } catch (error) {
      console.error("Error updating avatar:", error.message);
    } finally {
      setAvatarUpdating(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false || data.password !== data.confirmPassword) {
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
      const response = await api.put(`/users/${username}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.password,
      });

      if (response.status === 200) {
        // Password updated successfully
        toast.success("Password updated successfully");
      } else {
        // Password update failed
        console.error("Password update failed");
      }
      setValidated(false);
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
            {isCurrentUser && (
              <div
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Password
              </div>
            )}
            {isAuthenticated && <div className="user-email">{user.email}</div>}
            {isAuthenticated && isCurrentUser && (
              <AvatarPicker
                avatars={profileImages}
                selectedAvatar={selectedAvatar}
                onSelect={handleAvatarSelect}
              />
            )}
            {isAuthenticated && isCurrentUser && (
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
                  <Form.Label htmlFor="currentPassword">Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    required
                    value={data.currentPassword}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Current Password is required
                  </Form.Control.Feedback>
                </Form.Group>
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
                <Form.Group>
                  <Form.Label htmlFor="confirmPassword">Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    required
                    value={data.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Passwords do not match
                  </Form.Control.Feedback>
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
