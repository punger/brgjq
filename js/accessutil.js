/**
 * Created by paul on 1/26/14.
 */

function AccessUtil  () {
    var respAsXML = function (response) {
        var respXmlString;
        var htmLoc = response.indexOf('<html');
        if (htmLoc < 0) {
            respXmlString = response;
        } else {
            respXmlString = response.substr(0, htmLoc);
        }
        try {
            // Embedded script tags make the xml parsing barf
            var rxmlnoscript = respXmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            var respXml = $.parseXML(rxmlnoscript);
            return respXml;
        } catch (e) {
            alert('xml parse problem: '+ e);
        }

    };
    return {
        "$xResp": function (response) {
            return $(respAsXML(response));
        },
        "xmlResp": function (response) {
            return respAsXML(response);
        },
        "jResp": function (response) {
            var respJsonString;
            var htmLoc = response.indexOf('<html');
            if (htmLoc < 0) {
                respJsonString = response;
            }
            else {
                respJsonString = response.substr(0, htmLoc);
            }
            return $.parseJSON(respJsonString);
        },
        "slugify": function (str) {
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();

            // remove accents, swap ñ for n, etc
            var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to   = "aaaaeeeeiiiioooouuuunc------";
            for (var i=0, l=from.length ; i<l ; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/\bthe\b/gi, '-')
                .replace(/\bin\b/gi, '-')
                .replace(/\bof\b/gi, '-')
                .replace(/\bto\b/gi, '-')
                .replace(/\bfor\b/gi, '-')
                .replace(/\bby\b/gi, '-')
                .replace(/\bwith\b/gi, '-')
                .replace(/\bat\b/gi, '-')
                .replace(/\bon\b/gi, '-')
                .replace(/\bfrom\b/gi, '-')
                .replace(/\bas\b/gi, '-')
                .replace(/\binto\b/gi, '-')
                .replace(/\blike\b/gi, '-')
                .replace(/\ba\b/gi, '-')
                .replace(/\ban\b/gi, '-')
                .replace(/-+/g, '-')    // collapse dashes
                .replace(/^-/, '');     // remove a dash at the beginning

            return str.substr(0, 50);
        }

    };
}
