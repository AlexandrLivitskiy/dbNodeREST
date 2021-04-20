module.exports = {
    getDirsInDir,
    validateKey,
    getDiskList,
    updateFile,
    createFile,
    addToFile,
    updateTestDataJSON,
    formatTestDataJSON,
    getTestsList
};
const config = require('../../../config/main_config');
let fs = require("fs");
const child = require('child_process');

function getDirsInDir(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        const dirs = fs.readdirSync(req.params.path, {withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name);
        res.send(dirs);
    } else {
        res.send(["ERROR: WRONG KEY: " + req.params.pcFsKey]);
    }
}

function validateKey(req, res) {
    res.send(config.pcFsKey === req.params.pcFsKey);
}

function getDiskList(res) {
    child.exec('wmic logicaldisk get name', (error, stdout) => {
        let drives = stdout.split('\r\r\n').filter(x => /[A-Za-z]:/.test(x)).map(disk => disk.trim());
        res.send(drives);
    });
}

function updateFile(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        let contents = fs.readFileSync(req.params.path, 'utf8');
        contents = contents.split(req.params.oldValue).join(req.params.newValue);
        fs.writeFileSync(req.params.path, contents);
        res.send("File updated");
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function createFile(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        let pathArray = req.params.path.split("\\");
        let tempPath = pathArray[0];
        for (let i = 1; i < pathArray.length - 1; i++) {
            tempPath += "\\" + pathArray[i];
            try {
                fs.statSync(tempPath);
            } catch(e) {
                fs.mkdirSync(tempPath);
            }
        }
        fs.writeFileSync(req.params.path, decodeContent(req.params.content));
        res.send("SUCCESS: File added");
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function addToFile(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        fs.appendFileSync(req.params.path, decodeContent(req.params.content));
        res.send("SUCCESS: Content added to File");
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function decodeContent(content) {
    return content
        .split(";;;1;;;").join("\\")
        .split(";;;2;;;").join("/")
        .split(";;;3;;;").join("*")
        .split(";;;4;;;").join("?")
        .split(";;;5;;;").join("#");
}

function formatTestDataJSON(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        let name = req.params.name;
        name = name.replace("WEB-", "web") + ".testdata.json";
        // findTestDataAndUpdate(req.params.path + "\\tests-src", name, res);
        findTestDataAndFormat("H:\\Workspace\\web-tests\\tests-src", name, res);
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function findTestDataAndFormat(dir, name, res) {
    const files = fs.readdirSync(dir, {withFileTypes: true});
    let testData = files.filter(x => x.name.includes(name));
    if (testData.length > 0) {
        formatTestData(dir + "\\" + testData[0].name, res);
    } else {
        for (let file of files) {
            if (file.isDirectory()) {
                testData = findTestDataAndFormat(dir + "\\" + file.name, name, res);
                if (testData) {
                    break;
                }
            }
        }
    }
    return testData.length > 0;
}

function formatTestData(path, res) {
    let contents = fs.readFileSync(path, 'utf8');
    let indexTags = contents.indexOf('"tags"');
    contents = smartReplace(contents, indexTags, '[', ']', /",\s*"/g, '", "');
    contents = smartReplace(contents, indexTags, '[', ']', /"\s*:\s*\[\s*"/, '": ["');
    contents = smartReplace(contents, indexTags, '[', ']', /"\s*]/, '"]');
    let testdataIndex = contents.indexOf('"testData"');
    let testdataEndIndex = findEnd(contents, testdataIndex, '[', ']');
    let epIndex = contents.indexOf('{', testdataIndex);
    while (epIndex !== -1 && epIndex < testdataEndIndex) {
        contents = smartReplace(contents, epIndex, '{', '}', /,\s*"/g, ', "');
        contents = smartReplace(contents, epIndex, '{', '}', /{\s*"/g, '{"');
        contents = smartReplace(contents, epIndex, '{', '}', /"\s*:\s*/g, '": ');
        contents = smartReplace(contents, epIndex, '{', '}', /\[\s*/g, '[');
        contents = smartReplace(contents, epIndex, '{', '}', /\s*]/g, ']');
        contents = smartReplace(contents, epIndex, '{', '}', /\s*}/g, '}');
        let epEndIndex = findEnd(contents, epIndex, '{', '}');
        testdataEndIndex = findEnd(contents, testdataIndex, '[', ']');
        epIndex = contents.indexOf('{', epEndIndex);
    }
    fs.writeFileSync(path, contents);
    console.log("File updated: " + path);
    res.send("File updated");
}

function smartReplace(str, startIndex, open, end, reg, newVal) {
    let endIndexTags = findEnd(str, startIndex, open, end);
    return str.replace(reg, (match, offset) => {
        if (offset >= startIndex && offset <= endIndexTags) {
            return newVal;
        }
        return match;
    });
}

function findEnd(str, start, open, close, index = -1) {
    let openIndex = str.indexOf(open, start);
    let closeIndex = str.indexOf(close, start);
    if (openIndex !== -1 && openIndex < closeIndex) {
        return findEnd(str, openIndex + 1, open, close, ++index);
    } else if (index === 0) {
        return closeIndex;
    }
    return findEnd(str, closeIndex + 1, open, close, --index);
}

function updateTestDataJSON(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        let name = req.params.name;
        name = name.replace("WEB-", "web") + ".testdata.json";
        // findTestDataAndUpdate(req.params.path + "\\tests-src", name, res);
        findTestDataAndUpdate("H:\\Workspace\\web-tests\\tests-src", name, res);
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function findTestDataAndUpdate(dir, name, res) {
    const files = fs.readdirSync(dir, {withFileTypes: true});
    let testData = files.filter(x => x.name.includes(name));
    if (testData.length > 0) {
        updateTestData(dir + "\\" + testData[0].name, res);
    } else {
        for (let file of files) {
            if (file.isDirectory()) {
                testData = findTestDataAndUpdate(dir + "\\" + file.name, name, res);
                if (testData) {
                    break;
                }
            }
        }
    }
    return testData.length > 0;
}

function updateTestData(path, res) {
    let contents = fs.readFileSync(path, 'utf8');
    for (let tier in packageIds) {
        contents = contents.split(`"tierId": ${tier}`).join(`"packageId": ${packageIds[tier][0]}, "packageVersion": ${packageIds[tier][1]}`);
        contents = contents.split(`"tierId":${tier}`).join(`"packageId": ${packageIds[tier][0]}, "packageVersion": ${packageIds[tier][1]}`);
        contents = contents.split(`"tierId":"${tier}"`).join(`"packageId": ${packageIds[tier][0]}, "packageVersion": ${packageIds[tier][1]}`);
        contents = contents.split(`"tierId": "${tier}"`).join(`"packageId": ${packageIds[tier][0]}, "packageVersion": ${packageIds[tier][1]}`);
    }
    fs.writeFileSync(path, contents);
    console.log("File updated: " + path);
    res.send("File updated");
}

function getTestsList(req, res) {
    if (config.pcFsKey === req.params.pcFsKey) {
        let tests = searchAllTests("H:\\Workspace\\web-tests\\tests-src", req);
        res.send(tests);
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}

function searchAllTests(dir, req) {
    let allTests = [];
    const files = fs.readdirSync(dir, {withFileTypes: true});
    for (let file of files) {
        if (file.isDirectory()) {
            let tests = searchAllTests(dir + "\\" + file.name, req);
            allTests = [...allTests, ...tests];
        } else {
            if (isIncludeSearch(dir + "\\" + file.name, req)) {
                let test = file.name.split(".")[0].replace("web", "WEB-");
                if (!allTests.includes(test)) allTests.push(test);
            }
        }
    }
    return allTests;
}

function isIncludeSearch(path, req) {
    let contents = fs.readFileSync(path, 'utf8');
    let search = req.params.search;
    let orSearch = req.body.orSearch || [];
    let include = req.body.include || [];
    let excude = req.body.excude || [];

    return (contents.includes(search) || orSearch.some(x => contents.includes(x))) &&
        include.every(x => contents.includes(x)) &&
        excude.every(x => !contents.includes(x));
}

packageIds = {

};
