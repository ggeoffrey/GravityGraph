/// <reference path="headers/GravityGraphData.d.ts" />
/// <reference path='headers/d3.d.ts' />

/// <reference path="Events.ts" />

/// <reference path="Utils.ts" />


class D3Wrapper{
	
	private config : Options;
	
	private nodes : Array<any>;
	private links : Array<any>;
	
	private force : D3.Layout.ForceLayout;
	
	private events : Events;
	
	
	private idle : boolean;
	private working : boolean;

	constructor( config: Options,  nodes = [], links = []){
		
		this.config = config;
		
		this.events = new Events();
		
		this.nodes = nodes;
		this.links = links;
		
		
		
		if(this.config.isFlat()){
            this.force = d3.layout.force();
        }
        else{
            this.force = (<any> d3.layout).force3d();
        }

        this.force
            .charge(this.config.charge)
            .linkDistance(this.config.distance)
            .size([1000, 1000])
			.nodes(this.nodes)
			.links(this.links)
            .on('tick', ()=> {
                this.tick();
            })
			.start()
            //.on('end', ()=>{  this.d3IsWorking = false;  })
            ;
	}
	
	
	public isWorking(){
		return this.working;
	}
	
	
	public setNodes(nodes : Array<any> = []){
		this.nodes = nodes;
		this.force.nodes(this.nodes);
	}
	
	public setLinks(links : Array<any> = []){
		this.links = links;
		this.force.links(this.links);
	}
	
	public on (name : string, action : Function) : void {
        this.events.add(name, action);
    }
	
	
	
	public isStable(){
		return this.force.alpha() <= 1e-2;
	}
	
	public isCalm(){
		return this.force.alpha() <= 1e-1;
	}
	
	
	public stabilize( limit = 150 ){
		this.idle = true;
		var k = 0;
        while ((!this.isStable()) && (k < limit)) {
        	this.force.tick(),
        	k = k + 1;
        }
		this.idle = false;
		this.force.tick();
	}
	
	public calmDown(){
		this.stabilize(50);
	}
	
	public shake(){
		this.force.start();
	}
	
	
    private tick() {

        this.working = true;
		
		if(!this.isCalm){
			this.force.tick();
		}
		else if(!this.idle){
			this.events.emit("tick", []);
		}
		
		
    }
	
	
	// VISUAL
	
	public setDistance(distance : number){
		this.force.linkDistance(distance);
		this.shake();
		//this.calmDown();
	}
	
	public setCharge(charge : number){
		this.force.charge(charge);
		this.shake();
		//this.calmDown();
	}
	
	
	
	
}