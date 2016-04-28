var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function(){
    console.log('Redis connected.');
});

// REST API V3 calls go here.
router.get('/api/v3/entries.json', function(req, res) {
    console.log('Get list from redis');
    client.lrange('entries', 0, -1, function(err, data){
        if(err){
            throw err;
        }
        else{
            var returnVal = [];
            console.log(data);
            data.forEach(function(entry){
                returnVal.push(JSON.parse(entry));
            });
            res.status(201).json(returnVal);
        }
    });
});

// Create
router.post('/api/v3/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    // // {"subject":"Something else","contents":"This is the contents for 'Something else'"}
    var newObj = {};
    newObj.subject = req.body.subject;
    newObj.contents = req.body.contents;

    client.rpush(['entries', JSON.stringify(newObj)], function(err, reply){
        if(err){
            throw err;
        }
        else{
            console.log(reply);
            res.status(201).json(reply);
        }
    });
});

// Read
router.get('/api/v3/entries/:id.json', function(req, res){
    // var id = new mongo.ObjectId(req.params.id);
    var index = req.params.id;
    console.log(`Retrieving entry[${index}]...`);

    client.lrange('entries', index, index, function(err, result){
        if(err){
            throw err;
        }
        else{
            console.log(`Found ${result[0]}`);
            res.status(201).json(JSON.parse(result[0]));
        }
    });
});

// Update
router.put('/api/v3/entries/:id.json', function(req, res){
    var index = req.params.id;
    console.log(`Updating entry[${index}]`);

    var newObj = {};
    newObj.subject = req.body.subject;
    newObj.contents = req.body.contents;

    client.lset('entries', index, JSON.stringify(newObj), function(err, result){
        if(err){
            throw err;
        }
        else{
            console.log(`entry[${index}] updated to ${JSON.stringify(newObj)}`);
            res.sendStatus(204);
        }
    });
});

// Delete
router.delete('/api/v3/entries/:id', function(req, res){
    var index = req.params.id;

    console.log(`Deleting entry[${index}]...`);

    client.lset('entries', index, 'DELETED', function(err, result){
        if(err){
            throw err;
        }
        client.lrem('entries', -1, 'DELETED', function(err, result){
            if(err){
                throw err;
            }
            else{
                console.log(`Deleted entries[${index}]`);
                res.sendStatus(204);
            }
        });
    });
});

module.exports = router;
// END REAST API V2 CALLS.
