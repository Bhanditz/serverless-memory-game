// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const Uuid = require("node-uuid");

const SCORES_TABLE = process.env.SCORES_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

const app = express();

let dynamoDb;

// for local development
if (IS_OFFLINE === 'true') {

    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://0.0.0.0:8000'
    });
    console.log(dynamoDb);
}
else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(cors());

app.use(bodyParser.json({strict: false}));

app.get('/', function (req, res) {
    res.send('Hello Dani!')
});

app.get('/scores', function (req, res) {
    const params = {
        TableName: SCORES_TABLE,
        Limit: 10
    };

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({error: 'Could not get scores'});
        }
        res.json(result);
    });
});

app.post('/scores', function (req, res) {

    req.body.scoreId = Uuid.v4();

    const params = {
        TableName: SCORES_TABLE,
        Item: req.body
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({error: 'Could not create score'});
        }
        res.json(req.body);
    });
});

module.exports.handler = serverless(app);