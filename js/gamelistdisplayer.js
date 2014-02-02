/**
 * Created by paul on 2/1/14.
 */

function GameListDisplayer() {
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
                    $parent.append($newGameItem);
                }
            });
        }
    };
}