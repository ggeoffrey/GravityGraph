
/// <reference path='three.d.ts' />
/// <reference path='three-orbitcontrols.d.ts' />
/// <reference path='three-projector.d.ts' />



interface Window{
    rendererStats : any;
}

interface IWorker extends Worker{
    postMessage(message : IWorkerMessaqe, rest? : any) : void;
}

interface IWorkerMessaqe { // extends MessageEvent{
    message : string;
    content : any;
    type : string;
}




interface IOptions{
    target : string;
    opacity? : number;
    backgroundColor? : number;
    nodes?: Array<INodeData>;
    links?: Array<ILinkData>;
    stats?: boolean;
}

interface INodeData{
    x? : number;
    y? : number;
    z?: number;
    group?:any;
}
interface ILinkData{}


interface IMouse{
    x: number;
    y: number;
}


declare class Stats{
    public setMode(n:number);
    public domElement : HTMLElement;
    public begin();
    public end();
}