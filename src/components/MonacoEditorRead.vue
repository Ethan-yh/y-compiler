<template>
  <div ref="monacoEditor" :style="{ height: height + 'px' }"></div>
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

    language: {
      type: String,
      default: "c",
    },
  },
  data: () => {
    return {
      monacoEditor: null,
      nowMarks: [],
      model: null,
      code: "//暂无数据",
    };
  },
  methods: {
    getValue() {
      return this.monacoEditor.getValue();
    },
    setValue(code) {
      this.monacoEditor.setValue(code);
    },
  },
  mounted() {
    this.model = monaco.editor.createModel(this.code, this.language);
    this.monacoEditor = monaco.editor.create(this.$refs.monacoEditor, {
      value: "",
      language: this.language,
      theme: "vs-dark",
      lineNumbers: "on",
      scrollBeyondLastLine: true,
      readOnly: true,
      automaticLayout: true, // 自适应布局
      model: this.model,
    });
    this.$Bus.$on("clear", () => {
      this.monacoEditor.setValue("//暂无数据");
    });
  },
};
</script>

<style>
.MarkClass {
  background-color: #264f78;
}
</style>