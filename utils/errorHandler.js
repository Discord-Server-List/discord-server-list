/**
 * 
 * @param {Boolean} err 
 * @param {Number} code 
 * @param {String} message 
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 * @returns 
 */
module.exports.errorHandler = (err, code, message, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    } 
    res.sendStatus(code)
    res.send(`Error: ${message}`)
}