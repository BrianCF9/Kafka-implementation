const express = require("express")
const { Router } = require("express")
const { manageUser } = require("./controllers/usersController");
const app = express();
const router = Router()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use(router.post('/login', (req, res) => {
    const { user, pass } = req.body;
    // console.log(req.body)
    const resp = manageUser(req.body);
    res.status(200).send({ ...req.body, message: resp })
}))




app.listen(3000, () => {
    console.log("Server running in port 3000")
})