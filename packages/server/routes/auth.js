import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import keys from '../config/keys';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('auth endpoint');
});

router.post('/signup', async (req, res) => {
  const { username, email, password, profile_image } = req.body;

  if (!username || !email || !password) {
    return res.status(422).json({ error: 'Please provide username, email, and password.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(422).json({ error: 'User with the same username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      email, // Include email
      passwordHash: hashedPassword,
      profile_image,
    });

    await user.save();

    res.json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/signin', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(422).json({ error: 'missing username or password' })
  }

  const user = await User.findOne({ username: username })
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, keys.jwt.secret)
  res
    .status(200)
    .send({ token, username, uid: user.id, profile_image: user.profile_image })
})

module.exports = router
