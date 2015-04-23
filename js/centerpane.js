/**
 * Created by paul on 1/25/14.
 */

function CenterPane(parentpaneselector) {
    var pane = parentpaneselector;
    var gi = new GameInfo();
    var gv = new GoogleVisualizations();
    var eyecandy = new EyeCandy();
    var agepollgraph = new RatingGraph();
    var gld = new GameListDisplayer();
    var currGame = -1;
    var currcollid = -1;
    var getbgguser = function () {
        return $.cookie('bgguser');
    };

    // PURE directives
    var pseudo_vidinfo;
    var vidlistDirective = {
        "#gamestat-videos .gameviditem": {
            "video<-videos": {
                "@data-ordinal": function (v) {
//                    console.log("At pos "+ v.pos+" seeing item "+ JSON.stringify( v.item));
                    return v.pos;
                },
                "@data-thumbs": "video.numrecommend",
                "@data-comments": "video.numcomments",
                ".gamevidpreview@src": function (v) {
                    if (v.pos >= pseudo_vidinfo.length) {
                        return v.item.bggpic;
                    }
                    return pseudo_vidinfo[v.pos].vidpic;
                },
                ".gamevidlink@href": function(v) {
                    if (v.pos >= pseudo_vidinfo.length) {
                        return v.item.bgglink;
                    }
                    return 'http://' +
                        (v.item.videohost === 'youtube' ? 'youtu.be' : v.item.videohost) +
                        '/' + v.item.extvideoid;
                },
                ".gamevidtitle": "video.title"
            }
        }
    };
    var vidDirFn;
    var gamestatDirective = {
        "span#gamename, #gamename@data-gname":"name",
        "#gameyear": "yearpublished",
        "#gamepic@src": "imageUrl",
        "#gamestat-rating": function (g) {return "" + parseFloat(g.context.rating).toFixed(2);},
        "#gamestat-raters":"numraters",
        "#gamestat-minage": 'minage',
        "#gamestat-rank, #gamestat-rank@data-rank": 'rank',
        "#gamestat-length": "playingtime",
        "#gamestat-description": function (g) {
            return g.context.description.replace(/&#10;/g, "<br/>");
        },
        "#gamestat-numplayers": function (g) {
            return "Players: " + g.context.minplayers +
                ((g.context.minplayers === g.context.maxplayers) ? '' : ' to ' + g.context.maxplayers);
        }
    };
    var reviewDirective = {
        ".review-item": {
            "review<-reviews": {
                "a.review-title": "review.subject",
                "span.review-id": "review.id"
            }
        }
    };

    // The local functions
    var fillinvidlist = function(gameNo) {
        // Video list
        vidDirFn = $p("#gamestat-videos").compile(vidlistDirective);
        gi.vidlist(gameNo, function (vidlistobj) {
            var $vidnone = $("#gamestat-videos-none");
            if (!vidlistobj || !vidlistobj.videos || vidlistobj.videos.length === 0) {
                $vidnone.show();
                return;
            }
            $vidnone.hide();
            var $vidparent = $("#gamestat-videos");
            $vidparent.show();
            var gamename = $(vidlistobj.videos[0].objectlink).text();
            gi.hotvideos(gameNo, gamename, function(vidinfo) {
                pseudo_vidinfo = vidinfo;
                // if there are more videos than fit on the first page,
                // then extend with a dummy video that goes to bgg
                if (vidinfo.length < vidlistobj.videos.length) {
                    vidlistobj.videos.slice(0, vidinfo.length);
                    vidlistobj.videos[vidinfo.length] = {
                        "numrecommend": "0",
                        "comments": "0",
                        "bgglink": "http://boardgamegeek.com/boardgame/"+gameNo + "#videos",
                        "bggpic": "resources/bgg_cornerlogo.png",
                        "title": "More ..."
                    };
                }

                try {
                    $("#gamestat-videos").render(vidlistobj, vidlistDirective);
                    console.log('%s %o',"After render\n",$vidparent[0]);
                } catch (e) {
                    console.error('pure error (videos) '+e);
                }
                try {
                    $("#gamestat-videos").isotope({
                        "itemSelector": '.gameviditem',
                        "layoutMode": 'fitRows',
                        "getSortData": {
                            "ord": '[data-ordinal] parseInt',
                            "numthumbs": '[data-thumbs] parseInt'
                        },
                        "sortBy": 'original-order'
//                                , resizable: true
                    });
//                        $vidparent.isotope('bindResize');
                } catch (err) {
                    console.log("vid layout err "+err);
                }
            });
        });

    };

    var fillinmaininfo = function(gameNo, bNoAdd) {
        gi.gameinfo(gameNo, function (gameinfo) {
            $.publish('gamenumchange', gameNo);
            try {
                // Basic game info
                $("#bbgg-mainwindow").render(gameinfo, gamestatDirective);
            } catch (e) {
                console.error('pure error '+e);
            }
            if (typeof gameinfo.name === "undefined") {
                console.log("game id "+gameNo+" looks like it's undefined");
                return;
            }
            // Reviews
            gi.gamereviewsJSON(gameNo, gameinfo.name, function (revList) {
                var $reviewlisthtml = $("#gamestat-reviews");
                // I could externalize this with another html fragment, but it seems like overkill
                var $reviewitem = $("<li/>", {
                    html: "<span hidden class='review-id'/><a class='review-title'/>",
                    "class": "review-item"
                });
                $reviewlisthtml.append($reviewitem);
                try {
                    $reviewlisthtml.render(revList, reviewDirective);
                } catch (e) {
                    console.error('pure error (reviews) '+e);
                }

            });

            // Graphics
            eyecandy.showRating(gameinfo.rating, $("#gamerankparent"));
            // The target parameter to the following is a target id not a selector
            if (parseFloat(gameinfo.difficulty) !== 0.0) {
                gv.reinit("gauge").update("gauge", gameinfo.difficulty, "difficultygauge-g");
            } else {
                // No real need for an indication here
                console.log('No difficulty value found');
            }
            gv.reinit("agepoll").update("agepoll", gameinfo.$agepoll, "gamestat-minchart");
            gv.reinit("nppoll").update("nppoll", gameinfo.$nplyrpoll, "gamestat-numplayers-chart");

            // Related items
            var relatedmap = {};
            gameinfo.$links.each(function (index, linkitem) {
                var $linkitem = $(linkitem);
                var famtype = $linkitem.attr("type");
//                    var famname = $linkitem.attr('value');
                var baseid = 0;
                console.log('Family type: '+famtype);
                var linktypeoverride = relateditemmap[famtype].renameoninbound;
                if (linktypeoverride) {
                    if ($linkitem.attr('inbound')) {
                        famtype = linktypeoverride;
                    }
                    baseid = $linkitem.attr('id');
                }
                if (typeof relatedmap[famtype] === "undefined") {
                    relatedmap[famtype] = [];
                }
                relatedmap[famtype].push({
                    "familytype": famtype,
                    "famid": $linkitem.attr('id'),
                    "family": $linkitem.attr('value'),
                    "familylisttitle": relateditemmap[famtype].relatedtitle +
                    '"' + $linkitem.attr('value') + '"',
                    "baseid": baseid
                });
            });
            /**
             * Structure:
             * div                      id="gamestat-related-block"
             *  ul                      id="gamestat-related-list"
             *      li                  class="gamestat-related-item-parent"
             *          div             class="gamestat-related-itemsblock"
             *              ul          class="gamestat-related-items"
             *                  li      class="gamestat-related-item"
             * OR
             *      li                  class="gamestat-related-item gamestat-related-item-parent"
             */
            var $relatedlinkparent = $('#gamestat-related-list');
            for (var section in relatedmap) {
                var $rellink;
                var relations = relatedmap[section];
                if (relations.length > 1) {
                    var $relul = $('<ul/>', {
                        "class": "gamestat-related-items"  // this class may be unused
                    });
                    var $relitemproto = $('<li/>', {
                        "class": "gamestat-related-item"
                    });
                    for (var i = 0; i < relations.length; i++) {
                        var $relitem = $relitemproto.clone();
                        $relitem.data(relations[i]);
                        $relitem.text($relitem.data('family'));
                        $relul.append($relitem);
                    }
                    var $reldiv = $('<div/>', {
                        "class": "gamestat-related-itemsblock"
                    });
                    $reldiv.append($relul);
                    $rellink = $('<li/>', {
                        "class": 'gamestat-related-item-parent'
                    });
                    $rellink.text(relateditemmap[section].relatedprompt);
                    $rellink.append($reldiv);
                } else {
                    $rellink = $('<li/>', {
                        "class": 'gamestat-related-item gamestat-related-item-parent'
                    });
                    $rellink.data(relations[0]);
                    $rellink.text(
                        relateditemmap[section].relatedprompt +
                        '"' + $rellink.data('family') + '"');
                }
                $relatedlinkparent.append($rellink);

            }

            // Add to game history list unless we were told not to
            if (!bNoAdd) {
                gamehistory.add({
                    "gameNo":gameNo,
                    "name": gameinfo.name,
                    "year": gameinfo.yearpublished
                });
            }

        });

    };

    var fillinownership = function(gameNo) {
        var curruser = getbgguser();
        if (curruser) {
            (new GameLister()).gameforuser(curruser, gameNo, function (resp) {
                var $gameownershp = $('#gameownership');
                if (resp && resp.total > 0) {
                    $gameownershp.attr('data-collectionid', resp.items[0].data.collid);
                    if (resp.items[0].data.own) {
                        $gameownershp.attr('data-collectionid', resp.items[0].data.collid);
                        console.log('user '+curruser+' owns game ' + gameNo);
                        $gameownershp.attr('data-owngame', true);
                        $gameownershp.attr('title', curruser + ' owns this');
                        $gameownershp.find('img').attr('src','resources/traffic-lights-green-icon.png');
                    } else if (resp.items[0].data.wishlist) {
                        $gameownershp.attr('data-owngame', false);
                        console.log('user '+curruser+' wants game ' + gameNo);
                        $gameownershp.attr('title', curruser + ' '+resp.items[0].data.wishcomment + ' this');
                        $gameownershp.find('img').attr('src','resources/traffic-lights-yellow-icon.png');
                    }
                } else {
                    $gameownershp.attr('data-owngame', false);
                    $gameownershp.attr('data-collectionid', '');
                    $gameownershp.attr('title', curruser + " doesn't own this");
                    console.log('user '+curruser+" doesn't own game " + gameNo);
                    $gameownershp.find('img').attr('src','resources/traffic-lights-red-icon.png');
                }
            });
        }

    };

    // fills the center pane
    var fillingameinfo = function (gameNo, bNoAdd) {
        if (!gameNo) {
            return;
        }
        // The load
        $.get("html-frag/main.html", function (r) {
            $(pane).empty();
            var $m = $(r);
            $(pane).append($m);
            // initial load only so we have something to look at
            if (gameNo < 0) {
                return;
            }
            currGame = gameNo;
            $.publish('statusmessage', ["Retrieving game information ..."]);

            fillinmaininfo(gameNo, bNoAdd);

            fillinvidlist(gameNo);

            // Ownership
            fillinownership(gameNo);

            // Rating detail
            gi.ratingDetail(gameNo, 'graphstats', function(ratingmap){
                gv.reinit("ratingpoll").update("ratingpoll", ratingmap, "gamestat-rating-chart");
            });
            gi.ratingDetail(gameNo, 'collection/weightgraph', function(ratingmap){
                gv.reinit("weightpoll").update("weightpoll", ratingmap, "gamestat-difficulty-chart");
            });

            // Ratings history graph
            var ratingsGraph = gv.reinit("rathist");
            var piecearray = [];
            gi.ratinghistory(
                gameNo,
                function(histstats, pagenum) {
                    piecearray.push(pagenum);
                    console.log('%s %0','Got '+histstats.length+' history items so far', piecearray);
                    ratingsGraph.update("rathist", histstats, "gamestat-ratinghistory-chart");
                },
                function(finalstats) {

                }
            );
        });

    };


    // The event handlers
    $(document).on('click', ".gamestat-related-item", function () {
        var $this = $(this);
        var gameNo = $this.data('baseid');
        if (gameNo) {
            fillingameinfo(gameNo);
            return;
        }
        $.publish('list.gamelist', [
            "Retrieving related games ...",
            $this.data('familylisttitle'),
            'family',
            1,
            20,
            {
                fid:  $this.data('famid'),
                ftype: $this.data('familytype')
            },
            true
        ]);
    });

    $(document).on('click', "#gamestat-related", function() {
        $("#gamestat-related-list").toggle();
    });

    var longpresstimer;
    var gamenavlistdropped = false;

    var origmouseevent;
    $(document).on('mousedown', '.gameitemnav', function (evt) {
        origmouseevent = evt;
        longpresstimer = setTimeout(function () {
            console.info("mousedown timeout fired");
            var $source = $(origmouseevent.originalEvent.srcElement);
            var glist = ($source.attr('id') === 'nextgame') ? gamehistory.after() : gamehistory.before();
            gld.writelistitems_obj(glist, $("#gamesvisitedlistparent"));
            $("#gamesvisitedblock").show();
            gamenavlistdropped = true;
        }, 1000);
    });



    $(document).on('mouseleave', '.gameitemnav', function () {
        if (gamenavlistdropped) {
            $("#gamesvisitedblock").hide();
            gamenavlistdropped = false;
        }
    });
    $(document).on('mouseup', '.gameitemnav', function () {
        clearTimeout(longpresstimer);
        if (gamenavlistdropped) {
            return;
        }
        if (gamehistory.empty()) {
            return false;
        }
        // relies on the fact that the mouse event was captured on mouse down above
        var $source = $(origmouseevent.originalEvent.srcElement);
        if ($source.attr('id') === 'nextgame') {
            if (!gamehistory.next()) {
                return false;
            }
        }
        else {
            if (!gamehistory.prev()) {
                return false;
            }
        }
        var g = gamehistory.get();
        if (parseInt(g)) {
            fillingameinfo(g, true);
        } else if (typeof g === "object") {
            fillingameinfo(g.gameNo, true);
        }
    });

    $(document).on('click', "#gametitle", function () {
        window.open('http://boardgamegeek.com/boardgame/'+currGame);
    });

    $(document).on('click', "#bgplink", function () {
        var gamename = $("#gamename").data('gname');
        window.open('http://boardgameprices.com/compare-prices-for-'+gamename);
    });

    $(document).on('click', ".gameregion", function() {
        var $this = $(this);
        var $chevloc = $this.find('.glyphicon-chevron-up');
        if ($chevloc.length > 0) {
            $chevloc.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $chevloc = $this.find('.glyphicon-chevron-down');
            $chevloc.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    });

    $(document).on('click', '.review-item', function () {
        var $this = $( this );
        var revid = $this.find('.review-id').html();
        gi.threadcontent(revid, function($resp) {
            var reviewSubject = $this.find('.review-title').html();
            $("#reviewSubjectModal").html(reviewSubject);
            var firstreview = $resp.find('article').first().find('body').text();
            $("#reviewcontent").html(firstreview);
            $.publish('layout.showmodal'); // pg.allowOverflow('center');
            $('#reviewModal').modal({
                backdrop: false // only this seems to work
            });
        });
    });

    $(document).on('click', '#reviewModal', function() {
        $("#reviewModal").modal('hide');
    });

    $(document).on('hidden.bs.modal', '#reviewModal', function() {
        $.publish ('layout.hidemodal');   // pg.resetOverflow('center');
    });

    $(document).on('click',"#gamestat-rank",function () {
        var currgamerank = $("#gamestat-rank").data('rank');
        if (currgamerank > 0) {
            $.publish('list.rank', [currgamerank]);
        }
        return false;
    });

    //https://boardgamegeek.com/geekcollection.php?ajax=1&addowned=true&instanceid=19&objectid=163968&objecttype=thing&action=additem
    $(document).on('click', '#gameownership', function() {
        var $this = $(this);
        //var collid = $this.attr('data-collectionid');
        var owns = $this.attr('data-owngame') === 'true';
        var curruser = getbgguser();
        if (owns || !curruser) {
            return;
        }
        var win = window.open('https://boardgamegeek.com/geekcollection.php' +
                '?ajax=1&addowned=true&instanceid=19&objectid='+currGame+
                '&objecttype=thing&action=additem',
            '_blank');
        if (win) {
            setTimeout(function() {
                win.close();
                fillinownership(currGame);
            }, 2000);
        }
        win.focus();
        //$.ajax('/PHP/proxy.php', {
        //    data: 'https://boardgamegeek.com/geekcollection.php?ajax=1&addowned=true&instanceid=19&objectid='+currGame+'&objecttype=thing&action=additem',
        //    success: function (resp) {
        //        fillinownership(currGame);
        //    },
        //    error: function() {
        //        $.publish('statusmessage', ["Couldn't add game to "+curruser+"'s collection"]);
        //    }
        //});
    });

    // Initialize
    fillingameinfo(currGame);

    // The subscriptions
    $.subscribe('setgame', function (_, gameNo, bNoAdd) {
        fillingameinfo(gameNo, bNoAdd);
    });

    var gamehistory = new GameHistory(true);

    $.subscribe('selectgamehistoryindex', function (_, gameIndex) {
        gamehistory.select(gameIndex);
    });

    return {
        setgame: function (gameNo, bNoAdd) {
            fillingameinfo(gameNo, bNoAdd);
        }
    };
}