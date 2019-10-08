module.exports = {
    getDirsInDir, validateKey, getDiskList, updateFile, createFile
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
        let content = req.params.content
            .split(";;;1;;;").join("\\")
            .split(";;;2;;;").join("/")
            .split(";;;3;;;").join("*")
            .split(";;;4;;;").join("?")
            .split(";;;5;;;").join("#");
        fs.writeFileSync(req.params.path, content);
        res.send("File added");
    } else {
        res.send("ERROR: WRONG KEY: " + req.params.pcFsKey);
    }
}
