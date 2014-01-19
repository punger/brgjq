/**
 * Created by paul on 12/26/13.
 */

function GameInfo () {
    var gaugeinited = false;
    var $target;
    var gvgauge;
    var diff = 3;

    var $xResp= function (response) {
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
    };
    var jResp = function (response) {
        var respJsonString;
        var htmLoc = response.indexOf('<html');
        if (htmLoc < 0) {
            respJsonString = response;
        }
        else {
            respJsonString = response.substr(0, htmLoc);
        }
        return $.parseJSON(respJsonString);
    };
    var slugify = function (str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

        return str;
    };
    return {
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
                    videos: 1,
                    destination: 'http://www.rpggeek.com/xmlapi2/thing'
                },
                function (response) {
                    try {
                        var $respJq = $xResp(response);
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
                        info.minplayers = $respJq.find('minplayers').attr('value');
                        info.maxplayers = $respJq.find('maxplayers').attr('value');
                        info.$videos = $respJq.find('videos');

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
                    var $respJq = $xResp(response);
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
        gamereviews: function (gamenum, gamename, cb) {
            $.get("/xdproxy/proxy.php",
                {
                    id: gamenum,
                    type: 'thing',
                    destination: 'http://www.boardgamegeek.com/xmlapi2/forumlist'
                },
                function (response) {
                    var $respJq = $xResp(response);
                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                    var uri = forumid+'/'+slugify(gamename)+'/reviews';
                    $.get("/xdproxy/proxy.php",
                        {
//                        id: forumid,
                            destination: 'http://www.boardgamegeek.com/forum/'+uri
                        },
                        function (flresp) {
                            var $reviewlistpage = $(flresp);
                            var $reviewtable = $reviewlistpage.
                                find('table[class="forum_table"]').eq(1);
                            var actualreviewcount = 0;
                            var $reviewitems = $reviewtable.find('> tbody > tr');
                            var revarray = [];
                            $reviewitems.each(function (index) {
                                var $cells = $(this).find ('> td');
                                var thumbs = parseInt($cells.eq(0).text());
                                if (!thumbs) {
                                    return true;
                                }
                                var $thread = $cells.find('span[class="forum_index_subject"] a');
                                var revurl = $thread.attr('href');
                                var threadid = revurl.match(/\/([0-9]+)/gi)[0].substr(1);
                                var $item = $('<thread/>',{
                                    id: threadid,
                                    subject: $thread.text(),
                                    thumbs: thumbs,
                                    replies: $cells.eq(2).text()
                                });
                                revarray[actualreviewcount] = $item;
                                actualreviewcount++;
                            });
                            var sortedrevs = revarray.sort(function ($a, $b) {
                                return  parseInt($b.attr('thumbs')) - parseInt($a.attr('thumbs'));
                            });
                            var $revlist = $('<reviews/>', {
                                numthreads: actualreviewcount
                            });
                            $revlist.append(sortedrevs);
                            cb($revlist);
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
                    var $respJq = $xResp(response);
                    cb($respJq);
                },
                'html'
            );

        },
        vidlist: function (gameno, cb) {
            $.get('/xdproxy/proxy.php', {
                    destination: 'http://boardgamegeek.com/video/module',
                    ajax: 1,
                    domain: '',
                    filter: '{"languagefilter":0,"categoryfilter":0}',
                    filter_objecttype: '',
                    gallery: 'all',
                    languageid: 0,
                    nosession: 1,
                    objectid: gameno,
                    objecttype: 'thing',
                    pageid: 1,
                    showcount: 16,
                    sort: 'hot',
                    subdomainid: '',
                    version: 'v2'
                },
                function (resp) {
                    cb(jResp(resp));
                },
                'html');
        },
        hotvideos: function (gameno, gamename, cb) {
            //http://boardgamegeek.com/videos/thing/102794/caverna-the-cave-farmers?sort=hot&date=alltime&gallery=&B1=Go
            var dest = 'http://www.boardgamegeek.com/videos/thing/';
            dest += gameno + '/';
            dest += slugify(gamename);
            $.get("/xdproxy/proxy.php",
                {
                    destination:  dest,
                    sort: 'hot',
                    date: 'alltime',
                    gallery: '',
                    B1: 'Go'
                },
                function (response) {
                    var $respJq = $(response);
                    var $vidtable = $respJq.find('#maincontent #main_content .forum_table a[href*="/video"]');
                    var vidarray = [];
                    $vidtable.each(function(index) {
                        var $this = $(this);
                        var vidloc = $this.attr('href');
                        var vidid = vidloc.match(/\/([0-9]+)/gi)[0].substr(1);
                        vidarray[index] = {};
                        vidarray[index].videoid = vidid;
                        vidarray[index].vidpic = $this.find('img').attr('src');
                    });
                    cb(vidarray);
                },
                'html'
            );
        }
    };
}
