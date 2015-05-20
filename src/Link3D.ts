/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />


/// <reference path="Cloud.ts" />
/// <reference path="Arrow3D.ts" />
/// <reference path="Text3D.ts" />



class Link3D extends THREE.Line implements IFocusableElement{
    
    
    private static material = new THREE.LineBasicMaterial({color : 0xffffff});
    
    private data : ILinkData;

    private source : Node3D;
    private target : Node3D;
    
    private lineLength: number;


    private cloud : Cloud;
    private arrow : Arrow3D;
    private text : Text3D;
    

    constructor(source:Node3D, target:Node3D, data: ILinkData) {

        this.data = {
            source : data.source,
            target : data.target,
            value : data.value
        };

        this.source = source;
        this.target = target;
        
        //this.arrow = new Arrow3D(this);
        this.text = new Text3D(this);
        //this.arrow.add(this.text);
        
        
        var geometry = new THREE.Geometry();
        geometry.vertices.push(this.source.position);
        geometry.vertices.push(this.target.position);
        
        super(geometry, Link3D.material);
        
        this.add(this.text);
        this.position = this.source.position;
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
    
    
    public getArrow(){
        return this.arrow;
    }
    
    public getText(){
        return this.text;
    }


    public update(container : THREE.Object3D){
        this.lineLength = this.source.distanceTo(this.target);
                
        //this.position.copy(this.source.position);
        //this.geometry.vertices[1] = this.target.position.clone().sub(this.source.position);
        this.geometry.verticesNeedUpdate  = true;
        
        if(this.cloud){
            this.cloud.update();
        }
        //this.arrow.update();
        this.text.update();
    }
    
    
    // VIEW
    
    
    public setFocused(){
        if(this.cloud)  this.cloud.visible = true;
        //this.arrow.setFocused();
        this.visible = true;
        //this.text.setFocused();
    }
    
    public setUnFocused(){
        if(this.cloud)  this.cloud.visible = false;
        //this.arrow.setUnFocused();
        this.visible = false;
        //this.text.setUnFocused();        
    }

}