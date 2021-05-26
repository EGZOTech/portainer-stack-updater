const request = require("request");
const fs = require("fs");

module.exports = async (token, url, endpoint, service, forceUpdate) => {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        params.set("version", service.Version.Index.toString());

        request({
            method: "POST",
            uri:  url + `/endpoints/${endpoint}/docker/services/${service.ID}/update?${params.toString()}`,
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify((() => {
                const obj = {
                    ...service.Spec
                };

                if (obj.TaskTemplate && service.PreviousSpec && service.PreviousSpec.TaskTemplate) {
                    obj.TaskTemplate.ForceUpdate = typeof service.PreviousSpec.TaskTemplate.ForceUpdate === "number"
                        ? service.PreviousSpec.TaskTemplate.ForceUpdate + 1
                        : 1;
                }

                if (forceUpdate && obj.TaskTemplate && obj.TaskTemplate.ContainerSpec && obj.TaskTemplate.ContainerSpec.Image) {
                    obj.TaskTemplate.ContainerSpec.Image = obj.TaskTemplate.ContainerSpec.Image.split("@sha")[0];
                }

                return obj;
            })())
        }, (err, response, body) => {
            if(err) return reject(err);
            body = JSON.parse(body);
            if(body.err) return reject(body.err);
            return resolve(body);
        });
    });
};