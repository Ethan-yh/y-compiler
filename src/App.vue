<template>
  <div id="app">
    <div class="head">
      <el-button-group class="toolgroup">
        <el-button type="primary" @click="clear">清空</el-button>
        <el-button type="primary" @click="parse">编译</el-button>
        <el-button type="primary" @click="saveMidCode">导出中间代码</el-button>
        <el-button type="primary" @click="saveTargetCode"
          >导出目标代码</el-button
        >
      </el-button-group>
    </div>

    <div class="main">
      <split-pane split="vertical" :min-percent="15" :default-percent="45">
        <template slot="paneL">
          <div class="pane">
            <MonacoEditor ref="editor" :height="boxHeight" />
          </div>
        </template>
        <template slot="paneR">
          <div class="pane">
            <el-tabs type="border-card">
              <el-tab-pane label="词法结果"
                ><LexTable ref="lexTable" :height="boxHeight"
              /></el-tab-pane>
              <el-tab-pane label="语法分析树"
                ><CST :height="boxHeight"
              /></el-tab-pane>
              <el-tab-pane label="抽象语法树"
                ><AST :height="boxHeight"
              /></el-tab-pane>

              <el-tab-pane label="四元式中间代码"
                ><MidCode ref="midCode" :height="boxHeight"
              /></el-tab-pane>
              <el-tab-pane label="符号表"
                ><SymbolTable :height="hboxHeight"
              /></el-tab-pane>
              <el-tab-pane label="JavaScript代码"
                ><MonacoEditorRead ref="jsEditor" :height="boxHeight"
              /></el-tab-pane>
              <el-tab-pane label="x86目标代码"
                ><MonacoEditorRead ref="asmEditor" :height="boxHeight"
              /></el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import MonacoEditor from "./components/MonacoEditor.vue";
import Parser from "./node/parser.js";
import LexTable from "./components/LexTable.vue";
import AST from "./components/AST/AST.vue";
import MidCode from "./components/MidCode.vue";
import SymbolTable from "./components/SymbolTable.vue";
import MonacoEditorRead from "./components/MonacoEditorRead.vue";
import CST from "./components/CST/CST.vue";
import splitPane from "vue-splitpane";
// import { ipcRenderer } from "electron";
// const { ipcRenderer } = require("electron");
// const {dialog} = require('electron').remote;
// const { ipcRenderer } = window.require('electron')

export default {
  name: "App",
  data() {
    return {
      boxHeight: null,
      hboxHeight: null,
    };
  },
  components: {
    MonacoEditor,
    LexTable,
    AST,
    MidCode,
    SymbolTable,
    MonacoEditorRead,
    CST,
    splitPane,
  },
  methods: {
    parse() {
      this.$Bus.$emit("clear-error");
      const parseResult = this.parser.parse(this.$refs["editor"].getValue());
      this.$Bus.$emit("new-parse", parseResult);
      if (parseResult.isSucc) {
        this.$message({
          message: "编译成功！",
          type: "success",
        });
        this.$refs["jsEditor"].setValue(parseResult.jsCode);
        this.$refs["asmEditor"].setValue(parseResult.asmText);
      } else {
        this.$message({
          message: parseResult.err.msg,
          type: "error",
        });
        this.$Bus.$emit("new-error", parseResult.err);
        this.$refs["jsEditor"].setValue("");
        this.$refs["asmEditor"].setValue("");
      }
    },
    clear() {
      this.$Bus.$emit("clear");
    },
    saveMidCode() {
      const midCode = this.$refs["midCode"].getValue();
      // console.log(midCode);
      if (window.ipcRenderer) {
        window.ipcRenderer.send("save", {
          text: midCode,
          filter: { name: "文本文件", extensions: ["txt"] },
        });
      }
    },
    saveTargetCode() {
      if (window.ipcRenderer) {
        window.ipcRenderer.send("save", {
          text: this.$refs["asmEditor"].getValue(),
          filter: { name: "ASM", extensions: ["s"] },
        });
      }
    },
    calcHeight() {
      this.boxHeight = window.innerHeight - 60 - 20 - 40 - 30;
      this.hboxHeight = this.boxHeight / 2;
    },
  },
  mounted() {
    // 初始化语法分析器
    this.parser = new Parser();
    this.calcHeight();
    window.addEventListener("resize", () => {
      this.calcHeight();
    });
    window.ipcRenderer.on("save-failed", (event) => {
      this.$message({
        message: "保存失败!",
        type: "error",
      });
    });
    window.ipcRenderer.on("save-success", (event) => {
      this.$message({
        message: "保存成功！",
        type: "success",
      });
    });
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  background: aliceblue;
}
#app {
  height: 100%;
}
.head {
  height: 60px;
}
.main {
  position: absolute;
  top: 60px;
  bottom: 20px;
  left: 0px;
  right: 0px;
}

.toolgroup {
  /* margin: 10px; */
  padding: 10px;
  height: 40px;
}

.pane {
  margin-left: 10px;
  margin-right: 10px;
}

.el-tabs {
  height: 100%;
}
</style>
