<template>
  <div>
    <div
      class="container"
      :style="{ height: height + 'px', overflow: 'auto' }"
    >
      <div class="col-md-10 col-md-offset-1">
        <el-row>
          <el-col>
            <div class="checkbox">
              <label>
                <input type="checkbox" v-model="horizontal" /> 排列方向
              </label>
            </div>
          </el-col>
          <el-col>
            <div class="checkbox">
              <label>
                <input
                  type="checkbox"
                  v-model="expandAll"
                  @change="expandChange"
                />
                全部展开
              </label>
            </div>
          </el-col>
          <el-col>
            <div class="form-group">
              <label class="control-label col-md-5">主题: </label>

              <select class="form-control" v-model="labelClassName">
                <option value="bg-white">white</option>
                <option value="bg-orange">orange</option>
                <option value="bg-gold">gold</option>
                <option value="bg-gray">gray</option>
                <option value="bg-lightpink">lightpink</option>
                <option value="bg-chocolate">chocolate</option>
                <option value="bg-tomato">tomato</option>
              </select>
            </div>
          </el-col>
        </el-row>
        <div class="tree-container">
          <vue2-org-tree
            name="test"
            :data="data"
            :horizontal="horizontal"
            :collapsable="collapsable"
            :label-class-name="labelClassName"
            :render-content="renderContent"
            @on-expand="onExpand"
            @on-node-click="onNodeClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["height"],

  data() {
    return {
      data: { name: "暂无数据" },
      horizontal: false,
      collapsable: true,
      expandAll: false,
      labelClassName: "bg-tomato",
    };
  },
  methods: {
    renderContent(h, data) {
      return data.name;
    },
    onExpand(e, data) {
      if ("expand" in data) {
        data.expand = !data.expand;
        if (!data.expand && data.children) {
          this.collapse(data.children);
        }
      } else {
        this.$set(data, "expand", true);
      }
    },
    onNodeClick(e, data) {
      // alert(data.label);
    },
    collapse(list) {
      var _this = this;
      list.forEach(function (child) {
        if (child.expand) {
          child.expand = false;
        }
        child.children && _this.collapse(child.children);
      });
    },
    expandChange() {
      this.toggleExpand(this.data, this.expandAll);
    },
    toggleExpand(data, val) {
      var _this = this;
      if (Array.isArray(data)) {
        data.forEach(function (item) {
          _this.$set(item, "expand", val);
          if (item.children) {
            _this.toggleExpand(item.children, val);
          }
        });
      } else {
        this.$set(data, "expand", val);
        if (data.children) {
          _this.toggleExpand(data.children, val);
        }
      }
    },
  },
  mounted() {
    this.$Bus.$on("new-parse", (result) => {
      if (result.isSucc) {
        this.data = result.synResult.cst;
      } else {
        this.data = { name: "暂无数据" };
      }
    });
    this.$Bus.$on("clear", () => {
      this.data = { name: "暂无数据" };
    });
  },
};
</script>
<style type="text/css">
.org-tree-node-label {
  white-space: nowrap;
}
.tree-container {
  text-align: center;
}
.bg-white {
  background-color: white;
}
.bg-orange {
  background-color: orange;
}
.bg-gold {
  background-color: gold;
}
.bg-gray {
  background-color: gray;
}
.bg-lightpink {
  background-color: lightpink;
}
.bg-chocolate {
  background-color: chocolate;
}
.bg-tomato {
  background-color: tomato;
  color: #fff;
}
</style>
