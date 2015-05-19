/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/tweenjs.d.ts' />

class NodeSelectAnimation extends THREE.Line {
	
	
	private animation; // : createjs.Tween;
	private animatedObject:any; 
	
	constructor(){
		
		
		var segmentCount = 32,
		    radius = 30,
		    geometry = new THREE.Geometry(),
		    material = new THREE.LineBasicMaterial({ 
				color: 0xff0000,
				transparent : true
			});
		
		for (var i = 0; i <= segmentCount; i++) {
		    var theta = (i / segmentCount) * Math.PI * 2;
		    geometry.vertices.push(
		        new THREE.Vector3(
		            Math.cos(theta) * radius,
		            Math.sin(theta) * radius,
		            0
				)
			);            
		}
			
		super(geometry, material);
		this.changeDefaults();
		
		this.animatedObject = {scale : 0};
		this.animation = new createjs.Tween(this.animatedObject,
		{
			loop : true,
		})
		.to({
			scale : 100
		}, 1000);
		
	}
	
	private changeDefaults(){
		this.scale.set(1,1,1);
		this.material.opacity = 0;
	}
	
	
	public update(target : THREE.Vector3){
		var s = this.animatedObject.scale / 100;

		
		this.scale.set(s,s,s);
		this.material.opacity = 1-s;
		this.material.needsUpdate = true;
		
		
		this.lookAt(target);
		
	}
	
	public setPosition(position : THREE.Vector3){
		this.position.copy(position);
	}
	
	
	
	
}