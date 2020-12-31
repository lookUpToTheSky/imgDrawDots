<template>
  <div class='wrap'>
    <div id="draw-dots-image" v-if="drawDotsJson !== null" ref="drawDotsImage">
      <img width="100%" height="100%" draggable="false" :src="drawDotsJson.image" />
      <div id="dot-list-wrap" ref="dotListWrap"></div>
    </div>
    <el-button class="onBack" @click="$router.push('/')">退出预览</el-button>
  </div>
</template>

<script>
 export default {
   name: 'preview',
   data () {
     return {
       drawDotsJson: null
     }
   },
  methods: {
      initDots() {
          this.$refs.dotListWrap.innerHTML = ''
          this.drawDotsJson.data.forEach(element => {
          let dom = new DOMParser().parseFromString(element.node,'text/html').body.childNodes[0]
          this.$refs.dotListWrap.appendChild(dom);
          dom.style.marginLeft = -dom.clientWidth/2 + 'px';
          dom.style.marginTop = -dom.clientHeight/2 + 'px';
          dom.style.position = "absolute";
          dom.style.left = element.position.x  * this.$refs.dotListWrap.clientWidth/this.drawDotsJson.width + 'px';
          dom.style.top = element.position.y * this.$refs.dotListWrap.clientHeight/this.drawDotsJson.height + 'px';
        });
      },
      renderDots() {
        return new Promise((resovle, reject) => {
          let request = new XMLHttpRequest();
          request.open('get', './dots_2020.json');
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
    if(this.$route.params.show) {
      this.renderDots().then(res => {
        this.drawDotsJson = res
        this.$nextTick(() => {
          this.initDots();
        })
        window.onresize = () => {
          this.initDots();
        }
      })
    }else {
      this.drawDotsJson = this.$store.state.dotsData;
      this.$nextTick(() => {
        this.initDots(); 
      })
      window.onresize = () => {
        this.initDots();
      }
    }
  },
  //注销window.onresize事件
  destroyed(){
    window.onresize = null;
  }
 }
</script>

<style lang="scss" scoped>
#draw-dots-image {
  width: 100%;
  height: 100vh;
  position: relative;
  #dot-list-wrap {
    width: 100%;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
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
  }
  
}
.onBack {
  position: absolute;
  top: 20px;
  left: 40px;
  z-index: 99;
}
</style>
