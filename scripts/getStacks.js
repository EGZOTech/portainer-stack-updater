const request = require("request");
const _ = require("lodash");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, project) => {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri:  url + "/stacks",
            headers: {
                "content-type": "application/json",
                ...generateAuthHeaders(token)
            },
        }, (err, response, body) => {
            if(err) return reject(err);
            const stacks = JSON.parse(body);
            console.log(stacks);
            try {
                const stackID = _.find(stacks, ["Name", project]).Id;
                return resolve(stackID);
            } catch(err) {
                return reject(err);
            }
        });
    });
};
