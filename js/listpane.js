/**
 * Created by paul on 1/25/14.
 */

function ListPane(parentpaneselector) {
    var ptsel = parentpaneselector;
    var gl = new GameLister();
    var $srchlist;


    // Load the HTML
    $.get("html-frag/srchres.html", function (r) {
        $(ptsel).html(r);
        $('.gameranknav').hide();
        $srchlist = $('#searchresults');
//        $("#sidelistheader").html(listheader);
        $.publish('layout.addclosebutton', ['#srchlistclose']);
    });

    // Local functions
    var initlist = function (listheader) {
        $('.gameranknav').hide();
        $("#sidelistheader").html(listheader);
//            $.publish('layout.addclosebutton');
//            App.pg.addCloseBtn("#srchlistclose", 'east');
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

    var displaylistitems = function ($gamelist) {
//        var $gamelisthtml = $("#searchresults");
        $srchlist.find('li').remove();

        var numGames = $gamelist.find('items').attr("total");
        if (!numGames) {
            $.publish('statusmessage', ["No games found"]);  //$("#brgmessage").html("No games found");
            return;
        }
        $.publish('statusmessage', [""+numGames +" games found"]);
        var $gameitem = $("<li/>", {
            html: "<span hidden class='srchres-gameid'/><span class='srchres-gamename'/>",
            "class": "gameitem"
        });

        for (var srchlistindex = 0; srchlistindex < numGames; srchlistindex++) {
            var $newGameItem = $gameitem.clone();
            var $item = $gamelist.find('item').eq(srchlistindex);
            $newGameItem.find(".srchres-gameid").html($item.attr("id"));
            var linkcontent = (
                $item.find('name').attr('value') +
                    " <a>(" + $item.find('yearpublished').attr('value')+")</a>")
                .replace(/\(\(/g, '(').replace(/\)\)/g,')');
            $newGameItem.find(".srchres-gamename").html(linkcontent);
            $srchlist.append($newGameItem);
        }
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
                displaylistitems($gl);
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
        var gameNo = $this.find('.srchres-gameid').text();
        $.publish('setgame', [gameNo]);
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
