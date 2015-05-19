/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />


/// <reference path="Arrow3D.ts" />




class Link3D implements IFocusableElement {
    private data : ILinkData;

    private source : Node3D;
    private target : Node3D;
    
    private lineLength: number;


    private cloud : Cloud;
    private arrow : Arrow3D;
    

    constructor(source:Node3D, target:Node3D, data: ILinkData) {

        this.data = {
            source : data.source,
            target : data.target
        };

        this.source = source;
        this.target = target;
    }
        
    public getData(){
        return this.data;
    }

    public setCloud(c : Cloud){
        this.cloud = c;
    }

    public getCloud(){  return this.cloud; }

    public getLineLength(){return this.lineLength; }

    public getSource(){ return this.source; }
    public getTarget(){ return this.target; }
    
    
    public setArrow(arrow){
        this.arrow = arrow;
    }


    public update(){
        this.lineLength = this.source.distanceTo(this.target);

        if(this.cloud){
            this.cloud.update();
        }
        this.arrow.update();
    }
    
    
    // VIEW
    
    
    public setFocused(){

        this.cloud.visible = true;
        this.arrow.setFocused(); 
    }
    
    public setUnFocused(){
        this.cloud.visible = false;
        this.arrow.setUnFocused();        
    }

}