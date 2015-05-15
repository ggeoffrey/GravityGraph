/**
 * Created by Geoffrey on 04/04/2015.
 */

/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/three-orbitcontrols.d.ts' />
/// <reference path='headers/three-projector.d.ts' />

/// <reference path='headers/d3.d.ts' />

/// <reference path='Utils.ts' />


module GravityGraph {


    var U : GravityGraphTools.Utils = new GravityGraphTools.Utils();

    export class Graph {

        private config: GravityGraphTools.Options;


        private paused:boolean;
        private canvas:HTMLCanvasElement;

        private mouse:IMouse;
        private scene:THREE.Scene;
        private renderer:THREE.WebGLRenderer;
        private camera:THREE.Camera;

        private controls:THREE.OrbitControls;

        private sphereBackground:THREE.Mesh;

        private lights:Array<THREE.Light>;
        private rootObject3D:THREE.Object3D;

        private nodes:Array<Node3D>;
        private links:Array<Link3D>;

        private clouds: Array<Cloud>;


        // D3
        private force:D3.Layout.ForceLayout;

        constructor(config:IOptions) {

            this.config = new GravityGraphTools.Options(config);

            console.info("GG : Init");
            this.init3D();

            this.paused = false;

            console.info("Starting main loop.");

            //this.drawAxis();

            this.initD3();
            
            this.stretchToParent();

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
        private init3D():void {

            this.canvas = <HTMLCanvasElement> document.getElementById(this.config.target);
            this.mouse = {
                x: 0,
                y: 0
            };

            this.lights = new Array();


            var transparentRenderer = this.config.isTransparent();
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: transparentRenderer,
                devicePixelRatio: window.devicePixelRatio
            });

            if(!transparentRenderer){
                this.config.opacity = 1;
            }

            this.renderer.shadowMapEnabled = true;
            this.renderer.shadowMapType = THREE.PCFShadowMap;
            this.renderer.sortObjects = false;


            this.renderer.setClearColor(
                this.config.backgroundColor,
                this.config.opacity
            );

            this.renderer.setSize(
                this.canvas.width,
                this.canvas.height
            );


            this.scene = new THREE.Scene();

            if(this.config.quality == EQuality.HIGH){
               this.sphereBackground = this.addBackground();
            }

            this.addCamera();

            this.addLights();

            this.addControls();

            this.addRoot();

        }
       



        private addCamera(){

           this.camera = new THREE.PerspectiveCamera(
                70,
                this.canvas.offsetWidth / this.canvas.offsetHeight,
                1,
                10000
           );

           this.camera.position.z = 400;

        }

        private addRoot(){


            var z =  (this.config.isFlat() ? 0 : 1000);

            var rootContainerPosition = new THREE.Vector3(1000, 1000, z);

            this.rootObject3D = new THREE.Object3D();
            this.rootObject3D.position.copy(rootContainerPosition).divideScalar(2).negate();

            this.scene.add(this.rootObject3D);
        }
        
        
        private stretchToParent(){
            var parent = this.canvas.parentElement;
            
            this.canvas.width = parent.offsetWidth;
            this.canvas.height = parent.offsetHeight;
            
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
            
            (<any>this.camera).aspect = window.innerWidth / window.innerHeight;
            (<any>this.camera).updateProjectionMatrix();

            this.renderer.setSize( window.innerWidth, window.innerHeight );
               
        }       
        

        private initD3() {

            if(this.config.isFlat()){
                this.force = d3.layout.force();
            }
            else{
                this.force = (<any> d3.layout).force3d();
            }
            this.force
                .charge(-100)
                .linkDistance(60)
                .size([1000, 1000])
                .on('tick', ()=> {
                    this.d3Tick();
                })
                //.on('end', ()=>{  this.d3IsWorking = false;  })
                ;


            // TESTS   --------------------------------------------------------------------------

            this.nodes = [];
            this.links = [];
            this.clouds = [];

            d3.json("data-test/miserables.json", (error, graph) => {
                if (error) {
                    console.error(error);
                }
                else {

                    var position = [];
                    graph.nodes.forEach((node)=> {
                        var n = new Node3D(node, this.config);
                        this.nodes.push(n);
                        this.rootObject3D.add(n);
                        position.push(n.position);
                    });

                    graph.links.forEach((link)=> {
                        var source = this.nodes[link.source];
                        var target = this.nodes[link.target];

                        var link3D = new Link3D(source, target);
                        this.links.push(link3D);
                        this.rootObject3D.add(link3D);

                        var cloud = new Cloud(link3D);
                        this.clouds.push(cloud);
                        this.rootObject3D.add(cloud);


                    });

                    this.force
                        .nodes(position)
                        .links(graph.links)
                        .start();
                        
                    var k = 0;
                    while ((this.force.alpha() > 1e-2) && (k < 150)) {
                        this.force.tick(),
                        k = k + 1;
                    }
                    this.d3IsWorking = false;
                }
            });
        }

        private run():void {
            if (!this.paused) {
                this.update();
                this.render();
                requestAnimationFrame(()=> {
                    this.run();
                });
            }
        }

        public pause():void {
            this.paused = true;
        }

        public resume():void {
            this.paused = false;
        }


        private update():void {
            this.controls.update();
            this.updateClouds();
            
        }

        private updateClouds(){
            var i = 0, len = this.clouds.length;
            while (i < len) {
                //debugger;
                if(!this.d3IsWorking){
                    this.clouds[i].start();
                    this.clouds[i].update();
                }
                else{
                    this.clouds[i].stop();
                }
                
                this.clouds[i].animate();
                
                i++;
            }
        }

        


        private d3IsWorking : boolean = false;

        private nbTick : number = 0;
        private d3Tick() {

            this.d3IsWorking = true;

            // every X ticks
            if(this.nbTick % 50 === 0){
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].geometry.computeBoundingSphere(); // avoid disappearing
                    this.links[i].update();
                    i++;
                }
            }
            else{  // every tick
                var i = 0, len = this.links.length;
                while (i < len) {
                    this.links[i].update();
                    i++;
                }

            }
            this.nbTick++;
            
            
            // on stabilisation
            if(this.force.alpha() <= 1e-2){
                this.d3IsWorking = false;
            }
            
        }


        private render():void {
            this.renderer.render(this.scene, this.camera);
        }


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

        private addLights():void {
            var x, y, z;

            x = 3000;
            y = 3000;
            z = 3000;
            
            if(this.config.quality != EQuality.HIGH){
                this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff));                
            }
            else{                
                this.addLight(x, y, z );
    
                x = -x;
                this.addLight(x, y, z , true );
    
                y = -y;
                this.addLight(x, y, z);
    
                x = -x;
                //this.addLight(x, y, z, false);
                
                z = -z;
                this.addLight(x, y, z, false);
    
                y = -y;
                this.addLight(x, y, z, false);
    
                x = -x;
                this.addLight(x, y, z, false);
            }



        }

        private addLight(x:number, y:number, z:number, shadows = false) {

            var light:THREE.SpotLight = new THREE.SpotLight(0xffffff, 0.6);

            light.position.set(x, y, z);
            light.castShadow = shadows;

            light.shadowCameraNear = 200;
            if(!this.config.isFlat()){
                var camera = <THREE.PerspectiveCamera> this.camera;
                light.shadowCameraFar = camera.far;
            }
            light.shadowCameraFov = 50;

            light.shadowBias = -0.00022;
            light.shadowDarkness = 0.5;

            light.shadowMapWidth = 2048;
            light.shadowMapHeight = 2048;

            this.lights.push(light);
            this.scene.add(light);
        }

        public addBackground(): THREE.Mesh {


            var sphereBackgroundWidth = 20;
            var sphereBackgroundGeo = new THREE.SphereGeometry(sphereBackgroundWidth, sphereBackgroundWidth, sphereBackgroundWidth);
            var sphereBackgroundMat = new THREE.MeshBasicMaterial({
                color: 0xa0a0a0,//0x404040,
                ambient: 0xffffff,
                side: 1,
                transparent: this.config.isTransparent(),
                opacity : this.config.opacity
            });
            var sphereBackground = new THREE.Mesh(sphereBackgroundGeo, sphereBackgroundMat);

            sphereBackground.receiveShadow = true;
            sphereBackground.scale.set(200, 200, 200);

            this.scene.add(sphereBackground);
            return sphereBackground;
        }

        private addControls(){
            this.controls = new THREE.OrbitControls(this.camera, this.canvas);
            this.controls.rotateSpeed = 1.0;
            this.controls.zoomSpeed = 1.2;
            (<any> this.controls).panSpeed = 0.8;
            this.controls.noZoom = false;
            this.controls.noPan = this.config.isFlat();
            ( <any> this.controls).staticMoving = true;
            ( <any> this.controls).dynamicDampingFactor = 0.3;
        }

        private drawAxis():void {

            var xMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
            var xGeometry = new THREE.Geometry();
            xGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            xGeometry.vertices.push(new THREE.Vector3(10000, 0, 0));

            var xAxis = new THREE.Line(xGeometry, xMaterial);


            var yMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
            var yGeometry = new THREE.Geometry();
            yGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            yGeometry.vertices.push(new THREE.Vector3(0, 10000, 0));

            var yAxis = new THREE.Line(yGeometry, yMaterial);


            var zMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
            var zGeometry = new THREE.Geometry();
            zGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            zGeometry.vertices.push(new THREE.Vector3(0, 0, 10000));

            var zAxis = new THREE.Line(zGeometry, zMaterial);


            this.scene.add(xAxis);
            this.scene.add(yAxis);
            this.scene.add(zAxis);
        }



        // EVENTS

        private raycaster : THREE.Raycaster;

        private projectionOffset : THREE.Vector3;

        private intersectPlane : THREE.Mesh;
        private currentlySelectedObject : Node3D;
        private currentlyIntersectedObject : Node3D;

        private bindEvents(){

            window.addEventListener( 'resize', (e : Event) => {
                this.onWindowResize(e);;
            }, false );

            this.renderer.domElement.addEventListener( 'mousemove', (e:MouseEvent)=>{
                this.onDocumentMouseMove(e);
            }, false );
            this.renderer.domElement.addEventListener( 'mousedown', (e:MouseEvent)=>{
                this.onDocumentMouseDown(e);
            }, false );
            this.renderer.domElement.addEventListener( 'mouseup', (e:MouseEvent)=>{
                this.onDocumentMouseUp(e);
            }, false );


            this.raycaster = new THREE.Raycaster();
            this.projectionOffset = new THREE.Vector3(0,0,0);


            this.intersectPlane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
                new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true } )
            );
            this.intersectPlane.visible = false;
            this.scene.add( this.intersectPlane );



        }

        private onWindowResize(event : Event){

            var newWidth = this.renderer.domElement.parentElement.offsetWidth;
            var newHeight = this.renderer.domElement.parentElement.offsetHeight;
            
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            this.canvas.style.width = newWidth + "px";
            this.canvas.style.height = newHeight + "px";

            if(!this.config.isFlat()){
                var camera = <THREE.PerspectiveCamera> this.camera;
                camera.aspect = newWidth/ newHeight;
                camera.updateProjectionMatrix();
            }


            this.renderer.setSize( newWidth, newHeight);
        }

        private onDocumentMouseMove(event : MouseEvent){

            event.preventDefault();

            var boundingRect : ClientRect = this.canvas.getBoundingClientRect();

            this.mouse.x = ( (event.clientX - boundingRect.left)  / this.canvas.offsetWidth ) * 2 - 1;
            this.mouse.y = - ( (event.clientY - boundingRect.top) / this.canvas.offsetHeight ) * 2 + 1;



            if ( this.currentlySelectedObject ) {

                var intersectPlane = this.getPlanIntersect();
                if(intersectPlane){
                    intersectPlane.point.sub(this.rootObject3D.position);
                    this.currentlySelectedObject.position.copy(intersectPlane.point);
                    if(this.config.isFlat()){
                        this.currentlyIntersectedObject.position.z = 0;
                    }
                    this.updateClouds();
                }
                return;
            }

            var intersected = this.getTargetObject();

            if ( intersected ) {

                if ( this.currentlyIntersectedObject != intersected.object ) {


                    this.currentlyIntersectedObject = <Node3D> intersected.object;

                    this.intersectPlane.position.copy( this.currentlyIntersectedObject.position  );
                    this.intersectPlane.position.add(this.rootObject3D.position);
                    this.intersectPlane.lookAt( this.camera.position );

                }

                this.canvas.style.cursor = 'pointer';

            } else {


                this.currentlyIntersectedObject = null;

                this.canvas.style.cursor = 'auto';

            }
        }

        private onDocumentMouseDown(event : MouseEvent){

            event.preventDefault();


            var target = this.getTargetObject();

            if ( target ) {

                this.controls.enabled = false;
                this.currentlySelectedObject =  target.object;
                this.getPlanIntersect();

                this.canvas.style.cursor = 'move';

                this.force.resume();

            }
        }

        private onDocumentMouseUp(event : MouseEvent){
            event.preventDefault();

            this.controls.enabled = true;

            if ( this.currentlySelectedObject) {
                /*
                this.intersectPlane.position

                    .copy( this.currentlyIntersectedObject.position )
                    .add(this.rootObject3D.position);
                */
                this.currentlySelectedObject = null;

                this.force.resume();
            }

            this.canvas.style.cursor = 'auto';


        }

        private getPlanIntersect(): any {


            var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);

            vector.unproject(this.camera);

            this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

            var intersects = this.raycaster.intersectObjects([this.intersectPlane]);

            if (intersects.length > 0) {
                this.projectionOffset
                    .copy(intersects[0].point)
                    .sub(this.intersectPlane.position)
                    .add(this.rootObject3D.position);
                return intersects[0];
            }
            return null;
        }

        private getTargetObject(): any {
            var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);

            vector.unproject(this.camera);

            this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

            var intersects = this.raycaster.intersectObjects(this.nodes);
            if (intersects.length>0) {
                return intersects[0];
            }
            return null;
        }
    }


    class Node3D extends THREE.Mesh {

        private static nodesColor = d3.scale.category10();

        private static geometry : THREE.SphereGeometry = new THREE.SphereGeometry(10, 10, 10);

        private data : INodeData;

        private static materialsMap : { [color : number] : THREE.Material } = {};
        

        constructor(data:INodeData, config : GravityGraphTools.Options) {

            /*
                var material = ?
                var geometry = ?
            */

            var color = Node3D.nodesColor(data.group);
            var material;
            if (Node3D.materialsMap[color]) {
                material = Node3D.materialsMap[color];
            }
            else if(config.quality == EQuality.HIGH) {

                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: false,
                    opacity: 0.75,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;

            }
            else if(config.quality == EQuality.MEDIUM){

                material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: false,
                    opacity: 0.75,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;

            }


            super(Node3D.geometry, material);

            this.data = data;
            this.changeDefaults();
        }

        private changeDefaults() {

            this.castShadow = true;
            //this.receiveShadow = true;

            //this.scale.x = 5;
            //this.scale.y = 5;
            //this.scale.z = 5;

            //this.update();

        }

        // COLOR
        public static setColorMethod(colorScale:D3.Scale.OrdinalScale) {
            Node3D.nodesColor = colorScale;
        }

        public getColor():THREE.Color {
            var material = <THREE.MeshLambertMaterial> this.material;
            return material.color;
        }

        public setColor(color:number):void {
            //if(color <= 0xffffff && color >= 0x000000){
            var material = <THREE.MeshLambertMaterial> this.material;
            material.color.set(color);
            //}
        }



        // DATA

        public getData():INodeData {
            return this.data;
        }

        // REFRESH
        public update() {
            this.setColor(Node3D.nodesColor(this.data.group));
            this.material.needsUpdate = true;
        }


        // UTILS

        public distanceTo(node : Node3D) : number {
            return this.position.distanceTo(node.position);
        }

    }

    class Link3D extends THREE.Line {

        private static defaultMaterial:THREE.LineBasicMaterial = new THREE.LineBasicMaterial({
            color : 0x909090
        });


        private source : Node3D;
        private target : Node3D;

        private cloud : Cloud;

        private lineLength: number;

        constructor(source:Node3D, target:Node3D) {

            this.source = source;
            this.target = target;

            var geometry = new THREE.Geometry();
            geometry.vertices.push(source.position);
            geometry.vertices.push(target.position);

            super(geometry, Link3D.defaultMaterial);


            this.changeDefaults();
        }

        private changeDefaults() {
            this.castShadow = true;
            this.position = this.source.position;
        }

        public setCloud(c : Cloud){
            this.cloud = c;
        }

        public getCloud(){  return this.cloud; }

        public getLineLength(){return this.lineLength; }

        public getSource(){ return this.source; }
        public getTarget(){ return this.target; }


        public update(){
            this.lineLength = this.source.distanceTo(this.target);
            this.geometry.verticesNeedUpdate = true;
            this.getCloud().update();
        }





    }

    class Cloud extends THREE.PointCloud{


        private static  imgMap : string = 'assets/img/light.png';
        
        
        private static particleMap = THREE.ImageUtils.loadTexture(Cloud.imgMap);

        private static defaultMaterial = new THREE.PointCloudMaterial({
            color: 0xffffff, // blue
            size: 10,
            map: Cloud.particleMap,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            //vertexColors: true,
            sizeAttenuation: true
        });
        
        private static baseVelocity = 0.25;


        private support : Link3D;

        private velocity : number;

        private nbParticles: number;

        constructor(link : Link3D){

            this.support = link;
            this.velocity = 0;

            this.nbParticles = 10;

            var geometry = new THREE.Geometry();

            for(var i = 0 ; i < this.nbParticles; i++){
                geometry.vertices.push(new THREE.Vector3(0, 0, 0 /*+ i * 5*/));
            }
            super(geometry, Cloud.defaultMaterial);
            
           

            this.support.setCloud(this);
        }
        

        private changeDefaults(){

        }

        public update(){
            this.position.copy(this.support.geometry.vertices[0]);
            this.lookAt(this.support.geometry.vertices[1]);
        }


        public start() : void {
            if(this.velocity < Cloud.baseVelocity){
                this.velocity += 0.005;
            }
        }

        public stop() : void {
            if(this.velocity > 0){
                this.velocity -= 0.0035;            
            }
        }

        public animate(){
            
            if(this.velocity > 0){
                
                var i = 0, len = this.geometry.vertices.length, vertice, previousVertice;
    
                var lineLength = this.support.getLineLength();
    
                while(i<len){
                    vertice = this.geometry.vertices[i]
                    vertice.z += this.velocity;
                    if(vertice.z > lineLength){
                        vertice.z = 0;
                    }
                    if(previousVertice){
                        if(vertice.z-previousVertice.z < lineLength / this.nbParticles ) {
                            vertice.z+= this.velocity;
                        }
                    }
                    previousVertice = vertice;
    
                    i++;
                }
    
                this.geometry.verticesNeedUpdate = true;
                
            }
        }
    }

}
