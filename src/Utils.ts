/**
* Created by Geoffrey on 5/10/2015.
*/


/// <reference path="headers/GravityGraph.d.ts" />


module GravityGraph{   
        
        export enum EQuality {
            LOW,
            MEDIUM,
            HIGH
        }
        
        
        export class Utils {
            
            constructor(){}
        
            public isNumeric(item : any) : boolean {
                return !isNaN(parseFloat(item));
            }
            
            public isArray(item : any) : boolean {
                return Object.prototype.toString.call( item ) === "[object Array]";
            }
            
            public isObject(item : any) : boolean {
                return Object.prototype.toString.call( item ) === "[object Object]";
            }
        
            public parseBoolean(item : any) : boolean {
                var ret : boolean = !!item;
                if(item == "true"){
                    ret = true;
                }
                else if (item == "false"){
                    ret = false;
                }
                return ret;
            }
        }
        
        
        
        export class Options{
        
            private _config : IOptions;
            
            private webglAvailable : boolean;
        
            private U = new Utils();
        
        
            constructor(config : IOptions){
                this._config = config;
                       
                this.webglAvailable = Detector.webgl
                
                if(this.quality > EQuality.MEDIUM && ! this.isWebGL()){
                    this._config.quality = "medium";
                    console.warn("Degraded mode ! (slower)");
                    console.warn("WebGL is disabled, your drivers, your DirectX version or your browser are outdated.");
                    console.warn("Please update your software.  (https://get.webgl.org/)");
                }
                
            }
        
        
            public get target() {
                return this._config.target;
            }
        
            public get quality(){
                var quality = EQuality.HIGH;
                switch (this._config.quality){
                    case "high":
                        quality = EQuality.HIGH;
                        break;
                    case "medium":
                        quality = EQuality.MEDIUM;
                        break;
                    case "low":
                        quality = EQuality.LOW;
                        break;
                }
                return quality;
            }
        
        
            public get opacity(){
                return parseFloat(<any>this._config.opacity) || 1;
            }
        
            public get backgroundColor(){
                return this._config.backgroundColor || 0x202020;
            }
        
            public isTransparent() : boolean {
        
                return( this.U.isNumeric(this._config.opacity) && this._config.opacity >= 0 && this._config.opacity < 1);
            }
        
            public isFlat() : boolean {
                return this.U.parseBoolean(this._config.flat);
            }
            
            
            public get flow(){
                return this.U.parseBoolean(this._config.flow);
            }
            
            
            public get stats() : boolean{
                return this.U.parseBoolean(this._config.stats)
            }
            
            public get charge () : number {
                if(this.U.isNumeric(this._config.charge)){
                    return this._config.charge;
                }
                else{
                    return -100;
                }
            }
            
            
            public get distance() : number {
                if(this.U.isNumeric(this._config.distance)){
                    return this._config.distance;
                }
                else{
                    return 60;
                }
            }
            
            
            public get colorBuilder() : D3.Scale.OrdinalScale {
                var ret = d3.scale.category20;
                switch(this._config.colorType){
                    case "10":
                        ret = d3.scale.category10;
                        break;
                    case "20b":
                        ret = d3.scale.category20b;
                        break;
                    case "20c":
                        ret = d3.scale.category20c;
                        break;
                }
                return ret();
            }
            
            public isWebGL(){
                return this.webglAvailable;
            }
            
            public get shadows(){
                return this.U.parseBoolean(this._config.shadows) && this.quality > EQuality.MEDIUM && this.isWebGL();
            }
            
            
            
        }

}