/**
 * Created by paul on 2/1/14.
 */

/**
 *
 * @returns {{writelistitems: Function, writelistitems_obj: Function}}
 * @constructor
 */
function GameListDisplayer() {

    var tooltiplist = function () {
        var privatedata = $(this).attr('data-private');
        if (!privatedata) {
            return '<span hidden="true"></span>';
        }
        var data = JSON.parse(privatedata);
        var items = '';
        for (var setting in data) {
            if (data.hasOwnProperty(setting)) {
                items += '<dt>'+ setting+'</dt>';
                items += '<dd>'+data[setting]+'</dd>';
            }
        }
        return '<dl class="gameitem-tooltip">'+ items+'</dl>';
    };
    return {
        "writelistitems": function($gamelist, $parent) {
            $parent.empty();

            var numGames = $gamelist.find('items').attr("total");
            $.get("html-frag/listitem.html", function (r) {
                var $gameitem = $(r);

                for (var srchlistindex = 0; srchlistindex < numGames; srchlistindex++) {
                    var $newGameItem = $gameitem.clone();
                    var $item = $gamelist.find('item').eq(srchlistindex);
                    $newGameItem.find(".listitem-id").text($item.attr("id"));
                    $newGameItem.find(".listitem-name").text($item.find('name').attr('value'));
                    $newGameItem.find(".listitem-year").text($item.find('yearpublished').attr('value'));
                    $parent.append($newGameItem);
                }
            });
        },
        "writelistitems_obj": function(gamelist, $parent) {
            $parent.empty();

            var numGames = gamelist.total;
            $.get("html-frag/listitem.html", function (r) {
                var $gameitem = $(r);

                for (var srchlistindex = 0; srchlistindex < numGames; srchlistindex++) {
                    var $newGameItem = $gameitem.clone();
                    var item = gamelist.items[srchlistindex];
                    $newGameItem.find(".listitem-id").text(item.gameNo);
                    $newGameItem.find(".listitem-name").text(item.name);
                    $newGameItem.find(".listitem-year").text(item.year);
                    // present for a list from the history, absent otherwise
                    $newGameItem.find(".listitem-histindex").text(item.index);
                    if (item.hasOwnProperty('data') && item.data) {
                        // data-toggle="tooltip" title="Some tooltip text!" data-delay='{ "show": 500, "hide": 100 }'
                        $newGameItem.attr('data-toggle', 'tooltip');
                        $newGameItem.attr('data-delay', '{ "show": 300, "hide": 100 }');
                        $newGameItem.attr('data-html', 'true');
                        //$newGameItem.attr('data-viewport', '{ "selector": "body", "padding": 0 }');
                        $newGameItem.attr('data-placement', 'bottom');//
                        $newGameItem.attr('data-private', JSON.stringify(item.data));
                        if (item.data.own) {
                            $newGameItem.addClass('listitem-owned');
                        }
                        $newGameItem.attr('data-title', tooltiplist);
                        $parent.append($newGameItem);
                        $parent.find('.gameitem').tooltip();
                    } else {
                        $parent.append($newGameItem);
                    }
                }
            });
        }
    };
}