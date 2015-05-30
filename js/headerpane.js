/**
 *
 * @param paneselector
 * @param arg
 * @returns {{getGameNo: Function, setGameNo: Function, getSearchString: Function,
 * ajaxmore: Function, ajaxless: Function}}
 * @constructor
 */
function HeaderPane(paneselector, arg) {
    var pane = paneselector;
    var showCount = 0;
    var $ld;
    var catLister;
    var callid = 0;
    var ajaxtracker;

    $.get("html-frag/top.html", function (r) {
        $(pane).html(r);
        $ld = $('#loading');
        /**
         * Show loading gif when waiting for AJAX results.
         * It turns out that you need to keep a use count because more than one of these fires.
         */
        $(document)
            .bind("ajaxSend", function( event, request, settings ) {
                settings.privatecallid = ++callid;
                $.publish('ajaxcall.start', [settings.url, callid]);
                showCount++;
                $ld.show();
            })
            .bind("ajaxComplete", function( event, request, settings ) {
                $.publish('ajaxcall.end', [settings.url, settings.privatecallid, request.status]);
                if (showCount <= 1) {
                    showCount = 0;
                    $ld.hide();
                } else {
                    showCount--;
                }
            });
        if (!ajaxtracker) {
            ajaxtracker = new AjaxTracker("commtracer");
        }
        ajaxtracker.init();
        if (arg) {
            var gameNo = parseInt(arg);
            if (gameNo) {
                $.publish('setgame', [gameNo]);
            } else {
                var srchstr = decodeURI( arg);
                $.publish('list.search', [srchstr]);
                $.publish('gamesearchchange', [srchstr]);
            }
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
    $.subscribe('categories.ready', function() {
        // ready to do something with the categories
        console.log(catLister.listTypes());
        console.log("Categories\n"+JSON.stringify(catLister.catList()));
    });

    catLister = new GameCategories();

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

    $(document).on('keypress', '#bgguser', function (e){
        if (e.which === 13) {
            var q = $("#bgguser").val();
            $.cookie('bgguser', q);
            $.publish('list.collection', [q]);
        }
    });
    $(document).on('click', "#searchUser", function () {
        var q = $("#bgguser").val();
        $.cookie('bgguser', q);
        $.publish('list.collection', [q]);
    });
    $(document).on('click', "#hotness-list", function () {
        $.publish('list.hotness', []);
    });
    $(document).on('click', "#help", function () {
        alert('Only weenies whine for help.  Oh, well, coming soon, I guess.');
    });
    $(document).on('click', "#show-comm", function () {
        $.publish('layout.showmodal', 'north'); // pg.allowOverflow('north');
        $('#commModal').modal({
            backdrop: false // only this seems to work
        }).draggable();
    });
    $(document).on('click', '#commModal', function() {
        $("#commModal").modal('hide');
    });

    $(document).on('hidden.bs.modal', '#commModal', function() {
        $.publish ('layout.hidemodal', 'north');   // pg.resetOverflow('north');
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
