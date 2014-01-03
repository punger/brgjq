/**
 * Created by paul on 12/27/13.
 */

var eyecandy = {
    showRating:
        function(rating, $anchor) {
            var base = 5;
            var high = 9;
            var baseloc = 30;
            var rangeloc = 80;
            var lineloc = baseloc + (rangeloc *(rating - base)) / (high - base);

            var $c = $anchor.find('canvas');
//    $c.width(140).height(65);
//    $c.appendTo($anchor);
            $c.clearCanvas();
            var gradient = $c.createGradient({
                x1: 20, y1: 0,
                x2: 120, y2: 0,
                c1: 'black',	c2: 'red',	c3: 'yellow',	c4: 'green',	c5: 'black',
                s1: 0,          s2: 0.1,	s3: 0.45,        s4: 0.9,        s5: 1
            });
            $c.drawRect({
                fillStyle: gradient,
                x: 20,
                y: 5,
                width: 100,
                height: 10,
                fromCenter: false
            });
            $c.drawLine({
                strokeStyle: 'black',
                strokeWidth: 3,
                x1: lineloc, y1: 0,
                x2: lineloc, y2: 20
            });
        },
    showDifficulty: function (diff) {
        // Create and populate the data table.
        var data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Difficulty', diff]
        ]);

        var options = {
            width: 120, height: 120,
            redFrom: 4, redTo: 5,
            yellowFrom:1, yellowTo: 2,
            greenFrom: 2, greenTo: 4,
            majorTicks: ['Easy', 'Moderate', 'Hard'],
            min: 1, max: 5
        };

        // Create and draw the visualization.
        try {
            this._diffGauge.draw(data, options);
        } catch (err) {
            alert("Gauge drawing err "+err);
        }
    },
    initializeDifficultyGauge: function ( anchorid) {
        try {
            this._diffGauge = new google.visualization.Gauge(
                document.getElementById(anchorid));
        } catch (err) {
            alert('Gauge initialization error '+err);
        }

    }
};