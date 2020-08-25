const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const blt = require('./blt')
const app = express();

app.use(bodyParser.json({
    extended: true
}));
app.use(cors()) // Use this after the variable declaration

const port = 5000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});
// use this for direct communication between app server and electron.. hence app through emitters (ipcMain)
process.on("message", (cmd) => {
    if (cmd['checkSFM'])
        blt.isNeedSFM().then(value => process.send(value['res']))
    // command(cmd['cmd']).then(res => process.send(res))
});
app.get("/is-need-sfm", (req, res) => {
    blt.isNeedSFM().then(v=>{
        res.json({'sfm-needed': v['res']})
    })
})
app.post("/cmd", (req, res) => {
    const value = req.body.value;
    blt.command(value).then(result => res.json(result));
});
app.post("/start-blt", (req, res) => {
    // command(working_dir_cmd+"(blt --start-bg)").then(result => res.json(result));
    blt.sfm().then(() => res.json(blt.start_blt()))
});
app.post("/stop-blt", (req, res) => {
    blt.sfm().then(() => blt.command(working_dir_cmd + "blt --stop").then(result => res.json(result)));
});
app.post("/kill-blt", (req, res) => {
    blt.sfm().then(() => blt.killblt().then(result => res.json(result)));
});
app.post('/sfm', (req, res) => blt.sfm().then(r => res.json(r)))

app.post('/restart-blt', (req, res) => {
    blt.restartBlt().then(value => res.json(value))
});
app.get("/check-health", (req, res) => {
    blt.checkHealth().then(value => res.json(value))
});
