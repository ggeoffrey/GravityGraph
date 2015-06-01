/**
* Created by Geoffrey on 5/10/2015.
*/




module GravityGraph{   
        
    export enum EQuality {
        LOW,
        MEDIUM,
        HIGH
    }
    
    
    export class Utils {
        
        constructor(){}
    
        public isNumeric(item : any) : boolean {
            return !isNaN(parseFloat(item));
        }
        
        public isArray(item : any) : boolean {
            return Object.prototype.toString.call( item ) === "[object Array]";
        }
        
        public isObject(item : any) : boolean {
            return Object.prototype.toString.call( item ) === "[object Object]";
        }
    
        public parseBoolean(item : any) : boolean {
            var ret : boolean = !!item;
            if(item == "true"){
                ret = true;
            }
            else if (item == "false"){
                ret = false;
            }
            return ret;
        }
    }        

}