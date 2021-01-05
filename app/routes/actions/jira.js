module.exports = {
    jiraTest
};
let request = require('request');
const config = require('../../../config/main_config');

function jiraTest(req, res) {
    let propertiesObject = {
        os_username: "",
        os_password: "",
        login: "Log In"
    };
    request({
        headers: {
            'Content-Type': 'application/json'
        },
        uri: 'https://jira.ringcentral.com/login.jsp',
        qs: propertiesObject,
        method: 'POST'
    }, function (err, result, body) {
        if (err) {
            res.send({'error': 'An error has occurred by jira'});
        } else {
            console.log(result.headers["set-cookie"][0].split("; Path")[0].split("=")[1]);
            console.log(result.headers["set-cookie"][1].split("; Path")[0].split("=")[1]);
            res.send(result.headers["set-cookie"]);
        }
    });
}