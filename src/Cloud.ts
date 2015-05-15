
/// <reference path='headers/GravityGraphData.d.ts' />

/// <reference path='headers/three.d.ts' />





class Cloud extends THREE.PointCloud{


        private static  imgMap : string = 'assets/img/light.png';
        
        
        private static particleMap = THREE.ImageUtils.loadTexture(Cloud.imgMap);

        private static defaultMaterial = new THREE.PointCloudMaterial({
            color: 0xffffff, // blue
            size: 5,
            map: Cloud.particleMap,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            //vertexColors: true,
            sizeAttenuation: true
        });
        
        private static baseVelocity = 0.25;


        private support : Link3D;

        private velocity : number;

        private nbParticles: number;

        constructor(link : Link3D){

            this.support = link;
            this.velocity = 0;

            this.nbParticles = 10;

            var geometry = new THREE.Geometry();

            for(var i = 0 ; i < this.nbParticles; i++){
                geometry.vertices.push(new THREE.Vector3(0, 0, 0 /*+ i * 5*/));
            }
            super(geometry, Cloud.defaultMaterial);
            
           

            this.support.setCloud(this);
        }
        

        private changeDefaults(){

        }

        public update(){
            this.position.copy(this.support.geometry.vertices[0]);
            this.lookAt(this.support.geometry.vertices[1]);
        }


        public start() : void {
            if(this.velocity < Cloud.baseVelocity){
                this.velocity += 0.005;
            }
        }

        public stop() : void {
            if(this.velocity > 0){
                this.velocity -= 0.0035;            
            }
        }

        public animate(){
            
            if(this.velocity > 0){
                
                var i = 0, len = this.geometry.vertices.length, vertice, previousVertice;
    
                var lineLength = this.support.getLineLength();
    
                while(i<len){
                    vertice = this.geometry.vertices[i]
                    vertice.z += this.velocity;
                    if(vertice.z > lineLength){
                        vertice.z = 0;
                    }
                    if(previousVertice){
                        if(vertice.z-previousVertice.z < lineLength / this.nbParticles ) {
                            vertice.z+= this.velocity;
                        }
                    }
                    previousVertice = vertice;
    
                    i++;
                }
    
                this.geometry.verticesNeedUpdate = true;
                
            }
        }
    }