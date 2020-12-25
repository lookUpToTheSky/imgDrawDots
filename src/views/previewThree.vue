<template>
  <div class='wrap'>
    <div id="draw-dots-image" ref="drawDotsImage">
      <div id="threeView" ref="threeView"></div>
    </div>
    <el-button class="onBack" @click="$router.push('/three')">退出预览</el-button>
  </div>
</template>

<script>
import THREE from '@/assets/js/onEvent.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader' // obj文件加载
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader' // 材质mtl文件导入
let scene, camera, renderer, controls, dragControls, transformControls;
export default {
   name: 'preview',
   data () {
     return {
       drawDotsJson: null,
       viewNode: '',
       animationId: ''
     }
   },
  methods: {
        initThreeScene() {
            this.viewNode = this.$refs.threeView;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera( 75, this.viewNode.clientWidth / this.viewNode.clientHeight, 1, 1000 );
            camera.position.set(0, 10, 20);
            camera.lookAt(0,0,0)
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize( this.viewNode.clientWidth , this.viewNode.clientHeight );
            renderer.setClearColor(0x212830, 1);
            this.viewNode.appendChild( renderer.domElement );
            THREE.onEvent(scene, camera, this.viewNode, this.viewNode.clientWidth, this.viewNode.clientHeight);
            let AmbientLight = new THREE.AmbientLight( 0xeeeeee );
            scene.add( AmbientLight );
            var DirectionalLight = new THREE.DirectionalLight( 0xffffff, 2);
            DirectionalLight.position.set( 0, 50, 0 );
            scene.add( DirectionalLight );
            //辅助线
            let grid = new THREE.GridHelper( 50, 30, 0xcc4400, 0x404543 );
            scene.add( grid );
            controls = new OrbitControls(camera, renderer.domElement);
            controls.minPolarAngle = 0; 
            controls.maxPolarAngle = Math.PI/2;
            controls.minDistance = 1;
            controls.maxDistance = 50;
		},
        loadObjmtl(fileName, name) {
            return new Promise((resolve, reject) => {
                const mtlLoader = new MTLLoader();
                const objLoader = new OBJLoader();
                mtlLoader.setPath('source/');
                objLoader.setPath('source/');
                mtlLoader.load(fileName + '.mtl', (materials) => {
                    materials.preload();
                    objLoader.setMaterials(materials);
                    objLoader.load(fileName + '.obj', (obj) => {
                        obj.name = name;
                        resolve(obj);
                    })
                })
            })
            
        },
        animation() {
            this.animationId = requestAnimationFrame(this.animation);
            renderer.render(scene,camera)
            controls.update();
        },
        renderScene() {
            return new Promise((resovle, reject) => {
            let request = new XMLHttpRequest();
            request.open('get', './points.json');
            request.send();
            request.onload = function () {
                if(request.readyState === 4) {
                    resovle(JSON.parse(request.responseText))
                }else {
                    reject()
                }
            };
            })
      }
   },
  mounted() {
    this.initThreeScene();
    this.animation();
    // this.loadObjmtl('shanpo', '').then((obj) => {
    //     scene.add(obj)
    // });
    window.onresize = () => {
        camera.aspect = this.viewNode.clientWidth / this.viewNode.clientHeight//相机重置可视范围
        camera.updateProjectionMatrix();
        renderer.setSize( this.viewNode.clientWidth , this.viewNode.clientHeight );//渲染器重新渲染可视范围
        THREE.onEvent(scene, camera, this.viewNode, this.viewNode.clientWidth, this.viewNode.clientHeight);
    }
    if(this.$route.params.show) {
      this.renderScene().then(res => {
        this.drawDotsJson = res;
        let arr = res.data.filter( item => item.fileName);
        arr = arr.map( item => item.fileName);
        arr = new Set(arr);
        let loadModle = [];
        let account = 0;
        arr.forEach((item, i) => {
          this.loadObjmtl(item, item + i).then((obj) => {
            loadModle.push({modle: obj, fileName: item});
            account++;
            if(account === arr.size) {
                res.data.forEach((item) => {
                    if(item.scale) {
                      let modle = null
                      if(!item.fileName){ 
                        let material = new THREE.MeshPhongMaterial( {color: item.color} );
                        let mesh = new THREE.Mesh( new THREE[item.node](...item.argument), material)
                        modle = mesh
                      }else{
                        modle = loadModle.filter( modle => modle.fileName === item.fileName )[0].modle;
                      }
                      let mesh = modle.clone(true);
                      mesh.position.set(item.position.x, item.position.y, item.position.z);
                      mesh.scale.set(item.scale.x, item.scale.y, item.scale.z);
                      mesh.rotation.set(item.rotation._x, item.rotation._y, item.rotation._z);
                      scene.add(mesh);
                    }
                })
            }
          })
        })
      })
    }else {
    //   this.drawDotsJson = this.$store.state.dotsData;
    //   this.$nextTick(() => {
    //     this.initDots();
    //   })
    //   window.onresize = () => {
    //     this.initDots();
    //   }
    }
  },
  //注销window.onresize事件
    destroyed() {
        cancelAnimationFrame(this.animationId)
        scene = null;
        camera = null;
        renderer = null;
        controls = null;
        dragControls = null;
        transformControls = null;
    }
 }
</script>

<style lang="scss" scoped>
#draw-dots-image {
  width: 100%;
  height: 100vh;
  position: relative;
  #threeView {
    width: 100%;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
  }
  
}
.onBack {
  position: absolute;
  top: 20px;
  left: 40px;
  z-index: 99;
}
</style>
