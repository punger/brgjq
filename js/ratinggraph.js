/**
 * Created by paul on 1/21/14.
 */

function RatingGraph () {
        var graphinited = false;
        var gvgraph;
        var diff = 1.001;
        var data;

        var options = {
            max: 5,
            min: 1,
            yellowFrom: 1,
            yellowTo: 2,
            greenFrom: 2,
            greenTo: 4,
            redFrom: 4,
            redTo: 5,
            majorTicks: ["easy", "moderate", "hard"],
            minorTicks: 4,
            animation: {
                duration: 1000
            },
            height: 160,
            width: 160
        };



        var drawgraph = function () {

            // Update and draw the visualization.
            try {
                data.setValue(0, 1, diff);
                gvgraph.draw(data, options);
            } catch (e) {
                alert('graph error: '+ e);
            }

        };
        var initgraph = function (targetid) {
            graphinited = true;
            google.load("visualization", "1", {"packages": ["corechart"], "callback": function() {
                gvgraph = new google.visualization.Gauge(document.getElementById(targetid));
                data = google.visualization.arrayToDataTable([
                    ['Label', 'Value'],
                    ['', 1.0]
                ]);
                drawgraph();
            }});
        };

        return {
            updategraph: function (targetid, inputmap) {
                if (typeof inputmap === "string") {
                    diff = parseFloat(inputmap);
                } else if (typeof inputmap === "number") {
                    diff = inputmap;
                } else {
                    return;
                }
                if (!graphinited) {
                    initgraph(targetid);
                } else {
                    drawgraph();
                }
            }
        };
    }
