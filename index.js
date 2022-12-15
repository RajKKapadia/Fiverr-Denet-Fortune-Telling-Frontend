const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

const PROJECID = CREDENTIALS.project_id;

const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
};

const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

const detectIntent = async (languageCode, queryText, sessionId) => {

    let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);

    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        return {
            status: 1,
            text: result.fulfillmentText
        };
    } catch (error) {
        console.log(`Error at dialogflow_api.js detectIntent --> ${error}`);
        return {
            status: 0,
            text: 'Error at dialogflow detect intent.'
        };
    }
};

const webApp = express();

const PORT = process.env.PORT;

webApp.use(express.urlencoded({extended: true}));
webApp.use(express.json());
webApp.use(cors({origin: true}));
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});


webApp.get('/', (req, res) => {
    res.sendStatus(200);
});


webApp.get('/dialogflow', (req, res) => {

    res.status(200).json({ message: 'Use POST request for Dialogflow route.'});
});


webApp.post('/dialogflow', async (req, res) => {
    if (!Object.keys(req.body).length) {
        
        return res.status(400).json({
            mesage: 'Request has no body'
        });

    } else {

        let intentData = await detectIntent('en-US', req.body.query, req.body.sessionId);
    
        res.status(200).json(intentData);
    }
});


webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
