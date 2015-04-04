/**
 * Created by Geoffrey on 04/04/2015.
 */
/// <reference path='headers/d3.d.ts' />
/// <reference path='headers/GravityGraphData.d.ts' />
var D3Worker = (function () {
    function D3Worker(worker) {
        this.worker = worker;
        this.worker.postMessage({
            message: "log",
            type: "string",
            content: "D3 Worker ready"
        });
    }
    D3Worker.prototype.run = function () {
    };
    return D3Worker;
})();
// START
(function (self) {
    importScripts("../vendors/d3.js");
    new D3Worker(self);
})(self);
//# sourceMappingURL=d3_worker.js.map