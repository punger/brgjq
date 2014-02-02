/**
 * Created by paul on 1/18/14.
 */

function GameHistory (shouldset) {
    var storedgames = $.cookie("gameslist");
    var gameindex = -1;
    var games;
    var me;
    var showstatus = function() {
        $.publish('status.gamelist', [me]);
    };

    if (!storedgames) {
        games = [];
    } else {
        games = JSON.parse(storedgames);
        gameindex = games.length - 1;
        if (shouldset) {
            var lastgameitem = games[gameindex];
            if (parseInt(lastgameitem)) {
                $.publish('setgame', [lastgameitem, true]);
            } else {
                $.publish('setgame', [lastgameitem.gameNo, true]);
            }
        }
    }

    var persist = function() {
        $.cookie("gameslist", JSON.stringify(games));
        showstatus();
    };

    me = {
        "add": function (game) {
            if (typeof game === "undefined") {
                return;
            }
            gameindex++;
            games.splice(gameindex, 0, game);
            // reset indexes after add
            $.each(games, function(i, g) {
                g.index = i;
            });
            persist();
        },
        "get": function (index) {
            if (typeof index === "undefined") {
                if (gameindex < 0 || gameindex >= games.length) {
                    return;
                }
            } else {
                this.select(index);
            }
            return games[gameindex];
        },
        "select": function (index) {
            if (games.length > 0 && typeof index !== "undefined") {
                if (index < 0) {
                    gameindex = 0;
                } else if (index >= games.length) {
                    gameindex = games.length - 1;
                } else {
                    if (gameindex !== index) {
                        gameindex = index;
                        showstatus();
                        return true;
                    }
                }
            }
            showstatus();
            return false;
        },
        "clear": function () {
            games = [];
            gameindex = -1;
            persist();
        },
        "all": function() {
            return {
                "total": games ? games.length : 0,
                "items": games,
                "gameindex": gameindex
            };
        },
        "before": function () {
            if (!games.length || gameindex <= 0) {
                return {
                    "total": 0,
                    "items": []
                };
            }
            return {
                "total": gameindex,
                "items": games.slice(0, gameindex).reverse()
            };
        },
        "after": function () {
            if (!games.length || gameindex >= games.length - 1) {
                return {
                    "total": 0,
                    "items": []
                };
            }
            return {
                "total": games.length - gameindex - 1,
                "items": games.slice(gameindex + 1)
            };
        },
        "prev": function () {
            return this.select(gameindex - 1);
        },
        "next": function() {
            return this.select(gameindex + 1);
        },
        "empty": function () {
            return (!games.length);
        },
        "getindex": function() {
            return gameindex;
        }
    };
    return me;
}