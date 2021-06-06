const http = require('http');
exports.get_exp = async id => new Promise(resolve => {

    const hostname = process.env.DCBOT_PHPHOST;
    const path = '/get_exp.php';
    const data = JSON.stringify({
        user_id: id
    });
    const options = {
        hostname: hostname,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': data.length
        }
    }
    const r = http.request(options, async res => {
        try {
            let body = '';
            res.setEncoding('utf-8');
            for await (const chunk of res) {
                body += chunk;
            }
            resolve(isNaN(body) ? 0 : parseInt(body));
        } catch (e) {
            console.log('ERROR', e);
        }
    });
    r.write(data);
    r.end();
});