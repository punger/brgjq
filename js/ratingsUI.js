/**
 * Created by paul on 12/27/13.
 */

function EyeCandy() {
    return {
        showRating:
            function(rating, $anchor) {
                var base = 5;
                var high = 9;
                var baseloc = 30;
                var rangeloc = 80;
                var lineloc = baseloc + (rangeloc *(rating - base)) / (high - base);

                var $c = $anchor.find('canvas');
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
        initDifficulty: function (gaugedivname) {
//        AmCharts.ready(function () {
//            // create angular gauge
//            this._chart = new AmCharts.AmAngularGauge();
//            this._chart.addTitle("Speedometer");
//
//            // create this._chart
//            this._chart = new AmCharts.GaugeAxis();
//            this._axis.startValue = 0;
//            this._axis.endValue = 220;
//            // color bands
//            var band1 = new AmCharts.GaugeBand();
//            band1.startValue = 0;
//            band1.endValue = 90;
//            band1.color = "#00CC00";
//
//            var band2 = new AmCharts.GaugeBand();
//            band2.startValue = 90;
//            band2.endValue = 130;
//            band2.color = "#ffac29";
//
//            var band3 = new AmCharts.GaugeBand();
//            band3.startValue = 130;
//            band3.endValue = 220;
//            band3.color = "#ea3838";
//            band3.innerRadius = "95%";
//
//            this._axis.bands = [band1, band2, band3];
//
//            // bottom text
//            this._axis.bottomTextYOffset = -20;
//            this._axis.setBottomText("0 km/h");
//            this._chart.addAxis(this._axis);
//
//            // gauge this._arrow
//            this._arrow = new AmCharts.GaugeArrow();
//            this._chart.addArrow(this._arrow);
//            this._chart.write(gaugedivname);
//
//        });
//
        },
        showDifficulty: function(diff, gaugedivid) {
        }
    };
}
