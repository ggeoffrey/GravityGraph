/**
 * Created by Geoffrey on 04/04/2015.
 */

/// <reference path='headers/d3.d.ts' />
/// <reference path='headers/GravityGraphData.d.ts' />



/*

importScripts("../vendors/d3.js");



class D3Worker{


    private worker : IWorker;


    private force : D3.Layout.ForceLayout;

    private nodes : Array<INodeData>;

    private links : Array<ILinkData>;


    constructor( worker : IWorker ){
        this.worker = worker;


        this.worker.onmessage = (event : MessageEvent)=>{
            switch (event.data.message){
                case "setNodes" :
                    this.nodes = event.data.content;
                    this.force.nodes(this.nodes);
                    this.skipEnter();
                    break;
                case "setLinks" :
                    this.links = event.data.content;
                    this.run();
                    break;
                default :
                    break;
            }
        }

        this.init();

        this.run();
        this.worker.postMessage({
            message : "log",
            type: "string",
            content: "D3 Worker ready"
        });
    }


    private init(){
        this.force = d3.layout.force();

        this.force
            .charge(-100)
            .linkDistance(60)
            .size([100,100])
            .on('tick', ()=>{
                this.tick();
            });



    }



    private run() : void {
        if(this.nodes != undefined){
            this.force.start();
        }
    }

    private skipEnter(): void {
        this.run();
        var i = 0;
        while(this.force.alpha() > 1e-2 ){
            this.force.tick();
            i++;
        }

        this.force.stop();
    }


    private tick(){
        this.worker.postMessage({
            message : "tick",
            type: "array",
            content : this.nodes
        });
    }
}

// START


((self: IWorker) => {

    new D3Worker(self);
})(<any>self);

*/
