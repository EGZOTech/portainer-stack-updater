const request = require("request");
const generateAuthHeaders = require("./generateAuthHeaders");

module.exports = async (token, url, endpoint, image) => {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.set("fromImage", image);

        request({
            method: "GET",
            uri: url +  "/endpoints/1/registries",
            headers: {
                "content-type": "application/json",
                ...generateAuthHeaders(token)
            }
        }, (regErr, regResponse, regBody) => {
            if(regErr) return reject(regErr);

            const registries = JSON.parse(regBody);
            const host = new URL("http://" + image).host;
            const registry = registries.find(v => v.URL === host);

            if (!registry) {
                return reject(new Error(`Registry ${host} not found`));
            }

            request({
                method: "POST",
                uri:  url + `/endpoints/${endpoint}/docker/images/create?${params.toString()}`,
                headers: {
                    "content-type": "application/json",
                    "x-registry-auth": Buffer.from(JSON.stringify({ registryId: registry.Id })).toString("base64"),
                    ...generateAuthHeaders(token)
                },
                body: JSON.stringify({
                    fromImage: image
                })
            }, (err, response, body) => {
                if(err) return reject(err);

                body = JSON.parse("[" + body.split("\n").filter(v => v).join(",") + "]");

                if (body.length === 1 && body[0].message) {
                    return reject(new Error(body[0].message));
                }

                return resolve(body);
            });
        });
    });
};
