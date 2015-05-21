
/// <reference path='three.d.ts' />
/// <reference path='three-orbitcontrols.d.ts' />
/// <reference path='three-projector.d.ts' />
/// <reference path='three-canvasrenderer.d.ts' />
/// <reference path="Detector.d.ts" />

/// <reference path='d3.d.ts' />
/// <reference path='tweenjs.d.ts' />


/// <reference path='../Node3D.ts' />
/// <reference path='../Link3D.ts' />
/// <reference path='../Cloud.ts' />
/// <reference path='../NodeSelectAnimation.ts' />
/// <reference path="../D3Wrapper.ts" />
/// <reference path='../Events.ts' />
/// <reference path="../Foci.ts" />
/// <reference path="../Utils.ts" />
/// <reference path="../Visualisation3D.ts" />
/// <reference path="../Arrow3D.ts" />
/// <reference path="../Text3D.ts" />





declare module GravityGraph {   
    
    
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
        value : any;
    }
    
    interface IPoint{
        x : number;
        y : number;
    }
    
    
    
    interface IFocusableElement{
        setFocused() : void;
        setUnFocused() : void;
    }
    
    
    
    
}