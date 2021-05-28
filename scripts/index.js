module.exports = {
    Auth: require("./auth"),
    Deploy: require("./deployStack"),
    Update: require("./updateStack"),
    UpdateService: require("./updateService"),
    Help: require("./help"),
    GetStackByName: require("./getStacks"),
    GetEndpointByName: require("./getEndpoint"),
    GetSwarm: require("./getSwarm"),
    GetServices: require("./getServices"),
    CheckUrl: require("./checkURL")
};