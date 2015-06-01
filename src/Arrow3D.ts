/// <reference path="headers/three.d.ts" />

/// <reference path="GravityGraph.ts" />

/// <reference path="Link3D.ts" />
/// <reference path="Node3D.ts" />

module GravityGraph{
	
	
	export class Arrow3D extends THREE.ArrowHelper implements IFocusableElement{
		
		
		private static COLOR = 0xffffff;//0x909090;
		
		private sourcePosition : THREE.Vector3;
		private targetPosition : THREE.Vector3;	
		
		
		constructor(link : Link3D){
			this.sourcePosition = link.getSource().position;
			this.targetPosition = link.getTarget().position;
			
			var direction = this.targetPosition.clone().sub(this.sourcePosition);
			super(direction.clone().normalize(), this.sourcePosition, direction.length(), Arrow3D.COLOR);
			this.changeDefaults()
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
		
		public setFocused(){
			this.line.visible = true;
	        this.cone.visible = true;
		}
		
		public setUnFocused(){
			this.line.visible = false;
	        this.cone.visible = false;
		}
		
	}
	
}