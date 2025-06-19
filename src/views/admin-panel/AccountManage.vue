<template>
  <div>
    <n-card title="账户管理" :bordered="false" class="proCard">
      <div class="n-layout-page-header">
        <n-grid :cols="24">
          <n-gi :span="12">
            <n-button type="primary" @click="handleAdd">
              <template #icon>
                <n-icon>
                  <PlusOutlined />
                </n-icon>
              </template>
              新增账户
            </n-button>
          </n-gi>
          <n-gi :span="12">
            <div class="n-layout-page-header-right">
              <n-space>
                <n-input
                  v-model:value="searchParams.accountName"
                  placeholder="输入账户名称搜索"
                  @keyup.enter="loadData"
                >
                  <template #prefix>
                    <n-icon>
                      <SearchOutlined />
                    </n-icon>
                  </template>
                </n-input>
                <n-select
                  v-model:value="searchParams.role"
                  :options="roleOptions"
                  placeholder="角色"
                  style="width: 120px"
                  clearable
                />
                <n-select
                  v-model:value="searchParams.status"
                  :options="statusOptions"
                  placeholder="状态"
                  style="width: 100px"
                  clearable
                />
                <n-button type="primary" ghost @click="loadData">
                  <template #icon>
                    <n-icon>
                      <SearchOutlined />
                    </n-icon>
                  </template>
                  搜索
                </n-button>
                <n-button ghost @click="resetParams">
                  <template #icon>
                    <n-icon>
                      <ReloadOutlined />
                    </n-icon>
                  </template>
                  重置
                </n-button>
              </n-space>
            </div>
          </n-gi>
        </n-grid>
      </div>

      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row) => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        :bordered="false"
      />

      <!-- 账户表单 -->
      <n-modal v-model:show="showModal" preset="dialog" title="账户信息" :style="{ width: '600px' }">
        <n-form
          :model="formData"
          :rules="rules"
          ref="formRef"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <n-form-item label="账户名称" path="accountName">
            <n-input v-model:value="formData.accountName" placeholder="请输入账户名称" />
          </n-form-item>
          <n-form-item label="密码" path="password" v-if="formData.id === ''">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item label="角色" path="role">
            <n-select v-model:value="formData.role" :options="roleOptions" placeholder="请选择角色" />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
              <template #checked>启用</template>
              <template #unchecked>禁用</template>
            </n-switch>
          </n-form-item>
        </n-form>
        <template #action>
          <n-space>
            <n-button @click="closeModal">取消</n-button>
            <n-button type="primary" :loading="formSubmitting" @click="confirmForm">确认</n-button>
          </n-space>
        </template>
      </n-modal>

      <!-- 密钥编辑弹窗 -->
      <n-modal v-model:show="showKeyModal" preset="dialog" title="密钥管理" :style="{ width: '500px' }">
        <n-form
          :model="keyFormData"
          :rules="keyRules"
          ref="keyFormRef"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <n-form-item label="账户名称">
            <n-input v-model:value="keyFormData.accountName" disabled />
          </n-form-item>
          <n-form-item label="当前密钥" v-if="keyFormData.apiKey">
            <div class="flex items-center gap-2">
              <n-input v-model:value="keyFormData.apiKey" disabled />
              <n-button @click="copyToClipboard(keyFormData.apiKey)">
                <template #icon>
                  <n-icon>
                    <CopyOutlined />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-form-item>
          <n-form-item label="新密钥" path="newApiKey">
            <n-input
              v-model:value="keyFormData.newApiKey"
              placeholder="输入新密钥或留空自动生成"
            />
          </n-form-item>
          <div class="flex justify-end">
            <n-button @click="generateRandomKey" size="small">生成随机密钥</n-button>
          </div>
        </n-form>
        <template #action>
          <n-space>
            <n-button @click="closeKeyModal">取消</n-button>
            <n-button type="primary" :loading="keySubmitting" @click="confirmKeyForm">确认</n-button>
          </n-space>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, onMounted, h } from 'vue';
  import { useMessage, useDialog } from 'naive-ui';
  import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    KeyOutlined,
    CopyOutlined,
  } from '@vicons/antd';
  import { getAccountList, saveAccount, deleteAccount, editAccountKey } from '@/api/admin';
  import { FormInst } from 'naive-ui';

  export default defineComponent({
    name: 'AccountManage',
    components: {
      PlusOutlined,
      SearchOutlined,
      ReloadOutlined,
      EditOutlined,
      DeleteOutlined,
      KeyOutlined,
      CopyOutlined,
    },
    setup() {
      const message = useMessage();
      const dialog = useDialog();
      const formRef = ref<FormInst | null>(null);
      const keyFormRef = ref<FormInst | null>(null);
      const loading = ref(false);
      const formSubmitting = ref(false);
      const keySubmitting = ref(false);
      const showModal = ref(false);
      const showKeyModal = ref(false);
      
      // 分页和查询参数
      const pagination = reactive({
        page: 1,
        pageSize: 10,
        itemCount: 0,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
        prefix({ itemCount }) {
          return `共 ${itemCount} 条`;
        },
      });

      const searchParams = reactive({
        accountName: '',
        role: null,
        status: null,
      });

      // 表单数据
      const defaultFormData = {
        id: '',
        accountName: '',
        password: '',
        role: '运营人员',
        status: 1,
      };

      const defaultKeyFormData = {
        id: '',
        accountName: '',
        apiKey: '',
        newApiKey: '',
      };

      const formData = reactive({ ...defaultFormData });
      const keyFormData = reactive({ ...defaultKeyFormData });

      // 表单验证规则
      const rules = {
        accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur', type: 'string' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur', type: 'string' },
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      };

      const keyRules = {
        newApiKey: [
          { 
            validator: (rule, value) => {
              if (value && (value.length < 10 || !value.startsWith('sk-'))) {
                return new Error('密钥格式不正确,应以sk-开头且长度不小于10位');
              }
              return true;
            },
            trigger: 'blur',
          }
        ],
      };

      // 角色选项
      const roleOptions = [
        { label: '管理员', value: '管理员' },
        { label: '运营人员', value: '运营人员' },
        { label: '只读用户', value: '只读用户' },
      ];

      // 状态选项
      const statusOptions = [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ];

      // 生成随机密钥
      const generateRandomKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'sk-';
        for (let i = 0; i < 24; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        keyFormData.newApiKey = result;
      };

      // 复制到剪贴板
      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
          message.success('已复制到剪贴板');
        }).catch(() => {
          message.error('复制失败');
        });
      };

      // 表格列定义
      const columns = [
        {
          title: '账户名称',
          key: 'accountName',
          width: 150,
        },
        {
          title: '角色',
          key: 'role',
          width: 120,
        },
        {
          title: '状态',
          key: 'status',
          width: 100,
          render(row) {
            return h(
              'div',
              {
                class: row.status === 1 ? 'text-green-500' : 'text-red-500',
              },
              row.status === 1 ? '启用' : '禁用'
            );
          },
        },
        {
          title: '密钥',
          key: 'apiKey',
          width: 220,
          ellipsis: {
            tooltip: true,
          },
          render(row) {
            return h(
              'div',
              {
                class: 'flex items-center gap-2',
              },
              [
                row.apiKey.slice(0, 7) + '*'.repeat(10),
                h(
                  'n-button',
                  {
                    size: 'tiny',
                    onClick: (e) => {
                      e.stopPropagation();
                      copyToClipboard(row.apiKey);
                    },
                  },
                  {
                    icon: () => h(CopyOutlined),
                    default: () => '复制',
                  }
                ),
              ]
            );
          },
        },
        {
          title: '最后登录',
          key: 'lastLoginTime',
          width: 180,
        },
        {
          title: '创建时间',
          key: 'createTime',
          width: 180,
        },
        {
          title: '操作',
          key: 'actions',
          width: 240,
          fixed: 'right',
          render(row) {
            return h(
              'div',
              {
                class: 'flex gap-2',
              },
              [
                h(
                  'button',
                  {
                    class:
                      'p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-pointer',
                    onClick: () => handleEdit(row),
                  },
                  [
                    h(EditOutlined, {
                      class: 'cursor-pointer',
                    }),
                    ' 编辑',
                  ]
                ),
                h(
                  'button',
                  {
                    class:
                      'p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded cursor-pointer',
                    onClick: () => handleEditKey(row),
                  },
                  [
                    h(KeyOutlined, {
                      class: 'cursor-pointer',
                    }),
                    ' 管理密钥',
                  ]
                ),
                h(
                  'button',
                  {
                    class:
                      'p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded cursor-pointer',
                    onClick: () => handleDelete(row),
                  },
                  [
                    h(DeleteOutlined, {
                      class: 'cursor-pointer',
                    }),
                    ' 删除',
                  ]
                ),
              ]
            );
          },
        },
      ];

      const tableData = ref([]);

      // 加载数据
      const loadData = async () => {
        try {
          loading.value = true;
          const res = await getAccountList({
            page: pagination.page,
            pageSize: pagination.pageSize,
            ...searchParams,
          });
          
          if (res.code === 0) {
            tableData.value = res.result.list;
            pagination.itemCount = res.result.total;
          } else {
            message.error(res.message || '获取数据失败');
          }
        } catch (error) {
          message.error('获取数据出错');
          console.error('加载账户数据出错:', error);
        } finally {
          loading.value = false;
        }
      };

      // 重置查询参数
      const resetParams = () => {
        searchParams.accountName = '';
        searchParams.role = null;
        searchParams.status = null;
        pagination.page = 1;
        loadData();
      };

      // 处理分页变更
      const handlePageChange = (page: number) => {
        pagination.page = page;
        loadData();
      };

      const handlePageSizeChange = (pageSize: number) => {
        pagination.page = 1;
        pagination.pageSize = pageSize;
        loadData();
      };

      // 添加账户
      const handleAdd = () => {
        Object.assign(formData, defaultFormData);
        showModal.value = true;
      };

      // 编辑账户
      const handleEdit = (row) => {
        Object.assign(formData, { ...row, password: '' });
        showModal.value = true;
      };

      // 编辑密钥
      const handleEditKey = (row) => {
        Object.assign(keyFormData, {
          id: row.id,
          accountName: row.accountName,
          apiKey: row.apiKey,
          newApiKey: '',
        });
        showKeyModal.value = true;
      };

      // 删除账户
      const handleDelete = (row) => {
        dialog.warning({
          title: '警告',
          content: `确定要删除账户 "${row.accountName}" 吗？删除后将无法恢复。`,
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            try {
              const res = await deleteAccount(row.id);
              if (res.code === 0) {
                message.success('删除成功');
                loadData();
              } else {
                message.error(res.message || '删除失败');
              }
            } catch (error) {
              message.error('删除出错');
              console.error('删除账户出错:', error);
            }
          },
        });
      };

      // 关闭表单弹窗
      const closeModal = () => {
        showModal.value = false;
      };

      // 关闭密钥弹窗
      const closeKeyModal = () => {
        showKeyModal.value = false;
      };

      // 提交表单数据
      const confirmForm = () => {
        formRef.value?.validate(async (errors) => {
          if (!errors) {
            try {
              formSubmitting.value = true;
              const res = await saveAccount(formData);
              if (res.code === 0) {
                message.success(`${formData.id ? '修改' : '添加'}成功`);
                closeModal();
                loadData();
              } else {
                message.error(res.message || `${formData.id ? '修改' : '添加'}失败`);
              }
            } catch (error) {
              message.error(`${formData.id ? '修改' : '添加'}出错`);
              console.error('提交账户数据出错:', error);
            } finally {
              formSubmitting.value = false;
            }
          }
        });
      };

      // 提交密钥表单
      const confirmKeyForm = () => {
        keyFormRef.value?.validate(async (errors) => {
          if (!errors) {
            try {
              keySubmitting.value = true;
              
              // 如果未输入新密钥，则自动生成一个
              if (!keyFormData.newApiKey) {
                generateRandomKey();
              }

              const res = await editAccountKey({
                id: keyFormData.id,
                apiKey: keyFormData.newApiKey,
              });

              if (res.code === 0) {
                message.success('密钥更新成功');
                closeKeyModal();
                loadData();
              } else {
                message.error(res.message || '密钥更新失败');
              }
            } catch (error) {
              message.error('密钥更新出错');
              console.error('提交密钥数据出错:', error);
            } finally {
              keySubmitting.value = false;
            }
          }
        });
      };

      onMounted(() => {
        loadData();
      });

      return {
        loading,
        tableData,
        columns,
        pagination,
        searchParams,
        formRef,
        keyFormRef,
        formData,
        keyFormData,
        rules,
        keyRules,
        roleOptions,
        statusOptions,
        showModal,
        showKeyModal,
        formSubmitting,
        keySubmitting,
        loadData,
        resetParams,
        handlePageChange,
        handlePageSizeChange,
        handleAdd,
        handleEdit,
        handleEditKey,
        handleDelete,
        closeModal,
        closeKeyModal,
        confirmForm,
        confirmKeyForm,
        generateRandomKey,
        copyToClipboard,
      };
    },
  });
</script>

<style scoped>
.n-layout-page-header {
  margin-bottom: 16px;
}

.n-layout-page-header-right {
  display: flex;
  justify-content: flex-end;
}
</style>
