/**
 * Created by Geoffrey on 04/04/2015.
 */
/// <reference path='headers/d3.d.ts' />
/// <reference path='headers/GravityGraphData.d.ts' />
importScripts("../vendors/d3.js");
var D3Worker = (function () {
    function D3Worker(worker) {
        var _this = this;
        this.worker = worker;
        this.worker.onmessage = function (event) {
            switch (event.data.message) {
                case "setNodes":
                    _this.nodes = event.data.content;
                    _this.force.nodes(_this.nodes);
                    _this.skipEnter();
                    break;
                case "setLinks":
                    _this.links = event.data.content;
                    _this.run();
                    break;
                default:
                    break;
            }
        };
        this.init();
        this.run();
        this.worker.postMessage({
            message: "log",
            type: "string",
            content: "D3 Worker ready"
        });
    }
    D3Worker.prototype.init = function () {
        var _this = this;
        this.force = d3.layout.force();
        this.force
            .charge(-100)
            .linkDistance(60)
            .size([100, 100])
            .on('tick', function () {
            _this.tick();
        });
    };
    D3Worker.prototype.run = function () {
        if (this.nodes != undefined) {
            this.force.start();
        }
    };
    D3Worker.prototype.skipEnter = function () {
        this.run();
        var i = 0;
        while (this.force.alpha() > 1e-2) {
            this.force.tick();
            i++;
        }
        this.force.stop();
    };
    D3Worker.prototype.tick = function () {
        this.worker.postMessage({
            message: "tick",
            type: "array",
            content: this.nodes
        });
    };
    return D3Worker;
})();
// START
(function (self) {
    new D3Worker(self);
})(self);
//# sourceMappingURL=worker.js.map