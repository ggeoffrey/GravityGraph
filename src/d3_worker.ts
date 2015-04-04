/**
 * Created by Geoffrey on 04/04/2015.
 */

/// <reference path='headers/d3.d.ts' />
/// <reference path='headers/GravityGraphData.d.ts' />

class D3Worker{


    private worker : IWorker;


    constructor( worker : IWorker ){
        this.worker = worker;
        this.worker.postMessage({
            message : "log",
            type: "string",
            content: "D3 Worker ready"
        });
    }

    private run() : void {



    }
}



// START


((self: IWorker) => {
    importScripts("../vendors/d3.js");
    new D3Worker(self);
})(<any>self);