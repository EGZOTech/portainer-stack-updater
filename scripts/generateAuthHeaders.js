module.exports = ({ jwt, key }) => {
    if (jwt) {
        return {
            "Authorization": "Bearer " + jwt
        };
    }

    return {
        "X-API-Key": key
    };
}
