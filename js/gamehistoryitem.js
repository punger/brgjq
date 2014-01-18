/**
 * Created by paul on 1/18/14.
 */

function gamelist () {
    var games = [];
    var gameindex = -1;

    return {
        "add": function (game) {
            if (typeof game === "undefined") {
                return;
            }
            gameindex++;
            games.splice(gameindex, 0, game);
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
                        return true;
                    }
                }
            }
            return false;
        },
        "clear": function () {
            games = [];
            gameindex = -1;
        },
        "all": function() {
            return games;
        },
        "before": function () {
            if (!games.length || gameindex <= 0) {
                return [];
            }
            return games.slice(0, gameindex);
        },
        "after": function () {
            if (!games.length || gameindex >= games.length - 1) {
                return [];
            }
            return games.slice(gameindex + 1);
        },
        "prev": function () {
            return this.select(gameindex - 1);
        },
        "next": function() {
            return this.select(gameindex + 1);
        },
        "empty": function () {
            return (!games.length);
        }
    };
}