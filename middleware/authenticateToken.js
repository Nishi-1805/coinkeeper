import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token from header
    console.log('Token received in middleware:', token); 

    if (!token) return res.sendStatus(401); // No token, unauthorized
    
    jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
        if (err) {
            console.error('JWT verification error:',  err);
            return res.sendStatus(403); // Token invalid, forbidden
}
            req.user = user; // Save user info to request
        next(); // Proceed to the next middleware
    });
}

export default authenticateToken;