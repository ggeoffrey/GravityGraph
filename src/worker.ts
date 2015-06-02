/**
 * Created by Geoffrey on 04/04/2015.
 */
 
/// <reference path="GlobalDefs" />
/// <reference path="Node3D" />
/// <reference path="Link3D" />
/// <reference path="Text3D" />

/*

importScripts(
    "../vendors/d3.js",
    "../vendors/three.js",
    "../dist/GravityGraph.js"
);


module GravityGraph{
    
    export class D3Worker{
    
    
        private worker : IWorker;
    
        private nodes : Array<INodeData>;
    
        private links : Array<ILinkData>;
        
        private graph : IGraph;
    
        constructor( worker : IWorker ){
            this.worker = worker;    
    
            this.worker.onmessage = (event : MessageEvent)=>{
                var arrData = event.data.content;
                var config = new Config(event.data.config);
                
                switch (event.data.message){
                    case "prepareNodes" :
                        this.prepareNodes(arrData, config);
                        break;        
                    case "prepareLinks" :
                        this.prepareLinks(arrData, config);
                        break;                    
                    default :
                        break;
                }
            }


            this.worker.postMessage({
                message : "log",
                type: "string",
                content: "D3 Worker ready"
            });
        }
        
        
        
        
        
        
        private prepareNodes(nodesData : Array<INodeData>, config:Config) : Array<Node3D> {
            
        }
            
        private prepareLinks(nodesData : Array<INodeData>, config:Config) : Array<Link3D> {
            
        }
        
    }

    // START
    
    
    ((self: IWorker) => {
        new D3Worker(self);
    })(<any>self);


}


*/