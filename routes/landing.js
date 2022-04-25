const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    // res.send("Welcome")
    res.render("landing/index")
})

module.exports = router;