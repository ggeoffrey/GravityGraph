/// <reference path='headers/GravityGraphData.d.ts' />
/// <reference path='headers/three.d.ts' />

/// <reference path='Link3D.ts' />

class Text3D extends THREE.Mesh implements IFocusableElement{
	
	private support : Link3D;
	
	private width : number;
	
	constructor( support : Link3D){
		
		this.support = support;
		
		var materialFront = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		
		
		var materialArray = [ materialFront];
		var textGeom = new THREE.TextGeometry( support.getData().value + " >", 
		{
			size: 3, height: 0, curveSegments: 1,
			font: "droid sans",// weight: "normal", style: "normal",
			//bevelThickness: 0, bevelSize: 0, bevelEnabled: false,
			//material: 0, extrudeMaterial: 0
		});
		// font: helvetiker, gentilis, droid sans, droid serif, optimer
		// weight: normal, bold
		
		//var textMaterial = new THREE.MeshFaceMaterial(materialArray);
		
		super(textGeom, materialFront);
				
		textGeom.computeBoundingBox();
		this.width = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
		
		this.rotateZ(Math.PI/2);
		
		this.setUnFocused();
				
	}
	
	public update(){
		this.position.copy(this.support.getSource().position);
		
		this.position.add(this.support.getTarget().position.clone().sub(this.position).divideScalar(2));
		this.lookAt(this.support.getTarget().position);
		this.rotateY(-Math.PI/2);
		
	}
	
	
	
	public setFocused(){
		this.visible = true;
	}
	
	public setUnFocused(){
		this.visible = false;
	}
}