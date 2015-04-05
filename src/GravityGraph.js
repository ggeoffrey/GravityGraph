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
/// <reference path='headers/d3.d.ts' />
var GravityGraph;
(function (GravityGraph) {
    var Graph = (function () {
        function Graph(config) {
            this.nbTick = 0;
            this.config = config;
            console.info("GG : Init");
            this.init3D();
            this.paused = false;
            console.info("Starting main loop.");
            //this.drawAxis();
            this.initD3();
            this.bindEvents();
            this.run();
            /*this.D3Worker.postMessage({
             message : "setNodes",
             type: "array",
             content : positions
             });*/
        }
        /*
         private startD3Worker()  : void{

         this.D3Worker = new Worker('src/worker.js');


         this.D3Worker.onmessage = (event: MessageEvent)=>{
         if(event.data && event.data.message){
         switch (event.data.message){
         case "log":
         console.log("Worker:");
         console.log(event.data.content);
         break;
         case "tick":
         this.updateNodesPositions(event.data.content);
         break;
         default :
         console.log("Worker:");
         console.log(event.data);
         break;
         }
         }
         };

         this.D3Worker.onerror = (event: ErrorEvent)=>{
         console.error(event);
         };
         }*/
        /**
         * Initialise a 3D scene
         */
        Graph.prototype.init3D = function () {
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
                devicePixelRatio: window.devicePixelRatio
            });
            this.renderer.shadowMapEnabled = true;
            this.renderer.shadowMapType = THREE.PCFShadowMap;
            this.renderer.sortObjects = false;
            this.renderer.setClearColor(this.config.backgroundColor || 0x202020, this.config.opacity || 0);
            this.renderer.setSize(this.canvas.width, this.canvas.height);
            this.camera = new THREE.PerspectiveCamera(70, this.canvas.offsetWidth / this.canvas.offsetHeight, 1, 10000);
            this.camera.position.z = 900;
            var sphereBackgroundWidth = 50;
            var sphereBackgroundGeo = new THREE.SphereGeometry(sphereBackgroundWidth, sphereBackgroundWidth, sphereBackgroundWidth);
            var sphereBackgroundMat = new THREE.MeshLambertMaterial({
                color: 0xd0d0d0,
                ambient: 0xffffff,
                side: 1
            });
            this.sphereBackground = new THREE.Mesh(sphereBackgroundGeo, sphereBackgroundMat);
            this.sphereBackground.receiveShadow = true;
            this.sphereBackground.scale.set(50, 50, 50);
            this.scene = new THREE.Scene();
            this.scene.add(this.sphereBackground);
            this.addDefaultLights();
            this.controls = new THREE.OrbitControls(this.camera, this.canvas);
            this.controls.rotateSpeed = 1.0;
            this.controls.zoomSpeed = 1.2;
            this.controls.panSpeed = 0.8;
            this.controls.noZoom = false;
            this.controls.noPan = false;
            this.controls.staticMoving = true;
            this.controls.dynamicDampingFactor = 0.3;
            this.rootObject3D = new THREE.Object3D();
            var rootContainerPosition = new THREE.Vector3(5000, 5000, 0);
            this.rootObject3D.position.copy(rootContainerPosition).divideScalar(2).negate();
            this.scene.add(this.rootObject3D);
        };
        Graph.prototype.initD3 = function () {
            var _this = this;
            this.force = d3.layout.force();
            this.force.charge(-100).linkDistance(60).size([5000, 5000]).on('tick', function () {
                _this.d3Tick();
            });
            // TESTS   --------------------------------------------------------------------------
            this.nodes = [];
            this.links = [];
            d3.json("data-test/miserables.json", function (error, graph) {
                if (error) {
                    console.error(error);
                }
                else {
                    var position = [];
                    graph.nodes.forEach(function (node) {
                        var n = new Node3D(node);
                        _this.nodes.push(n);
                        _this.rootObject3D.add(n);
                        position.push(n.position);
                    });
                    graph.links.forEach(function (link) {
                        var source = _this.nodes[link.source];
                        var target = _this.nodes[link.target];
                        var link3D = new Link3D(source, target);
                        _this.links.push(link3D);
                        _this.rootObject3D.add(link3D);
                    });
                    _this.force.nodes(position).links(graph.links).start();
                }
            });
        };
        Graph.prototype.run = function () {
            var _this = this;
            if (!this.paused) {
                this.update();
                this.render();
                requestAnimationFrame(function () {
                    _this.run();
                });
            }
        };
        Graph.prototype.pause = function () {
            this.paused = true;
        };
        Graph.prototype.resume = function () {
            this.paused = false;
        };
        Graph.prototype.update = function () {
            this.controls.update();
        };
        Graph.prototype.d3Tick = function () {
            // every X ticks
            if (this.nbTick % 50 === 0) {
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].geometry.verticesNeedUpdate = true;
                    this.links[i].geometry.computeBoundingSphere(); // avoid disappearing
                    i++;
                }
            }
            else {
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].geometry.verticesNeedUpdate = true;
                    i++;
                }
            }
            this.nbTick++;
        };
        Graph.prototype.render = function () {
            this.renderer.render(this.scene, this.camera);
        };
        // D3
        /*
         private updateNodesPositions(positions : Array<INodeData>   ){

         var node_index = this.nodes.length-1;
         var positions_index = positions.length-1;

         while(node_index >= 0 && positions_index >= 0){
         var n = this.nodes[node_index];
         var pos = positions[positions_index];
         n.position.x = pos.x;
         n.position.y = pos.y;
         n.position.z = pos.z;

         node_index--;
         positions_index--;
         }

         }
         */
        // UTILS
        Graph.prototype.addDefaultLights = function () {
            var x, y, z;
            x = 3000;
            y = 3000;
            z = 3000;
            this.addLight(x, y, z);
            x = -x;
            this.addLight(x, y, z, true);
            y = -y;
            this.addLight(x, y, z);
            x = -x;
            this.addLight(x, y, z, false);
            /*
             z = -z;
             this.addLight(x, y, z, false);

             y = -y;
             addLight(x, y, z, false, '1 1 -1');

             x = -x;
             addLight(x, y, z, false, '-1 1 -1');
             */
            //this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff));
        };
        Graph.prototype.addLight = function (x, y, z, shadows, name) {
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
        Graph.prototype.drawAxis = function () {
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
        Graph.prototype.bindEvents = function () {
            var _this = this;
            window.addEventListener('resize', function (e) {
                _this.onWindowResize(e);
                ;
            }, false);
            this.renderer.domElement.addEventListener('mousemove', function (e) {
                _this.onDocumentMouseMove(e);
            }, false);
            this.renderer.domElement.addEventListener('mousedown', function (e) {
                _this.onDocumentMouseDown(e);
            }, false);
            this.renderer.domElement.addEventListener('mouseup', function (e) {
                _this.onDocumentMouseUp(e);
            }, false);
            this.raycaster = new THREE.Raycaster();
            this.projectionOffset = new THREE.Vector3(0, 0, 0);
            this.intersectPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000, 8, 8), new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true }));
            this.intersectPlane.visible = false;
            this.scene.add(this.intersectPlane);
        };
        Graph.prototype.onWindowResize = function (event) {
            var newWidth = this.renderer.domElement.clientWidth;
            var newHeight = this.renderer.domElement.height;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        };
        Graph.prototype.onDocumentMouseMove = function (event) {
            event.preventDefault();
            var boundingRect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - boundingRect.left) / this.canvas.offsetWidth) * 2 - 1;
            this.mouse.y = -((event.clientY - boundingRect.top) / this.canvas.offsetHeight) * 2 + 1;
            if (this.currentlySelectedObject) {
                var intersectPlane = this.getPlanIntersect();
                if (intersectPlane) {
                    intersectPlane.point.sub(this.rootObject3D.position);
                    this.currentlySelectedObject.position.copy(intersectPlane.point);
                }
                return;
            }
            var intersected = this.getTargetObject();
            if (intersected) {
                if (this.currentlyIntersectedObject != intersected.object) {
                    this.currentlyIntersectedObject = intersected.object;
                    this.intersectPlane.position.copy(this.currentlyIntersectedObject.position);
                    this.intersectPlane.position.add(this.rootObject3D.position);
                    this.intersectPlane.lookAt(this.camera.position);
                }
                this.canvas.style.cursor = 'pointer';
            }
            else {
                this.currentlyIntersectedObject = null;
                this.canvas.style.cursor = 'auto';
            }
        };
        Graph.prototype.onDocumentMouseDown = function (event) {
            event.preventDefault();
            var target = this.getTargetObject();
            if (target) {
                this.controls.enabled = false;
                this.currentlySelectedObject = target.object;
                this.getPlanIntersect();
                this.canvas.style.cursor = 'move';
                this.force.resume();
            }
        };
        Graph.prototype.onDocumentMouseUp = function (event) {
            event.preventDefault();
            this.controls.enabled = true;
            if (this.currentlySelectedObject) {
                /*
                this.intersectPlane.position

                    .copy( this.currentlyIntersectedObject.position )
                    .add(this.rootObject3D.position);
                */
                this.currentlySelectedObject = null;
                this.force.resume();
            }
            this.canvas.style.cursor = 'auto';
        };
        Graph.prototype.getPlanIntersect = function () {
            var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
            vector.unproject(this.camera);
            this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
            var intersects = this.raycaster.intersectObjects([this.intersectPlane]);
            if (intersects.length > 0) {
                this.projectionOffset.copy(intersects[0].point).sub(this.intersectPlane.position).add(this.rootObject3D.position);
                return intersects[0];
            }
            return null;
        };
        Graph.prototype.getTargetObject = function () {
            var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
            vector.unproject(this.camera);
            this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
            var intersects = this.raycaster.intersectObjects(this.nodes);
            if (intersects.length > 0) {
                return intersects[0];
            }
            return null;
        };
        return Graph;
    })();
    GravityGraph.Graph = Graph;
    var Node3D = (function (_super) {
        __extends(Node3D, _super);
        function Node3D(data) {
            /*var material = */
            var color = Node3D.nodesColor(data.group);
            var material;
            if (Node3D.materialsMap[color]) {
                material = Node3D.materialsMap[color];
            }
            else {
                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: false,
                    opacity: 0.75,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;
            }
            _super.call(this, Node3D.geometry, material);
            this.data = data;
            this.changeDefaults();
        }
        Node3D.prototype.changeDefaults = function () {
            this.castShadow = true;
            //this.receiveShadow = true;
            //this.scale.x = 5;
            //this.scale.y = 5;
            //this.scale.z = 5;
            //this.update();
        };
        // COLOR
        Node3D.setColorMethod = function (colorScale) {
            Node3D.nodesColor = colorScale;
        };
        Node3D.prototype.getColor = function () {
            var material = this.material;
            return material.color;
        };
        Node3D.prototype.setColor = function (color) {
            //if(color <= 0xffffff && color >= 0x000000){
            var material = this.material;
            material.color.set(color);
            //}
        };
        // DATA
        Node3D.prototype.getData = function () {
            return this.data;
        };
        // REFRESH
        Node3D.prototype.update = function () {
            this.setColor(Node3D.nodesColor(this.data.group));
            this.material.needsUpdate = true;
        };
        Node3D.nodesColor = d3.scale.category10();
        Node3D.geometry = new THREE.SphereGeometry(10, 10, 10);
        Node3D.defaultMaterial = new THREE.MeshLambertMaterial({
            color: 0x0000ff,
            transparent: false,
            opacity: 0.75,
            wireframe: false
        });
        Node3D.materialsMap = {};
        return Node3D;
    })(THREE.Mesh);
    var Link3D = (function (_super) {
        __extends(Link3D, _super);
        function Link3D(source, target) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(source.position);
            geometry.vertices.push(target.position);
            geometry.vertices.push(source.position);
            geometry.vertices.push(target.position);
            _super.call(this, geometry, Link3D.defaultMaterial);
            this.changeDefaults();
        }
        Link3D.prototype.changeDefaults = function () {
            this.receiveShadow = true;
        };
        Link3D.defaultMaterial = new THREE.LineBasicMaterial({
            color: 0x909090
        });
        return Link3D;
    })(THREE.Line);
})(GravityGraph || (GravityGraph = {}));
//# sourceMappingURL=GravityGraph.js.map