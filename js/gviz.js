/**
 * Created by paul on 2/3/14.
 */

function GoogleVisualizations () {
    var q = $({});
    var gvizinited = false;
    var vizs = [];
    var debug = function (msg) {
        console.log('At '+msg+', Queue has '+ q.queue().length+' items\nQ='+ q.queue());
    };

    function DiffGauge () {
        var gvgauge;
//        var diff = 1.001;
        var data;
        var initialized = false;

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
        var drawgauge = function (diff) {

            // Update and draw the visualization.
            try {
                data.setValue(0, 1, diff);
                gvgauge.draw(data, options);
            } catch (e) {
                alert('gauge error: '+ e);
            }

        };

        return {
            "initialize": function (targetid) {
                debug('init');
                q.queue(function (next) {
                    debug('init 2');
                    if (!initialized) {
                        gvgauge = new google.visualization.Gauge(document.getElementById(targetid));
                        data = google.visualization.arrayToDataTable([
                            ['Label', 'Value'],
                            ['', 1.0]
                        ]);
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.error("Invalid data to gauge="+data);
                    return;
                }
                debug('draw 1');
                this.initialize(targetid);
                q.queue(function (next) {
                    debug('draw 2');
                    drawgauge(data);
                    next();
                });
            },
            "validateinput": function (value) {
                if (typeof value === "string") {
                    var diff = parseFloat(value);
                    if (diff >= 1 && diff <= 5) {
                        return true;
                    }
                } else if (typeof value === "number") {
                    if (value >= 1 && value <= 5) {
                        return true;
                    }
                }
                return false;
            },
            "reinit": function () {
                initialized = false;
            }
        };

    }


    q.queue(function (next) {
        google.load("visualization", "1", {"packages": ["gauge"], "callback": function() {
            var dg =  new DiffGauge();
            vizs.gauge = dg;
            next();
        }});
    });

    return {
        updategauge: function (value, targetid) {
            debug('ug 1');
            q.queue(function(next) {
                debug('ug 2');
                vizs.gauge.draw(value, targetid);
            });
            debug('ug 3');
            q.dequeue();
        },
        gaugereinit: function () {
            q.queue(function (n) {
                if (vizs && vizs.gauge) {
                    vizs.gauge.reinit();
                }
                n();
            });
            return this;
        }
    };

}