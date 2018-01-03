chrome.contextMenus.create({
    title: "このページを監査",
    contexts: ["page"],
    type: "normal",
    onclick: function (info) {
        localStorage.auditUrl = info["pageUrl"];
        chrome.tabs.create({ url: 'pages/result.html' }, tab => { });
    }
});

chrome.contextMenus.create({
    title: "リンク先を監査",
    contexts: ["link"],
    type: "normal",
    onclick: function (info) {
        localStorage.auditUrl = info["linkUrl"];
        chrome.tabs.create({ url: 'pages/result.html' }, tab => { });
    }
});

chrome.contextMenus.create({
    title: "画像を監査",
    contexts: ["image"],
    type: "normal",
    onclick: function (info) {
        localStorage.auditUrl = info["srcUrl"];
        chrome.tabs.create({ url: 'pages/result.html' }, tab => { });
    }
});