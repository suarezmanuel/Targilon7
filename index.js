// Load express
const express = require('express')
const app = express()
// Use a middleware that processes JSON objects in the request
app.use(express.json());
// Serve static files from the public folder
app.use(express.static('public'))
// Use a library to perform the cryptographic operations
const jwt = require("jsonwebtoken")
// We are using cryptography, to ensure that no one else will be able to impersonate users
// To that end, we are going to use the following secret key
// Keep it safe. No one except the server should know this secret value
const key = "Some super secret key shhhhhhhhhhhhhhhhh!!!!!"

// Define a function that responds with a json response.
// Only logged in users should be able to execute this function
const index = (req, res) => {
    res.json({ data: 'secret data' })
}

// Ensure that the user sent a valid token
const isLoggedIn = (req, res, next) => {
// If the request has an authorization header
if (req.headers.authorization) {
    // Extract the token from that header
    const token = req.headers.authorization.split(" ")[1];
    try {
        // Verify the token is valid
        const data = jwt.verify(token, key);
        console.log('The logged in user is: ' + data.username);
        // Token validation was successful. Continue to the actual function (index)
        return next()
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }   
} else
    return res.status(403).send('Token required');
}

// Handle login form submission
const processLogin = (req, res) => {
// Check credentials
if (req.body.username == 'guest' && req.body.password == '123456') {
    // Correct username and password - Yayyyy
    // We now want to generate the JWT.
    // The token can contain whatever information we desire.
    // However, do not put sensitive information there, like passwords.
    // Here, we will only put the *validated* username
    const data = { username: req.body.username }
    // Generate the token.
    const token = jwt.sign(data, key)
    // Return the token to the browser
    res.status(201).json({ token });
} else
    // Incorrect username/password. The user should try again.
    res.status(404).send('Invalid username and/or password')
}
// Handle login attempt
app.post('/login', processLogin)
// Show sensitive route index - only if logged in
app.get('/', isLoggedIn, index)
// Start server
app.listen(89)