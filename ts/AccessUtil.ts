/// <reference path="../bower_components/dt-jquery2/jquery.d.ts" />

 /**
 * Collection of methods for getting usable data from some ajax responses.
 * Generally, these are forced on us by idiosyncrasies of the bgg return data
 */
class AccessUtil {
    /**
     * Strips out any trailing html.  Useful for some bgg responses
     * @param response which might have bogus html at the end
     * @returns {string}
     */
    private static stripHtmlTag(response: string) {
        var htmLoc = response.indexOf('<html');
        if (htmLoc < 0) {
            return response;
        } else {
            return response.substr(0, htmLoc);
        }
    }

    /**
     *
     * @param response
     * @returns {string|null}
     */
    private static respAsXML(response: string) {
        var respXmlString = AccessUtil.stripHtmlTag(response);
        try {
            // Embedded script tags make the xml parsing barf
            var rxmlnoscript =
                respXmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            return $.parseXML(rxmlnoscript);
        } catch (e) {
            console.error('xml parse problem: '+ e);
            return null;
        }
    }

    /**
     * Strip html content out of html responses
     * @param response return string from ajax call
     * @returns {string|string}
     */
    static htmlResp( response: string) {
        return AccessUtil.stripHtmlTag(response);
    }

    /**
     *
     * @param response
     * @returns {JQuery}
     */
    static $xResp(response: string) {
        return $(AccessUtil.respAsXML(response));
    }

    /**
     *
     * @param response
     * @returns {XMLDocument|null}
     */
    static xmlResp(response: string) {
        return AccessUtil.respAsXML(response);
    }

    /**
     *
     * @param response
     * @returns {any}
     */
    static jResp(response: string) {
        var respJsonString;
        var htmLoc = response.indexOf('<html');
        if (htmLoc < 0) {
            respJsonString = response;
        }
        else {
            respJsonString = response.substr(0, htmLoc);
        }
        return $.parseJSON(respJsonString);
    }

    /**
     *
     * @param response
     * @returns {JQuery}
     */
    static $jqResp(response: string) {
        var respNoScript = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return $(respNoScript);
    }

    /**
     *
     * @param str
     * @returns {string}
     */
    static slugify(str: string) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ס for n, etc
        var from = "אבהגטיכךלםןמעףצפשתüûסח·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str
            .replace(/\bthe\b/gi, '-')  // prepositions and articles
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
            .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-')    // collapse dashes
            .replace(/-$/, '')      // remove dash at the end
            .replace(/^-/, '');     // remove a dash at the beginning

        return str.substr(0, 50);
    }

}
