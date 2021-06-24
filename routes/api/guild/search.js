var Guild = require("@models/Guild");
var {Router} = require("express");
var router = Router();


router
.route("/")
.get(async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const guilds = await Guild.find({ _id: false });
    res.json(guilds.filter(x => Object.values(x).join().includes(req.query.q.toLocaleLowerCase())));
})

module.exports = router;