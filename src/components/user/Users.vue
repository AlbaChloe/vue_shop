<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChaneged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="editDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <p>当前的用户 : {{ userInfo.username }}</p>
      <p>当前的角色 : {{ userInfo.role_name }}</p>
      <p>
        分配新角色 ：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // (自定义规则 )之 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;

      if (regEmail.test(value)) {
        // value为true时 -> 合法的邮箱
        return callback();
      }

      callback(new Error("请输入合法的邮箱"));
    };

    // (自定义规则) 之 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

      // value为true时 -> 合法的手机号
      if (regMobile.test(value)) {
        return callback();
      }

      callback("请输入合法的手机号");
    };

    return {
      // (请求相关): 通过get发送请求时获取用户列表的参数对象
      queryInfo: {
        query: "",
        pagenum: 1, // 当前页数
        pagesize: 2, // 当前每页显示多少条数据
      },
      userList: [], // 用户列表数据
      total: 0, // 用户总数

      // （添加用户）: 控制dialog的显示与隐藏
      addDialogVisible: false,
      // (添加用户)： dialog中的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // (添加用户)表单： dialog中表单的验证规则
      addFormRules: {
        // username的验证规则
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }, // 自定义校验规则
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }, //自定义校验规则
        ],
      },

      // （修改用户信息）: 控制dialog的显示与隐藏
      editDialogVisible: false,
      // （修改用户信息）: dialog中查询到的用户信息
      editForm: {},
      // （修改用户信息）: dialog中表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }, // 自定义校验规则
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }, //自定义校验规则
        ],
      },

      // (分配角色) ： 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // (分配角色) : 需要被分配角色的用户信息
      userInfo: {},
      // (分配角色) : 所有角色的数据列表
      rolesList: [],
      // (分配角色) : 当前select下拉框中已选中的角色id值
      selectedRoleId: "",
    };
  },
  created() {
    // (请求相关): 发送请求
    this.getUserList();
  },
  methods: {
    // (请求相关): 请求用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // (用户列表) : 监听 switch状态 的改变
    async userStateChaneged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 这边如果状态码 ！== 200 则表示操作失败  但是我们点击了开关将他改变了 所以要重置一下 让他回到改变之前的状态  取反即可
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },

    // (添加用户) ： 点击确定按钮之后的预验证 + 添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起添加用户的网络请求  然后通过解构赋值将数据拿出来
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(res);
        // 做出判断 如状态码 ！== 201 则请求失败 提示用户添加失败
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败！");
        }

        // 重新获取用户列表数据
        this.getUserList();
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        //status === 201 时，成功 提示用户添加成功
        this.$message.success("添加用户成功！");
      });
    },
    // (添加用户) ： 对话框关闭事件的监听
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      // console.log(this.$refs.addFormRef);
    },

    // (修改用户信息) ： 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      // 成功获取时将获取到的数据存储起来
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // (修改用户信息) : 点击确定按钮之后的预验证 + 提交 同步编辑后的信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新用户列表数据
        this.getUserList();
        // 提示用户修改成功
        this.$message.success("更新用户信息成功！");
      });
    },
    // (修改用户信息) ： 对话框关闭事件的监听
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // (删除用户) ：点击弹出confirm框
    async removeUserById(id) {
      // 弹框提示用户是否删除
      // 弹框第一个参数(此操作将永久删除该用户, 是否继续?)为提示的文本信息  第二个参数(提示)为标题的文本  第三个参数为一个配置对象  用来指定确认和取消按钮的文本及前面图标的类型
      // 他的返回值是一个promise对象
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }

      // 发起请求并接收
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }
      // 刷新用户列表数据
      this.getUserList();
      // 提示删除成功
      this.$message.success("删除用户成功！");
    },

    // (分配权限) : 展示分配角色的对话框
    async setRole(userInfo) {
      // 将用户点击的当前用户的基本信息存储起来
      this.userInfo = userInfo;

      // 在展示对话框之前，获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("分配角色失败！");
      }

      // 将数据保存下来供后面提交请求时使用
      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },
    // (分配权限) : 点击按钮分配角色
    async saveRoleInfo() {
      // 如果用户有没有选择角色 如果没有选择角色 则selectedRoleId
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色！");
      }

      // 选择了角色时 发起分配角色请求
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      }

      // 刷新列表
      this.getUserList();
      // 隐藏对话框
      this.setRoleDialogVisible = false;
      // 提示用户操作成功
      this.$message.success("更新角色成功！");
    },
    // (分配权限) : 对话框关闭时重置select框
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.userInfo = [];
    },
  },
};
</script>

<style lang="less" scoped>
</style>