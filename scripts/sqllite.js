const {dbdir} = require("./constants");
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(path.join(dbdir,'bltbuddy.db'), (err)=>err?console.error(err)?'connected to sqllite db');
db.serialize()