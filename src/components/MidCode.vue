<template>
  <el-table
    :data="tableData"
    stripe
    highlight-current-row
    :height="height + 'px'"
  >
    <el-table-column type="index" :index="0"> </el-table-column>
    <el-table-column prop="op" label="op" align="center"> </el-table-column>
    <el-table-column prop="arg1" label="arg1"> </el-table-column>
    <el-table-column prop="arg2" label="arg2"> </el-table-column>
    <el-table-column prop="rs" label="result"> </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "MidCode",
  props: ["height"],
  data: () => {
    return {
      tableData: [],
    };
  },
  methods: {
    fillQuaternionTable(result) {
      this.tableData = result;
    },
    getValue() {
      let text = "";
      for (let i in this.tableData) {
        text += "op: " + this.tableData[i].op + "\t";
        text += "arg1: " + this.tableData[i].arg1 + "\t";
        text += "arg2: " + this.tableData[i].arg2 + "\t";
        text += "result: " + this.tableData[i].rs + "\t";
        text += "\n";
      }
      return text;
    },
  },
  mounted() {
    this.$Bus.$on("new-parse", (result) => {
      if (result.isSucc) {
        this.tableData = result.optMidCode;
      } else {
        this.tableData = [];
      }
    });
    this.$Bus.$on("clear", () => {
      this.tableData = [];
    });
  },
};
</script>

<style>
</style>
