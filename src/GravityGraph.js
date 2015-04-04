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
        this.config = config;
        this.startD3Worker();
        console.info("GG : Init");
        this.init();
        this.paused = false;
        console.info("Starting main loop.");
        this.run();
        this.drawAxis();
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
        this.canvas = document.getElementById(this.config.target);
        this.mouse = {
            x: 0,
            y: 0
        };
        this.lights = new Array();
        var transparentRenderer = (this.config.opacity && this.config.opacity < 0);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: transparentRenderer,
            shadowMapEnabled: true,
            shadowMapType: THREE.PCFShadowMap
        });
        this.renderer.setClearColor(this.config.backgroundColor || 0x202020, this.config.opacity || 0);
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.offsetWidth / this.canvas.offsetHeight, 1, 10000);
        this.camera.position.z = 900;
        var sphereBackgroundWidth = 10;
        var sphereBackgroundGeo = new THREE.SphereGeometry(sphereBackgroundWidth, sphereBackgroundWidth, sphereBackgroundWidth);
        var sphereBackgroundMat = new THREE.MeshLambertMaterial({
            color: 0xd0d0d0,
            ambient: 0xffffff,
            side: 1
        });
        this.sphereBackground = new THREE.Mesh(sphereBackgroundGeo, sphereBackgroundMat);
        this.sphereBackground.receiveShadow = true;
        this.sphereBackground.scale.set(260, 260, 260);
        this.scene = new THREE.Scene();
        this.scene.add(this.sphereBackground);
        this.addDefaultLights();
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        //this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        //this.controls.staticMoving = true;
        //this.controls.dynamicDampingFactor = 0.3;
        this.rootObject3D = new THREE.Object3D();
        this.scene.add(this.rootObject3D);
    };
    GravityGraph.prototype.run = function () {
        var _this = this;
        if (!this.paused) {
            this.update();
            this.render();
            requestAnimationFrame(function () {
                _this.run();
            });
        }
    };
    GravityGraph.prototype.pause = function () {
        this.paused = true;
    };
    GravityGraph.prototype.resume = function () {
        this.paused = false;
    };
    GravityGraph.prototype.update = function () {
        this.controls.update();
    };
    GravityGraph.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
    };
    // UTILS
    GravityGraph.prototype.addDefaultLights = function () {
        var x, y, z;
        x = 3000;
        y = 3000;
        z = 3000;
        this.addLight(x, y, z, true);
        x = -x;
        this.addLight(x, y, z, true);
        y = -y;
        this.addLight(x, y, z);
        /*
         x = -x;
         addLight(x, y, z, false, '1 -1 1');

         z = -z;
         addLight(x, y, z, false, '1 -1 -1');

         y = -y;
         addLight(x, y, z, false, '1 1 -1');

         x = -x;
         addLight(x, y, z, false, '-1 1 -1');
         */
    };
    GravityGraph.prototype.addLight = function (x, y, z, shadows, name) {
        if (shadows === void 0) { shadows = false; }
        var light = new THREE.SpotLight(0xffffff, 0.6);
        light.name = name;
        light.position.set(x, y, z);
        light.castShadow = shadows;
        light.shadowCameraNear = 200;
        light.shadowCameraFar = this.camera.far;
        light.shadowCameraFov = 50;
        light.shadowBias = -0.00022;
        light.shadowDarkness = 0.5;
        light.shadowMapWidth = 2048;
        light.shadowMapHeight = 2048;
        this.lights.push(light);
        this.scene.add(light);
    };
    GravityGraph.prototype.drawAxis = function () {
        var xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        var xGeometry = new THREE.Geometry();
        xGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        xGeometry.vertices.push(new THREE.Vector3(10000, 0, 0));
        var xAxis = new THREE.Line(xGeometry, xMaterial);
        var yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        var yGeometry = new THREE.Geometry();
        yGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        yGeometry.vertices.push(new THREE.Vector3(0, 10000, 0));
        var yAxis = new THREE.Line(yGeometry, yMaterial);
        var zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        var zGeometry = new THREE.Geometry();
        zGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        zGeometry.vertices.push(new THREE.Vector3(0, 0, 10000));
        var zAxis = new THREE.Line(zGeometry, zMaterial);
        this.scene.add(xAxis);
        this.scene.add(yAxis);
        this.scene.add(zAxis);
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