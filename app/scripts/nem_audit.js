'use strict';

module.exports = {
    getTimeStamp: function (time) {
        const NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
        return Math.floor((time * 1000 + NEM_EPOCH));
    },

    sendRequestNimAPI: function (path, func) {
        const NODES = Array(
            'alice2.nem.ninja:7890',
            'alice3.nem.ninja:7890',
            'alice4.nem.ninja:7890',
            'alice5.nem.ninja:7890',
            'alice6.nem.ninja:7890',
            'alice7.nem.ninja:7890'
        );

        const $ = require('jquery');

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
    },

    audit: function (transaction, pageBinary) {
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
}