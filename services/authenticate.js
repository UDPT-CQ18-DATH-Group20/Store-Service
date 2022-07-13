const jwt = require("jsonwebtoken");
const JWT_KEY = "secretKey";

//token
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmIzNzJlMWIwOWQ0YjYyN2M3NDQyZDciLCJ1c2VyX3R5cGUiOjEsImFjY291bnRfaW5mbyI6IjYyYjM3MmUxYjA5ZDRiNjI3Yzc0NDJkNiIsImlhdCI6MTY1NjE0MTkzMX0.DuwmatBqWytxvo5G3EnVNC7hWtPCM58_1YewHVdy8HU

const auth = async (req, res, next) => {
  try {
    const Authorization = req.header("Authorization");
    if (!Authorization) {
      throw new Error();
    }
    const token = Authorization.replace("Bearer ", "");
    const data = jwt.verify(token, JWT_KEY);

    req.query.account_id = data._id;
    req.query.user_type = data.user_type;
    // req.params.token = token;
    next();
  } catch (error) {
    res.status(401).send("Not authorized to access this resource");
  }
};
module.exports = auth;
