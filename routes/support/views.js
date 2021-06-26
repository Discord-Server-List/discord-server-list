var Support = require("@models/Support");
var {Router} = require("express");
var router = Router();

router.route("/:ticket_id").get(async(req, res) => {
    let supportData = await Support.findOne({supportID: req.params.ticket_id});
    if(supportData) {
        res.json(supportData);
    } else {
        res.sendStatus(404).json({
            message: "Not Found",
            errorCode: 404
        })
    }
})

module.exports = router;