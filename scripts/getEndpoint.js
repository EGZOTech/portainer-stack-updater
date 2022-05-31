const request = require("request");
const _ = require("lodash");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, endpointName) => {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri:  url + "/endpoints",
            headers: {
                "content-type": "application/json",
                ...generateAuthHeaders(token)
            },
        }, (err, response, body) => {
            if(err) return reject(err);
            const endpoints = JSON.parse(body);
            try {
                const endpoint = _.find(endpoints, ["Name", endpointName]);
                return resolve(endpoint);
            } catch(err) {
                return reject(err);
            }
        });
    });
};
