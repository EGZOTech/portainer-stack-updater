const request = require("request");
const fs = require("fs");

module.exports = async (token, url, stack, endpoint, composeFile, deployType = "swarm") => {
    return new Promise((resolve, reject) => {
        const compose = fs.readFileSync(composeFile, {encoding: "utf8"});
        request({
            method: "POST",
            uri:  url + `/stacks?endpointId=${endpoint}&type=${deployType === "swarm" ? 1 : 2}&method=string`,
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                Name: stack,
                StackFileContent: compose
            })
        }, (err, response, body) => {
            if(err) return reject(err);
            body = JSON.parse(body);
            if (response.statusCode !== 200) return reject(body);
            if(body.err) return reject(body.err);
            return resolve(body);
        });
    });
};