// src/utils/lib/response.js

const errorResMsg = (res, code, message) => {
    return res.status(code).json({ success: false, message });
};

module.exports = {
    errorResMsg
};
