/**
 * Created by paul on 1/26/14.
 */

function GameInfo () {
    var au = new AccessUtil();

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
        ratingDetail: function (gamenum, cb) {
            // http://boardgamegeek.com/graphstats/thing/6749?ajax=1
            // img src extract chm=
            // 14,000000,0,0,12|t19,000000,0,1,12|t16,000000,0,2,12|t33,000000,0,3,12|t30,000000,0,4,12|
            // t38,000000,0,5,12|t18,000000,0,6,12|t8,000000,0,7,12|t4,000000,0,8,12|t6,000000,0,9,12

        },
        gamereviewsJSON: function (gamenum, gamename, cb) {
            $.get("/xdproxy/proxy.php",
                {
                    id: gamenum,
                    type: 'thing',
                    destination: 'http://www.boardgamegeek.com/xmlapi2/forumlist'
                },
                function (response) {
                    var $respJq = au.$xResp(response);
                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                    var uri = forumid+'/'+au.slugify(gamename)+'/reviews';
                    $.ajax({
                        url: "/xdproxy/proxy.php",
                        data: {
                            destination: 'http://www.boardgamegeek.com/forum/'+uri
                        },
                        dataType: 'html',
                        success: function (flresp) {
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

                                revarray[actualreviewcount] = {
                                    id: threadid,
                                    subject: $thread.text(),
                                    thumbs: thumbs,
                                    replies: $cells.eq(2).text()
                                };
                                actualreviewcount++;
                            });
//                            var sortedrevs = revarray.sort(function (a, b) {
//                                return  parseInt(b.thumbs) - parseInt(a.thumbs);
//                            });
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
//                    $.get("/xdproxy/proxy.php",
//                        {
////                        id: forumid,
//                            destination: 'http://www.boardgamegeek.com/forum/'+uri
//                        },
//                        function (flresp) {
//                            var $reviewlistpage = $(flresp);
//                            var $reviewtable = $reviewlistpage.
//                                find('table[class="forum_table"]').eq(1);
//                            var actualreviewcount = 0;
//                            var $reviewitems = $reviewtable.find('> tbody > tr');
//                            var revarray = [];
//                            $reviewitems.each(function (index) {
//                                var $cells = $(this).find ('> td');
//                                var thumbs = parseInt($cells.eq(0).text());
//                                if (!thumbs) {
//                                    return true;
//                                }
//                                var $thread = $cells.find('span[class="forum_index_subject"] a');
//                                var revurl = $thread.attr('href');
//                                var threadid = revurl.match(/\/([0-9]+)/gi)[0].substr(1);
//
//                                revarray[actualreviewcount] = {
//                                    id: threadid,
//                                    subject: $thread.text(),
//                                    thumbs: thumbs,
//                                    replies: $cells.eq(2).text()
//                                };
//                                actualreviewcount++;
//                            });
//                            var sortedrevs = revarray.sort(function (a, b) {
//                                return  parseInt(b.thumbs) - parseInt(a.thumbs);
//                            });
//                            var revlist = {
//                                "numReviews": actualreviewcount,
//                                "reviews": revarray
//                            };
//                            cb(revlist);
//                        },
//                        'html'
//                    );
                },
                'html'
            );

        },
        gamereviews: function (gamenum, gamename, cb) {
            $.ajax({
                url:"/xdproxy/proxy.php",
                data: {
                    id: gamenum,
                    type: 'thing',
                    destination: 'http://www.boardgamegeek.com/xmlapi2/forumlist'
                },
                dataType: 'html',
                success: function (response) {
                    var $respJq = au.$xResp(response);
                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
                    var uri = forumid+'/'+au.slugify(gamename)+'/reviews';
                    $.ajax({
                        url: "/xdproxy/proxy.php",
                        data: {
                            destination: 'http://www.boardgamegeek.com/forum/'+uri
                        },
                        dataType: 'html',
                        success: function (flresp) {
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
                        error: function (jqXHR, textStatus,  errorThrown) {
                            var rh = jqXHR.getAllResponseHeaders();


                        }
                    });
                }
            });
//            $.get("/xdproxy/proxy.php",
//                {
//                    id: gamenum,
//                    type: 'thing',
//                    destination: 'http://www.boardgamegeek.com/xmlapi2/forumlist'
//                },
//                function (response) {
//                    var $respJq = au.$xResp(response);
//                    var forumid = $respJq.find('forum[title="Reviews"]').attr('id');
//                    var uri = forumid+'/'+au.slugify(gamename)+'/reviews';
//                    $.get("/xdproxy/proxy.php",
//                        {
////                        id: forumid,
//                            destination: 'http://www.boardgamegeek.com/forum/'+uri
//                        },
//                        function (flresp) {
//                            var $reviewlistpage = $(flresp);
//                            var $reviewtable = $reviewlistpage.
//                                find('table[class="forum_table"]').eq(1);
//                            var actualreviewcount = 0;
//                            var $reviewitems = $reviewtable.find('> tbody > tr');
//                            var revarray = [];
//                            $reviewitems.each(function (index) {
//                                var $cells = $(this).find ('> td');
//                                var thumbs = parseInt($cells.eq(0).text());
//                                if (!thumbs) {
//                                    return true;
//                                }
//                                var $thread = $cells.find('span[class="forum_index_subject"] a');
//                                var revurl = $thread.attr('href');
//                                var threadid = revurl.match(/\/([0-9]+)/gi)[0].substr(1);
//                                var $item = $('<thread/>',{
//                                    id: threadid,
//                                    subject: $thread.text(),
//                                    thumbs: thumbs,
//                                    replies: $cells.eq(2).text()
//                                });
//                                revarray[actualreviewcount] = $item;
//                                actualreviewcount++;
//                            });
//                            var sortedrevs = revarray.sort(function ($a, $b) {
//                                return  parseInt($b.attr('thumbs')) - parseInt($a.attr('thumbs'));
//                            });
//                            var $revlist = $('<reviews/>', {
//                                numthreads: actualreviewcount
//                            });
//                            $revlist.append(sortedrevs);
//                            cb($revlist);
//                        },
//                        'html'
//                    );
//                },
//                'html'
//            );

        },
        threadcontent: function (threadid, cb) {
            $.get("/xdproxy/proxy.php",
                {
                    id: threadid,
                    destination: 'http://www.boardgamegeek.com/xmlapi2/thread'
                },
                function (response) {
                    var $respJq = au.$xResp(response);
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