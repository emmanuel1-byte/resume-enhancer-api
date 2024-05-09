function respond(res, statusCode, message, data = null) {
    const success = statusCode >= 200 && statusCode < 300; 
    return res.status(statusCode).json({ success, message, data });
}

module.exports = respond