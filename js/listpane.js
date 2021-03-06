/**
 * Created by paul on 1/25/14.
 */

function ListPane(parentpaneselector) {
    var ptsel = parentpaneselector;
    var gl = new GameLister();
    var gld = new GameListDisplayer();
    var $srchlist;


    // Load the HTML
    $.get("html-frag/srchres.html", function (r) {
        $(ptsel).html(r);
//        $('.gameranknav').hide();
        $srchlist = $('#searchresults');
        $.publish('layout.addclosebutton', ['#srchlistclose']);
    });

    // Local functions
    var initlist = function (listheader) {
        $('.gameranknav').hide();
        $("#sidelistheader").html(listheader);
    };


    var showranklist = function (ranktarget) {
        var rankbase = Math.floor((ranktarget - 1) / 100) * 100 + 1;
        showgamelist(
            "Retrieving games by rank ...",
            'Games by Rank',
            'rank',
            rankbase,
            100,
            null,
            true
        );
    };

//    var displaygameitems = function($gamelist, $parent) {
//        $parent.empty();
//
//        var numGames = $gamelist.find('items').attr("total");
//        if (!numGames) {
//            $.publish('statusmessage', ["No games found"]);  //$("#brgmessage").html("No games found");
//            return;
//        }
//        $.publish('statusmessage', [""+numGames +" games found"]);
//        $.get("html-frag/listitem.html", function (r) {
//            var $gameitem = $(r);
//
//            for (var srchlistindex = 0; srchlistindex < numGames; srchlistindex++) {
//                var $newGameItem = $gameitem.clone();
//                var $item = $gamelist.find('item').eq(srchlistindex);
//                $newGameItem.find(".listitem-id").text($item.attr("id"));
//                $newGameItem.find(".listitem-name").text($item.find('name').attr('value'));
//                $newGameItem.find(".listitem-year").text($item.find('yearpublished').attr('value'));
//                $parent.append($newGameItem);
//            }
//        });
//    };

    var displaygamelist = function (gamelist) {
        var numGames = gamelist.total;
        if (!numGames) {
            $.publish('statusmessage', ["No games found"]);  //$("#brgmessage").html("No games found");
            return;
        }
        $.publish('statusmessage', [""+numGames +" games found"]);
        gld.writelistitems_obj(gamelist, $srchlist);
    };

    var showgamelist = function(
        processprompt,
        listheader,
        listtype,
        start,
        count,
        arg,
        bcontinue
        )
    {
        $.publish('statusmessage', [processprompt]);  // $("#brgmessage").html(processprompt);
        initlist(listheader);
        gl.gamelist(
            listtype,
            function($gl) {
                var liststate = {
                    processprompt: processprompt,
                    listheader: listheader,
                    listtype: listtype,
                    start: start,
                    count: count,
                    arg: arg,
                    bcontinue: bcontinue
                };
                $srchlist.data(liststate);
                $srchlist.attr('start', start);
                displaygamelist($gl);
                if (!bcontinue) {
                    $('.gameranknav').hide();
                } else {
                    $('#prevranklist').tooltip({
                        'show': true,
                        'placement': 'left',
                        'title': "Previous " + count
                    });
                    $('#nextranklist').tooltip({
                        'show': true,
                        'placement': 'bottom',
                        'title': "Next " + count
                    });
                    $('.gameranknav').show();
                }
//                $(".gameitem").tooltip({"html": true});
                $.publish('layout.showlist');
            },
            start, count, arg
        );

    };

    var showsearchresults = function (q) {
        if (!q || !q.trim()) {
            $.publish('statusmessage', ["Nothing to search"]);
            return;
        }
        showgamelist(
            "Searching ...",
            "Search Results",
            'search',
            1,
            1000,
            q,
            false);

    };

    $(document).on('click', '.gameitem', function () {
        var $this = $( this );
        var gameNo = $this.find('.listitem-id').text();
        // Don't add if we're not in the search panel
        var searchParent = $this.parents("#searchresults");
        if (searchParent.length !== 0) {
            $.publish('setgame', [gameNo]);
        } else {
            // If we can find a game index, tell the historylist to move to it
            $.publish('setgame', [gameNo, true]);
            var gameindex = $this.find('.listitem-histindex').text();
            if (typeof gameindex === "string" && gameindex.length > 0) {
                $.publish('selectgamehistoryindex', [parseInt(gameindex)]);
            } else if (typeof gameindex === "number") {
                $.publish('selectgamehistoryindex', [gameindex]);
            }
        }
    });
    $(document).on('click', '.gameranknav', function () {
        var listparams = $srchlist.data();
        var delta = ($(this).attr('id') === "prevranklist") ? -1 : 1;
        var currbase = parseInt(listparams.start);
        if (!currbase) {
            return;
        }
        var nextbase = currbase + (delta * parseInt(listparams.count));
        if (nextbase <= 0) {
            return;
        }
        showgamelist(listparams.processprompt,
            listparams.listheader,
            listparams.listtype,
            nextbase,
            listparams.count,
            listparams.arg,
            listparams.bcontinue);
    });




    $.subscribe('list.gamelist', function (_,
                                           processprompt,
                                           listheader,
                                           listtype,
                                           start,
                                           count,
                                           arg,
                                           bcontinue
        ) {
        showgamelist(
            processprompt,
            listheader,
            listtype,
            start,
            count,
            arg,
            bcontinue
        );
    });
    $.subscribe('list.search', function (_, q) {
        showsearchresults(q);
    });
    $.subscribe('list.rank', function (_, rid) {
        showranklist(rid);
    });

    return {
        showlist: function () {},
        loadandshowlist: function () {}


    };

}
