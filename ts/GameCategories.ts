/// <reference path="../bower_components/dt-jquery2/jquery.d.ts" />
/// <reference path="../dts/jq-tiny-pubsub.d.ts" />

class GameCategories {
    categories: Array<string> = ["boardgamecategory", "boardgamemechanic", "boardgamesubdomain"];
    catLists: Array<any> = [];
    constructor () {
        $.get("/PHP/proxy.php",
            'http://boardgamegeek.com/advsearch/boardgame',
            function (response) {
                var $respJq = $(response);
                $.each(this.categories, function (i, cat) {
                    var currList = this.catLists[cat] = [];
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
                $.publish('categories.ready', this.catLists);
            },
            "html"
        );

    }

}