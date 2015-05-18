/// <reference path="headers/three.d.ts" />


/// <reference path="Link3D.ts" />
/// <reference path="Node3D.ts" />


class Arrow3D extends THREE.ArrowHelper{
	
	private sourcePosition : THREE.Vector3;
	private targetPosition : THREE.Vector3;
	
	
	constructor(link : Link3D){
		this.sourcePosition = link.getSource().position;
		this.targetPosition = link.getTarget().position;
		
		var direction = this.targetPosition.clone().sub(this.sourcePosition);
		super(direction.clone().normalize(), this.sourcePosition, direction.length(), 0x00ff00);
		this.changeDefaults()
		link.setArrow(this);
	}
	
	private changeDefaults(){
		this.position = this.sourcePosition;
		
	}
	
	
	public update(){
		var direction = this.targetPosition.clone().sub(this.sourcePosition);
		this.setDirection(direction.normalize());
		
		var length = this.sourcePosition.distanceTo(this.targetPosition);
		var toAdd = this.targetPosition.clone().sub(this.sourcePosition).normalize().multiplyScalar(1);//length/2);
		this.position.copy(this.sourcePosition.clone().add(toAdd));
		this.setLength(length*0.9);
	}
}