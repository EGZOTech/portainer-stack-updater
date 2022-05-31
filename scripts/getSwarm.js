const request = require("request");
const _ = require("lodash");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, endpointId) => {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri:  url + `/endpoints/${endpointId}/docker/swarm`,
            headers: {
                "content-type": "application/json",
                ...generateAuthHeaders(token)
            },
        }, (err, response, body) => {
            if(err) return reject(err);
            const sawrmInfo = JSON.parse(body);
            try {
                return resolve(sawrmInfo);
            } catch(err) {
                return reject(err);
            }
        });
    });
};
