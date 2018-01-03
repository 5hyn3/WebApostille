chrome.contextMenus.create({
    title: "このページを監査",
    contexts: ["page"],
    type: "normal",
    onclick: function (info) {
        console.log(info);
        console.log(info["pageUrl"]);
        chrome.tabs.create({ url: 'pages/result.html' }, tab => { });
    }
});

chrome.contextMenus.create({
    title: "リンク先を監査",
    contexts: ["link"],
    type: "normal",
    onclick: function (info) {
        console.log(info["linkUrl"]);
    }
});

chrome.contextMenus.create({
    title: "画像を監査",
    contexts: ["image"],
    type: "normal",
    onclick: function (info) {
        console.log(info["pageUrl"]);
    }
});