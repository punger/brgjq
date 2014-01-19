/**
 * Created by paul on 1/19/14.
 */

function DiffGauge () {
    var gaugeinited = false;
    var $target;
    var gvgauge;
    var diff = 3;


    var drawgauge = function () {
        var data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['', diff]
        ]);

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
            "animation.duration": 4000
        };

        // Create and draw the visualization.
        gvgauge.draw(data, options);

    };
    var creategauge = function() {
        gvgauge = new google.visualization.Gauge($target[0]);
        drawgauge();
    };
    var initgauge = function (targetid) {
        gaugeinited = true;
        $target = $('#'+targetid);
        google.load("visualization", "1", {"packages": ["gauge"], "callback": creategauge});
//            $('body').append(
//                '<script type="text/javascript">' +
//                    'google.load("visualization", "1", {packages: ["gauge"], "callback": this.drawgauge});</script>');


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
                return;
            }
            drawgauge();
        }
    };
}
