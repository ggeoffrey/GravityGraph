/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/tweenjs.d.ts' />

class NodeSelectAnimation extends THREE.Line {
	
	
	private animation; // : createjs.Tween;
	private animation2;
	private animatedObject:any;
	
	
	private firstExpand  : boolean; 
	
	
	private support : Node3D;
	
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
		
		
		this.animatedObject = {scaleCircle : 0, scaleNode: 1};
		this.animation = new createjs.Tween(this.animatedObject)
		.to({
			scaleCircle : 3000
		}, 1000)
		.call(()=>{
			
			//createjs.Tween.removeTweens(this.animatedObject);
			this.firstExpand = false;
			this.animatedObject.scaleCircle = 0;
			this.animation = new createjs.Tween(this.animatedObject,
			{
				loop : true,
			})
			.to({
				scaleCircle : 100,
			}, 1000);
			
		});
		
		this.animation2 = new createjs.Tween(this.animatedObject,
			{
				loop : true,
			})
			.to({
				scaleNode : 1.25
			}, 500, createjs.Ease.backInOut)
			.to({
				scaleNode : 1
			}, 500, createjs.Ease.backInOut);
		
		
	}
	
	
	public update(target : THREE.Vector3){
		if(this.animatedObject.scaleCircle !== undefined ){
			var s = this.animatedObject.scaleCircle / 100;
	
			this.scale.set(s,s,s);
			
			if(!this.firstExpand){
				var opacity = Math.sin(1-s);
				this.material.opacity = opacity;
				this.material.needsUpdate = true;
			}
			
			this.lookAt(target);
			
			s = this.animatedObject.scaleNode;
			
			this.support.scale.set(s,s,s);
		}
		
	}
	
	
	
	public setPosition(node : Node3D){
		this.support = node;
		this.position.copy(node.position);
	}
	
	
	public show(){
		this.visible = true;
	}
	
	public hide(){
		this.support.scale.set(1,1,1);
		this.visible = false;
	}
	
	
	
	
}