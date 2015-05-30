/**
 * Represents game information and provides access to game characteristics
 * @returns {{gameinfo: Function, ratingDetail: Function, gamereviewsJSON: Function, gamereviews: Function, threadcontent: Function, vidlist: Function, hotvideos: Function, ratinghistory: Function}}
 * @constructor
 */
function GameInfo () {
    var au;
    au = new AccessUtil();
    var PAGESIZE=100;
    var MILLISINADAY=86400000;
    var outstanding = 0;
    var totalentries = -1;

    var stringtodate = function(ds) {
        return new Date(ds.slice(0,4), parseInt(ds.slice(4,6))-1, ds.slice(6,8));
    };

    var daysuntilnow = function(start) {
        var d = stringtodate(start);
        return ((Date.now() - d.getTime()) / MILLISINADAY).toFixed(0);
    };

    var gethistPage = function(gameno, page, cbend, repeat) {
        cbend([], page);
        return;
/*
        outstanding++;
        $.ajax({
            url: "/PHP/proxy.php",
            data: 'http://www.rpggeek.com/xmlapi2/thing?id='+gameno+'&stats=1&historical=1' +
                '&pagesize='+PAGESIZE+'&page='+page,
            dataType: 'html',
            timeout: 60000,
            success: function (response) {
                var statarray = [];
                var $respJq = au.$xResp(response);
                var stats = $respJq.find('statistics ratings');
                if (stats.length === 0) {
                    if (repeat) {
                        cbend(statarray, page);
                    } else {
                        gethistPage(gameno,page, cbend, true);
                    }
                    return;
                }
                if (page === 1 && stats.length > 0) {
                    var startdate = $(stats[0]).attr('date');
                    totalentries = daysuntilnow(startdate);
                }
                stats.each(function(index, element) {
                    statarray[index] = {};
                    var $this = $(element);
                    statarray[index].date = $this.attr('date');
                    statarray[index].usersrated = $this.find('usersrated').attr('value');
                    statarray[index].average = $this.find('average').attr('value');
                    statarray[index].bayesaverage = $this.find('bayesaverage').attr('value');
                    statarray[index].rank = $this.find('ranks #1').attr('value');
                });
                if (statarray.length === 0) {
                    console.error('statarray has zero length: game='+
                        gameno+', page='+page+', expected total entries='+totalentries);
                } else {
                    if (page * PAGESIZE < totalentries &&
                         Date.now() - stringtodate(statarray[statarray.length - 1].date).getTime() > MILLISINADAY) {
                       gethistPage(gameno, page + 1, cbend);
                    }
                }
                cbend(statarray, page);
            },
            error: function (jqXHR, textStatus,  errorThrown) {
                var rh = jqXHR.getAllResponseHeaders();
                cbend([], page);
            }

        })
            .retry({times:3, timeout:3000, statusCodes: [502, 503]});

*/
    };

    var procapi1 = function(response) {
        var info = {};
        var $respJq = au.$xResp(response).find("boardgame");
        info.name = $respJq.find('[primary]').text();
        info.minage = $respJq.find('age').text();
        info.imageUrl = $respJq.find('image').text();
        var $stats = $respJq.find("statistics ratings");
        info.rating = $stats.find("average").text();
        info.bggrating = $stats.find("bayesaverage").text();
        info.difficulty = parseFloat($stats.find("averageweight").text()).toFixed(2);
        info.rank = $stats.find('rank[type="subtype"]').attr("value");
        info.numraters = $stats.find("usersrated").text();
        info.description = $respJq.find('description').text();
        info.yearpublished = $respJq.find('yearpublished').text();
        info.playingtime = $respJq.find('playingtime').text();
        info.minplayers = $respJq.find('minplayers').text();
        info.maxplayers = $respJq.find('maxplayers').text();
        info.$videos = $respJq.find('videos');
        //info.$links = $respJq.find('link').filter('[type!="boardgamepublisher"]');
        info.$agepoll = $respJq.find('poll').filter('[name="suggested_playerage"]').find('result');
        info.$nplyrpoll = $respJq.find('poll').filter('[name="suggested_numplayers"]').find('results');
        var $x1 = $respJq.children().filter(
            function() {
                var $x = $(this);
                var nodename = $x.prop('nodeName');
                return nodename.substr(0,8) ==="boardgam";
            }
        );
        var $x2 = $x1.map(function(index, item ){
            var $item = $(item);
            return $('<link/>', {
                "type": $item.prop("nodeName"),
                "id": $item.attr("objectid"),
                "value": $item.text()
            })[0];
        });
        info.$links = $x2;
        return info;
    };

    var procapi2 = function(response) {
        var info = {};
        var $respJq = au.$xResp(response);
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
        info.$links = $respJq.find('link').filter('[type!="boardgamepublisher"]');
        info.$agepoll = $respJq.find('poll').filter('[name="suggested_playerage"]').find('result');
        info.$nplyrpoll = $respJq.find('poll').filter('[name="suggested_numplayers"]').find('results');
        return info;
    };

    var retrievegameinfo = function(cb, url, responseprocessor) {
        $.get("/PHP/proxy.php", url,
            function (response) {
                try {
                    cb(responseprocessor(response));
                } catch (err) {
                    var txt = "There was an error on this page.\n\n";
                    txt += "Error description: " + err.message + "\n\n";
                    txt += "Click OK to continue.\n\n";
                    alert(txt);
                    cb({"valid": false, "message": txt});
                }
            },
            "html"
        ).retry({times:3, timeout:3000, statusCodes: [502, 503]});
    };

    return {
        gameinfo: function (gamenum, cb, use1) {
            var url = 'http://www.rpggeek.com/xmlapi2/thing?id='+gamenum +'&stats=1&videos=1';
            if (!use1) {
                url = 'http://www.rpggeek.com/xmlapi/boardgame/'+gamenum +'&stats=1';
                retrievegameinfo(cb, url, procapi1);
            } else {
                retrievegameinfo(cb, url, procapi2);
            }
        },
        /**
         * Gets the contents of a BGG graph in Google Charts format
         * @param gamenum
         * @param target a string: either 'graphstats' for ratings or
         * 'collection/weightgraph' for weight
         * @param cb callback with data
         */
        ratingDetail: function (gamenum, target, cb) {
            // http://boardgamegeek.com/graphstats/thing/6749?ajax=1
            // img src extract chm=
            // t14,000000,0,0,12|t19,000000,0,1,12|t16,000000,0,2,12|t33,000000,0,3,12|t30,000000,0,4,12|
            // t38,000000,0,5,12|t18,000000,0,6,12|t8,000000,0,7,12|t4,000000,0,8,12|t6,000000,0,9,12
            $.get("/PHP/proxy.php",
                'http://boardgamegeek.com/'+target+'/thing/' +gamenum+'&ajax=1',
                function (response) {
                    var $r = au.$jqResp(response);
                    var chartArg = $r.find('#main_content').find('img').attr('src');
                    var chartUri;
                    try {
                        chartUri = new URI(chartArg);
                    } catch (e) {
                        console.log('Failed getting rating detail because of bad source URI:"'+chartArg+'"');
                        cb([]);
                        return;
                    }
                    var splitArgs = chartUri.search(true);
                    var ratingArg = splitArgs.chm;
                    var ratingsArr = ratingArg.split('|');
                    var ratingData = [];
                    var labels = splitArgs.chxl.split(':')[1].split('|');
                    $.each(ratingsArr, function (i, el) {
                        var ratingComponents = el.split(',');
                        ratingData.push(
                            $('<result/>', {
                            "numvotes": ratingComponents[0].substr(1),
                            "value": labels[i+1]
                        })[0]);
                    });
                    cb(ratingData);
                },
                'html'
            );

        },
        gamereviewsJSON: function (gamenum, gamename, cb) {
            $.get("/PHP/proxy.php",
                'http://www.boardgamegeek.com/xmlapi2/forumlist?id=' + gamenum +
                    '&type=thing',
                function (response) {
                    var $respJq = au.$xResp(response);
                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                    var uri = forumid+'/'+au.slugify(gamename)+'/reviews';
                    var u = "/PHP/proxy.php?http://www.boardgamegeek.com/forum/"+uri;
                    //console.log("Troublesome URL (gamereviewsJSON) "+u);
                    $.ajax({
                        url: u,
                        dataType: 'html',
                        success: function (flresp) {
                            var $reviewlistpage = $(flresp);
                            var $reviewtable = $reviewlistpage.
                                find('table[class="forum_table"]').eq(1);
                            var actualreviewcount = 0;
                            var $reviewitems = $reviewtable.find('> tbody > tr');
                            var revarray = [];
                            $reviewitems.each(function () {
                                var $cells = $(this).find ('> td');
                                var thumbs = parseInt($cells.eq(0).text());
                                if (!thumbs) {
                                    return true;
                                }
                                var $thread = $cells.find('span[class="forum_index_subject"] a');
                                var revurl = $thread.attr('href');
                                var threadid = revurl.match(/\/([0-9]+)/gi)[0].substr(1);

                                revarray[actualreviewcount] = {
                                    id: threadid,
                                    subject: $thread.text(),
                                    thumbs: thumbs,
                                    replies: $cells.eq(2).text()
                                };
                                actualreviewcount++;
                            });
                            var revlist = {
                                "numReviews": actualreviewcount,
                                "reviews": revarray
                            };
                            cb(revlist);
                        },
                        error: function (jqXHR, textStatus,  errorThrown) {
                            var rh = jqXHR.getAllResponseHeaders();
                        }

                    });
                },
                'html'
            );

        },
        gamereviews: function (gamenum, gamename, cb) {
            $.ajax({
                url:"/PHP/proxy.php",
                data: 'http://www.boardgamegeek.com/xmlapi2/forumlist?id='+gamenum+
                    '&type=thing',
                dataType: 'html',
                success: function (response) {
                    var $respJq = au.$xResp(response);
                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                    var uri = forumid+'/'+au.slugify(gamename)+'/reviews';
                    var u =  "/PHP/proxy.php?http://www.boardgamegeek.com/forum/"+uri;
                    console.log('Troublesome URL= (gamereviews) ' + u);
                    $.ajax({
                        url: u,
                        dataType: 'html',
                        success: function (flresp) {
                            var $reviewlistpage = $(flresp);
                            var $reviewtable = $reviewlistpage.
                                find('table[class="forum_table"]').eq(1);
                            var actualreviewcount = 0;
                            var $reviewitems = $reviewtable.find('> tbody > tr');
                            var revarray = [];
                            $reviewitems.each(function () {
                                var $cells = $(this).find ('> td');
                                var thumbs = parseInt($cells.eq(0).text());
                                if (!thumbs) {
                                    return true;
                                }
                                var $thread = $cells.find('span[class="forum_index_subject"] a');
                                var revurl = $thread.attr('href');
                                var threadid = revurl.match(/\/([0-9]+)/gi)[0].substr(1);
                                revarray[actualreviewcount] = $('<thread/>',{
                                    id: threadid,
                                    subject: $thread.text(),
                                    thumbs: thumbs,
                                    replies: $cells.eq(2).text()
                                });
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
                        error: function (jqXHR, textStatus,  errorThrown) {
                            var rh = jqXHR.getAllResponseHeaders();
                        }
                    });
                }
            });
        },
        threadcontent: function (threadid, cb) {
            $.get("/PHP/proxy.php",
                'http://www.boardgamegeek.com/xmlapi2/thread?id='+threadid,
                function (response) {
                    var $respJq = au.$xResp(response);
                    cb($respJq);
                },
                'html'
            );

        },
        vidlist: function (gameno, cb) {

            //http://boardgamegeek.com/video/module?ajax=1&domain=&filter={"languagefilter":0,"categoryfilter":0}
            // &filter_objecttype=&gallery=all&languageid=0&nosession=1&objectid=102794&objecttype=thing&pageid=1&
            // showcount=16&sort=hot&subdomainid=&version=v2
            $.get('/PHP/proxy.php',
                'http://boardgamegeek.com/video/module?objectid=' + gameno +
                '&ajax=1&domain=&filter={"languagefilter":0,"categoryfilter":0}&filter_objecttype=' +
                '&gallery=all&languageid=0&nosession=1&objecttype=thing&pageid=1&showcount=16' +
                '&sort=hot&subdomainid=&version=v2',
                function (resp) {
                    cb(au.jResp(resp));
                },
                'html');
        },
        hotvideos: function (gameno, gamename, cb) {
            //http://boardgamegeek.com/videos/thing/102794/caverna-the-cave-farmers?sort=hot&
            // date=alltime&gallery=&B1=Go
            var dest = 'http://www.boardgamegeek.com/videos/thing/';
            dest += gameno + '/';
            dest += au.slugify(gamename);
            $.get("/PHP/proxy.php",
                dest+'?sort=hot&date=alltime&gallery=&B1=Go',
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
        },
        ratinghistory: function(gameno, cbinterim, cbend) {
            var statarray = [];
            gethistPage(gameno, 1, function (statpiece, pagenum) {
                if (statpiece.length === 0) {
                    return;
                }
                statpiece.forEach(function (cur, index ) {
                    statarray[PAGESIZE * (pagenum - 1) + index] = cur;
                });
                cbinterim(statarray, pagenum);
                outstanding--;
                if (outstanding <= 0) {
                    cbend(statarray);
                }
            });
        }

    };
}