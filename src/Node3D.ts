/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />


class Node3D extends THREE.Mesh {

        private static nodesColor = d3.scale.category10();

        private static basicGeometry : THREE.SphereGeometry = new THREE.SphereGeometry(10, 10, 10);
        private static lowQualityGeometry : THREE.CircleGeometry = new THREE.CircleGeometry(10, 20);

        private static materialsMap : { [color : number] : THREE.Material } = {};
        
        
        


        private data : INodeData;
        
        public selected : boolean;
        public walked : boolean;
            
        private quality : EQuality;


        constructor(data:INodeData, config : Options) {

            /*
                var material = ?
                var geometry = ?
            */

            var color = Node3D.nodesColor(data.group);
            var material;
            if (Node3D.materialsMap[color]) {
                material = Node3D.materialsMap[color];
            }
            else if(config.quality == EQuality.HIGH) {

                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: false,
                    opacity: 0.75,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;

            }
            else if(config.quality < EQuality.HIGH){

                material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: false,
                    opacity: 0.75,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;
            }
            
            if(config.quality > EQuality.LOW){
                super(Node3D.basicGeometry, material);                
            }
            else{
                super(Node3D.lowQualityGeometry, material);
            }

            this.data = data;
            this.quality = config.quality;
            
            this.selected = false;
            this.walked = false;
            
            this.changeDefaults();
        }

        private changeDefaults() {

            this.castShadow = true;
        }

        // COLOR
        public static setColorMethod(colorScale:D3.Scale.OrdinalScale) {
            Node3D.nodesColor = colorScale;
        }

        public getColor():THREE.Color {
            var material = <THREE.MeshLambertMaterial> this.material;
            return material.color;
        }

        public setColor(color:number):void {
            
            var material = <THREE.MeshLambertMaterial> this.material;
            material.color.set(color);
            
        }



        // DATA

        public getData():INodeData {
            return this.data;
        }

        // REFRESH
        public update() {
            this.setColor(Node3D.nodesColor(this.data.group));
            this.material.needsUpdate = true;
        }
        
        public updateTarget( position : THREE.Vector3 ) : void {
            if(this.quality == EQuality.LOW){
                this.lookAt(position);
            }
        }
        
        // UTILS

        public distanceTo(node : Node3D) : number {
            return this.position.distanceTo(node.position);
        }

    }