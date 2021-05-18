<template>
  <el-card class="box-card" :body-style="{ padding: '15px' }">
    <div class="tool-bar">
      <el-button style="padding: 2px 0" type="text" @click="load"
        >导入</el-button
      >
    </div>
    <div class="editor-container">
      <div ref="monacoEditor" :style="{ height: height + 'px' }"></div>
    </div>
  </el-card>
</template>

<script>
import * as monaco from "monaco-editor";
export default {
  name: "MonacoEditor",
  props: {
    height: {
      type: Number,
      default: 100,
    },
  },
  data: () => {
    return {
      monacoEditor: null,
      nowMarks: [],
      model: null,
      theme:'vs',
      code: "int main(void)\n{\n    printf(\"Hello world!\");\n}\n",
    };
  },
  methods: {
    getValue() {
      return this.monacoEditor.getValue();
    },
    setValue(value) {
      this.monacoEditor.setValue(value);
    },
    markContents(startLineNumber, startColNumber, endLineNumber, endColNumber) {
      this.nowMarks = this.monacoEditor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(
              startLineNumber,
              startColNumber,
              endLineNumber,
              endColNumber
            ),
            options: {
              className: "MarkClass",
            },
          },
        ]
      );
    },
    unmarkContents() {
      this.monacoEditor.deltaDecorations(this.nowMarks, []);
    },
    load() {
      window.ipcRenderer.send("loadc");
    },
  },
  mounted() {
    this.model = monaco.editor.createModel(this.code, "c");
    // monaco.editor.setTheme("vs-light");
    this.monacoEditor = monaco.editor.create(this.$refs.monacoEditor, {
      value: "",
      language: "c",
      fontSize: 16,
      lineNumbers: "on",
      scrollBeyondLastLine: true,
      readOnly: false,
      automaticLayout: true, // 自适应布局
      model: this.model,
    });
    monaco.editor.setTheme("vs-dark");

    this.$Bus.$on("high-light", (loc) => {
      this.unmarkContents();
      this.markContents(
        loc.start.line,
        loc.start.col,
        loc.end.line,
        loc.end.col
      );
    });
    this.$Bus.$on("light-cancel", () => {
      this.unmarkContents();
    });
    this.$Bus.$on("new-error", (data) => {
      monaco.editor.setModelMarkers(this.model, "c", [
        {
          startLineNumber: data.loc.start.line,
          endLineNumber: data.loc.end.line,
          startColumn: data.loc.start.col,
          endColumn: data.loc.end.col,
          severity: monaco.MarkerSeverity.Error,
          message: data.msg,
        },
      ]);
    });
    this.$Bus.$on("clear-error", () => {
      monaco.editor.setModelMarkers(this.model, "c", []);
    });
    this.$Bus.$on("clear", () => {
      this.monacoEditor.setValue("");
    });
    window.ipcRenderer.on("read-success", (event, data) => {
      this.setValue(data);
    });
    window.ipcRenderer.on("read-failed", (event, data) => {
      this.$message({ msg: "读取失败！", type: "error" });
    });
  },
};
</script>

<style scoped>
.MarkClass {
  background-color: #ddec99;
}

.box-card {
  height: 100%;
}

.tool-bar {
  padding: 8.5px;
}

/* .el-card__header{
  padding: 9px 20px!important;
} */
</style>