/**
 * Created by paul on 12/24/13.
 */

// In loc/mods/mod1.js (which means this code defines
// the "demo/mods/mod1" module):

define([
    // The dojo/dom module is required by this module, so it goes
    // in this list of dependencies.
    "dojo/request", "jquery"
], function(request, $){
    // Once all modules in the dependency list have loaded, this
    // function is called to define the demo/myModule module.
    //
    // The dojo/dom module is passed as the first argument to this
    // function; additional modules in the dependency list would be
    // passed in as subsequent arguments.

    // This returned object becomes the defined value of this module
    return {
        gameinfo: function (gamenum, cb) {
            var info;
            info = {
                id: gamenum,
                name: 'Some game name',
                imageUrl: '',
                minage: 12,
                difficulty: 2.8,
                rating: 7.33,
                rank: -1,
                valid: true,
                message: ''
            };
            request.get("/xdproxy/proxy.php",
                {
                    query: {
                        id: gamenum,
                        stats: 1,
                        destination: 'http://www.rpggeek.com/xmlapi2/thing'
                    }
                }
            ).then(
                function (response) {
                    try {
                        var respXmlString;
                        var htmLoc = response.indexOf('<html');
                        if (htmLoc < 0) {
                            respXmlString = response;
                        }
                        else {
                            respXmlString = response.substr(0, htmLoc);
                        }
                        var respXml = $.parseXML(respXmlString);
                        var $respJq = $(respXml);
                        info.name = $respJq.find('name[type="primary"]').attr('value');
                        info.minage = $respJq.find('minage').attr('value');
                        info.imageUrl = $respJq.find('image').text();
                        var $stats = $respJq.find("statistics ratings");
                        info.rating = $stats.find("average").attr("value");
                        info.difficulty = $stats.find("averageweight").attr("value");
                        info.rank = $stats.find('rank[type="subtype"]').attr("value");
//                        info.minage = $respJq.find('minage').attr('value');
                    }
                    catch (err) {
                        var txt="There was an error on this page.\n\n";
                        txt+="Error description: " + err.message + "\n\n";
                        txt+="Click OK to continue.\n\n";
                        alert(txt);
                        info.valid = false;
                        info.message = txt;
                    }
                    cb(info);
                },
                function (error) {
                    info.valid = false;
                    info.message = '<pre> Error: '+error+'</pre>';
                    cb(info);
                }

            );
            return info;
        }
    };
});