var ratelimit =  require("express-rate-limit");

module.exports.rateLimit = (windowMs, max, req, res, next) => {
    return ratelimit({
        windowMs, max, handler: function(req, res) {
            return res.sendStatus(429).json({
                error: true,
                statusCode: 429,
                message: "Noisy Penguin Server List API - You are sending too many requests, please slow down"
            })
        }
    })
}