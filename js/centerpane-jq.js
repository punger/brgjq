/**
 * Created by paul on 1/25/14.
 */

function CenterPane(parentpaneselector) {
    var pane = parentpaneselector;
    var gi = new GameInfo();
    var diffgauge = new DiffGauge();
    var gamehistory = new GameHistory();
    var eyecandy = new EyeCandy();
    var currGame = 0;

    // The local functions
    var fillingameinfo = function (gameNo, bNoAdd) {
        if (!gameNo) {
            return;
        }
        $.publish('statusmessage', ["Retrieving game information ..."]);

        // Clean up any existing info
        $('#gamestat-reviews').find('li').remove();
        $('#gamestat-related-list').find('li').remove();
        var $viditems = $('#gamestat-videos').find('.gameviditem');
        if ($viditems.length) {
            $('#gamestat-videos').isotope('destroy');
            $viditems.remove();
        } else {
            $('#gamestat-videos >').remove();
        }

        gi.gameinfo(gameNo, function(gameinfo) {
            var $gamename = $("#gamename");
            if (!gameinfo.valid) {
                $gamename.html('<pre> Error: ' + gameinfo.message + '</pre>');
                $gamename.css("backgroundColor", "orange");
                return;
            }
            try {
                currGame = gameNo;
                $.publish('gamenumchange', gameNo);
                var gamename = gameinfo.name;
                gi.gamereviews(gameNo, gamename, function ($reviewlist) {
                    var numReviews = $reviewlist.attr("numthreads");
                    var $reviewitem = $("<li/>", {
                        html: "<span hidden class='review-id'/><a class='review-title'/>",
                        "class": "review-item"
                    });

                    var $reviewlisthtml = $("#gamestat-reviews");
                    for (var reviewindex = 0; reviewindex < numReviews; reviewindex++) {
                        var $newReviewItem = $reviewitem.clone();
                        var $item = $reviewlist.find('thread').eq(reviewindex);
                        $newReviewItem.find(".review-id").html($item.attr("id"));

                        $newReviewItem.find(".review-title").html($item.attr('subject'));
                        $reviewlisthtml.append($newReviewItem);
                    }

                });
                $gamename.html(gamename + '  (' + gameinfo.yearpublished + ')');
                $gamename.data('gname', gamename);

                $("#gamepic").attr("src", gameinfo.imageUrl);
                $("#gamestat-rating").html("Rating: " + parseFloat(gameinfo.rating).toFixed(2));
                eyecandy.showRating(gameinfo.rating, $("#gamerankparent"));
                $("#gamestat-raters").html("Number of Raters: " + gameinfo.numraters);

                $("#gamestat-difficulty").html("Game Difficulty: ");
                diffgauge.updategauge("difficultygauge-g", gameinfo.difficulty);

                $("#gamestat-minage").html("Minimum Age: " + gameinfo.minage);
                $("#gamestat-rank").html("Boardgame Rank: <a>" + gameinfo.rank + "</a>");
                $("#gamestat-rank").data('rank', gameinfo.rank);

                $("#gamestat-length").html("Length: " + gameinfo.playingtime + " minutes");
                $("#gamestat-description").html(gameinfo.description.replace(/&#10;/g, "<br/>"));
                $("#gamestat-numplayers").html("Players: " + gameinfo.minplayers +
                    ((gameinfo.minplayers === gameinfo.maxplayers) ? '' : ' to ' + gameinfo.maxplayers));

                var relatedmap = {};
                gameinfo.$links.each(function (index, linkitem) {
                    var $linkitem = $(linkitem);
                    var famtype = $linkitem.attr("type");
                    var famname = $linkitem.attr('value');
                    var baseid = 0;
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
                if (!bNoAdd) {
                    gamehistory.add(gameNo);
                }
            } catch (err) {
                console.error("Game info error " + err);
            }
        });
        gi.vidlist(gameNo, function (vidlistobj) {
            var $vidparent = $("#gamestat-videos");
            if (!vidlistobj || !vidlistobj.videos || vidlistobj.videos.length === 0) {
                $vidparent.append($("<h4 class='alert alert-info'>No videos found</h4>"));
                return;
            }
            var gamename = $(vidlistobj.videos[0].objectlink).text();
            gi.hotvideos(gameNo, gamename, function(vidinfo) {
                $.get('html-frag/videotile.html', function (vtiletemplate) {

                    var $vttmpl = $(vtiletemplate);
                    // This is only the first page so it is limited to 15 whereas vidlistobj is not
                    for (var i = 0; i < vidinfo.length; i++) {
                        var vidid = vidinfo[i].videoid;
                        var videntry = vidlistobj.videos[i];
                        var $viditem = $vttmpl.clone();
                        $viditem.attr('ordinal', i);
                        $viditem.attr('thumbs', videntry.numrecommend);
                        $viditem.attr('comments', videntry.numcomments);
                        $viditem.find('.gamevidpreview').attr('src', vidinfo[i].vidpic);
                        var vidsource = 'http://' +
                            (videntry.videohost === 'youtube' ? 'youtu.be' : videntry.videohost) +
                            '/' + videntry.extvideoid;
                        $viditem.find('.gamevidlink').attr('href', vidsource);
                        $viditem.find('.gamevidtitle').html(videntry.title);
                        $vidparent.append($viditem);
                    }
                    // If there were more than 15 videos, show a more thumbnail with a link
                    // to the bgg page
                    if (vidinfo.length < vidlistobj.videos.length) {
                        var $viditem = $vttmpl.clone();
                        $viditem.attr('ordinal', 1000000);
                        $viditem.attr('thumbs', 0);
                        $viditem.attr('comments', 0);
                        $viditem.find('.gamevidpreview').attr('src', 'resources/bgg_cornerlogo.png');
                        $viditem.find('.gamevidlink')
                            .attr('href', 'http://boardgamegeek.com/boardgame/'+gameNo + '#videos')
                            .attr('target', '_blank');
                        $viditem.find('.gamevidtitle').html('More ...');
                        $vidparent.append($viditem);
                    }
                    try {
                        $vidparent.isotope({
                            itemSelector: '.gameviditem',
                            layoutMode: 'fitRows',
                            getSortData: {
                                ord: function ($e) {
                                    return parseInt($e.find('[ordinal]').attr('ordinal'));
                                },
                                numthumbs: function ($e) {
                                    return parseInt($e.find('[thumbs]').attr('ordinal'));
                                }
                            },
                            sortBy: 'original-order', // 'ord'
                            resizable: true
                        });
//                        $vidparent.isotope('bindResize');
                    } catch (err) {
                        console.log("vid layout err "+err);
                    }
                });
            });
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

    $(document).on('click', '.gameitemnav', function () {
        if (gamehistory.empty()) {
            return false;
        }
        if ($(this).attr('id') === 'nextgame') {
            if (!gamehistory.next()) {
                return false;
            }
        }
        else {
            if (!gamehistory.prev()) {
                return false;
            }
        }
        fillingameinfo(gamehistory.get(), true);
    });

    $(document).on('click', "#gametitle", function (evt) {
        window.open('http://boardgamegeek.com/boardgame/'+currGame);
    });

    $(document).on('click', "#bgplink", function (evt) {
        var gamename = $("#gamename").data('gname');
        window.open('http://boardgameprices.com/search/'+gamename);
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

    $(document).on('click', '.review-item', function (evt) {
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

    $(document).on('click', '#reviewModal', function(evt) {
        $("#reviewModal").modal('hide');
    });

    $(document).on('hidden.bs.modal', '#reviewModal', function(evt) {
        $.publish ('layout.hidemodal');   // pg.resetOverflow('center');
    });

    $(document).on('click',"#gamestat-rank",function () {
        var currgamerank = $("#gamestat-rank").data('rank');
        if (currgamerank > 0) {
            $.publish('list.rank', [currgamerank]);
        }
        return false;
    });


    // The subscriptions
    $.subscribe('setgame', function (_, gameNo, bNoAdd) {
        fillingameinfo(gameNo, bNoAdd);
    });

    // The load
    $.get("html-frag/main.html",
        function (r) {
            $(pane).html(r);
        }
    );

    return {
        setgame: function (gameNo, bNoAdd) {
            fillingameinfo(gameNo, bNoAdd);
        }
    };
}