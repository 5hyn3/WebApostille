// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

const $ = require('jquery');
const crypto = require('crypto');

const NODES = Array(
    'alice2.nem.ninja:7890',
    'alice3.nem.ninja:7890',
    'alice4.nem.ninja:7890',
    'alice5.nem.ninja:7890',
    'alice6.nem.ninja:7890',
    'alice7.nem.ninja:7890'
);

const algorithms = {
    1: 'md5',
    2: 'sha1',
    3: 'sha256',
    8: 'sha3-256',
    9: 'sha3-512'
};

const messagesFixedValue = 'fe4e54590';

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

function check(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function (e) {
        var pageBinary = this.response;
        var filename = url.match('.+/(.+?)([\?#;].*)?$')[1];
        var message = filename.match(/.*%20--%20Apostille%20TX%20([0-9a-f]{64})%20--%20Date%20\d{4}-\d{1,2}-\d{1,2}/)

        var hash = crypto.createHash('sha256');
        hash.update(new Buffer(pageBinary));
        var pagesHash = hash.digest('hex');

        if (message == null) {
            failed();
            return;
        }
        var txhash = message[1];
        var getEndpoint = function () {
            var target_node = NODES[Math.floor(Math.random() * NODES.length)];
            return 'http://' + target_node + '/transaction/get?hash=' + txhash;
        }
        var sendAjax = function () {
            $.ajax({ url: getEndpoint(), type: 'GET' }).then(
                function (res) { checkTransaction(res) },
                function (res) {
                    sendAjax();
                }
            )
        };

        var checkTransaction = function (res) {
            var payload = res['transaction']['message']['payload']
            if (payload.slice(0, 9) != messagesFixedValue) {
                failed();
            }
            var algorithm = payload.slice(9, 10);
            var hash = crypto.createHash(algorithms[algorithm]);
            hash.update(new Buffer(pageBinary));
            var pagesHash = hash.digest('hex');
            if (payload.slice(10) == pagesHash) {
                var date = new Date(getTimeStamp(res['transaction']['timeStamp']));
                $('#status').text('監査に成功しました');
                $('#timestamp').text('TimeStamp');
                $('#time').text(date.toUTCString());
            } else {
                failed();
            }
        };
        sendAjax();
    }

    xhr.send();
}


window.onload = function () {
    chrome.tabs.getSelected(window.id, function (tab) {
        var url = tab.url;
        check(url);
    })
}

