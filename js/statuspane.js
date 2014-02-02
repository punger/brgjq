/**
 * Created by paul on 2/1/14.
 */

function StatusPane(parentpaneselector) {
    var pane = parentpaneselector;

    var gi;
    var currghl;

    var statDirective = {
        "#status-gameindex": "gameindex",
        "#status-gamecount": "total",
        "#status-table .status-colheader": {
            "game<-items" : {
                ".status-colhdrval": function(g) {
                    return g.pos;
                }
            }
        },
        "#status-table .status-entry": {
            "game<-items" : {
                ".status-gamename": "game.name"
            }
        }
    };

    var showlist = function (ghl) {
        $(pane).empty();
        $.get("html-frag/status.html", function (r) {
            var $statbody = $(r);
            $(pane).append($statbody);
            $statbody.render(ghl.all(), statDirective);
            $(".status-entry").eq(ghl.getindex()).css('background-color',  '#ff8080');
        });

    };
    $.subscribe('status.gamelist', function(_, ghlin) {
        currghl = ghlin;
        showlist(ghlin);
    });
    $(document).on('click', "#status-glistclear",function() {
        if (currghl) {
            currghl.clear();
            showlist(currghl);
        }
    });
}