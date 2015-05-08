/**
 * Created by paul on 1/21/14.
 */

function RatingGraph () {
    var graphinited = false;
    var gvgraph;
    var data;

    var options = {
        height: 160,
        width: 160
    };


    var convertToGDataTable = function (inputmap) {
        // Array of [Object { val, votes array of number } ]
        var gdt = [ ['Age', 'Votes'] ];
        var numbars = 0;
        $.each(inputmap, function(i, val) {
            var $val = $(val);
            var age = $val.attr('value');
            var votes = $val.attr('numvotes');
            ++numbars;
            gdt.push([age, votes]);
        });
        return google.visualization.arrayToDataTable(gdt);
    };

    var drawgraph = function (inputmap) {
        // Update and draw the visualization.
        try {
            data = convertToGDataTable(inputmap);
            gvgraph.draw(data, options);
        } catch (e) {
            alert('graph error: '+ e);
        }

    };
    var initgraph = function (targetid, inputmap) {
        graphinited = true;
        google.load("visualization", "1", {"packages": ["corechart"], "callback": function() {
            gvgraph = new google.visualization.BarChart(document.getElementById(targetid));
            data = google.visualization.arrayToDataTable([
                ['Age', 'Votes'],
                ['1', 0]
            ]);
            drawgraph(inputmap);
        }});
    };

    return {
        updategraph: function (targetid, inputmap) {

            if (typeof inputmap !== "object") {
                return;
            }
            if (!graphinited) {
                initgraph(targetid);
            } else {
                drawgraph(inputmap);
            }
        }
    };
}
