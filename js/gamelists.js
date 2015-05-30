/**
 * Created by paul on 1/26/14.
 */

/**
 * Surfaces methods to retrieve lists of games
 * @returns {{gamesearch: Function, hotness: Function, gamerank: Function, familylist: Function, gameforuser: Function, gamelist: Function}}
 * @constructor
 */
function GameLister() {
    var MAXDELAY = 5000;
    var RETRYINTERVAL = MAXDELAY / 10;
    var au = new AccessUtil();
    var ownersmap = {};

    var wishlistarray = [
        "",
        "Must have",
        "Love to have",
        "Like to have",
        "Thinking about it",
        "Don't buy this"
    ];

    var BgList = function() {
        var gamecount = 0;
        var gamelist = [];
        var $jqtemplate;
        var loadtemplate = function(cb) {
            $.get('html-frag/gamelist.xml', function(r) {
                $jqtemplate = $(r);
                if (cb) {
                    cb();
                }
            });
        };
        var asObj = function () {
            return {
                "total": gamecount,
                "items":gamelist
            };
        };

//        var glDir = {
//            "items@total": "total",
//            "item":{
//                "it<-items": {
//                    "@id": "it.gameNo",
//                    "name@value": "it.name",
//                    "yearpublished@value": "it.year"
//                }
//            }
//        };

        return {
            additem: function (gameNo, name, year, data) {
                gamelist[gamecount++] = {
                    "name": name,
                    "gameNo": gameNo,
                    "year": year,
                    "data": data
                };
            },

            $getparent: function (cb) {
                loadtemplate(function() {

                    var $items = $jqtemplate.find('items');
                    $items.attr('total', gamecount);
                    var $item = $jqtemplate.find('item');
                    $items.empty();
                    $.each(gamelist, function (i, item){
                        var $ti = $item.clone();
                        $ti.attr('id', item.gameNo);
                        $ti.find('name').attr('value', item.name);
                        $ti.find('yearpublished').attr('value', item.year);
                        $items.append($ti);
                    });
                    cb($jqtemplate);
                });
            },
            getparent: function () {
                return asObj();
            },
            findgame: function(gameno) {
                for (var i = 0; i < gamecount; i++) {
                    if (gamelist[i].gameNo === gameno) {
                        return gamelist[i];
                    }
                }
                return null;
            },
            containsgame: function(gameno) {
                return this.findgame(gameno) !== null;
            },
            ownsgame: function (gameno) {
                var gameitem = this.findgame(gameno);
                if (!gameitem) return false;
                if (!gameitem.data) return false;
                return gameitem.data.own;
            },
            tomap: function () {
                var gamemap = {};
                for (var i = 0; i < gamecount; i++) {
                    var item = gamelist[i];
                    gamemap[item.gameNo] = item;
                }
                return gamemap;
            }
        };
    };

    var getcollection = function(user, game, cb, delay) {
        if (delay > MAXDELAY) {
            cb('Collection retrieval timed out');
            return;
        }
        var gamesuffix = '';
        if (game) {
            gamesuffix = '&id='+game;
        }
        $.ajax("/PHP/proxy.php",
            {
                //context: this,
                data: 'http://www.rpggeek.com/xmlapi2/collection?username='+user + gamesuffix,
                dataType: 'text',
                success: function (response) {
                    var $respJq = au.$xResp(response);
                    var $resptype = $respJq.find('items');
                    if ($resptype[0]) {
                        var itemlist = new BgList();
                        $respJq.find("item").each(function(i, item){
                            var $item = $(item);
                            itemlist.additem(
                                $item.attr('objectid'),
                                $item.find('name').text(),
                                $item.find('yearpublished').text(),
                                {
                                    collid: $item.attr('objectid'),
                                    own: $item.find('status').attr('own') === '1',
                                    date: $item.find('status').attr('lastmodified'),
                                    wishlist: $item.find('status').attr('wishlistpriority'),
                                    wishcomment: wishlistarray[parseInt($item.find('status').attr('wishlistpriority'))]
                                }
                            );
                        });
                        // either this is the entire collection, so cache it
                        if (!game) {
                            ownersmap[user] = itemlist.tomap();

                        } else {
                            // or it's a single game update, so overwrite the last retrieved
                            // status of the game because it could be an update
                            var userscoll = ownersmap[user];
                            if (userscoll) {
                                userscoll[game] = itemlist.getparent().items[0];
                            }
                        }
                        cb(itemlist.getparent());
                        return;
                    }

                    //<message>Your request for this collection has been accepted and will be processed.
                    // Please try again later for access.</message>
                    $resptype = $respJq.find('message');
                    if ($resptype[0]) {
                        if ($resptype.text().indexOf('try again later') >= 0) {
                            setTimeout(
                                function() {
                                    getcollection(user, game, cb, delay + RETRYINTERVAL);
                                },
                                RETRYINTERVAL);
                        } else {
                            cb($resptype.text());
                        }
                    }
                }
            }
        );

    };

    var getcurcoll = function() {
        var user = $.cookie('bgguser');
        if (user) {
            if (ownersmap.hasOwnProperty(user))
                return ownersmap[user];
        }
        return null;
    };

    var mixedgamedata = function(data, gameno, currcoll) {
        if (currcoll) {
            if (currcoll.hasOwnProperty(gameno)) {
                return $.extend({}, data, currcoll[gameno].data);
            }
        }
        return data;
    };

    var getsimplelist = function(url, cb) {
        $.get("/PHP/proxy.php",
            url,
            function (response) {
                var currcoll = getcurcoll();
                var itemlist = new BgList();
                var $respJq = au.$xResp(response);
                $respJq.find("item").each(function(i, item){
                    var $item = $(item);
                    var gameno = $item.attr('id');
                    itemlist.additem(
                        gameno,
                        $item.find('name').attr('value'),
                        $item.find('yearpublished').attr('value'),
                        mixedgamedata(null, gameno, currcoll)
                    );
                });
                cb(itemlist.getparent());
            },
            "html"
        );

    };

    return {
        gamesearch: function (query, cb) {
            getsimplelist(
                'http://www.rpggeek.com/xmlapi2/search?type=boardgame&query='+
                query.replace(" ", "+"), cb);
        },
        hotness: function (query, cb) {
            getsimplelist('http://www.rpggeek.com/xmlapi2/hotness?type=boardgame', cb);
        },
        gamerank: function (rankid, cb) {
            // http://rpggeek.com/browse/boardgame?sort=rank&rankobjectid=1&rank=222
            $.get("/PHP/proxy.php",
                'http://rpggeek.com/browse/boardgame?sort=rank&rankobjectid=1&rank='+rankid,
                function (response) {
                    var $rankPage = $(response);
                    var $colltable = $rankPage.find("#maincontent #main_content #collection #collectionitems #row_");
                    var gamecount = 0;
                    // The following might be wrong
                    var gamelist = new BgList();
                    var currcoll = getcurcoll();
                    $colltable.each(function (index, gamerow) {
                        try {
                            gamecount++;
                            var $gamerow = $(gamerow);
                            var $gamelink = $gamerow.find("div[id*='results_objectname'] a");
                            var gameyear = $gamerow.find("div[id*='results_objectname'] span").text();
                            gameyear = gameyear.replace(/\(|\)/g, '');
                            var linkval = $gamelink.attr('href');
                            var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);
                            var $stats = $gamerow.find('.collection_bggrating');
                            var gamedata = {
                                rating: $stats.get(1).innerHTML.trim(),
                                bggrating: $stats.get(0).innerHTML.trim(),
                                raters: $stats.get(2).innerHTML.trim()
                            };
                            gamedata = mixedgamedata(gamedata, gameNo, currcoll);
                            gamelist.additem(gameNo,  $gamelink.text(), gameyear, gamedata);
                        } catch (err) {
                            console.log('rank list error '+ err);
                            console.log("At game number " + gamecount++);
                            console.log(gamerow);
                            return;
                        }
                    }).get();
                    cb(gamelist.getparent());
                },
                "html"
            );

        },
        familylist: function(fid, ftype, start, count, cb) {
            var page = Math.floor(start / count) +1 ;
            var lt = relateditemmap[ftype].listtype;
            var objtype = (lt === "person") ? 'person' : 'property';
            var view = (lt === "person") ? ftype : 'boardgames';
            $.get("/PHP/proxy.php",
                'http://boardgamegeek.com/geekitem.php' +
                    '?instanceid=5'+
                    '&objecttype='+objtype +
                    '&objectid='+fid+
                    '&subtype='+ftype+
                    '&pageid='+page+
                    '&sort=rank'+
                    '&view='+view+
                    '&modulename=linkeditems'+
                    '&callback='+
                    '&showcount='+count+
                    '&filters[categoryfilter]=' +
                    '&filters[mechanicfilter]=' +
                    '&action=linkeditems&ajax=1',
                function(response) {
                    var $rankPage = $(response);
                    var $colltable = $rankPage.find(".innermoduletable > tbody > tr");
                    var gamecount = 0;
                    var gamelist = new BgList();
                    var currcoll = getcurcoll();
                    $colltable.each(function (index, gamerow) {
                        try {
                            gamecount++;
                            var $gr = $(gamerow);
                            var $gamelink = $gr.find(".geekitem_linkeditems_title a");
                            var linkval = $gamelink.attr('href');
                            var gameNo = linkval.match(/\/([0-9]+)/gi)[0].substr(1);

                            var $statstable = $gr.find('.sf');
                            var $firstcol = $($statstable[0].rows[0].cells[0]);
                            var data = {
                                rank: $($firstcol.find('table'))[0].rows[0].cells[1].innerHTML.trim(),
                                raters: $($($firstcol.find('table'))[0].rows[1].cells[1].innerHTML).text().trim(),
                                rating: $($firstcol.find('table'))[0].rows[2].cells[1].innerHTML.trim(),
                                weight: $($firstcol.find('table'))[0].rows[3].cells[1].innerHTML.trim()
                            };
                            var $thirdcol = $($statstable[0].rows[0].cells[2]);
                            var gameyear = $($thirdcol.find('table')[0].rows[2].cells[1]).text().trim();
                            //$gr.find("div[id*='results_objectname'] span").text();
                            data = mixedgamedata(data, gameNo, currcoll);
                            gamelist.additem(gameNo,  $gamelink.text(), gameyear, data);
                        } catch (err) {
                            console.log("At game number " + gamecount++);
                            console.log(gamerow);
                            return;
                        }
                    }).get();
                    cb(gamelist.getparent());

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
        gameforuser: function(user, game, cb) {
            getcollection(user, game, function(resp){
                if (typeof resp === 'string') {
                    $.publish('stausmessage', [resp]);
                    cb(null);
                } else {
                    cb(resp);
                }
            }, 0);
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
                case 'collection':
                    if (typeof start === "string") {
                        this.gameforuser(start, null, cb);
                    } else if (typeof start === "number" && typeof args === "string") {
                        this.gameforuser(args, null, cb);
                    }
                    break;
                case 'usergame':
                    if (typeof start === 'object') {
                        this.gameforuser(start.user, start.game, cb);
                    } else if (typeof args === 'object') {
                        this.gameforuser(args.user, args.game, cb);
                    }
                    break;
                case 'hotness':
                    getsimplelist(
                        'http://www.rpggeek.com/xmlapi2/hotness?type=boardgame', cb);
                    break;
                default:
            }
        }

    };

}