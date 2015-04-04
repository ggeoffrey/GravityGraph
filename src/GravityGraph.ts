/**
 * Created by Geoffrey on 04/04/2015.
 */

/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/three-orbitcontrols.d.ts' />
/// <reference path='headers/three-projector.d.ts' />



class GravityGraph{

    private D3Worker : Worker;

    private canvas : HTMLCanvasElement;
    private scene : THREE.Scene;
    private renderer : THREE.WebGLRenderer;


    constructor (config : IOptions){

        this.startD3Worker();

        this.canvas = <HTMLCanvasElement> document.getElementById(config.target);

        this.init()

    }

    private startD3Worker()  : void{
        this.D3Worker = new Worker('src/d3_worker.js');


        this.D3Worker.onmessage = (event: MessageEvent)=>{
            if(event.data && event.data.message === "log"){
                console.log("Worker:");
                console.log(event.data.content);
            }
            else{
                console.log(event.data);
            }
        };

        this.D3Worker.onerror = (event: ErrorEvent)=>{
            console.error(event);
        };
    }

    /**
     * Initialise a 3D scene
     */
    private init() : void {
        
    }

    private run() : void {}

}


class Node3D extends THREE.Mesh{
    constructor(data: INodeData){
        // TODO
        super();
    }
}

class Link3D extends THREE.Line{
    constructor(data: ILinkData){
        // TODO
        super();
    }
}