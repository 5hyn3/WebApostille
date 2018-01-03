// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

'use strict';

const $ = require('jquery');

function nemAudit(transaction, pageBinary) {
    const crypto = require('crypto');

    const algorithms = {
        1: 'md5',
        2: 'sha1',
        3: 'sha256',
        8: 'sha3-256',
        9: 'sha3-512'
    };

    const messagesFixedValue = 'fe4e54590';
    const payload = transaction['transaction']['message']['payload']

    if (payload.slice(0, 9) != messagesFixedValue) {
        return false;
    }

    const algorithm = payload.slice(9, 10);
    const hash = crypto.createHash(algorithms[algorithm]);
    hash.update(new Buffer(pageBinary));
    const pagesHash = hash.digest('hex');

    if (payload.slice(10) == pagesHash) {
        return true;
    } else {
        return false;
    }
}

function getTimeStamp(time) {
    const NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
    return Math.floor((time * 1000 + NEM_EPOCH));
}

function string_to_buffer(src) {
    return (new Uint16Array([].map.call(src, function (c) {
        return c.charCodeAt(0);
    }))).buffer;
}

function failed() {
    $('#status').text('監査に失敗しました');
}

function sendRequestNimAPI(path, func) {
    const NODES = Array(
        'alice2.nem.ninja:7890',
        'alice3.nem.ninja:7890',
        'alice4.nem.ninja:7890',
        'alice5.nem.ninja:7890',
        'alice6.nem.ninja:7890',
        'alice7.nem.ninja:7890'
    );

    const getEndpoint = function () {
        const target_node = NODES[Math.floor(Math.random() * NODES.length)];
        return 'http://' + target_node + path;
    };

    const sendAjax = function () {
        $.ajax({ url: getEndpoint(), type: 'GET' }).then(
            function (res) { func(res) },
            function (res) {
                sendAjax();
            }
        )
    };

    sendAjax();
}

function audit(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function (e) {
        const pageBinary = this.response;
        const filename = url.match('.+/(.+?)([\?#;].*)?$')[1];
        const message = filename.match(/.*%20--%20Apostille%20TX%20([0-9a-f]{64})%20--%20Date%20\d{4}-\d{1,2}-\d{1,2}/);

        if (message == null) {
            failed();
            return;
        }

        const txhash = message[1];
        const getTransactionPath = '/transaction/get?hash=' + txhash;

        const checkTransaction = function (res) {
            if (nemAudit(res, pageBinary)) {
                const date = new Date(getTimeStamp(res['transaction']['timeStamp']));
                $('#status').text('監査に成功しました');
                $('#timestamp').text('TimeStamp:' + date.toUTCString());
                const getAccountFromPublicKeyPath = '/account/get/from-public-key?publicKey=' + res['transaction']['signer'];

                const setOwnerAddress = function (res) {
                    $('#address').text('Owner:' + res['account']['address']);
                };

                sendRequestNimAPI(getAccountFromPublicKeyPath, setOwnerAddress);
            } else {
                failed();
            }
        };
        sendRequestNimAPI(getTransactionPath, checkTransaction);
    }

    xhr.send();
}


window.onload = function () {
    chrome.tabs.getSelected(window.id, function (tab) {
        const url = tab.url;
        audit(url);
    })
}

