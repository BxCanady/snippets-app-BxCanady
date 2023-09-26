import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../utils/api.utils.js";
import { Post, LoadingSpinner, SearchBar } from "../";
import { useProvideAuth } from "../../hooks/useAuth";

const initialState = {
  postText: "",
  isSubmitting: false,
  errorMessage: null,
};

const Feed = () => {
  const {
    state: { user },
  } = useProvideAuth();
  const [posts, setPosts] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState("");

  const [data, setData] = useState(initialState);
  const [validated, setValidated] = useState(false);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handlePostSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      toast.error("Post text is required");
      setValidated(true);
      return;
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    api
      .post("/posts", {
        text: data.postText,
        author: user.username,
      })
      .then(
        (res) => {
          setData(initialState);
          setPosts((posts) => [
            {
              ...res.data,
              author: {
                username: user.username,
                profile_image: user.profile_image,
              },
            },
            ...posts,
          ]);
          setValidated(false);
        },
        (error) => {
          setData({
            ...data,
            isSubmitting: false,
            errorMessage: error.message,
          });
        }
      );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await api.get("/posts");
        setPosts(postsResponse.data);
        setPostLoading(false);
      } catch (err) {
        console.error(err.message);
        setPostLoading(false);
        setPostError(true);
      }
    };

    fetchData();
  }, []);

  // Filter posts based on search keywords
  const filteredPosts = posts
    ? posts.filter((post) =>
      post.text.toLowerCase().includes(searchKeywords.toLowerCase())
    )
    : [];

  return (
    <>
      <Container className="pt-3 pb-3 clearfix">
        <h4>Share a Snip</h4>
        <Form noValidate validated={validated} onSubmit={handlePostSubmit}>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength="120"
            name="postText"
            placeholder="What's on your mind?"
            aria-describedby="post-form"
            size="lg"
            required
            value={data.postText}
            onChange={handleInputChange}
          />

          {data.errorMessage && (
            <span className="form-error">{data.errorMessage}</span>
          )}
          <Button
            className="float-right mt-3"
            type="submit"
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? <LoadingSpinner /> : "Post"}
          </Button>
        </Form>
      </Container>
      <SearchBar setKeywords={setSearchKeywords} />

      {!postLoading ? (
        <Container className="pt-3 pb-3">
          <h6>Search Results</h6>
          {postError && "Error fetching data"}

          {filteredPosts.length > 0 && (
            <>
              <h6>Posts</h6>
              {filteredPosts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </>
          )}
        </Container>
      ) : (
        <LoadingSpinner full />
      )}
    </>
  );
};

export default Feed;
