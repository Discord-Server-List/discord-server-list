const { Router } = require("express");
var User = require("@models/User");
var router = Router();

router.use("/add", require("./add"));
router.get("/:user_id", async(req, res) => {
    var userData = await User.findOne({userID: req.params.user_id});
    if(userData) {
        res.render("user/views", {
            title: userData.username + " Profile",
            icon: userData.userIcon,
            id: userData.userID
        })
    } else {
        res.send("User Not Found")
    }
});

module.exports = router;