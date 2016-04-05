/**
 * Created by brian on 2/23/16.
 */
console.log('Loading...');
var fs = require('fs');
var express = require('express');

//modules below are express middleware
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var mysql = require('mysql');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(bodyParser.json());

app.use(logger('dev'));

app.use(compression());

app.use(allowCrossDomain);

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'phL@!!nds:gh3t:)',
    database: 'siq'
});

connection.connect();

// MongoDB Connection Initialization.



// REST API V2 calls go here.
app.get('/api/v2/entries.json', function(req, res) {
    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').find({},{subject:1}).toArray(function(err, result) {
            if (err) {
                throw err;
            }
            res.status(200).json(result);
            db.close();
        });
    });
});

// Create
app.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var newObj = {};
    newObj.subject = req.body.subject;
    newObj.contents = req.body.contents;

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').insert(newObj, function(err, result) {
            if (err) {
                throw err;
            }
            res.status(201).json(result.ops[0]._id);
            db.close();
        });
    });
});

// Read
app.get('/api/v2/entries/:id.json', function(req, res){
    var id = new mongo.ObjectId(req.params.id);

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        console.log(`Checking mongodb for _id:${id}`);
        //find({_id:ObjectId("56fab77f6ab3ead947e97973")})
        db.collection('entries').find({_id:id}).toArray(function(err, result) {
            if (err) {
                console.log(`Reading _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Reading _id succeeded with result: ${result[0]}`)
            res.status(201).json(result[0]);
            db.close();
        });
    });
});

// Update
app.put('/api/v2/entries/:id.json', function(req, res){
    var object = {};
    var id = new mongo.ObjectId(req.params.id);
    var subject = req.body.subject;
    var contents = req.body.contents;
    
    object._id = id;
    object.subject = subject;
    object.contents = contents;

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        db.collection('entries').update({_id:id}, object, function(err, result) {
            if (err) {
                console.log(`Updating _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Updating _id succeeded with result: ${result}`)
            res.sendStatus(204);
            db.close();
        });
    });
});

// Delete
app.delete('/api/v2/entries/:id', function(req, res){
    var id = new mongo.ObjectId(req.params.id);

    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        console.log(`Checking mongodb for _id:${id}`);
        //find({_id:ObjectId("56fab77f6ab3ead947e97973")})
        db.collection('entries').remove({_id:id}, function(err, result) {
            if (err) {
                console.log(`Deleting _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Deleting _id succeeded with result: ${result}`)
            res.sendStatus(204);
            db.close();
        });
    });
});
// END REAST API V2 CALLS.

/**************************************************************************************************************************************/

//REST API V1 calls go here.
app.get('/api/v1/entries.json', function(req, res) {
    connection.query('select id, subject from entries', function(err, rows, fields){
        if(err) throw err;
        res.status(200).json(rows);
    });
});

// IDEMPOTENT - You can repeat the operation as many times as you want without changing state.
// Create
app.post('/api/v1/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var subject = connection.escape(req.body.subject);
    var contents = connection.escape(req.body.contents);
    console.log(`insert into entries(subject, contents) values (${subject}, ${contents})`);
    connection.query(`insert into entries(subject, contents) values (${subject}, ${contents})`, function(err, results){
        if(err) throw err;
        res.status(201).json(results.insertId);
    });
});

// Read
app.get('/api/v1/entries/:id.json', function(req, res){
    var id = connection.escape(req.params.id);
    console.log(`select id, subject, contents from entries where id = ${id}`);
    connection.query(`select id, subject, contents from entries where id = ${id}`, function(err, row, fields){
        if(err) throw err;
        res.status(200).json(row[0]);
    });
});

// Update
app.put('/api/v1/entries/:id.json', function(req, res){
    var id = connection.escape(req.params.id);
    var subject = connection.escape(req.body.subject);
    var contents = connection.escape(req.body.contents);
    
    connection.query(`update entries set subject = ${subject}, contents = ${contents} WHERE id = ${id}`, function(err, rows, fields){
        if(err) throw err;
        console.log(`update entries set subject = ${subject}, contents = ${contents} WHERE id = ${id}`);
    });
    console.log('Update called');
    res.sendStatus(204);
});

// Delete
app.delete('/api/v1/entries/:id', function(req, res){
    var id = connection.escape(req.params.id);
    connection.query(`delete from entries where id = ${id}`, function(err, rows, fields){
        if(err) throw err;
    });
    console.log('Delete called');
    res.sendStatus(204);
});
// END API METHODS

//traditional webserver stuff for serving static files
var WEB = __dirname + '/web';
app.use(favicon(WEB + '/favicon.ico'));
app.use(express.static(WEB, {maxAge: '12h'}));
app.get('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).sendFile(WEB + '/github404.png');
});

//var config = JSON.parse(fs.readFileSync("/dev/nodejs/resumeServer.json"));
var port = process.env.port || 8080;
var server = app.listen(port);

function gracefulShutdown(){
    console.log("\nStarting shutdown...");
    server.close(function(){
        connection.end();
        console.log('Shutdown complete.');
    });
}

process.on('SIGTERM', function(){
    gracefulShutdown();
});

process.on('SIGINT', function(){
    gracefulShutdown();
});


console.log(`Listening on port ${port}`);