// Server Setup
const express=require("express");


// Creating express object (in this case, the app)
const app = express();

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);