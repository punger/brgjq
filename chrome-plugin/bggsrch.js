/**
 * Created by paul on 1/25/14.
 */

// A generic onclick callback function.
function genericOnClick(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
    chrome.tabs.query({"title": "BBGG 2"}, function (tabarray) {
        if (tabarray.length > 0) {
            var tabid = tabarray[0].id;
            chrome.tabs.update(tabid, {
                "url": "http://pju.name/bbgg?"+info.selectionText
            });
        } else {
            chrome.tabs.create({
                "url": "http://pju.name/bbgg?"+info.selectionText
            });
        }
    });
}

chrome.contextMenus.create({
    "title": "Search on BBGG",
    "contexts": ["selection"],
    "onclick": genericOnClick
});

