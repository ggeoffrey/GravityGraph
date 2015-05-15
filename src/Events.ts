

class Events{
	
	private eventsMap : { [index:string] : Function };
	
	constructor(){
		this.eventsMap = {};
	}
	
	public emit(name : string, args : Array<any>) : void {
		if(this.eventsMap[name]){
			this.eventsMap[name].apply(null,args);
		}
	}
	
	public add(name : string, action : Function){
		this.eventsMap[name] = action;
	}
	
}