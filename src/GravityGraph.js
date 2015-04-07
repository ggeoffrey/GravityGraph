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
            if (this.config.stats)
                this.enableStats();
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
            var rootContainerPosition = new THREE.Vector3(1000, 1000, 1000);
            this.rootObject3D.position.copy(rootContainerPosition).divideScalar(2).negate();
            this.scene.add(this.rootObject3D);
        };
        Graph.prototype.initD3 = function () {
            var _this = this;
            this.force = d3.layout.force3d();
            this.force.charge(-100).linkDistance(60).size([1000, 1000]).on('tick', function () {
                _this.d3Tick();
            });
            // TESTS   --------------------------------------------------------------------------
            this.nodes = [];
            this.links = [];
            this.clouds = [];
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
                        var cloud = new Cloud(link3D);
                        _this.clouds.push(cloud);
                        _this.rootObject3D.add(cloud);
                    });
                    _this.force.nodes(position).links(graph.links).start();
                }
            });
        };
        Graph.prototype.enableStats = function () {
            this.stats = new Stats();
            this.stats.setMode(0); // 0: fps, 1: ms
            // align top-left
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            document.body.appendChild(this.stats.domElement);
        };
        Graph.prototype.run = function () {
            var _this = this;
            if (!this.paused) {
                this.stats.begin();
                this.update();
                this.render();
                this.stats.end();
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
            this.animateClouds();
        };
        Graph.prototype.updateClouds = function () {
            var i = 0, len = this.clouds.length;
            while (i < len) {
                this.clouds[i].update();
                i++;
            }
        };
        Graph.prototype.animateClouds = function () {
            var i = 0, len = this.clouds.length;
            while (i < len) {
                this.clouds[i].animate();
                i++;
            }
        };
        Graph.prototype.d3Tick = function () {
            // every X ticks
            if (this.nbTick % 50 === 0) {
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].geometry.computeBoundingSphere(); // avoid disappearing
                    this.links[i].update();
                    i++;
                }
            }
            else {
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].update();
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
            if (!this.config.lights) {
                this.config.lights = 'basic';
            }
            if (this.config.lights === 'basic') {
                this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff));
            }
            else if (this.config.lights === 'advenced') {
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
            }
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
                    this.updateClouds();
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
        // UTILS
        Node3D.prototype.distanceTo = function (node) {
            return this.position.distanceTo(node.position);
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
            this.source = source;
            this.target = target;
            var geometry = new THREE.Geometry();
            geometry.vertices.push(source.position);
            geometry.vertices.push(target.position);
            _super.call(this, geometry, Link3D.defaultMaterial);
            this.changeDefaults();
        }
        Link3D.prototype.changeDefaults = function () {
            this.castShadow = true;
            this.position = this.source.position;
        };
        Link3D.prototype.setCloud = function (c) {
            this.cloud = c;
        };
        Link3D.prototype.getCloud = function () {
            return this.cloud;
        };
        Link3D.prototype.getLineLength = function () {
            return this.lineLength;
        };
        Link3D.prototype.getSource = function () {
            return this.source;
        };
        Link3D.prototype.getTarget = function () {
            return this.target;
        };
        Link3D.prototype.update = function () {
            this.lineLength = this.source.distanceTo(this.target);
            this.geometry.verticesNeedUpdate = true;
            var cloud = this.getCloud();
            if (cloud) {
                cloud.update();
            }
        };
        Link3D.defaultMaterial = new THREE.LineBasicMaterial({
            color: 0x909090
        });
        return Link3D;
    })(THREE.Line);
    var Cloud = (function (_super) {
        __extends(Cloud, _super);
        function Cloud(link) {
            this.support = link;
            this.velocity = 0.25;
            this.nbParticles = 10;
            var geometry = new THREE.Geometry();
            for (var i = 0; i < this.nbParticles; i++) {
                geometry.vertices.push(new THREE.Vector3(0, 0, 0 + i * 5));
            }
            _super.call(this, geometry, Cloud.defaultMaterial);
            this.support.setCloud(this);
        }
        Cloud.prototype.changeDefaults = function () {
        };
        Cloud.prototype.update = function () {
            this.position.copy(this.support.geometry.vertices[0]);
            this.lookAt(this.support.geometry.vertices[1]);
        };
        Cloud.prototype.animate = function () {
            var i = 0, len = this.geometry.vertices.length, vertice, previousVertice;
            var lineLength = this.support.getLineLength();
            while (i < len) {
                vertice = this.geometry.vertices[i];
                vertice.z += this.velocity;
                if (vertice.z > lineLength) {
                    vertice.z = 0;
                }
                if (previousVertice) {
                    if (vertice.z - previousVertice.z < lineLength / this.nbParticles) {
                        previousVertice.z += this.velocity;
                    }
                }
                previousVertice = vertice;
                i++;
            }
            this.geometry.verticesNeedUpdate = true;
        };
        Cloud.base64Particle = 'data:image/png;base64,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';
        Cloud.particleMap = THREE.ImageUtils.loadTexture(Cloud.base64Particle);
        Cloud.defaultMaterial = new THREE.PointCloudMaterial({
            color: 0xffffff,
            size: 10,
            map: Cloud.particleMap,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            //vertexColors: true,
            sizeAttenuation: true
        });
        return Cloud;
    })(THREE.PointCloud);
})(GravityGraph || (GravityGraph = {}));
//# sourceMappingURL=GravityGraph.js.map