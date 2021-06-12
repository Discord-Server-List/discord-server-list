const nodemailer = require('nodemailer');

/**
 * Connect SMTP Server
 * @param {String} uri 
 * @param {Number} port 
 * @param {String} host 
 * @param {String} user 
 * @param {Password} pass 
 */
module.exports.connectMail = (host, port , user, pass, err) => {
    nodemailer.createTransport({
        host: host,
        port: port,
        auth: {
           user: user,
           pass: pass
        }
    })
    if(err) {
        console.error(err)
    } else {
        console.log(`Connected to host ${host}`)
    }
}