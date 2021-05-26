const request = require("request");
const _ = require("lodash");

module.exports = async (token, url, endpointName) => {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri:  url + "/endpoints",
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
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