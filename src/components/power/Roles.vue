<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addtDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染一级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoles(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-deleteh"
              size="mini"
              @click="removeRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addtDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="editRolesForm"
        :rules="editRolesRules"
        ref="editRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色ID">
          <el-input v-model="editRolesForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      roleList: [],

      // (添加角色) : 控制dialog的显示与隐藏
      addtDialogVisible: false,
      // (添加角色) : dialog中的表单数据
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      // (添加角色) : dialog的校验规则
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 1,
            max: 6,
            message: "用户名的长度在1~6个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },

      // (编辑角色) : 控制dialog的显示与隐藏
      editDialogVisible: false,
      // (编辑角色) : dialog中的表单数据
      editRolesForm: {},
      // (编辑角色) : dialog的校验规则
      editRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 1,
            max: 6,
            message: "用户名的长度在1~6个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },

      // (分配权限) : 控制分配权限对话框的显示与隐藏
      showSetRightDialogVisible: false,
      // (分配权限) : 分配权限列表
      rightsList: [],
      // (分配权限) : 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // (分配权限) : 默认选中的节点Id值数组
      defKeys: [],
      // (分配权限) ： 当前即将分配权限的id
      roleId: "",
    };
  },
  created() {
    // (请求相关) : 发起角色列表数据的请求
    this.getRolesList();
  },
  methods: {
    // (请求相关) : 发送角色列表数据的请求
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }

      this.roleList = res.data;
      // console.log(this.roleList);
    },

    // (添加角色) : 点击确定时预校验 + 提交编辑请求并同步信息
    addRoles() {
      this.$refs.addRolesRef.validate(async (valid) => {
        if (!valid) return;

        // 发起添加角色的请求
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        // console.log(res);

        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }

        // 刷新角色列表
        this.getRolesList();
        // 隐藏对话框
        this.addtDialogVisible = false;
        // 提示添加用户成功
        this.$message.success("添加角色成功！");
      });
    },
    // (添加角色) : dialog关闭时重置表单
    addDialogClosed() {
      this.$refs.addRolesRef.resetFields();
    },

    // (编辑角色) : 点击显示编辑角色dialog
    async showEditRoles(id) {
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败");
      }
      // 成功时则将获取到的角色信息保存起来
      this.editRolesForm = res.data;
      this.editDialogVisible = true;
    },
    // (编辑角色) : 点击确定时预校验 + 提交编辑请求并同步信息
    editRoles() {
      // ① 预校验
      this.$refs.editRolesRef.validate(async (valid) => {
        if (!valid) return;

        // ② 提交 编辑角色信息的请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );

        // ③ 判断 提交请求成功/失败
        if (res.meta.status !== 200) {
          return this.$message.error("编辑角色失败！");
        }
        // ④ 同步信息
        this.getRolesList();
        // ⑤ 隐藏对话框
        this.editDialogVisible = false;
        // ⑥ 提示编辑成功
        this.$message.success("编辑角色成功!");
      });
    },
    // (编辑角色) : dialog关闭时重置表单
    editDialogClosed() {
      this.$refs.editRolesRef.resetFields();
    },

    // (删除角色) : 点击弹出确认框
    async removeRoles(id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 用户点击取消时
      if (confirmRes !== "confirm") {
        return this.$message.info("已取消删除！");
      }

      // 用户点击确认时 发送删除请求
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！");
      }
      // 刷新角色列表
      this.getRolesList();
      // 提示删除成功
      this.$message.success("删除角色成功！");
    },

    // (删除权限) : 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmRes = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmRes !== "confirm") {
        return this.$message.info("删除已取消！");
      }

      // 提交删除请求：
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }

      // 刷新列表
      // this.getRolesList();
      // 这里重新刷新列表会导致页面重新 加载  打开的权限列表就会自动关闭  所以这里不能直接刷新角色列表
      // 应该直接把修改后的数据赋值给scope.row.children也就是当前行的角色信息
      role.children = res.data;

      // 提示用户删除权限成功
      this.$message.success("删除权限成功！");
    },

    // (分配权限) : 显示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 在弹出对话框前要先获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("获取分配权限信息失败！");
      }

      // 把获取到的权限数据保存到data中
      this.rightsList = res.data;

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.showSetRightDialogVisible = true;
    },
    // (分配权限) ：通过递归的形式，获取角色下所有三级权限的id，并保存到 deafKeys 数组中
    getLeafKeys(node, arr) {
      // 如果包含不包含children节点 那么就是三级节点 直接将id push进数组
      if (!node.children) {
        return arr.push(node.id);
      }

      // 如果包含children节点 则为一级/二级节点 利用递归将children项再次筛选 符合条件的push到数组中
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // (分配权限) ：关闭对话框时重置defKeys
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // (分配权限) : 点击确定按钮时提交为角色分配权限请求
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      const idStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.getRolesList();
      this.showSetRightDialogVisible = false;

      // 提示用户分配权限成功
      this.$message.success("分配权限成功！");
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>