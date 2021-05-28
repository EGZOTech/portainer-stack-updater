const request = require("request");
const _ = require("lodash");

module.exports = async (token, url, endpointId) => {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri:  url + `/endpoints/${endpointId}/docker/swarm`,
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
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