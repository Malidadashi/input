const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const url = "mongodb+srv://ali:Ma101010@nodejs.sgw7o.mongodb.net/?retryWrites=true&w=majority&appName=nodejs";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    newUser.save()
        .then(user => res.json({ message: 'User registered successfully' }))
        .catch(err => res.status(400).json({ error: err.message }));
});

app.post('/', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});



app.get('/dashboard', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, 'secretkey');
        res.json({ message: 'Welcome to the dashboard', userId: verified.id });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));