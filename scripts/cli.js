#!/usr/bin/env node
const arg = require("arg");
const Script = require(".");

const execute = async () => {

    let args = undefined;

    try {
        args = arg({
            "--help": Boolean,
            "--env": String,
            "--project": String,
            "--stack": String,
            "--service": String,
            "--portainersystem": String,
            "--user": String,
            "--password": String,
            "--key": String,
            "--compose": String,
            "--endpoint": String,
            "--update": Boolean,
            "--include-services": Boolean,
            "--pull": Boolean,
            "--deploy-compose": Boolean,
            "-h": "--help",
            "-e": "--env",
            "-p": "--project",
            "-s": "--portainersystem",
            "-u": "--user",
            "-f": "--compose"
        });
    } catch(err) {
        console.error(err);
        Script.Help(1);
    }

    if(args["--help"]) {
        Script.Help();
    }

    const url = Script.CheckUrl(args["--portainersystem"]);

    if(!args["--endpoint"]) args["--endpoint"] = "1";

    console.info(`Authenticating against ${url}`);
    const auth = args["--key"] ? { key: args["--key"] } : await Script.Auth(args["--user"], args["--password"], url);

    if (isNaN(parseInt(args["--endpoint"]))) {
        args["--endpoint"] = Script.GetEndpointByName(auth, url, args["--endpoint"]).Id;
    }

    let stackID = undefined;
    let deploy = false;
    let updateOnly = args["--update"];
    let includeServices = updateOnly || args["--include-services"];

    const stackName = args["--project"] || args["--stack"];

    try {
        console.info(`Check if ${stackName} already exists`);
        stackID = await Script.GetStackByName(auth, url, stackName);
    } catch(err) {
        deploy = true;
    }

    let stack = undefined;

    try {
        if(deploy) {
            if (updateOnly) {
                console.error(`Stack ${stackName} cannot be updated because it does not exist`);
                process.exit(1);
            }

            console.info(`Deploy ${stackName} as new project`);

            if (args["--deploy-compose"]) {
                stack = await Script.Deploy(auth, url, stackName, args["--endpoint"], args["--compose"]);
            }
            else {
                const swarm = await Script.GetSwarm(auth, url, args["--endpoint"]);
                stack = await Script.Deploy(auth, url, stackName, args["--endpoint"], args["--compose"], swarm.ID);
            }
        }
        else {
            const serviceName = args["--service"];

            if (serviceName) {
                const services = await Script.GetServices(auth, url, args["--endpoint"], stackName);
                const service = services.find(v => v.Spec.Name === serviceName);

                if (!service) {
                    console.error(`Cannot update service. Service named ${serviceName} does not exist.`);
                    process.exit(2);
                }

                console.info(`Updating service ${stackName}`);
                const result = await Script.UpdateService(auth, url, args["--endpoint"], service, args["--pull"]);

                if (typeof result === "object" && result.Warnings) {
                    console.warn(`Service ${service.ID} update warnings:`);
                    console.warn(result);
                }
            }
            else {
                if (!updateOnly) {
                    console.info(`Updating ${stackName}...`);
                    stack = await Script.Update(auth, url, stackID, args["--endpoint"], args["--compose"]);
                }

                if (includeServices) {
                    console.info(`Updating ${stackName} services...`);
                    const services = await Script.GetServices(auth, url, args["--endpoint"], stackName);

                    for (const service of services) {
                        console.info(`Updating ${stackName} service ${service.ID} ...`);
                        const result = await Script.UpdateService(auth, url, args["--endpoint"], service, args["--pull"]);

                        if (typeof result === "object" && result.Warnings) {
                            console.warn(`Service ${service.ID} update warnings:`);
                            console.warn(result);
                        }
                    }
                }
            }
        }
    } catch(err) {
        console.error(err);
        process.exit(1);
    }

    console.info(JSON.stringify(stack));
    process.exit(0);
};

execute();
