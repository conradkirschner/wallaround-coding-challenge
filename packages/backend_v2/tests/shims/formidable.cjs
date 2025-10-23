// Superagent only needs a shape; we don't parse multipart in tests.
class IncomingForm {
    constructor() {}
    parse(req, cb) { cb(null, {}, {}); }
}
module.exports = { IncomingForm };
