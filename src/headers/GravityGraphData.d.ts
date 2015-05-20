
/// <reference path='three.d.ts' />
/// <reference path='three-orbitcontrols.d.ts' />
/// <reference path='three-projector.d.ts' />

declare enum EQuality{}   // implemented in Utils.ts


interface IWorker extends Worker{
    postMessage(message : IWorkerMessaqe, rest? : any) : void;
}

interface IWorkerMessaqe { // extends MessageEvent{
    message : string;
    content : any;
    type : string;
}



interface IGraph {
    nodes : Array<Node3D>;
    links : Array<Link3D>;
}


interface IMouse extends IPoint{}



interface IOptions{
    target : string;
    opacity? : number;
    backgroundColor? : number;
    nodes?: Array<INodeData>;
    links?: Array<ILinkData>;
    quality? : string;
    flat? : boolean;
    flow? : boolean;
    stats? : boolean;
    charge? : number;
    distance? : number;
    colorType ? : string;
    shadows ? : boolean; 
}



interface INodeData{
    x? : number;
    y? : number;
    z?: number;
    group?:any;  
}

interface ILinkData{
    source : any;
    target : any;
}

interface IPoint{
    x : number;
    y : number;
}



interface IFocusableElement{
    setFocused() : void;
    setUnFocused() : void;
}


