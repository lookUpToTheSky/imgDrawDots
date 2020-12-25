<template>
<div class="wrap">
  <!-- 图片描点编辑器head -->
  <section class="head-menu">
    <div class="left">
        <el-menu 
        class="el-menu-demo" 
        mode="horizontal" 
        background-color="#666"
        active-text-color="#eee"
        text-color="#eee"
        @select="handleSelect">
        <el-submenu index="1">
          <template slot="title">文件</template>
          <el-menu-item index="1-1">导入底图</el-menu-item>
          <el-menu-item index="1-2">新建窗口</el-menu-item>
          <el-divider class="line"></el-divider>
          <el-menu-item index="1-3">打开文件</el-menu-item>
          <el-menu-item index="1-4">打开文件夹</el-menu-item>
          <el-divider class="line"></el-divider>
          <el-menu-item index="1-5" @click="getJson">下载为json</el-menu-item>
          <el-menu-item index="1-6">下载为图片</el-menu-item>
          <el-divider class="line"></el-divider>
          <el-menu-item index="1-7">退出</el-menu-item>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">编辑</template>
          <el-menu-item index="2-1">清空</el-menu-item>
          <el-menu-item index="2-2">撤销</el-menu-item>
        </el-submenu>
        <el-menu-item index="3"><a href="###">社区</a></el-menu-item>
        <el-menu-item index="4"><a href="###">帮助文档</a></el-menu-item>
      </el-menu>
    </div>
    <div class="right">
        <el-menu 
        class="el-menu-demo" 
        mode="horizontal" 
        background-color="#666"
        active-text-color="#eee"
        text-color="#eee"
        @select="handleSelect">
				<el-menu-item index="1">
          <el-button size="mini" @click="$router.push('/')">图片描点</el-button>
        </el-menu-item>
        <el-menu-item index="2">
          <el-button size="mini" @click="onPreviw(false)">预览</el-button>
        </el-menu-item>
        <el-menu-item index="3">
          <el-button size="mini" @click="onPreviw(true)">示例预览</el-button>
        </el-menu-item>
      </el-menu>
    </div>
  </section>
  <!-- 图片描点编辑器left -->
  <section class="left-dots-select">
    <ul class="dots" ref="dots">
      <ol v-for="(item, index) in list" :key="index" class="item-wrap">
        <div @dragstart="onDropStart(item)" draggable="true" class="dots-item">
            <img v-if="item.icon" :src="item.icon" alt="">
            <img v-else src="../assets/logo.png">
        </div>
      </ol>
    </ul>
  </section>
  <!-- 图片描点区域center -->
  <section class="center-draw-dots"
    @drop="ondropEnd" 
    @dragenter="dragenter"
    @dragover="preventDefault">
    <div v-if="imageSrc" id="draw-dots-image">
      <div class="threeView" id="threeView" ref="view"></div>
      <div class="user-operate" v-if="activeElement && activeElement.userData.dragable">
        <ul>
          <li class="modle-position">
            <div>
              <label>位置X：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.position.x"></el-input-number>
            </div>
            <div>
              <label>位置Y：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.position.y"></el-input-number>
            </div>
            <div>
              <label>位置Z：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.position.z"></el-input-number>
            </div>
          </li>
          <li class="modle-scale">
            <div>
              <label>缩放X：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.scale.x"></el-input-number>
            </div>
            <div>
              <label>缩放Y：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.scale.y"></el-input-number>
            </div>
            <div>
              <label>缩放Z：</label>
              <el-input-number controls-position="right" size="small" v-model="activeElement.scale.z"></el-input-number>
            </div>
          </li>
          <li class="modle-rotation">
            <div>
              <label>旋转X：</label>
              <el-input-number controls-position="right" :step="0.1" size="small" v-model="activeElement.rotation.x"></el-input-number>
            </div>
            <div>
              <label>旋转Y：</label>
              <el-input-number controls-position="right" :step="0.1" size="small" v-model="activeElement.rotation.y"></el-input-number>
            </div>
            <div>
              <label>旋转Z：</label>
              <el-input-number controls-position="right" :step="0.1" size="small" v-model="activeElement.rotation.z"></el-input-number>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 右击菜单 -->
    <section class="dotsMenu" v-show="showMenu" ref="dotsMenu">
      <el-menu 
        class="dots-menu-content" 
        background-color="#eee"
        active-text-color="#444"
        v-if="activeElement"
        text-color="#444">
        <el-menu-item index="1" @click="onFreeze">{{ activeElement.userData.dragable? '冻结': '解冻(已冻结)'}}</el-menu-item>
        <el-menu-item index="1" :disabled="!activeElement.userData.dragable" @click="onChangeMode('translate')">移动</el-menu-item>
        <el-menu-item index="2" :disabled="!activeElement.userData.dragable" @click="onChangeMode('scale')">缩放</el-menu-item>
        <el-menu-item index="3" :disabled="!activeElement.userData.dragable" @click="onChangeMode('rotate')">旋转</el-menu-item>
        <el-menu-item index="4" @click="onCloneNode">复制</el-menu-item>
        <el-menu-item index="5" @click="onDelete">删除</el-menu-item>
        <el-menu-item index="6" @click="setUserDataShow = true; showMenu = false">绑定自定义数据</el-menu-item>
      </el-menu>
    </section>
    <!-- 用户自定义数据 -->
    <el-dialog
      width="30%"
      title="用户自定义数据"
      :visible.sync="setUserDataShow"
      append-to-body>
      <!-- <div class="userData" v-for="(item, key) in JSON.parse(userData)" :key="key">
        <div class="userKey">
          <label for=""></label>
          <el-input v-model="userData[key]"><el-input>
        </div>
        =>
        <div class="userVal">
          <label for=""></label>
          <el-input v-model="userData[key]"><el-input>
        </div>
      </div> -->
      <el-input
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 10}"
        placeholder='例如(JSON格式)： {"title": "你好"}'
        v-model="userData">
      </el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setUserDataShow = false">取 消</el-button>
        <el-button type="primary" @click="onSetUserData">确定</el-button>
      </div>
  </el-dialog>
  </section>
</div>
</template>
<script>
	import THREE from '@/assets/js/onEvent.js'
  import { TransformControls } from '@/assets/js/TransformControls' // 控制器(修改了hover时不可控制场景移动)
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' // 控制器
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader' // obj文件加载
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader' // 材质mtl文件导入
import { BoxGeometry, BoxHelper, MeshPhongMaterial } from 'three'
	let scene, camera, renderer, controls, dragControls, transformControls;
  export default {
    data() {
      return {
        drawDotsJson: {
          image: '',
          width: 0,
          height: 0,
          data: []
        },
        animationId: null,
        showMenu: false,
        disabled: false,
        setUserDataShow: false,
        userData: '',
        activeElement: null,
        selectedNode: null,
        imageSrc: '/',
        viewNode: '',
        rotation: null,
				list: [
            {node: '', fileName: 'shanpo', argument: [1,1,1], icon: require('../assets/img/mountain.jpg')},
            {node: '', fileName: 'GNSS-sensor',argument: [0.05,0.05,0.05], icon: require('../assets/img/GNSS-sensor.jpg')},
            {node: '', fileName: 'yu-sensor', argument: [0.05,0.05,0.05],icon: require('../assets/img/yu-sensor.jpg')},
            {node: '', fileName: 'grid',argument: [0.05,0.05,0.05], icon: require('../assets/img/grid.jpg')},
						{node: 'BoxBufferGeometry', argument: [1,1,1], color: 'red', icon: ''},
						{node: 'CylinderBufferGeometry', argument: [1, 1, 1, 32 ], color: 'green',icon: ''},
						{node: 'OctahedronBufferGeometry', argument: [1], color: '#ccdd00', icon: ''},
						{node: 'SphereBufferGeometry',  argument: [1, 64, 64], color: '#ccdd00', icon: ''},
				],
      };
    },
    watch: {
      'activeElement.position': {
          handler: function(val) {
            this.BoxHelperChange('position')
          },
          deep: true
      },
      'activeElement.scale': {
          handler: function(val) {
            this.BoxHelperChange('scale')
          },
          deep: true
      },
      'activeElement.rotation': {
          handler: function(val) {
            this.BoxHelperChange('rotation')
          },
          deep: true
      }
    },
    methods: {
      BoxHelperChange(type) {
        if(!this.activeElement) return
        if(this.activeElement.isBoxHelper) {
          let typeVal = this.activeElement[type];
          this.activeElement.helperModle[type].set(typeVal.x, typeVal.y, typeVal.z);
        }
      },
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      onDelteData() {
        this.imageSrc = '';
        this.drawDotsJson = null;
      },
      // 点击显示菜单
      onShowMenu(pos) {
        event.preventDefault();
        this.showMenu = true;
        this.$refs.dotsMenu.style.top = pos.y + 'px';
        this.$refs.dotsMenu.style.left = pos.x + 'px';
      },
      // 冻结
      onFreeze() {
        this.activeElement.userData.dragable = !this.activeElement.userData.dragable;
        if(this.activeElement.userData.dragable) {
          transformControls.attach(this.activeElement);
        }else{
          transformControls.detach(this.activeElement);
        }
        this.showMenu = false;
      },
      // 删除
      onDelete() {
        transformControls.detach(this.activeElement);
        if(!this.activeElement.isBoxHelper) {
          scene.remove(this.activeElement);
          this.activeElement.off();
        }else{
          scene.remove(this.activeElement);
          scene.remove(this.activeElement.helperModle);
          this.activeElement.helperModle.off();
        }
        this.activeElement = null;
        this.showMenu = false;
      },
      // 修改模型切换
      onChangeMode(mode) {
        transformControls.setMode(mode);
        this.showMenu = false;
      },
      // 复制
      onCloneNode() {
        let that = this;
        let nodeModle = this.activeElement.isBoxHelper? this.activeElement.helperModle : this.activeElement
        let group = new THREE.Group();
        let mesh = nodeModle.clone(true);
        let element = null;
        if(nodeModle.type === 'Group') {
          let helperBox = this.activeElement.clone();
          nodeModle.traverse( child => {
            if(child.isMesh) {
              let childMesh = child.clone(true);
              group.add(childMesh);
            }
          })
          element = group;
          helperBox.helperModle = group;
          helperBox.isBoxHelper = true;
          this.activeElement = helperBox;
          scene.add(group);
          scene.add(helperBox);
        }else{
          mesh.material = nodeModle.material.clone(true);
          scene.add(mesh);
          element = mesh;
          this.activeElement = element;
        }
        this.activeElement.userData = {
          ...this.activeElement.userData
        }
        transformControls.attach(that.activeElement);
        element.on('click', (() => {
          let node = that.activeElement;
          return function() {
            that.activeElement = node
            if(node.userData.dragable) transformControls.attach(that.activeElement);
            that.onShowMenu({x: event.offsetX, y: event.offsetY}, node);
          }
        })())
        this.showMenu = false;
      },
      // 用户自定义数据
      onSetUserData() {
        try {
          let data = JSON.parse(this.userData);
          if(!(data.constructor === Object) ) {
            this.$message.warning('数据类型不是JSON格式！')
            this.userData = '';
          }else{
            this.activeElement.userData = Object.assign({}, data, this.activeElement.userData);
            this.userData = '';
            this.showMenu = false;
            this.$message({type:'success', message: '自定义数据成功！'})
          }
        }catch(err) {
          this.$message.warning('数据类型不是JSON格式！')
          this.userData = '';
        }
      },
      getBase64ToBlob(blob) {
          var fileReader = new FileReader();
          fileReader.readAsDataURL(imageSrc);
          fileReader.onload = function (e) { 
            console.log(e.target.result); 
          }
      },
      getJson() {
         scene.children.forEach((item, i) => {
            if(Object.keys(item.userData).length > 0) {
              this.drawDotsJson.data.push({...item.userData});
            }
         })
         console.log(this.drawDotsJson.data)
        const blobData = new Blob([JSON.stringify(this.drawDotsJson)], {type: 'text/json'});
        var link = document.createElement('a');
        link.download = `dots_${Math.floor(Math.random(0, 10)*Math.pow(10, 8))}.json`;
        link.href = URL.createObjectURL(blobData);
        link.click();
      },
      getBase64Image(img) {  
        var canvas = document.createElement("canvas");  
        canvas.width = img.width;  
        canvas.height = img.height;  
        var ctx = canvas.getContext("2d");  
        ctx.drawImage(img, 0, 0, img.width, img.height);  
        var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();  
        var dataURL = canvas.toDataURL("image/"+ext);  
        return dataURL;  
      },  
      // 选择点
      onDropStart(item) {
        this.selectedNode = item;
      },
      preventDefault() {
          event.preventDefault();
      },
      dragenter() {
        event.preventDefault();
      },
      ondropEnd() {
        if(!!this.selectedNode.node) {
          let material = new THREE.MeshPhongMaterial( {color: this.selectedNode.color} );
          let mesh = new THREE.Mesh( new THREE[this.selectedNode.node](...this.selectedNode.argument), material)
          this.activeElement = mesh;
          this.setNodePostion(event);
        }else{
          let dragEvent = event;
          this.loadObjmtl(this.selectedNode.fileName, this.selectedNode.fileName).then((obj) => {
            let box = new BoxHelper(obj, 0x00dd95);
            let mesh = new THREE.Mesh(box.geometry, new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
            scene.add(obj);
            mesh.isBoxHelper = true;
            mesh.helperModle = obj;
            this.activeElement = mesh;
            this.activeElement.scale.x *= this.selectedNode.argument[0];
            this.activeElement.scale.y *= this.selectedNode.argument[1];
            this.activeElement.scale.z *= this.selectedNode.argument[2];
            this.setNodePostion(dragEvent);
          });
        }
      },
      setNodePostion(e) {
        let that = this;
        let pos = this.getModeXYZ(e.offsetX, e.offsetY);
        this.activeElement.position.set(pos.x, pos.y, 0);
        this.activeElement.userData = {
          id: this.activeElement.uuid,
          dragable: true,
          name: this.activeElement.name,
          position: this.activeElement.position,
          scale: this.activeElement.scale,
          rotation: this.activeElement.rotation,
          ...this.selectedNode
        }
        scene.add(this.activeElement);
        transformControls.attach(this.activeElement)
        let activeElement = null;
        activeElement = this.activeElement.isBoxHelper? this.activeElement.helperModle : this.activeElement;
        activeElement.on('click', (() => {
          let node = that.activeElement;
          return function() {
            transformControls.detach(that.activeElement);
            that.activeElement = node
            if(node.userData.dragable) transformControls.attach(that.activeElement);
            that.onShowMenu({x: event.offsetX, y: event.offsetY});
          }
        })())
      },
      //每帧额外的运算 传感器信息牌位置变化
      getModeXYZ(x, y) {
          var vec = new THREE.Vector3(); // create once and reuse
          var pos = new THREE.Vector3(); // create once and reuse
          vec.set(
              ( x / this.viewNode.clientWidth ) * 2 - 1,
              - ( y / this.viewNode.clientHeight ) * 2 + 1,
              0.5 );
          vec.unproject( camera );
          vec.sub( camera.position ).normalize();
          var distance = - camera.position.z / vec.z;
          pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
          return pos;
      },
      onPreviw(type) {
         scene.children.forEach((item, i) => {
           if(Object.keys(item.userData).length > 0) {
             this.drawDotsJson.data.push(item.userData)
           }
         })
        this.$store.commit('setDotsData', this.drawDotsJson);
        this.$router.push({name: 'PreviewThree', params: {show: type}});
      },
			initThreeScene() {
            this.viewNode = this.$refs.view;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera( 75, this.viewNode.clientWidth / this.viewNode.clientHeight, 1, 1200 );
            camera.position.set(0, 10, 20);
            camera.lookAt(0,0,0)
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize( this.viewNode.clientWidth , this.viewNode.clientHeight );
            renderer.setClearColor(0x212830, 1);
            document.getElementById('threeView').appendChild( renderer.domElement );
            THREE.onEvent(scene, camera, this.viewNode, this.viewNode.clientWidth, this.viewNode.clientHeight);
            let AmbientLight = new THREE.AmbientLight( 0xeeeeee );
            scene.add( AmbientLight );
            var DirectionalLight = new THREE.DirectionalLight( 0xffffff, 2);
            DirectionalLight.position.set( 0, 50, 0 );
            scene.add( DirectionalLight );
            //辅助线
            let grid = new THREE.GridHelper( 50, 30, 0xcc4400, 0x404543 );
            scene.add( grid );
			},
			loadObjmtl(fileName, name) {
        return new Promise((resovle, reject) => {
          const mtlLoader = new MTLLoader();
            const objLoader = new OBJLoader();
            mtlLoader.setPath('source/');
            objLoader.setPath('source/');
            mtlLoader.load(fileName + '.mtl', (materials) => {
                materials.preload();
                objLoader.setMaterials(materials);
                objLoader.load(fileName + '.obj', (obj) => {
                    obj.name = name;
                    resovle(obj)
                })
            })
        })
					
      },
      // 添加拖拽控件
      initDragControls() {
          if(!controls) {
            controls = new OrbitControls(camera, renderer.domElement);
            // controls.minPolarAngle = 0; 
            // controls.maxPolarAngle = Math.PI/2;
            // controls.enableZoom = true;
            // controls.enableRotate = false;
            controls.minDistance = 1;
            controls.maxDistance = 1000;
            controls.addEventListener('change', () => {
              this.showMenu = false;
            })
          }
          if(!transformControls) {
            // 添加平移控件
            transformControls = new TransformControls(camera, renderer.domElement, controls);
            scene.add(transformControls);
          }
      },
			animation() {
				this.animationId = requestAnimationFrame(this.animation);
				renderer.render(scene,camera)
        controls.update();
			}
    },
    mounted() {
      this.initThreeScene();
      this.initDragControls();
      this.animation();
			window.onresize = () => {
					camera.aspect = this.viewNode.clientWidth / this.viewNode.clientHeight//相机重置可视范围
					camera.updateProjectionMatrix();
					renderer.setSize( this.viewNode.clientWidth , this.viewNode.clientHeight );//渲染器重新渲染可视范围
          THREE.onEvent(scene, camera, this.viewNode, this.viewNode.clientWidth, this.viewNode.clientHeight);
			}
    },
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
$head-height: 35px;
$content-height: calc(100% - 35px);
$bg-black: #666;
  .wrap {
    width: 100%;
    height: 100vh;
    // overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    .head-menu {
      width: 100%;
      height: $head-height;
      box-shadow: 0 1px 1px 1px #444;
      z-index: 88;
      display: flex;
      justify-content: space-between;
      background-color: $bg-black;
    }
    .el-menu-demo{
      overflow: hidden;
      box-sizing: border-box;
      height: $head-height;
      line-height: $head-height;
    }
    .left-dots-select {
      width: 220px;
      padding: 5px;
      height: $content-height;
      box-sizing: border-box;
      background-color: #444;
      .dots {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
      }
    }
    .item-wrap {
      width: calc(100% / 2);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .dots-item {
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 100%;
        height: 100px;
      }
    }
    .center-draw-dots {
      position: relative;
      flex: 1;
      background-color: #f5f5f5;
      height: $content-height;
      overflow: hidden;
      .el-icon-close {
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 99;
        font-size: 30px;
        cursor: pointer;
        background-color: rgba(225,225,225,.5);
        &:hover {
          transform: scale(1.3);
        }
      }
      #draw-dots-image {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .threeView {
          width: 100%;
          height: 100%;
          background: #49ddcc;
      }
      .user-operate {
        color: #eee;
        padding: 10px;
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 50%;
        min-width: 300px;
        transform: translateX(-50%);
        background: rgba(25,125,225,.5);
        ul {
          display: flex;
        }
        li {
          width: (100% / 3);
          font-size: 14px;
          div {
            margin-bottom: 10px;
          }
          input {
            line-height: 28px;
          }
        }
      }
      .dotsMenu {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 999;
        width: 180px;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 2px 3px 2px #ccc;
      }
    }
    .active {
        border: 2px solid #49ddcc;
    }
    .line{
      margin: 5px 0 !important;
    }
  }
  ::v-deep {
    .el-button--mini {
      padding: 3px 8px;
    }
    .el-menu-item {
      height: 40px;
      line-height: 40px;
    }
    .el-menu--horizontal>.el-submenu .el-submenu__title,
    .el-menu--horizontal>.el-menu-item
    {
      height: $head-height;
      line-height: $head-height;
    }
    .el-menu.el-menu--horizontal {
      border: none;
    }
  }
  .el-divider--horizontal {
    margin: 5px 0;
  }
</style>
