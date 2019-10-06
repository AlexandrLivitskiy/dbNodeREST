module.exports = {
    getAllNotSuberSube, getAllSubscribes
};
let request = require('request');
const config = require('../../../config/main_config');

function getAllSubscribes(res, after = null, type = "subscribes", customRes = false) {
    let subType = {
        subscribes: "d04b0a864b4b54837c0d870b0e77e076",
        subscribers: "c76146de99bb02f6415203be841dd25a"
    };
    let propertiesObject = {
        query_hash: subType[type],
        variables: `{"id":"6912966503","include_reel":false,"fetch_mutual":false,"first":100,"after":${after}}`
    };
    request({
        headers: {
            'Content-Type': 'application/json',
            'Cookie': config.instaCookie
        },
        uri: 'https://www.instagram.com/graphql/query/',
        qs: propertiesObject,
        method: 'GET'
    }, function (err, result, body) {
        if (customRes) {
            customRes(err, result, body);
        } else {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(body);
            }
        }
    });
}

function getAllNotSuberSube(res, after = null, subscribesEdges = []) {
    getAllSubscribes(res, after, "subscribes", (err, result, body) => {
        let edges = JSON.parse(body).data.user.edge_follow.edges;
        for (let i = 0; i < edges.length; i++) {
            subscribesEdges.push(edges[i]);
        }
        if (JSON.parse(body).data.user.edge_follow.page_info.has_next_page) {
            getAllNotSuberSube(res, '"' + JSON.parse(body).data.user.edge_follow.page_info.end_cursor + '"', subscribesEdges);
        } else {
            getAllSuberAndComp(res, null, subscribesEdges);
        }
    });
}

function getAllSuberAndComp(res, after, subscribesEdges, subscribersEdgesId = []) {
    getAllSubscribes(res, after, "subscribers", (err, result, body) => {
        let edges = JSON.parse(body).data.user.edge_followed_by.edges;
        for (let i = 0; i < edges.length; i++) {
            subscribersEdgesId.push(edges[i].node.id);
        }
        if (JSON.parse(body).data.user.edge_followed_by.page_info.has_next_page) {
            getAllSuberAndComp(res, '"' + JSON.parse(body).data.user.edge_followed_by.page_info.end_cursor + '"', subscribesEdges, subscribersEdgesId);
        } else {
            let resultList = subscribesEdges.filter(node => subscribersEdgesId.filter(id => id === node.node.id).length == 0);
            res.send(resultList);
        }
    })
}
