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
            bggrating: 9.1,
            numraters: 100,
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
                    info.bggrating = $stats.find("bayesaverage").attr("value");
                    info.difficulty = parseFloat($stats.find("averageweight").attr("value")).toFixed(2);
                    info.rank = $stats.find('rank[type="subtype"]').attr("value");
                    info.numraters = $stats.find("usersrated").attr("value");
                    info.description = $respJq.find('description').text();
                    info.yearpublished = $respJq.find('yearpublished').attr("value");
                    info.playingtime = $respJq.find('playingtime').attr("value");

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
                var $colltable = $rankPage.find("#maincontent #main_content #collection #collectionitems #row_");
                var gamecount = 0;
                var $gamelist = $($.parseXML('<items/>'));
                var $gameitems = $gamelist.find('items');
                $colltable.each(function (index, gamerow) {
                    try {
                        gamecount++;
                        var $gamelink = $(gamerow).find("div[id*='results_objectname'] a");
                        var gameyear = $(gamerow).find("div[id*='results_objectname'] span").text();
                        var linkval = $gamelink.attr('href');
                        var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);
                        $gameitems.append($('<item/>', {
                            id: gameNo
                        }));
                        var $curritem = $gameitems.find('item').last();
                        $curritem.append($('<name/>',
                            {
                                value: $gamelink.text()
                            }
                        ));
                        $curritem.append($('<yearpublished/>',
                            {
                                value: gameyear
                            }
                        ));
                    } catch (err) {
                        console.log("At game number " + gamecount++);
                        console.log(gamerow);
                        return;
                    }
                }).get();
                $gamelist.find('items').attr("total", gamecount);
                cb($gamelist);
            },
            "html"
        );

    },
    gamereviews: function (gamenum, cb) {
        $.get("/xdproxy/proxy.php",
            {
                id: gamenum,
                type: 'thing',
                destination: 'http://www.boardgamegeek.com/xmlapi2/forumlist'
            },
            function (response) {
                var $respJq = gi.$xResp(response);
                var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                $.get("/xdproxy/proxy.php",
                    {
                        id: forumid,
                        destination: 'http://www.boardgamegeek.com/xmlapi2/forum'
                    },
                    function (flresp) {
                        cb(gi.$xResp(flresp));
                    },
                    'html'
                );
            },
            'html'
        );

    },
    threadcontent: function (threadid, cb) {
        $.get("/xdproxy/proxy.php",
            {
                id: threadid,
                destination: 'http://www.boardgamegeek.com/xmlapi2/thread'
            },
            function (response) {
                var $respJq = gi.$xResp(response);
                cb($respJq);
            },
            'html'
        );

    }
};