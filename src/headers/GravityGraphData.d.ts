
/// <reference path='three.d.ts' />
/// <reference path='three-orbitcontrols.d.ts' />
/// <reference path='three-projector.d.ts' />


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
    nodes: Array<INodeData>;
    links: Array<ILinkData>;
}

interface INodeData{}
interface ILinkData{}