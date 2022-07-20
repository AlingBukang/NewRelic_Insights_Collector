var baseURL = 'https://insights-collector.newrelic.com/v1/accounts/';  //1962014/events';
var endpoint = '/events';
var authHeader = 'NRII-8fBvdQTcr7IrS59I-Daw4FIBcbLyvjT6';

function constructURL(accountId) {
    return baseURL + accountId + endpoint;
}

exports.push = function(failed, succeeded, event, context) {
    var apiKey = event.apiKey;
    var accountId = event.accountId;
    var insightEvent = event.item;
    
    console.log('apiKey = ' + apiKey);
    console.log('accountId = ' + accountId);
    console.log('insightEvent = ' + insightEvent);

    var insightsURL = constructURL(accountId);
    console.log('insightsURL = ' + insightsURL);

    superagent.post(insightsURL)
            .set(authHeader, apiKey)
            .send(insightEvent)
            .end(function(error, response) {
                    console.log(error);
                    if (response.ok) {
                        succeeded(response);
                    } else {
                        failed(error);
                    }
                });
}