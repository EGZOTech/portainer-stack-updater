const request = require("request");
const fs = require("fs");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, stack, endpoint, composeFile) => {
    return new Promise((resolve, reject) => {
        const compose = fs.readFileSync(composeFile, {encoding: "utf8"});
        request({
            method: "PUT",
            uri:  url + `/stacks/${stack}?endpointId=${endpoint}`,
            headers: {
                "content-type": "applocation/json",
                ...generateAuthHeaders(token)
            },
            body: JSON.stringify({
                prune: true,
                pullImage: true,
                stackFileContent: compose
            })
        }, (err, response, body) => {
            if(err) return reject(err);
            body = JSON.parse(body);
            if(body.err) return reject(body.err);
            return resolve(body);
        });
    });
};
