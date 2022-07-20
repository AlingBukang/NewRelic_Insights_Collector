const pbHost = '';
const esrHost = ''
const nrHost = 'insights-collector.newrelic.com';
const pbKey = '';
const esrKey = '';
const nrKey = '';
const nrAccount = '';

exports.getOptions = ((type, subsid) => {
    var options;
    
    if (type == 'esr') {
        return options = {
            host: esrHost,
            path: '/v1/eventsubscriptions/' +subsid,
            method: 'GET',
            headers: {
                'x-api-key': esrKey
            }
        };
    } else
    
    if (type == 'pb') {
        return options = {
            host: pbHost,
            path: '/v1/postboxes/' + subsid + '/payload',
            method: 'GET',
            headers: {
                'x-itr-required': false,
                'x-api-key': pbKey
            }
        };
    } else 
    
    if (type == 'nr') {
        return options = {
            host: nrHost,
            path: '/v1/accounts/' + nrAccount +'/events', //dynamic account
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Insert-Key': nrKey
            }
        };
    }  else {
        return 'unknown type';
    }
})    
