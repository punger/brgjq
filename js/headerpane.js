/**
 * Created by paul on 1/25/14.
 */

function HeaderPane(paneselector, initComplete) {
    var pane = paneselector;
    var showCount = 0;
    var $ld;
    $.get("html-frag/top.html", function (r) {
        $(pane).html(r);
        $ld = $('#loading');
        /**
         * Show loading gif when waiting for AJAX results.
         * It turns out that you need to keep a use count because more than one of these fires.
         */
        $(document)
            .bind("ajaxSend", function() {
                showCount++;
                $ld.show();
            })
            .bind("ajaxComplete", function() {
                if (showCount <= 1) {
                    showCount = 0;
                    $ld.hide();
                } else {
                    showCount--;
                }
            });

        if (typeof initComplete === "function") {
            initComplete();
        }
    });

    var setMessage = function (m) {
        $("#brgmessage").html(m);
    };

    $.subscribe('statusmessage', function (_, m) {setMessage(m);});
    $.subscribe('gamenumchange', function (_, gameNo) {
        $('#gamenum').val(gameNo);
    });
    $.subscribe('gamesearchchange', function(_, searchstring) {
        $("#gamesearch").val(searchstring);
    });

    $(document).on('keypress', '#gamenum', function (e){
        if (e.which === 13) {
            var gameNo = $("#gamenum").val();
            $.publish('setgame', [gameNo]);
        }
    });
    $(document).on('click', "#getGame", function () {
        var gameNo = $("#gamenum").val();
        $.publish('setgame', [gameNo]);
    });

    $(document).on('keypress', '#gamesearch', function (e){
        if (e.which === 13) {
            var q = $("#gamesearch").val();
            $.publish('list.search', [q]);
        }
    });
    $(document).on('click', "#searchGame", function () {
        var q = $("#gamesearch").val();
        $.publish('list.search', [q]);
    });

    return {
        getGameNo: function () {
            return $("#gamenum").val();
        },
        setGameNo: function (gn) {

        },
        getSearchString: function () {

        },
        ajaxmore: function () {

        },
        ajaxless: function () {
            if (showCount) {
                showCount--;
                if (!showCount) {
                    $ld.hide();
                }
            }

        }
    };
}
