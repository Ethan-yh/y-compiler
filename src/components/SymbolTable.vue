<template>
  <div>
    <div>
      <el-table
        :data="tablesData"
        stripe
        highlight-current-row
        @row-click="selectTable"
        :height="height + 'px'"
      >
        <el-table-column prop="name" label="name"> </el-table-column>
        <el-table-column prop="type" label="type"> </el-table-column>
        <el-table-column prop="previous" label="previous"> </el-table-column>
      </el-table>
    </div>
    <div v-if="tableTitle" style="margin: 5px auto; text-align: center">
      {{ tableTitle }}:
    </div>
    <el-table
      :data="symbolsData"
      stripe
      highlight-current-row
      :height="height + 'px'"
    >
      <el-table-column prop="name" label="name"> </el-table-column>
      <el-table-column prop="type" label="type"> </el-table-column>
      <el-table-column prop="isFormal" label="isFormal"> </el-table-column>
      <el-table-column prop="size" label="size"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "symbolTable",
  props: ["height"],
  data: () => {
    return {
      tablesData: [],
      symbolsData: [],
      treeData: [],
      symbolTableData: [],
      tableTitle: "",
    };
  },
  methods: {
    fillSymbolTable(result) {
      this.symbolTableData = result;
      const tmp = this.buildTreeTmp(-1);
      this.treeData = [];
      tmp.forEach((element) => {
        this.treeData.push(this.buildTree(element));
      });
    },
    selectTable(table) {
      console.log(table);
      this.symbolsData = table.content;
    },
  },
  mounted() {
    this.$Bus.$on("new-parse", (result) => {
      if (result.isSucc) {
        this.tablesData = result.synResult.symbolTables.content;
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
