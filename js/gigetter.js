/**
 * Created by paul on 12/26/13.
 */

var gi;
gi = {
    $xResp: function (response) {
        var respXmlString;
        var htmLoc = response.indexOf('<html');
        if (htmLoc < 0) {
            respXmlString = response;
        }
        else {
            respXmlString = response.substr(0, htmLoc);
        }
        var respXml = $.parseXML(respXmlString);
        return $(respXml);
    },
    gameinfo: function (gamenum, cb) {
        var info = {
            id: gamenum,
            name: 'Some game name',
            imageUrl: '',
            minage: 12,
            difficulty: 2.8,
            rating: 7.33,
            rank: -1,
            valid: true,
            message: ''
        };
        $.get("/xdproxy/proxy.php",
            {
                id: gamenum,
                stats: 1,
                destination: 'http://www.rpggeek.com/xmlapi2/thing'
            },
            function (response) {
                try {
                    var $respJq = gi.$xResp(response);
                    info.name = $respJq.find('name[type="primary"]').attr('value');
                    info.minage = $respJq.find('minage').attr('value');
                    info.imageUrl = $respJq.find('image').text();
                    var $stats = $respJq.find("statistics ratings");
                    info.rating = $stats.find("average").attr("value");
                    info.difficulty = $stats.find("averageweight").attr("value");
                    info.rank = $stats.find('rank[type="subtype"]').attr("value");
//                        info.minage = $respJq.find('minage').attr('value');
                }
                catch (err) {
                    var txt = "There was an error on this page.\n\n";
                    txt += "Error description: " + err.message + "\n\n";
                    txt += "Click OK to continue.\n\n";
                    alert(txt);
                    info.valid = false;
                    info.message = txt;
                }
                cb(info);
            },
            "html"

        );
        return info;
    },
    gamesearch: function (query, cb) {
        $.get("/xdproxy/proxy.php",
            {
                type: "boardgame",
                query: query.replace(" ", "+"),
                destination: 'http://www.rpggeek.com/xmlapi2/search'
            },
            function (response) {
                var $respJq = gi.$xResp(response);
                cb($respJq);
            },
            "html"
        );
    },
    gamerank: function (rankid, cb) {
        // http://rpggeek.com/browse/boardgame?sort=rank&rankobjectid=1&rank=222
        $.get("/xdproxy/proxy.php",
            {
                sort: "rank",
                rankobjectid: 1,
                rank: rankid,
                destination: 'http://rpggeek.com/browse/boardgame'
            },
            function (response) {
                var $rankPage = $(response);
                var $colltable = $rankPage.find("#maincontent #main_content #collection #collectionitems #row");
                var gamelist = $colltable.map(function(index, $gamerow){
                    var $gamelink = $gamerow.find("#results_objectname1 a");
                    var linkval = $gamelink.attr('href');
                    var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);
                    return {
                        id: gameNo,
                        name: $gamelink.text()
                    };
                }).get();
                cb(gamelist);
            },
            "html"
        );

    }
};