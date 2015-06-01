/// <reference path="GlobalDefs.ts" />


module GravityGraph {

	export class Foci {
		private foci : {[index:string] : IPoint};
		private names : Array<string>;
		
		constructor(){
			this.foci = {};
			this.names = [];
		}
		
		public addFocus (name : string){
			if(this.names.indexOf(""+name) == -1){
				this.names.push(""+name);
			}
			this.computeRepartition();
		}
		
		public addAllFocus(key : string, array : Array<any>){
			array.forEach((data)=>{
				if(data[key]){
					this.addFocus(""+data[key]);
				}
			});
		}
		
		
		private computeRepartition(){
			this.foci = {};
			
			var radius = 1000;
			var pointCount = this.names.length;
			
			for (var i = 0; i < pointCount; i++) {
				var name = this.names[i];
			    var theta = (i / pointCount) * Math.PI * 2;
				
			    this.foci[name] = {
			         x : (Math.cos(theta) * radius) + radius/2,
			         y : (Math.sin(theta) * radius) + radius/2
				};
				
			}
		}
		
		
		
		public getPositionOf(name : any){
			return this.foci[""+name];
		}
	}
	
}