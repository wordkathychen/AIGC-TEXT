<template>
  <div>
    <n-card title="用户管理" :bordered="false" class="proCard">
      <n-alert title="提示" type="info" :show-icon="true" class="mb-4">
        在此页面可以管理论文生成系统的用户，包括基本信息、会员等级、额度管理等。
      </n-alert>
      
      <div class="flex justify-between mb-4">
        <n-space>
          <n-input v-model:value="searchText" placeholder="搜索用户名/邮箱/手机号">
            <template #prefix>
              <n-icon><search-outlined /></n-icon>
            </template>
          </n-input>
          <n-select
            v-model:value="searchStatus"
            :options="statusOptions"
            placeholder="选择状态"
            style="width: 120px"
            clearable
          />
          <n-select
            v-model:value="searchLevel"
            :options="levelOptions"
            placeholder="选择会员等级"
            style="width: 140px"
            clearable
          />
          <n-button type="primary" @click="handleSearch">
            <template #icon>
              <n-icon><search-outlined /></n-icon>
            </template>
            搜索
          </n-button>
          <n-button @click="resetSearch">
            <template #icon>
              <n-icon><reload-outlined /></n-icon>
            </template>
            重置
          </n-button>
        </n-space>
        
        <n-button type="primary" @click="handleAddUser">
          <template #icon>
            <n-icon><user-add-outlined /></n-icon>
          </template>
          新增用户
        </n-button>
      </div>
      
      <n-data-table
        ref="table"
        :columns="columns"
        :data="userData"
        :loading="loading"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="handlePageChange"
      />
      
      <!-- 用户详情抽屉 -->
      <n-drawer
        v-model:show="showUserDetail"
        :width="500"
        :placement="'right'"
        :mask-closable="true"
        :title="drawerTitle"
      >
        <n-tabs type="line" animated>
          <n-tab-pane name="basic" tab="基本信息">
            <n-form
              ref="userFormRef"
              :model="userForm"
              :rules="userRules"
              label-placement="left"
              :label-width="100"
            >
              <n-form-item label="用户名" path="username">
                <n-input v-model:value="userForm.username" placeholder="用户登录名" />
              </n-form-item>
              
              <n-form-item label="姓名" path="realName">
                <n-input v-model:value="userForm.realName" placeholder="用户真实姓名" />
              </n-form-item>
              
              <n-form-item label="手机号码" path="phone">
                <n-input v-model:value="userForm.phone" placeholder="手机号码" />
              </n-form-item>
              
              <n-form-item label="邮箱" path="email">
                <n-input v-model:value="userForm.email" placeholder="电子邮箱" />
              </n-form-item>
              
              <n-form-item label="会员等级" path="level">
                <n-select
                  v-model:value="userForm.level"
                  :options="levelOptions"
                  placeholder="选择会员等级"
                />
              </n-form-item>
              
              <n-form-item label="账号状态" path="status">
                <n-radio-group v-model:value="userForm.status">
                  <n-space>
                    <n-radio :value="1">
                      启用
                    </n-radio>
                    <n-radio :value="0">
                      禁用
                    </n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>
              
              <n-form-item v-if="!userForm.id" label="密码" path="password">
                <n-input
                  v-model:value="userForm.password"
                  type="password"
                  placeholder="登录密码"
                  show-password-on="click"
                />
              </n-form-item>
              
              <n-form-item label="注册时间">
                <span>{{ userForm.registerTime || '---' }}</span>
              </n-form-item>
              
              <n-form-item label="最后登录">
                <span>{{ userForm.lastLoginTime || '---' }}</span>
              </n-form-item>
            </n-form>
            
            <n-divider />
            
            <n-space justify="end">
              <n-button @click="showUserDetail = false">取消</n-button>
              <n-button type="primary" @click="saveUser" :loading="saveLoading">
                保存
              </n-button>
            </n-space>
          </n-tab-pane>
          
          <n-tab-pane name="quota" tab="额度管理">
            <n-descriptions label-placement="left" bordered>
              <n-descriptions-item label="剩余生成额度">
                <span class="text-lg font-bold text-green-600">{{ userQuota.balance }}</span> 点
              </n-descriptions-item>
              <n-descriptions-item label="已用额度">
                <span>{{ userQuota.used }}</span> 点
              </n-descriptions-item>
              <n-descriptions-item label="总获得额度">
                <span>{{ userQuota.total }}</span> 点
              </n-descriptions-item>
              <n-descriptions-item label="本月生成次数">
                <span>{{ userQuota.monthCount }}</span> 次
              </n-descriptions-item>
              <n-descriptions-item label="字数限制">
                <n-tag v-if="userQuota.wordLimit > 0" type="info">
                  每次最多 {{ userQuota.wordLimit }} 字
                </n-tag>
                <n-tag v-else type="success">无限制</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="额度更新时间">
                <span>{{ userQuota.updateTime || '---' }}</span>
              </n-descriptions-item>
            </n-descriptions>
            
            <n-divider>调整额度</n-divider>
            
            <n-form
              ref="quotaFormRef"
              :model="quotaForm"
              label-placement="left"
              :label-width="100"
            >
              <n-form-item label="调整类型" path="type">
                <n-radio-group v-model:value="quotaForm.type">
                  <n-space>
                    <n-radio :value="'add'">
                      充值增加
                    </n-radio>
                    <n-radio :value="'deduct'">
                      扣除
                    </n-radio>
                    <n-radio :value="'set'">
                      设置为
                    </n-radio>
                  </n-space>
                </n-radio-group>
              </n-form-item>
              
              <n-form-item label="额度值" path="amount">
                <n-input-number
                  v-model:value="quotaForm.amount"
                  :min="1"
                  placeholder="额度数量"
                />
              </n-form-item>
              
              <n-form-item label="调整原因" path="reason">
                <n-input
                  v-model:value="quotaForm.reason"
                  type="textarea"
                  placeholder="请输入调整原因"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                />
              </n-form-item>
            </n-form>
            
            <n-divider />
            
            <n-space justify="end">
              <n-button type="primary" @click="saveQuota" :loading="quotaSaving">
                提交调整
              </n-button>
            </n-space>
            
            <n-divider>额度记录</n-divider>
            
            <n-data-table
              :columns="quotaColumns"
              :data="quotaRecords"
              :pagination="quotaPagination"
              :bordered="false"
              size="small"
            />
          </n-tab-pane>
          
          <n-tab-pane name="paper" tab="论文记录">
            <n-data-table
              :columns="paperColumns"
              :data="userPapers"
              :pagination="paperPagination"
              :bordered="false"
            />
          </n-tab-pane>
        </n-tabs>
      </n-drawer>
    </n-card>
    
    <!-- 重置密码对话框 -->
    <n-modal
      v-model:show="showResetPassword"
      title="重置密码"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmResetPassword"
    >
      <n-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-placement="left"
        :label-width="80"
      >
        <n-form-item label="新密码" path="password">
          <n-input
            v-model:value="passwordForm.password"
            type="password"
            show-password-on="click"
            placeholder="请输入新密码"
          />
        </n-form-item>
        <n-form-item label="确认密码" path="confirmPassword">
          <n-input
            v-model:value="passwordForm.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入新密码"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, h, onMounted } from 'vue';
import { 
  UserAddOutlined, UserOutlined, SearchOutlined, ReloadOutlined, 
  EditOutlined, DeleteOutlined, KeyOutlined, BlockOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from '@vicons/antd';
import { useMessage } from 'naive-ui';
import type { FormInst, DataTableColumns } from 'naive-ui';

export default defineComponent({
  name: 'UserManagement',
  components: {
    UserAddOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    KeyOutlined,
    BlockOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
  },
  setup() {
    const message = useMessage();
    const table = ref(null);
    const userFormRef = ref<FormInst | null>(null);
    const quotaFormRef = ref<FormInst | null>(null);
    const passwordFormRef = ref<FormInst | null>(null);
    
    // 加载和保存状态
    const loading = ref(false);
    const saveLoading = ref(false);
    const quotaSaving = ref(false);
    
    // 显示控制
    const showUserDetail = ref(false);
    const showResetPassword = ref(false);
    
    // 标题
    const drawerTitle = ref('用户详情');
    
    // 搜索
    const searchText = ref('');
    const searchStatus = ref(null);
    const searchLevel = ref(null);
    
    // 状态选项
    const statusOptions = [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ];
    
    // 会员等级选项
    const levelOptions = [
      { label: '普通会员', value: 'normal' },
      { label: '高级会员', value: 'premium' },
      { label: 'VIP会员', value: 'vip' },
      { label: '超级VIP', value: 'svip' }
    ];
    
    // 用户表单
    const userForm = reactive({
      id: '',
      username: '',
      realName: '',
      phone: '',
      email: '',
      level: 'normal',
      status: 1,
      password: '',
      registerTime: '',
      lastLoginTime: ''
    });
    
    // 用户额度信息
    const userQuota = reactive({
      balance: 0,
      used: 0, 
      total: 0,
      monthCount: 0,
      wordLimit: 5000,
      updateTime: ''
    });
    
    // 额度表单
    const quotaForm = reactive({
      type: 'add',
      amount: 100,
      reason: ''
    });
    
    // 密码表单
    const passwordForm = reactive({
      userId: '',
      password: '',
      confirmPassword: ''
    });
    
    // 用户表单验证规则
    const userRules = {
      username: {
        required: true,
        message: '请输入用户名',
        trigger: 'blur'
      },
      realName: {
        required: true,
        message: '请输入真实姓名',
        trigger: 'blur'
      },
      phone: {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      },
      email: {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: 'blur'
      },
      password: {
        required: true,
        message: '请输入密码',
        trigger: 'blur'
      }
    };
    
    // 密码表单验证规则
    const passwordRules = {
      password: {
        required: true,
        message: '请输入密码',
        trigger: 'blur'
      },
      confirmPassword: {
        required: true,
        message: '请确认密码',
        validator: (rule, value) => {
          if (value !== passwordForm.password) {
            return new Error('两次输入的密码不一致');
          }
          return true;
        },
        trigger: 'blur'
      }
    };
    
    // 分页
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      itemCount: 0,
      pageSizes: [10, 20, 30, 50]
    });
    
    // 额度记录分页
    const quotaPagination = reactive({
      page: 1,
      pageSize: 5,
      itemCount: 0,
      pageSizes: [5, 10, 15]
    });
    
    // 论文记录分页
    const paperPagination = reactive({
      page: 1,
      pageSize: 5,
      itemCount: 0,
      pageSizes: [5, 10, 15]
    });
    
    // 用户数据
    const userData = ref([
      {
        id: '1',
        username: 'user001',
        realName: '张三',
        phone: '13800138000',
        email: 'user001@example.com',
        level: 'normal',
        status: 1,
        balance: 2000,
        registerTime: '2023-02-15 10:25:36',
        lastLoginTime: '2023-06-12 14:05:22'
      },
      {
        id: '2',
        username: 'user002',
        realName: '李四',
        phone: '13800138001',
        email: 'user002@example.com',
        level: 'premium',
        status: 1,
        balance: 5000,
        registerTime: '2023-03-22 15:45:30',
        lastLoginTime: '2023-06-13 09:15:14'
      },
      {
        id: '3',
        username: 'user003',
        realName: '王五',
        phone: '13800138002',
        email: 'user003@example.com',
        level: 'vip',
        status: 1,
        balance: 8500,
        registerTime: '2023-04-05 09:10:20',
        lastLoginTime: '2023-06-14 16:30:45'
      },
      {
        id: '4',
        username: 'user004',
        realName: '赵六',
        phone: '13800138003',
        email: 'user004@example.com',
        level: 'svip',
        status: 0,
        balance: 15000,
        registerTime: '2023-01-10 14:20:15',
        lastLoginTime: '2023-05-20 11:05:38'
      }
    ]);
    
    // 额度记录数据
    const quotaRecords = ref([
      {
        id: '1',
        type: 'add',
        amount: 2000,
        balance: 2000,
        reason: '初始充值',
        operator: 'admin',
        createTime: '2023-02-15 10:25:36'
      },
      {
        id: '2',
        type: 'deduct',
        amount: 200,
        balance: 1800,
        reason: '生成论文消耗',
        operator: 'system',
        createTime: '2023-03-10 14:35:22'
      },
      {
        id: '3',
        type: 'add',
        amount: 500,
        balance: 2300,
        reason: '活动奖励',
        operator: 'admin',
        createTime: '2023-04-05 09:15:40'
      },
      {
        id: '4',
        type: 'deduct',
        amount: 300,
        balance: 2000,
        reason: '生成论文消耗',
        operator: 'system',
        createTime: '2023-04-25 11:25:18'
      }
    ]);
    
    // 论文记录数据
    const userPapers = ref([
      {
        id: '1',
        title: '人工智能在自然语言处理中的应用研究',
        wordCount: 5800,
        quotaCost: 200,
        status: 'completed',
        createTime: '2023-03-10 14:35:22'
      },
      {
        id: '2',
        title: '虚拟现实技术在教育领域的应用前景',
        wordCount: 8500,
        quotaCost: 300,
        status: 'completed',
        createTime: '2023-04-25 11:25:18'
      }
    ]);
    
    // 用户表格列
    const columns: DataTableColumns = [
      {
        title: '用户ID',
        key: 'id',
        width: 80
      },
      {
        title: '用户名',
        key: 'username'
      },
      {
        title: '姓名',
        key: 'realName'
      },
      {
        title: '手机号',
        key: 'phone',
        width: 120
      },
      {
        title: '邮箱',
        key: 'email',
        width: 180
      },
      {
        title: '会员等级',
        key: 'level',
        width: 100,
        render(row) {
          const levelMap = {
            normal: { type: 'default', text: '普通会员' },
            premium: { type: 'info', text: '高级会员' },
            vip: { type: 'success', text: 'VIP会员' },
            svip: { type: 'warning', text: '超级VIP' }
          };
          const level = levelMap[row.level] || levelMap.normal;
          return h('n-tag', { type: level.type }, { default: () => level.text });
        }
      },
      {
        title: '剩余额度',
        key: 'balance',
        width: 100
      },
      {
        title: '状态',
        key: 'status',
        width: 80,
        render(row) {
          return row.status === 1
            ? h('n-tag', { type: 'success' }, { default: () => '启用' })
            : h('n-tag', { type: 'error' }, { default: () => '禁用' });
        }
      },
      {
        title: '注册时间',
        key: 'registerTime',
        width: 180
      },
      {
        title: '操作',
        key: 'actions',
        width: 250,
        fixed: 'right',
        render(row) {
          return h('div', { class: 'flex gap-2' }, [
            h(
              'n-button',
              {
                size: 'small',
                type: 'info',
                secondary: true,
                onClick: () => handleViewUser(row)
              },
              { default: () => '详情', icon: () => h(UserOutlined) }
            ),
            h(
              'n-button',
              {
                size: 'small',
                type: 'primary',
                secondary: true,
                onClick: () => handleEditUser(row)
              },
              { default: () => '编辑', icon: () => h(EditOutlined) }
            ),
            h(
              'n-button',
              {
                size: 'small',
                type: 'warning',
                secondary: true,
                onClick: () => handleResetPassword(row)
              },
              { default: () => '重置密码', icon: () => h(KeyOutlined) }
            ),
            row.status === 1
              ? h(
                  'n-button',
                  {
                    size: 'small',
                    type: 'error',
                    secondary: true,
                    onClick: () => handleToggleStatus(row)
                  },
                  { default: () => '禁用', icon: () => h(BlockOutlined) }
                )
              : h(
                  'n-button',
                  {
                    size: 'small',
                    type: 'success',
                    secondary: true,
                    onClick: () => handleToggleStatus(row)
                  },
                  { default: () => '启用', icon: () => h(CheckCircleOutlined) }
                )
          ]);
        }
      }
    ];
    
    // 额度记录表格列
    const quotaColumns = [
      {
        title: '类型',
        key: 'type',
        render(row) {
          const typeMap = {
            add: { type: 'success', text: '充值' },
            deduct: { type: 'error', text: '扣除' },
            set: { type: 'info', text: '设置' }
          };
          const type = typeMap[row.type] || typeMap.add;
          return h('n-tag', { type: type.type, size: 'small' }, { default: () => type.text });
        }
      },
      {
        title: '数量',
        key: 'amount',
        render(row) {
          const prefix = row.type === 'add' ? '+' : row.type === 'deduct' ? '-' : '';
          const className = row.type === 'add' 
            ? 'text-green-600' 
            : row.type === 'deduct' 
              ? 'text-red-600' 
              : 'text-blue-600';
          return h('span', { class: className }, `${prefix}${row.amount}`);
        }
      },
      {
        title: '余额',
        key: 'balance'
      },
      {
        title: '原因',
        key: 'reason'
      },
      {
        title: '操作人',
        key: 'operator'
      },
      {
        title: '时间',
        key: 'createTime'
      }
    ];
    
    // 论文记录表格列
    const paperColumns = [
      {
        title: '论文标题',
        key: 'title'
      },
      {
        title: '字数',
        key: 'wordCount'
      },
      {
        title: '消耗额度',
        key: 'quotaCost'
      },
      {
        title: '状态',
        key: 'status',
        render(row) {
          const statusMap = {
            completed: { type: 'success', text: '已完成' },
            generating: { type: 'info', text: '生成中' },
            failed: { type: 'error', text: '失败' }
          };
          const status = statusMap[row.status] || statusMap.completed;
          return h('n-tag', { type: status.type }, { default: () => status.text });
        }
      },
      {
        title: '生成时间',
        key: 'createTime'
      }
    ];
    
    // 查看用户详情
    const handleViewUser = (row) => {
      drawerTitle.value = '用户详情';
      Object.assign(userForm, row);
      loadUserQuota(row.id);
      loadQuotaRecords(row.id);
      loadUserPapers(row.id);
      showUserDetail.value = true;
    };
    
    // 编辑用户
    const handleEditUser = (row) => {
      drawerTitle.value = '编辑用户';
      Object.assign(userForm, row);
      loadUserQuota(row.id);
      loadQuotaRecords(row.id);
      loadUserPapers(row.id);
      showUserDetail.value = true;
    };
    
    // 新增用户
    const handleAddUser = () => {
      drawerTitle.value = '新增用户';
      Object.assign(userForm, {
        id: '',
        username: '',
        realName: '',
        phone: '',
        email: '',
        level: 'normal',
        status: 1,
        password: '',
        registerTime: '',
        lastLoginTime: ''
      });
      showUserDetail.value = true;
    };
    
    // 重置密码
    const handleResetPassword = (row) => {
      passwordForm.userId = row.id;
      passwordForm.password = '';
      passwordForm.confirmPassword = '';
      showResetPassword.value = true;
    };
    
    // 确认重置密码
    const confirmResetPassword = () => {
      passwordFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        message.success('密码重置成功');
        showResetPassword.value = false;
      });
    };
    
    // 切换用户状态
    const handleToggleStatus = (row) => {
      const newStatus = row.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? '启用' : '禁用';
      
      // 模拟API调用
      setTimeout(() => {
        const user = userData.value.find(u => u.id === row.id);
        if (user) {
          user.status = newStatus;
          message.success(`已${action}用户: ${user.username}`);
        }
      }, 500);
    };
    
    // 保存用户
    const saveUser = () => {
      userFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        saveLoading.value = true;
        
        try {
          // 模拟API调用
          setTimeout(() => {
            if (userForm.id) {
              // 更新现有用户
              const userIndex = userData.value.findIndex(u => u.id === userForm.id);
              if (userIndex !== -1) {
                userData.value[userIndex] = { ...userData.value[userIndex], ...userForm };
                message.success('用户信息更新成功');
              }
            } else {
              // 添加新用户
              const newUser = {
                ...userForm,
                id: String(userData.value.length + 1),
                balance: 0,
                registerTime: new Date().toLocaleString(),
                lastLoginTime: ''
              };
              userData.value.push(newUser);
              message.success('用户添加成功');
            }
            
            showUserDetail.value = false;
            saveLoading.value = false;
          }, 1000);
        } catch (error) {
          message.error('保存用户信息出错');
          saveLoading.value = false;
        }
      });
    };
    
    // 保存额度调整
    const saveQuota = () => {
      quotaFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        quotaSaving.value = true;
        
        try {
          // 模拟API调用
          setTimeout(() => {
            const user = userData.value.find(u => u.id === userForm.id);
            if (user) {
              let newBalance = user.balance;
              
              if (quotaForm.type === 'add') {
                newBalance += quotaForm.amount;
              } else if (quotaForm.type === 'deduct') {
                newBalance = Math.max(0, newBalance - quotaForm.amount);
              } else if (quotaForm.type === 'set') {
                newBalance = quotaForm.amount;
              }
              
              // 更新用户额度
              user.balance = newBalance;
              userQuota.balance = newBalance;
              
              // 添加额度记录
              const newRecord = {
                id: String(Date.now()),
                type: quotaForm.type,
                amount: quotaForm.amount,
                balance: newBalance,
                reason: quotaForm.reason || '管理员调整',
                operator: 'admin',
                createTime: new Date().toLocaleString()
              };
              quotaRecords.value.unshift(newRecord);
              
              message.success('额度调整成功');
              
              // 重置表单
              quotaForm.amount = 100;
              quotaForm.reason = '';
            }
            
            quotaSaving.value = false;
          }, 1000);
        } catch (error) {
          message.error('额度调整出错');
          quotaSaving.value = false;
        }
      });
    };
    
    // 加载用户额度信息
    const loadUserQuota = (userId) => {
      // 模拟API调用
      const user = userData.value.find(u => u.id === userId);
      if (user) {
        userQuota.balance = user.balance;
        userQuota.used = 5000;
        userQuota.total = user.balance + 5000;
        userQuota.monthCount = 25;
        userQuota.wordLimit = user.level === 'svip' ? 0 : (
          user.level === 'vip' ? 10000 :
          user.level === 'premium' ? 8000 : 5000
        );
        userQuota.updateTime = new Date().toLocaleString();
      }
    };
    
    // 加载额度记录
    const loadQuotaRecords = (userId) => {
      // 实际应用中应该调用API加载指定用户的额度记录
      // 这里仅作模拟
    };
    
    // 加载用户论文记录
    const loadUserPapers = (userId) => {
      // 实际应用中应该调用API加载指定用户的论文记录
      // 这里仅作模拟
    };
    
    // 搜索用户
    const handleSearch = () => {
      loading.value = true;
      
      // 模拟搜索
      setTimeout(() => {
        loading.value = false;
      }, 500);
    };
    
    // 重置搜索
    const resetSearch = () => {
      searchText.value = '';
      searchStatus.value = null;
      searchLevel.value = null;
      handleSearch();
    };
    
    // 分页变化
    const handlePageChange = (page) => {
      pagination.page = page;
      loadData();
    };
    
    // 加载用户数据
    const loadData = () => {
      loading.value = true;
      
      // 模拟API调用
      setTimeout(() => {
        pagination.itemCount = userData.value.length;
        loading.value = false;
      }, 500);
    };
    
    onMounted(() => {
      loadData();
    });
    
    return {
      table,
      userFormRef,
      quotaFormRef,
      passwordFormRef,
      drawerTitle,
      searchText,
      searchStatus,
      searchLevel,
      statusOptions,
      levelOptions,
      loading,
      saveLoading,
      quotaSaving,
      showUserDetail,
      showResetPassword,
      userForm,
      userQuota,
      quotaForm,
      passwordForm,
      userRules,
      passwordRules,
      pagination,
      quotaPagination,
      paperPagination,
      userData,
      quotaRecords,
      userPapers,
      columns,
      quotaColumns,
      paperColumns,
      handleViewUser,
      handleEditUser,
      handleAddUser,
      handleResetPassword,
      confirmResetPassword,
      handleToggleStatus,
      saveUser,
      saveQuota,
      handleSearch,
      resetSearch,
      handlePageChange
    };
  }
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.text-lg {
  font-size: 18px;
}

.font-bold {
  font-weight: bold;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.text-blue-600 {
  color: #2563eb;
}
</style> 