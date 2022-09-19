const request = require("request");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, stack, endpoint) => {
    return new Promise((resolve, reject) => {
        request({
            method: "DELETE",
            uri:  url + `/stacks/${stack}?endpointId=${endpoint}`,
            headers: {
                "content-type": "application/json",
                ...generateAuthHeaders(token)
            },
        }, (err, response, body) => {
            if(err) return reject(err);
            body = JSON.parse(body);
            if (response.statusCode !== 200) return reject(body);
            if(body.err) return reject(body.err);
            return resolve(body);
        });
    });
};
