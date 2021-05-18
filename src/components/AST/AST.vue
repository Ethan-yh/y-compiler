<template>
  <div>
    <div id="option" :style="{ height: height - 20 + 'px' }"></div>
    <!-- <div v-show="!hasData" :style="{height:height-30-40+'px'}">
    <div :style="{'line-height':height-30-40+'px','text-align':'center','font-size':'14px','color':'#909399'}">暂无数据</div>
  </div> -->
  </div>
</template>

<script>
import { mount } from "./object-visualizer.esm.min.js";

export default {
  name: "AST",
  props: {
    height: {
      type: Number,
      default: 390,
    },
  },
  data: () => {
    return {
      treeData: { status: "暂无数据" },
      hasData: true,
    };
  },
  methods: {
    refreshAst() {
      const el = document.getElementById("option");
      var AST = this.treeData;
      var self = this;
      var option = {
        rootName: "Program",
        expandOnCreatedAndUpdated(path) {
          if (path.length === 0) {
            return true;
          }
          return false;
        },
        getKeys(object, path) {
          return Object.keys(object).filter(
            (key) => key.startsWith("_private") === false
          );
        },
        //需要传入的函数, mouseEnter鼠标移入结点名的时候, mouseOut鼠标移出结点名的时候
        mouseEnter(data) {
          console.log(data);
          if (data.loc) {
            self.$Bus.$emit("high-light", data.loc);
          }
        },
        mouseOut(data) {
          if (data.loc) {
            self.$Bus.$emit("light-cancel");
          }
        },
      };
      mount(AST, el, option);
    },
  },
  mounted() {
    this.refreshAst();
    this.$Bus.$on("new-parse", (result) => {
      this.hasData = true;
      if (result.isSucc) {
        this.treeData = result.synResult.ast;
      } else {
        this.treeData = {};
      }
      this.refreshAst();
    });
    this.$Bus.$on("clear", () => {
      this.hasData = false;
      this.treeData = {};
      this.refreshAst();
    });
  },
};
</script>

<style>
.object-visualizer {
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  padding: 10px;
  font-family: Menlo;
  font-size: 0.8rem;
  line-height: 2;
  background-color: hsl(0, 23%, 94%);
  height: 100%;
  overflow-y: auto;
}

.array > .value,
.object > .value {
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
}

.key {
  color: hsl(300, 60%, 65%);
  user-select: none;
}

.string > .value {
  color: hsl(15, 100%, 70%);
}

.boolean > .value,
.number > .value {
  color: hsl(250, 70%, 65%);
}

.null > .value,
.undefined > .value {
  color: hsl(0, 0%, 40%);
}

.separator {
  cursor: pointer;
  font-size: 0.8rem;
  user-select: none;
  color: hsl(0, 0%, 80%);
}

.indicator {
  cursor: pointer;
  font-size: 0.8rem;
  padding-right: 0.3rem;
  user-select: none;
  vertical-align: text-bottom;
  color: hsl(0, 0%, 50%);
}

.array > .key,
.object > .key {
  cursor: pointer;
}

.value > .array,
.value > .object {
  position: relative;
  left: -0.8rem;
}

.count,
.preview,
.quotes {
  cursor: pointer;
  font-size: 0.8rem;
  user-select: none;
  color: hsl(0, 0%, 80%);
}
</style>