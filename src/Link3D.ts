/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />



class Link3D extends THREE.Line {

    private static defaultMaterial:THREE.LineBasicMaterial = new THREE.LineBasicMaterial({
        color : 0x909090
    });


    private source : Node3D;
    private target : Node3D;

    private cloud : Cloud;

    private lineLength: number;

    constructor(source:Node3D, target:Node3D) {

        this.source = source;
        this.target = target;

        var geometry = new THREE.Geometry();
        geometry.vertices.push(source.position);
        geometry.vertices.push(target.position);

        super(geometry, Link3D.defaultMaterial);


        this.changeDefaults();
    }

    private changeDefaults() {
        this.castShadow = true;
        this.position = this.source.position;
    }

    public setCloud(c : Cloud){
        this.cloud = c;
    }

    public getCloud(){  return this.cloud; }

    public getLineLength(){return this.lineLength; }

    public getSource(){ return this.source; }
    public getTarget(){ return this.target; }


    public update(){
        this.lineLength = this.source.distanceTo(this.target);
        this.geometry.verticesNeedUpdate = true;
        if(this.cloud){
            this.cloud.update();
        }
    }

}