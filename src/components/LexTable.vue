<template>
  <div class="table">
    <el-table
      :data="tableData"
      stripe
      @cell-mouse-enter="mouseEnter"
      @cell-mouse-leave="mouseLeave"
      highlight-current-row
      :height="height + 'px'"
    >
      <el-table-column prop="step" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="value" label="单词值"> </el-table-column>
      <el-table-column prop="type" label="单词类型"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
// import bus from '@/utils/bus'
export default {
  name: "LexTable",
  props: ["height"],
  data: () => {
    return {
      tableData: [],
    };
  },
  methods: {
    fillLexTable(result) {
      this.tableData = [];
      result.forEach((element, index) => {
        this.tableData.push({
          step: index + 1,
          value: element.value,
          type: element.type,
          loc: element.loc,
        });
      });
    },

    mouseEnter(word) {
      this.$Bus.$emit("high-light", word.loc);
    },
    mouseLeave() {
      this.$Bus.$emit("light-cancel");
    },
  },
  mounted() {
    this.$Bus.$on("new-parse", (result) => {
      if (result.isSucc) {
        this.fillLexTable(result.synResult.words);
      } else {
        this.fillLexTable([]);
      }
    });
    this.$Bus.$on("clear", () => {
      this.fillLexTable([]);
    });
  },
};
</script>

<style scoped>
</style>
