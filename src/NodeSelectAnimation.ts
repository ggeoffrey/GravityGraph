/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/tweenjs.d.ts' />

class NodeSelectAnimation extends THREE.Line {
	
	
	private animation; // : createjs.Tween;
	private animatedObject:any;
	
	
	private firstExpand  : boolean; 
	
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
		
		
		
	}
	
	private changeDefaults(){
		this.scale.set(1,1,1);
		this.visible = false;
	}
	
	
	public animate(){
		
		//createjs.Tween.removeTweens(this.animatedObject);
		this.firstExpand = true;
		
		this.material.opacity = 1;
		this.material.needsUpdate = true;
		
		
		this.animatedObject = {scale : 0};
		this.animation = new createjs.Tween(this.animatedObject)
		.to({
			scale : 3000
		}, 1000)
		.call(()=>{
			
			//createjs.Tween.removeTweens(this.animatedObject);
			this.firstExpand = false;
			this.animatedObject = {scale : 0};
			this.animation = new createjs.Tween(this.animatedObject,
			{
				loop : true,
			})
			.to({
				scale : 100
			}, 1000);
			
		});
	}
	
	
	public update(target : THREE.Vector3){
		if(this.animatedObject.scale !== undefined ){
			var s = this.animatedObject.scale / 100;
	
			this.scale.set(s,s,s);
			
			if(!this.firstExpand){
				var opacity = Math.sin(1-s);
				this.material.opacity = opacity;
				this.material.needsUpdate = true;
			}
			
			
			this.lookAt(target);
		}
		
	}
	
	
	
	public setPosition(position : THREE.Vector3){
		this.position.copy(position);
	}
	
	
	public show(){
		this.visible = true;
	}
	
	public hide(){
		this.visible = false;
	}
	
	
	
	
}