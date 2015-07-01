/// <reference path="GlobalDefs.ts" />
/// <reference path="Utils.ts" />
/// <reference path="Config.ts" />
/// <reference path="Visualisation3D.ts" />
/// <reference path="D3Wrapper.ts" />
/// <reference path="Events.ts" />


module GravityGraph{
    
    "use strict";
    
    declare var Stats;
    declare var TWEEN ;
    
    export enum ERelation{
        INNER,
        OUTER,
        INNER_OUTER,
        SELF
    }
    
    var U = new Utils();
    
    export class Graph {
    
        private config: Config;
        
        private canvas:HTMLCanvasElement;
    
        private paused:boolean;
        
        
        // 3D
        
        private vis3D : Visualisation3D;
        
        // D3
        private force: D3Wrapper;
        
        // Stats
        
        private stats;
        
        
        // User functions
        
        private events : Events;
        
        
        
        // Data
        
        private nodes : Array<Node3D>;
        private links : Array<Link3D>;
        
        
        
    
        constructor(config:IConfig) {
            
            this.events = new Events();
    
            this.config = new Config(config);
            this.canvas = <HTMLCanvasElement> document.getElementById(this.config.target);
           
            this.paused = false;
     
            if(this.config.stats){
                this.addStats();
            }
   
        }       
        
        
        public initialize() : void {
            this.events.emit('info',['GravityGraph : Init'])
            
            
            if(!this.config.isWebGL()){
                this.events.emit('warn', ["Degraded mode ! (slower)"]);
                this.events.emit('warn', ["WebGL is disabled, your drivers, your DirectX version, or your browser are outdated."]);
                this.events.emit('warn', ["Please update your software.  (https://get.webgl.org/)"]);
            }
            
            
            this.force = new D3Wrapper(this.config);
            this.vis3D = new Visualisation3D(this.config, this.force);
            
            
            this.vis3D.on('info', (...args)=>{
                this.events.emit('info', args);
            });
            this.vis3D.on('warn', (...args)=>{
                this.events.emit('warn', args);
            });
            
            this.vis3D.on("nodeOvered", (...args)=>{
                this.events.emit("nodeOvered", args);
            });
            
            this.vis3D.on("nodeBlur", (...args)=>{
                this.events.emit("nodeBlur", args);
            });
            
            this.vis3D.on("nodeSelected", (...args)=>{
                this.events.emit("nodeSelected", args);
            });
            
            this.vis3D.on("dblclick", ()=>{
                if (!this.vis3D.isOverSomething()){
                    this.resetFocus();
                }
                else{
                    this.focusOnRelations();                
                }
            });
            
            this.vis3D.on("contextmenu", ()=>{
                //this.resetFocus();
            });
            
            if(this.config.isWebGL()){
                this.events.emit('info',["GG: Everything ok ! Starting main loop."]);                
            }
            else{
                this.events.emit('info',["GG: Starting main loop, running in compatibility mode"]);
            }
            this.run();
            
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
           
    
        public setNodes(nodes : Array<INodeData>, callback ? : (nodes : Array<Node3D>) => void ) : Array<Node3D> {
            
            this.events.emit('busy', []);
            var startTime = new Date().getTime();
            
                var clone = JSON.parse(JSON.stringify(nodes));
            
                this.force = new D3Wrapper(this.config);
                this.vis3D.setForce(this.force);
            
                this.nodes = this.vis3D.setNodes(clone);
            
            var endTime = new Date().getTime();
            this.events.emit('done', ["Nodes generation", (endTime-startTime)]);
            
            if(callback){
                callback(this.nodes);
            }
            
            return this.nodes;
        }
        
        public setLinks(links : Array<ILinkData>, callback ? : () => void){
            
            this.events.emit('busy', []);
            var startTime = new Date().getTime();            
            
                var clone = JSON.parse(JSON.stringify(links));
                clone = this.groupLinks(clone);
                this.links = this.vis3D.setLinks(clone);
            
            var endTime = new Date().getTime();
            this.events.emit('done', ["Links generation", (endTime-startTime)]);
            
            if(callback){
                callback();
            }
            
        }
        
        
        private groupLinks(links : Array<ILinkData>) : Array<ILinkData> {
            var grouped : Array<ILinkData> = [];
            var map : {[index : string] : ILinkData} = {};
            
            var key;
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                link.value = link.value || 0;
                
                key = link.source + ":" + link.target;
                
                if(!map[key]){
                    map[key] = link;
                }
                else{
                    map[key].value += link.value;
                }
            }
            
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    var element = map[key];
                    grouped.push(element);
                }
            }
            
            return grouped;
        }
        
        
        // main loop  
        
        private run( time? ):void {
            
            if(this.stats){
                this.stats.begin();
            }
                
            if (!this.paused) {
                this.update();
                //TWEEN.update(time);
                this.render();
                requestAnimationFrame(()=> {
                    this.run();
                });
            }
            
            if(this.stats){
                this.stats.end();
            }
            
        }
        
        
    
        private update():void {
            this.vis3D.update();            
        }
    
        private render():void {
            this.vis3D.render();
        }
        
        
        // controls
        
        
        public start(){
            this.vis3D.start();
        }
    
        public forceStart(){
            this.force.stop();
            this.force.start();
        }

        public pause():void {
            this.paused = true;
        }
    
        public resume():void {
            this.paused = false;
        }
        
        
        // setters
        
        
    
        public setCharge(charge : number){
            this.force.setCharge(charge);
        }
        
        public setDistance(distance : number){
            this.force.setDistance(distance);
        }
        
        

        public color(name : string) : string {
            return this.config.colorBuilder(name);
        }
        
        
     
    
        // UTILS
       
        
        
        
        
        private addStats(){
            
            var actualNode = document.getElementById('stats');
            if(actualNode){
                actualNode.remove();
                actualNode = undefined;
            }
            
            var stats = new Stats();
            
            stats.setMode(0);
            
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.right= 0;
            stats.domElement.style.bottom = 0;
            
            this.canvas.parentElement.appendChild(stats.domElement);
            
            this.stats = stats;            
        }
        
        
        
        
        
        // events
        
        
        
        public on (name : string, action : Function) : void {
            this.events.add(name, action);
        }
        
        
        
        
        
        //  --  Advenced methods  --
        
        
        
        public selectBy(idkey : string, value : any) : void {
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                if(node.getData()[idkey] === value){
                    this.vis3D.selectNode(node);
                    break;
                }
            }
        }
        
        public unSelect() : void {
            this.vis3D.unselectNode();
        }
        
    
        private resetFocus(){
            this.nodes.forEach((node) => {
                node.setFocused();
            });
            if(this.links){
                this.links.forEach((link) => {
                    if(!this.config.flow){
                        link.setFocused();
                    }
                    link.getText().setUnFocused();
                });
            }
        }
        
        public focusOnRelations(nodes ? : Array<Node3D>, type : ERelation = ERelation.SELF){
            var relations : IGraph = {
                nodes : [],
                links : []
            };
            
            var nodeOfGroup : Node3D;   // a node of the focused group for coparision with other nodes 
            
            if( type == ERelation.SELF && this.vis3D.getSelectedNode()){
                nodeOfGroup = this.vis3D.getSelectedNode();
                relations = this.getRelationsOf(this.vis3D.getSelectedNode());
            }
            else if (nodes){
                nodeOfGroup = nodes[0];
                nodes.forEach((node)=>{
                    var rel = this.getRelationsOf(node);
                    relations.nodes = relations.nodes.concat(rel.nodes);
                    relations.links = relations.links.concat(rel.links);
                });
            }
            
            
            
            if(relations.nodes){            
                
                this.nodes.forEach((node)=>{
                   if(relations.nodes.indexOf(node) != -1){
                       node.setFocused();
                   }
                   else{
                       node.setUnFocused();
                   }
                });
                this.links.forEach((link)=>{
                   if(relations.links.indexOf(link) != -1 ){  // if link is candidate
                       
                       
                       
                       
                       if(type == ERelation.SELF || type == ERelation.INNER_OUTER){
                           link.setFocused();
                           link.getText().setFocused();
                       }
                       else if(type == ERelation.OUTER && !link.getTarget().isSameGroupOf(link.getSource())){
                            link.setFocused();
                            link.getText().setFocused();    
                       }
                       else if(type == ERelation.INNER && link.getTarget().isSameGroupOf(link.getSource()) ){
                           link.setFocused();
                           link.getText().setFocused();
                       }
                       else{
                            link.setUnFocused();
                            link.getText().setUnFocused();
                       }
                       
                            
                   }
                   else{
                       link.setUnFocused();
                       link.getText().setUnFocused();
                   }
                });
            }
        }
        
        public focusOnGroupRelations(relationType : ERelation = ERelation.INNER){
            var nodes : Array<Node3D> = [];
            
            if(this.vis3D.getSelectedNode()){
                            
               this.nodes.forEach((node) => {
                   if(node.isSameGroupOf(this.vis3D.getSelectedNode())){
                       node.setFocused();
                       nodes.push(node);
                   }
                   else{
                       node.setUnFocused();
                   }
               });
               
               if(nodes){
                   this.focusOnRelations(nodes, relationType);
               }
            }
            
        }
        
        
        public separateGroups(separate : boolean = false){
            this.vis3D.separateGroups(separate);
            this.force.shake();
        }
        
        
        public shake(){
            this.vis3D.separateGroups(false);
            this.force.shakeHard();
        }
        
        
        // SEARCH / SORT
        
        private getRelationsOf(node:Node3D) : IGraph  {
            var name = this.getNameOrIndexOf(node);
            
            
            var relations : IGraph = {
                nodes : [],
                links : []
            };
            
            if(name !== undefined ){
                this.links.forEach((link) => {
                    
                    
                    var match = false;
                    
                    if(link.getData().source == name || link.getData().target == name){
                    
                        var node = this.nodes[link.getData().source];
                        if(relations.nodes.indexOf(node) == -1 && node){
                            relations.nodes.push(node);
                        }
                        node = this.nodes[link.getData().target];
                        if(relations.nodes.indexOf(node) == -1 && node){
                            relations.nodes.push(node);
                        }
                        
                        relations.links.push(link);
                        
                    }             
                    
                });
            }
            
            return relations;        
        }
        
        private getNameOrIndexOf(node:Node3D){
            
            var name;
            
            for (var i = 0; i < this.links.length; i++) {
                var link = this.links[i];
                
                var source = link.getData().source;
                var target = link.getData().target;
                
                if(this.nodes[source] && this.nodes[source].equals(node)){
                    name = source;
                    break;   
                }
                else if(this.nodes[target] && this.nodes[target].equals(node)){
                    name = target;
                    break;
                }
            }
            
            return name;
            
        }
        
        
    }




    
}
