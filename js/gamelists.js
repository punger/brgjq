/**
 * Created by paul on 1/26/14.
 */

function GameLister() {
    var au = new AccessUtil();
    var BgList = function() {
        var $gamelist = $('<items/>');
        var gamecount = 0;

        return {
            additem: function (gameNo, name, year) {
                gamecount++;
                var $curritem = $("<item/>", {
                    id: gameNo
                });
                $curritem.append($("<name/>", {
                    value: name
                }));
                $curritem.append($('<yearpublished/>', {
                    value: year
                }));
                $gamelist.append($curritem);

            },
            $getparent: function () {
                $gamelist.attr("total", gamecount);
                var $dummy = $("<dummy/>");
                $dummy.append($gamelist);
                return $dummy;
            }
        };
    };

    return {
        gamesearch: function (query, cb) {
            $.get("/xdproxy/proxy.php",
                {
                    type: "boardgame",
                    query: query.replace(" ", "+"),
                    destination: 'http://www.rpggeek.com/xmlapi2/search'
                },
                function (response) {
                    var $respJq = au.$xResp(response);
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
                    // The following might be wrong
                    var gamelist = new BgList();
                    $colltable.each(function (index, gamerow) {
                        try {
                            gamecount++;
                            var $gamelink = $(gamerow).find("div[id*='results_objectname'] a");
                            var gameyear = $(gamerow).find("div[id*='results_objectname'] span").text();
                            var linkval = $gamelink.attr('href');
                            var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);
                            gamelist.additem(gameNo,  $gamelink.text(), gameyear);
                        } catch (err) {
                            console.log('rank list error '+ err);
                            console.log("At game number " + gamecount++);
                            console.log(gamerow);
                            return;
                        }
                    }).get();
                    cb(gamelist.$getparent());
                },
                "html"
            );

        },
        familylist: function(fid, ftype, start, count, cb) {
            var page = Math.floor(start / count) +1 ;
            var lt = relateditemmap[ftype].listtype;
            var objtype = (lt === "person") ? 'person' : 'property';
            var view = (lt === "person") ? ftype : 'boardgames';
            $.get("/xdproxy/proxy.php",
                {
                    destination:  'http://boardgamegeek.com/geekitem.php',
                    instanceid: 5,      // not relevant?
                    objecttype: objtype,
                    objectid: fid,
                    subtype: ftype,
                    pageid: page,
                    sort: 'rank',
                    view: view,
                    modulename: 'linkeditems',
                    callback: '',
                    showcount: count,
                    "filters[categoryfilter]": '',
                    "filters[mechanicfilter]": '',
                    action: 'linkeditems',
                    ajax: 1
                },
                function(response) {
                    var $rankPage = $(response);
                    var $colltable = $rankPage.find(".innermoduletable > tbody > tr");
                    var gamecount = 0;
                    var gamelist = new BgList();
                    $colltable.each(function (index, gamerow) {
                        try {
                            gamecount++;
                            var $gr = $(gamerow);
                            var $gamelink = $gr.find(".geekitem_linkeditems_title a");
                            var linkval = $gamelink.attr('href');
                            var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);

                            var $statstable = $gr.find('.sf');
                            var $thirdcol = $($statstable[0].rows[0].cells[2]);
                            var gameyear = $($thirdcol.find('table')[0].rows[2].cells[1]).text().trim();
                            //$gr.find("div[id*='results_objectname'] span").text();

                            gamelist.additem(gameNo,  $gamelink.text(), gameyear);
                        } catch (err) {
                            console.log("At game number " + gamecount++);
                            console.log(gamerow);
                            return;
                        }
                    }).get();
                    cb(gamelist.$getparent());

                });

            /*
             For a category:
             http://boardgamegeek.com/geekitem.php
             ?instanceid=5           Not meaningful
             &objecttype=property
             &objectid=1021
             &subtype=boardgamecategory
             &pageid=1
             &sort=name
             &view=boardgames
             &modulename=linkeditems
             &callback=
             &showcount=10
             &filters[categoryfilter]=
             &filters[mechanicfilter]=
             &action=linkeditems
             &ajax=1

             For a mechanic:
             http://boardgamegeek.com/geekitem.php
             ?instanceid=5
             &objecttype=property
             &objectid=2072
             &subtype=boardgamemechanic
             &pageid=2
             &sort=name
             &view=boardgames
             &modulename=linkeditems
             &callback=
             &showcount=10
             &filters[categoryfilter]=
             &filters[mechanicfilter]=
             &action=linkeditems
             &ajax=1

             For a person:
             http://boardgamegeek.com/geekitem.php
             ?instanceid=8
             &objecttype=person
             &objectid=140
             &subtype=boardgamedesigner
             &pageid=1
             &sort=name
             &view=boardgamedesigner
             &modulename=linkeditems
             &callback=
             &showcount=10
             &filters[categoryfilter]=
             &filters[mechanicfilter]=
             &action=linkeditems
             &ajax=1
             */
        },
        gamelist: function (listtype, cb, start, count, args) {
            switch (listtype) {
                case 'search':
                    if (typeof start === "string") {
                        this.gamesearch(start, cb);
                    } else if (typeof start === "number" && typeof args === "string") {
                        this.gamesearch(args, cb);
                    }
                    break;
                case 'rank':
                    this.gamerank(start, cb);
                    break;
                case 'family':
                    this.familylist(args.fid, args.ftype, start, count, cb);
                    break;
                case 'person':
                    break;
                default:
            }
        }

    };

}