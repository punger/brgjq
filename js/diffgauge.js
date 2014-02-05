/**
 * Created by paul on 1/19/14.
 */

function DiffGauge () {
    var gaugeinited = false;
    var gvgauge;
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



    var drawgauge = function () {

        // Update and draw the visualization.
        try {
            data.setValue(0, 1, diff);
            gvgauge.draw(data, options);
        } catch (e) {
            alert('gauge error: '+ e);
        }

    };
    var gauginiting = false;
    var initgauge = function (targetid) {
        if (gauginiting) {
            drawgauge();
            return;
        }
        google.load("visualization", "1", {"packages": ["gauge"], "callback": function() {
            gauginiting = true;
            gvgauge = new google.visualization.Gauge(document.getElementById(targetid));
            data = google.visualization.arrayToDataTable([
                ['Label', 'Value'],
                ['', 1.0]
            ]);
            gaugeinited = true;
            gauginiting = false;
            drawgauge();
        }});
    };

    return {
        updategauge: function (targetid, value) {
            if (typeof value === "string") {
                diff = parseFloat(value);
            } else if (typeof value === "number") {
                diff = value;
            } else {
                return;
            }
            if (!gaugeinited) {
                initgauge(targetid);
            } else {
                drawgauge();
            }
        },
        reinit: function () {
            gaugeinited = false;
            gvgauge = null;
        }
    };
}
