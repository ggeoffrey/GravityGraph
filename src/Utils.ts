/**
 * Created by Geoffrey on 5/10/2015.
 */


enum EQuality{
    LOW,
    MEDIUM,
    HIGH
}


module GravityGraphTools{

    export class Utils {        

        public isNumeric(item : any) : boolean {
            return !isNaN(parseFloat(item));
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



    export class Options{

        private _config : IOptions;

        private U = new Utils();


        constructor(config : IOptions){
            this._config = config;
        }


        public get target() {
            return this._config.target;
        }

        public get quality(){
            var quality = EQuality.HIGH;
            switch (this._config.quality){
                case "high":
                    quality = EQuality.HIGH;
                    break;
                case "medium":
                    quality = EQuality.MEDIUM;
                    break;
                case "low":
                    quality = EQuality.LOW;
                    break;
            }
            return quality;
        }


        public get opacity(){
            return parseFloat(<any>this._config.opacity) || 0;
        }

        public get backgroundColor(){
            return this._config.backgroundColor || 0x202020;
        }

        public isTransparent() : boolean {

            return( this.U.isNumeric(this._config.opacity) && this._config.opacity >= 0 && this._config.opacity < 1);
        }

        public isFlat() : boolean {
            return this.U.parseBoolean(this._config.flat);
        }

    }
}