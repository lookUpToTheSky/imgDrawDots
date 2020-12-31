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
          <el-menu-item index="1-1" @click="$refs.fileSelected.click()">导入底图</el-menu-item>
          <el-menu-item index="1-2">新建窗口</el-menu-item>
          <el-divider class="line"></el-divider>
          <el-menu-item index="1-3" @click="onOpenJsonData">打开文件</el-menu-item>
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
          <el-button size="mini" @click="$router.push('/three')">三维模型描点</el-button>
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
        <div @dragstart="onDropStart" draggable="true" v-html="item.node" class="dots-item"></div>
      </ol>
    </ul>
  </section>
  <!-- 图片描点区域center -->
  <section class="center-draw-dots" @drop="ondropEnd" @dragenter="preventDefault"  @dragover="preventDefault" @dragstart="onStart">
    <i v-if="imageSrc" class="el-icon-close" @click="onDelteData"></i>
    <div v-if="imageSrc" @mousedown="showMenu = false" id="draw-dots-image">
      <img width="100%" height="100%" draggable="false" :src="imageSrc" />
      <div class="dot-list-wrap" ref="drawDotsImage"></div>
    </div>
    <div class="no-image">
      <input type="file" @change="onImportImage" accept="image/*" ref="fileSelected"/>
    </div>
    <!-- 右击菜单 -->
    <section class="dotsMenu" v-show="showMenu" ref="dotsMenu">
      <el-menu 
        class="dots-menu-content" 
        background-color="#eee"
        active-text-color="#41dd9c"
        text-color="#444">
        <el-menu-item index="1">置顶</el-menu-item>
        <el-menu-item index="2">复制</el-menu-item>
        <el-menu-item index="3" @click="onDelete">删除</el-menu-item>
        <el-menu-item index="4">粘贴</el-menu-item>
        <el-menu-item index="5" @click="setUserDataShow = true; showMenu = false">绑定自定义数据</el-menu-item>
      </el-menu>
    </section>
  </section>
  
    <!-- 用户自定义数据 -->
    <el-dialog
      width="30%"
      title="用户自定义数据"
      :visible.sync="setUserDataShow"
      append-to-body>
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
</div>
</template>
<script>
  export default {
    data() {
      return {
        drawDotsJson: {
          image: '',
          width: 0,
          height: 0,
          data: []
        },
        position: {},
        startPos: {},
        offsetX: 0,
        offsetY: 0,
        showMenu: false,
        setUserDataShow: false,
        userData: '',
        activeElement: null,
        activeIndex: 0,
        iconList: ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','9.png','10.png','11.png'
        ,'12.png','13.png','14.png','15.png','16.png','17.png','18.png','19.png','20.png','camera.png',
        'dataLine.png', 'photo.png'],
        list: [
            {node: `<div class="light">
              <div class="outer-wrap" style="background: radial-gradient(#eee, #41dd9c);"></div>
              <div class="inner-wrap" style="background: radial-gradient(#eee, #41dd9c);"></div>
            </div>`}
        ],
        imageSrc: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1607860392180&di=90f12ef5b6a5f7e5a26af9ead01f04f1&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fbaike%2Fpic%2Fitem%2Fb21bb051f8198618ea5dfbdc45ed2e738bd4e654.jpg'
      };
    },
    methods: {
      initIcon() {
        this.iconList.forEach((item, i) => {
          this.list.push({node: `<img draggable="false" width="40" height="40" src="./img/${item}" />`})
        })
      },
      // 导入json文件
      onOpenJsonData() {
        let input = document.createElement('input');
        input.type = 'file';
        input.click();
        input.onchange = (e, res) => {
          let file = e.target.files[0]
          if (window.FileReader) {
              var reader = new FileReader();
              // 包含中文内容用UTF-8编码
              reader.readAsText(file, 'UTF-8');
              reader.onload = (evt) => {
                  if (evt.target.readyState == FileReader.DONE) {
                      const photoRootPath = './img/'
                      this.drawDotsJson = JSON.parse(evt.target.result);
                      this.$store.commit('setDotsData', this.drawDotsJson);
                      this.imageSrc = photoRootPath + this.drawDotsJson.image
                      this.$nextTick(() => {
                        this.initDots();
                      })
                  }
              };
          }
        }
      },
      // 用户自定义数据
      onSetUserData() {
        try {
          let data = JSON.parse(this.userData);
          if(!(data.constructor === Object) ) {
            this.$message.warning('数据类型不是JSON格式！')
            this.userData = '';
          }else{
            this.userData = JSON.parse(this.userData);
            let index = this.activeElement.getAttribute('data-index')*1;
            this.drawDotsJson.data[index] = Object.assign({}, this.drawDotsJson.data[index], this.userData);
            this.userData = '';
            this.showMenu = false;
            this.setUserDataShow = false;
            this.$message({type:'success', message: '自定义数据成功！'})
          }
        }catch(err) {
          this.$message.warning('数据类型不是JSON格式！')
          this.userData = '';
        }
      },
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      onDelteData() {
        this.imageSrc = '';
        this.$refs.fileSelected.value = '';
        this.drawDotsJson.data = []
      },
      onShowMenu(pos, index, dom) {
        event.preventDefault();
        this.showMenu = true;
        this.activeElement = dom;
        this.activeIndex = index;
        this.$refs.dotsMenu.style.top = pos.y * this.$refs.drawDotsImage.clientHeight/this.drawDotsJson.height+ 'px';
        this.$refs.dotsMenu.style.left = pos.x * this.$refs.drawDotsImage.clientWidth/this.drawDotsJson.width + 'px';
      },
      onDelete() {
        this.$refs.drawDotsImage.removeChild(this.activeElement);
        this.drawDotsJson.data.splice(this.activeIndex, 1, null);
        this.showMenu = false;
      },
      //导入图片
      onImportImage(e) {
        const data = e.target.files[0];
        this.drawDotsJson.image = data.name;
        this.imageSrc = URL.createObjectURL(data);
      },
      getBase64ToBlob(blob) {
          var fileReader = new FileReader();
          fileReader.readAsDataURL(imageSrc);
          fileReader.onload = function (e) { 
            console.log(e.target.result); 
          }
      },
      getJson() {
        this.drawDotsJson.data =  this.drawDotsJson.data.filter( item => item !== null);
        const blobData = new Blob([JSON.stringify(this.drawDotsJson)], {type: 'text/json'});
        console.log(this.drawDotsJson.data)
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
      onDropStart() {
        let that = this;
        this.startPos.x = event.offsetX;
        this.startPos.y = event.offsetY;
        this.activeElement = event.target.cloneNode(true);
        this.offsetX = event.target.clientWidth;
        this.offsetY = event.target.clientHeight;
        this.drawDotsJson.data.push({node: this.activeElement.innerHTML, position:{}}) 
        this.activeElement.setAttribute('data-index', this.drawDotsJson.data.length-1)
        this.activeElement.addEventListener('click', addActive)
        let i = that.drawDotsJson.data.length-1;
        this.activeElement.addEventListener('contextmenu', eventFunction(i, this.activeElement))
        function eventFunction(i, dom) {
          return function() {
            that.onShowMenu(that.drawDotsJson.data[i].position, i, dom);
          }
        }
        function addActive() {
          if(!!document.getElementsByClassName('active')[0]) {
                document.getElementsByClassName('active')[0].classList.remove('active'); 
            }
          this.classList.add('active');
        }
      },
      preventDefault() {
          event.preventDefault();
      },
      ondropEnd() {
        let that = this;
        this.$refs.drawDotsImage.appendChild(this.activeElement);
        this.position.x = event.x - this.startPos.x - 220 + this.offsetX/2;
        this.position.y = event.y - this.startPos.y - 35 + this.offsetY/2;
        this.activeElement.style.marginLeft = -this.offsetX/2 + 'px';
        this.activeElement.style.marginTop = -this.offsetY/2 + 'px';
        this.activeElement.style.position = "absolute";
        this.activeElement.style.left = this.position.x + 'px';
        this.activeElement.style.top = this.position.y + 'px';
        let index = this.activeElement.getAttribute('data-index')*1;
        if(this.drawDotsJson.width == this.$refs.drawDotsImage.clientWidth) {
          this.drawDotsJson.data[index].position.x = this.position.x;
          this.drawDotsJson.data[index].position.y = this.position.y;
        }else{
          this.drawDotsJson.data[index].position.x = this.position.x * this.drawDotsJson.width/this.$refs.drawDotsImage.clientWidth;
          this.drawDotsJson.data[index].position.y = this.position.y * this.drawDotsJson.height/this.$refs.drawDotsImage.clientHeight;
        }
      },
      onStart() {
          this.activeElement = event.target;
          this.startPos.x = event.offsetX;
          this.startPos.y = event.offsetY;
          this.offsetX = event.target.clientWidth;
          this.offsetY = event.target.clientHeight;
      },
      onPreviw(type) {
        this.drawDotsJson.image = this.imageSrc;
        this.drawDotsJson.data =  this.drawDotsJson.data.filter( item => item !== null);
        this.$store.commit('setDotsData', this.drawDotsJson);
        this.$router.push({name: 'Preview', params: {show: type}});
      },
      initDots() {
        let that = this;
        this.showMenu = false;
        this.$refs.drawDotsImage.innerHTML = ''
        console.log(this.drawDotsJson.data)
        this.drawDotsJson.data.forEach((element, i) => {
          if(element !== null) {
            let dom = new DOMParser().parseFromString(element.node,'text/html').body.childNodes[0]
            let dragElement = document.createElement('ol');
            dragElement.setAttribute('draggable', true)
            dragElement.setAttribute('data-index', i)
            dragElement.appendChild(dom);
            dragElement.addEventListener('contextmenu', eventFunction)
            function eventFunction() {
              that.onShowMenu(element.position, i, dragElement);
            }
            this.$refs.drawDotsImage.appendChild(dragElement);
            dragElement.style.position = "absolute";
            dragElement.style.left = element.position.x * this.$refs.drawDotsImage.clientWidth/this.drawDotsJson.width + 'px';
            dragElement.style.top = element.position.y * this.$refs.drawDotsImage.clientHeight/this.drawDotsJson.height + 'px';
            dragElement.style.marginLeft = -dom.clientWidth/2 + 'px';
            dragElement.style.marginTop = -dom.clientHeight/2 + 'px';
            dragElement.style.width = dom.clientWidth + 'px';
            dragElement.style.height = dom.clientHeight + 'px'; 
          }
        })
      }
    },
    mounted() {
      this.initIcon();
      if(this.$store.state.dotsData !== null) {
        this.drawDotsJson = this.$store.state.dotsData;
        this.imageSrc = this.drawDotsJson.image
        this.$nextTick(() => {
          this.initDots();
        })
      }else {
        this.drawDotsJson.width = this.$refs.drawDotsImage.clientWidth;
        this.drawDotsJson.height = this.$refs.drawDotsImage.clientHeight;
      }
      window.onresize = () => {
        this.initDots()
      }
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
      width: calc(100% / 3);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      box-sizing: border-box;
    }
    .dots-item {
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
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
      .no-image, #draw-dots-image {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .dot-list-wrap {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
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
      .light {
      width: 50px;
      height: 50px;
      position: relative;
    }
    .outer-wrap {
      width: 100%;
      height: 100%;
      background: radial-gradient(#eee, orange);
      border-radius: 50%;
      animation: light 2s linear infinite;
    }
    .inner-wrap {
      width: 15px;
      height: 15px;
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(#eee, orange);
    }
    @keyframes light {
      0% {
        transform: scale(0);
        opacity: 1;
      }50% {
        transform: scale(0.75);
        opacity: 0.5;
      }100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }
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
