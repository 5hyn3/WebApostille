// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

'use strict';

const $ = require('jquery');
const nemAudit = require('./nem_audit');

function show() {
    $("#loading").fadeOut("fast");
    $("#contents").delay(400).fadeIn("fast");
}

function failed() {
    $('#failed').show();
    show();
}

function success() {
    $('#success').show();
    show();
}

function init() {
    $("#contents").hide();
    $('#failed').hide();
    $('#success').hide();
}

function audit(url) {
    $('#url').text(url);
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
            if (nemAudit.audit(res, pageBinary)) {
                const date = new Date(nemAudit.getTimeStamp(res['transaction']['timeStamp']));
                $('#status').text('監査に成功しました');
                $('#timestamp').text(date.toUTCString());
                const getAccountFromPublicKeyPath = '/account/get/from-public-key?publicKey=' + res['transaction']['signer'];

                const setOwnerAddress = function (res) {
                    $('#address').text(res['account']['address']);
                    success();
                };

                nemAudit.sendRequestNisAPI(getAccountFromPublicKeyPath, setOwnerAddress);
            } else {
                failed();
            }
        };
        nemAudit.sendRequestNisAPI(getTransactionPath, checkTransaction);
    }

    xhr.send();
}

window.onload = function () {
    init();
    setTimeout(function () {
        show();
    }, 3000);
    chrome.tabs.getSelected(window.id, function (tab) {
        const url = localStorage.auditUrl;
        audit(url);
    })
}
