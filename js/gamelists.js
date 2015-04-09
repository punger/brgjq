/**
 * Created by paul on 1/26/14.
 */

function GameLister() {
    var au = new AccessUtil();
    var BgList = function() {
        var gamecount = 0;
        var gamelist = [];
        var $jqtemplate;
//        $jqtemplate.load('html-frag/gamelist.xml');
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
            additem: function (gameNo, name, year) {
                gamelist[gamecount++] = {
                    "name": name,
                    "gameNo": gameNo,
                    "year": year
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
            }
        };
    };

    return {
        gamesearch: function (query, cb) {
            $.get("/PHP/proxy.php",
                'http://www.rpggeek.com/xmlapi2/search?type=boardgame&query='+
                query.replace(" ", "+"),
                function (response) {
                    var itemlist = new BgList();
                    var $respJq = au.$xResp(response);
                    $respJq.find("item").each(function(i, item){
                        var $item = $(item);
                        itemlist.additem(
                            $item.attr('id'),
                            $item.find('name').attr('value'),
                            $item.find('yearpublished').attr('value')
                        );
                    });
                    cb(itemlist.getparent());
//                    itemlist.$getparent(cb);
                },
                "html"
            );
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
                    $colltable.each(function (index, gamerow) {
                        try {
                            gamecount++;
                            var $gamelink = $(gamerow).find("div[id*='results_objectname'] a");
                            var gameyear = $(gamerow).find("div[id*='results_objectname'] span").text();
                            gameyear = gameyear.replace(/\(|\)/g, '');
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