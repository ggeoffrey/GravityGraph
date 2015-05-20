/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />
/// <reference path='headers/d3.d.ts' />
/// <reference path='Utils.ts' />


class Node3D extends THREE.Mesh implements IFocusableElement {

        private static nodesColor;

        private static basicGeometry : THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry(10, 2);
        private static degradedGeometry : THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry(10, 0);
        
        //private static lowQualityGeometry : THREE.CircleGeometry = new THREE.CircleGeometry(10, 20);

        private static materialsMap : { [color : number] : THREE.Material } = {};
        
        
        public static OPACITY = 0.90;


        private data : INodeData;
        
        public selected : boolean;
        public walked : boolean;
            
        private quality : EQuality;


        constructor(data:INodeData, config : Options) {

            /*
                var material = ?
                var geometry = ?
            */
            
            if(!Node3D.nodesColor){
                Node3D.nodesColor = config.colorBuilder;
            }

            var color = Node3D.nodesColor(data.group);
            var material : THREE.Material;
            if (Node3D.materialsMap[color]) {
                material = Node3D.materialsMap[color];
            }
            else if(config.quality == EQuality.HIGH) {
                
                Node3D.OPACITY = 0.90;

                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: true,
                    opacity: Node3D.OPACITY,
                    wireframe: false,
                    shininess: 5
                });
                Node3D.materialsMap[color] = material;

            }
            else if(config.quality < EQuality.HIGH){

                Node3D.OPACITY = 1;

                material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: Node3D.OPACITY,
                    wireframe: false
                });
                Node3D.materialsMap[color] = material;
            }
            
            
            if(config.isWebGL()){
                 super(Node3D.basicGeometry, material.clone());                
            }
            else{
                 super(Node3D.degradedGeometry, material.clone());
            }
            

            this.data = data;
            this.quality = config.quality;
            
            this.selected = false;
            this.walked = false;
            
            this.changeDefaults(config);
        }

        private changeDefaults(config : Options) {
            this.position.set(0,0,0);
            this.castShadow = config.shadows;
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
        
        public equals(node : Node3D){
            return this.getData() == node.getData();
        }
        
        public isSameGroupOf(node : Node3D){
            return this.getData().group == node.getData().group;
        }
        
        
        // VISUAL
        
        
        public setFocused(){
            this.material.opacity = Node3D.OPACITY;
            this.material.needsUpdate = true;
        }
        
        public setUnFocused(){
            this.material.opacity = 0.375;
            this.material.needsUpdate = true;
        }

    }