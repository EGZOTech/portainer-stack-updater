const request = require("request");
const _ = require("lodash");

module.exports = async (token, url, endpointId, stackName) => {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.set("filters", JSON.stringify({
            label: [`com.docker.stack.namespace=${stackName}`]
        }));

        request({
            method: "GET",
            uri:  url + `/endpoints/${endpointId}/docker/services?${params.toString()}`,
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
            },
        }, (err, response, body) => {
            if(err) return reject(err);
            try {
                const services = JSON.parse(body);
                return resolve(services);
            } catch(err) {
                return reject(err);
            }
        });
    });
};