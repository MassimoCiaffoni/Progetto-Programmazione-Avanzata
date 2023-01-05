// Server Setup
const express=require("express");
import * as controller from "./controller/controller"
import * as validation from "./middleware/middlewareVal";

// Network constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.json());


//POST route to charge token to specified user
app.post('/charge',validation.ChargeUserVal,  errorHandler, (req, res) => {
    controller.ChargeUser(req,res);
});





app.listen(PORT, HOST);
console.log(`Server started on port ${PORT}`);
