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
            "--portainersystem": String,
            "--user": String,
            "--password": String,
            "--compose": String,
            "--endpoint": String,
            "--update": Boolean,
            "--pull": Boolean,
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
    const auth = await Script.Auth(args["--user"], args["--password"], url);

    if (isNaN(parseInt(args["--endpoint"]))) {
        args["--endpoint"] = Script.GetEndpointByName(auth.jwt, url, args["--endpoint"]).Id;
    }

    let stackID = undefined;
    let deploy = false;
    let updateOnly = args["--update"];

    try {
        console.info(`Check if ${args["--project"]} already exists`);
        stackID = await Script.GetStackByName(auth.jwt, url, args["--project"]);
    } catch(err) {
        deploy = true;
    }

    let stack = undefined;

    try {
        if (updateOnly) {
            if (deploy) {
                console.error(`Stack ${args["--project"]} cannot be updated because it does not exists`);
                process.exit(1);
            }

            console.info(`Updating ${args["--project"]} and its services ...`);

            const services = await Script.GetServices(auth.jwt, url, args["--endpoint"], args["--project"]);

            for (const service of services) {
                console.info(`Updating ${args["--project"]} service ${service.ID} ...`);
                const result = await Script.UpdateService(auth.jwt, url, args["--endpoint"], service, args["--pull"]);

                if (typeof result === "object" && result.Warnings) {
                    console.info(`Service ${service.ID} update warnings:`);
                    console.info(result);
                }
            }
        }
        else if(deploy) {
            console.info(`Deploy ${args["--project"]} as new project`);
            stack = await Script.Deploy(auth.jwt, url, args["--project"], args["--endpoint"], args["--compose"]);
        } else  {
            console.info(`Updating ${args["--project"]}...`);
            stack = await Script.Update(auth.jwt, url, stackID, args["--endpoint"], args["--compose"]);
        }
    } catch(err) {
        console.error(err);
        process.exit(1);
    }

    console.info(JSON.stringify(stack));
    process.exit(0);
};

execute();