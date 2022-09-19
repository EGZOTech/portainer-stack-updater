const request = require("request");
const fs = require("fs");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, stack, endpoint, composeFile, swarmId = "", environmentVariables = []) => {
    return new Promise((resolve, reject) => {
        const compose = fs.readFileSync(composeFile, {encoding: "utf8"});
        request({
            method: "POST",
            uri:  url + `/stacks?endpointId=${endpoint}&type=${swarmId ? 1 : 2}&method=string`,
            headers: {
                "content-type": "application/json",
                ...generateAuthHeadershHeaders(token)
            },
            body: JSON.stringify({
                env: environmentVariables.map(envVar => ({
                    name: envVar,
                    value: process.env[envVar]
                })),
                name: stack,
                stackFileContent: compose,
                ...(swarmId ? { swarmId } : {})
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
