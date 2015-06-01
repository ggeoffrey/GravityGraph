
/// <reference path="Node3D" />
/// <reference path="Link3D" />

module GravityGraph{
	

    // Global definitions


    export interface IGraph {
        nodes : Array<Node3D>;
        links : Array<Link3D>;
    }
    
    export interface IPoint{
        x : number;
        y : number;
    }
    
    export interface IMouse extends IPoint{}
    
    
    
    export interface IConfig{
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
    
    
    
    export interface INodeData{
        x? : number;
        y? : number;
        z?: number;
        group?:any;  
    }
    
    export interface ILinkData{
        source : any;
        target : any;
        value : any;
    }
    
    
    
    
    
    export interface IFocusableElement{
        setFocused() : void;
        setUnFocused() : void;
    }
    
    
    export interface IWorker extends Worker{
        postMessage(message : IWorkerMessaqe, rest? : any) : void;
    }
    
    export interface IWorkerMessaqe { // extends MessageEvent{
        message : string;
        content : any;
        type : string;
    }
}