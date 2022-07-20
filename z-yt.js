const express = require('express')
const app = express()
const axios = require('axios')
const qs = require('querystring');

var https = require('https');
var opt = require('./z-optionsBuilder.js');


exports.handler = (async (event) => {
  // var SNS_msg = JSON.parse(JSON.stringify(event)); //input could be different if coming from SNS
  //var subsid = SNS_msg['id'];
  //var subsid = 'a74e1f29-b7ea-46a5-b844-3c2a5610452b';
  var subsid = '0857794a-7f47-441a-bb79-617dafceee10';
  // console.log('message='+subsid);  
 
  if (subsid == '' || subsid == null) {
    Console.log("Subscription ID is null... terminating");
    process.exit(1);
  }

  //get esr details
  var subs = await sendRequest('esr', subsid, null).then((data) => {
    //console.log("Resposnse...." + JSON.stringify(data));    
    return JSON.stringify(data);
  });

  //get pb details
  var events = await sendRequest('pb', subsid, null).then((data) => {
    //console.log("Resposnse...." + JSON.stringify(data));    
    return JSON.stringify(data);
  });

  //process payload
  var NRpayload = await processNRPayload(subs, events).then((data) => {
    //console.log("Resposnse...." + JSON.stringify(data));    
    return JSON.stringify(data);
  });

  //send to NR
  return await sendRequest('nr', null, NRpayload).catch(err => console.log(err.message));

}) ();


function sendRequest(type, subsid, payload) {
  return new Promise((resolve, reject) => {
     var options = opt.getOptions(type, subsid);
     
     const req = https.request(options, (res) => {
         if (res.statusCode < 200 || res.statusCode >= 300) {
             return reject(new Error('statusCode=' + res.statusCode));
         }
         var body = [];
         res.on('data', function(chunk) {
             body.push(chunk);
         });
         res.on('end', function() {
             try {
                 body = JSON.parse(Buffer.concat(body).toString());
             } catch(e) {
                 reject(e);
             }
             resolve(body);
         });
         res.on('error', function (e) {
          console.log("Result Error", body.toString());
          reject(e.message);
         });    
     });
     req.on('error', (e) => {
       reject(e.message);
     });

     // send the request
     if (type === 'nr') {
       console.log('Payload: \n\n' + payload);
        req.write(JSON.stringify(payload)); 
     }
     
     req.end();
 });
}

function processNRPayload(subsPayload, eventDetailsPayload) {
  return new Promise((resolve, reject) => {
    try {
      var sub = JSON.parse(subsPayload);
      var event = JSON.parse(eventDetailsPayload);
      //var oldestEvent = event['events'][0].eventDateUtc;
      var oldestEvent = event['events'][2].eventDateUtc;
      var first = parseInt(event['firstEventSequence']);
      var last = parseInt(event['lastEventSequence']);
      var totalEvents = ((last-first)+1);

    //   console.log("firstEvent: " +  oldestEvent);
    //   console.log("Number of events: " +  ((last-first)+1));

      sub['oldestEvent'] = oldestEvent;
      sub['numOfEvents'] = totalEvents;
      sub['eventType'] = 'WebhooksESREvents';
      //console.log("For NR payload:  " + JSON.stringify(sub));
      resolve(sub);
    } catch (err) {
      reject(err);
    }  
  });    
}


app.listen(3001, (err) => {
    if (err) return console.error(err);
});
