const util = require('util');
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const exec = util.promisify(require('child_process').exec);

async function command(cmd) {
    try {
        const {stdout, stderr} = await exec(cmd);
        return {'stdout': stdout, 'stderr': stderr};
    } catch (err) {
        return {'err': err};
    }
}

const app = express();
app.use(bodyParser.json({
    extended: true
}));
app.use(cors()) // Use this after the variable declaration

const port = 5000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});

app.post("/cmd", (req, res) => {
    const value = req.body.value;
    command(value).then(result => res.json(result));
});

app.get("/url", (req, res) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});
