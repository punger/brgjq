/**
 * Load static category information
 * @returns {{catList: Function, entries: Function, listTypes: Function}}
 * @constructor
 */
function GameCategories() {
    var categories = ["boardgamecategory", "boardgamemechanic", "boardgamesubdomain"];
    var catLists = [];
    $.get("/PHP/proxy.php",
        'http://boardgamegeek.com/advsearch/boardgame',
        function (response) {
            var $respJq = $(response);
            $.each(categories, function (i, cat) {
                var currList = catLists[cat] = [];
                var $catTable = $respJq.find("#"+ cat);
                var $catEntries = $catTable.find('.pt5');
                $catEntries.each(function(i, catEntry) {
                    var $catEntry = $(catEntry);
                    var entry = {
                        "name": $catEntry.find('input').first().attr('value'),
                        "id": $catEntry.find('td').eq(1).text()
                    };
                    currList.push(entry);
                });
            });
            $.publish('categories.ready', catLists);
        },
        "html"
    );
    return {
        "catList": function () {
            return catLists;
        },
        "entries": function(cat) {
            if (catLists) {
                return catLists[cat];
            }
            return null;
        },
        "listTypes": function() {
            return categories;
        }
    };
}