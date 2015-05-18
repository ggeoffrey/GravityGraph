/**
* Created by Geoffrey on 04/04/2015.
*/

/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/d3.d.ts' />

/// <reference path='Utils.ts' />
/// <reference path="Visualisation3D.ts" />
/// <reference path="D3Wrapper.ts" />

/// <reference path='Events.ts' />

declare var Stats;
declare var TWEEN ;

var U = new Utils();

class GravityGraph {

    private config: Options;
    
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
    
    
    

    constructor(config:IOptions) {

        this.config = new Options(config);
        this.canvas = <HTMLCanvasElement> document.getElementById(this.config.target);
        this.events = new Events();
        

        console.info("GG : Init");
        
        this.force = new D3Wrapper(this.config);
        this.vis3D = new Visualisation3D(this.config, this.force);

        this.paused = false;

        console.info("Starting main loop.");


        this.initD3();
        
        if(this.config.stats){
            this.addStats();
        }
        
        // bind events
        
        
        this.vis3D.on("nodeOvered", (...args)=>{
            this.events.emit("nodeOvered", args);
        });
        
        this.vis3D.on("nodeBlur", (...args)=>{
            this.events.emit("nodeBlur", args);
        });
        
        this.vis3D.on("nodeSelected", (...args)=>{
            this.events.emit("nodeSelected", args);
        });
        
        
        // ----------------
        

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
       

    
      
    

    private initD3() {

       

        // TESTS   --------------------------------------------------------------------------

        this.nodes = [];
        this.links = [];
        

        d3.json("data-test/miserables.json", (error, graph) => {
            if (error) {
                console.error(error);
            }
            else {
                this.nodes = this.vis3D.setNodes(graph.nodes);
                this.links = this.vis3D.setLinks(graph.links);
                               
                this.vis3D.start();
            }
        });
    }

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

    public pause():void {
        this.paused = true;
    }

    public resume():void {
        this.paused = false;
    }


    private update():void {
        this.vis3D.update();            
    }

    private render():void {
        this.vis3D.render();
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

    



    
    
    
    
    
    private addStats(){
        var stats = new Stats();
        
        stats.setMode(0);
        
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = this.canvas.offsetLeft + "px";
        stats.domElement.style.top = this.canvas.offsetTop + "px";
        
        this.canvas.parentElement.appendChild(stats.domElement);
        
        this.stats = stats;            
    }
    
    
    
    
    
    // events
    
    
    
    public on (name : string, action : Function) : void {
        this.events.add(name, action);
    }
    
    
    
    
    
    //  --  Advenced methods  --
    

    private resetFocus(){
        this.nodes.forEach((node) => {
            node.setFocused();
        });
    }
    
    public focusOnRelations(){
        if(this.vis3D.getSelectedNode()){
            var relations = this.getRelationsOf(this.vis3D.getSelectedNode());
            
            console.log(relations);
            this.nodes.forEach((node)=>{
               if(relations.indexOf(node) != -1){
                   node.setFocused();
               }
               else{
                   node.setUnFocused();
               }
            });
        }
    }
    
    public focusOnGroup(){
        var nodes : Array<Node3D>;
        
        if(this.vis3D.getSelectedNode()){
           this.nodes.forEach((node) => {
               if(node.isSameGroupOf(this.vis3D.getSelectedNode())){
                   node.setFocused();
               }
               else{
                   node.setUnFocused();
               }
           });
        }
        
    }
    
    
    
    // SEARCH / SORT
    
    private getRelationsOf(node:Node3D){
        var name = this.getNameOrIndexOf(node);
        
        
        var relations : Array<Node3D> = [];
        if(name !== undefined ){
            this.links.forEach((link) => {
                
                
                var match = false;
                
                if(link.getData().source == name || link.getData().target == name){
                    match = true;
                }
                
                
                if(match){
                    var node = this.nodes[link.getData().source];
                        relations.push(node);
                    /*if(relations.indexOf(node) == -1 && node){
                    }*/
                    node = this.nodes[link.getData().target];
                        relations.push(node);
                    /*if(relations.indexOf(node) == -1 && node){
                    }*/
                }             
                
            });
        }
        
        return relations || [];        
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
