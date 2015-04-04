/**
 * Created by Geoffrey on 04/04/2015.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path='headers/GravityGraphData.d.ts' />
/// <reference path='headers/three.d.ts' />
/// <reference path='headers/three-orbitcontrols.d.ts' />
/// <reference path='headers/three-projector.d.ts' />
var GravityGraph = (function () {
    function GravityGraph(config) {
        this.startD3Worker();
        this.canvas = document.getElementById(config.target);
        this.init();
    }
    GravityGraph.prototype.startD3Worker = function () {
        this.D3Worker = new Worker('src/d3_worker.js');
        this.D3Worker.onmessage = function (event) {
            if (event.data && event.data.message === "log") {
                console.log("Worker:");
                console.log(event.data.content);
            }
            else {
                console.log(event.data);
            }
        };
        this.D3Worker.onerror = function (event) {
            console.error(event);
        };
    };
    /**
     * Initialise a 3D scene
     */
    GravityGraph.prototype.init = function () {
    };
    GravityGraph.prototype.run = function () {
    };
    return GravityGraph;
})();
var Node3D = (function (_super) {
    __extends(Node3D, _super);
    function Node3D(data) {
        // TODO
        _super.call(this);
    }
    return Node3D;
})(THREE.Mesh);
var Link3D = (function (_super) {
    __extends(Link3D, _super);
    function Link3D(data) {
        // TODO
        _super.call(this);
    }
    return Link3D;
})(THREE.Line);
//# sourceMappingURL=GravityGraph.js.map