/**
 *
 * @param parentid selector for the id of the parent that will be populated
 * @returns {{init: Function, clear: Function}}
 * @constructor
 */
function AjaxTracker(parentid) {
    var requests = [];
    var stash = [];
    var PROXYSTRING = '/PHP/proxy.php';
    var GEEKSTRING = 'geek.com';
    var AJAXIDSTRING = 'ac_';
    var BADAJAXTIMEOUT = 10000;
    var $reqlist;

    var appendrequest = function (req) {
        if ($reqlist) {
            var $item = $(
                '<li id="'+AJAXIDSTRING+req.id+'">' +
                '<span class="ajc-type">'+req.type+'</span>'+
                '<span class="ajc-loc">'+req.loc+'</span>'+
                '</li>');
            $reqlist.append($item);
        }
    };

    var showlist = function() {
        $reqlist = $("#"+parentid);
        if (requests && requests.length > 0) {
            var reqarray = [];
            for (var it in requests) {
                if (requests.hasOwnProperty(it)) {
                    reqarray.push(requests[it]);
                }
            }
            reqarray.sort(function(a, b) { return a.id - b.id;});
            reqarray.forEach(function (item, ix, arr){
                appendrequest(item);
            });
        }

    };

    var parserequest = function(url) {
        if (url.substr(0, PROXYSTRING.length) === PROXYSTRING) {
            var wsloc = url.indexOf(GEEKSTRING);
            if (wsloc > 0) {
                return {
                    "type": "bgg",
                    "loc": url.substr(wsloc+GEEKSTRING.length+1)
                };
            } else {
                return {
                    "type": "unknown",
                    "loc": url
                };
            }
        } else {
            return {
                "type": "local",
                "loc": url
            };
        }
    };

    var stashrequest = function(url, reqid, code) {
        var req = parserequest(url);
        req.id = reqid;
        req.code = code;
        req.origurl = url;
        req.endtime = Date.now();
        stash[""+reqid] = req;
        return req;
    };
    var addrequest = function(url, reqid) {
        var req = parserequest(url);
        req.id = reqid;
        req.starttime = Date.now();
        requests[""+reqid] = req;
        appendrequest(req);
        var stashedreq = stash[""+reqid];
        if (stashedreq) {
            removerequest(reqid, stashedreq.origurl, stashedreq.code);
            delete stash[""+reqid];
        }
        return req;
    };

    var removerequest = function(reqid, url, code) {
        var req = requests[""+reqid];
        if (!req) {
            stashrequest(url, reqid, code);
            //console.log("request ended but didn't start url="+url);
            return;
        }
        var $item = $("#"+AJAXIDSTRING+req.id);
        if (!code || code === 200) {
            delete requests[""+reqid];
            $item.remove();
            return;
        }
        req.endtime = Date.now();
        console.log("Ending "+url+", code="+code);
        $item.find('.ajc-type').css('background-color',  '#ff8080');
    };
    $.subscribe('ajaxcall.start', function(_, url, callid) {
        //console.log("Starting "+url);
        addrequest(url, callid);
    });
    $.subscribe('ajaxcall.end', function(_, url, callid, code) {
        removerequest(callid, url, code);
    });

    var cleanup = function() {
        if (!requests) {
            return;
        }
        requests.forEach(function(item) {
            if (item.hasOwnProperty('endtime')) {
                if (Date.now() - item.endtime > BADAJAXTIMEOUT){
                    removerequest(item.id);
                }
            }
        });
    };

    setInterval(cleanup, 1000);

    return {
        "init": showlist,
        "clear": function() {
            requests = [];
            showlist();
        }
    };

}
