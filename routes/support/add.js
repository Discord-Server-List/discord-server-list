var {Router} = require("express")
const Support = require("@models/Support")
var router = Router();

router
.route("/support")
.post(async(req, res) => {
   let s = new Support({
        title:req.body.title,
        body:eq.body.body,
    //s.locale = req.body.locale;
        username:req.body.username,
        file:req.body.attachments,
   })
   s.save((err) => {
    if(err) {
        res.json({
            message: err
        })
    } else {
        res.redirect("/")
    }
});
})

module.exports = router