<template>
  <div>
    <n-card title="提示词配置" :bordered="false" class="proCard">
      <div class="n-layout-page-header">
        <n-grid :cols="24">
          <n-gi :span="12">
            <n-button type="primary" @click="handleAdd">
              <template #icon>
                <n-icon>
                  <PlusOutlined />
                </n-icon>
              </template>
              新增提示词
            </n-button>
          </n-gi>
          <n-gi :span="12">
            <div class="n-layout-page-header-right">
              <n-space>
                <n-input
                  v-model:value="searchParams.name"
                  placeholder="输入提示词名称搜索"
                  @keyup.enter="loadData"
                >
                  <template #prefix>
                    <n-icon>
                      <SearchOutlined />
                    </n-icon>
                  </template>
                </n-input>
                <n-select
                  v-model:value="searchParams.type"
                  :options="typeOptions"
                  placeholder="提示词类型"
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

      <n-modal v-model:show="showModal" preset="dialog" title="提示词配置" :style="{ width: '600px' }">
        <n-form
          :model="formData"
          :rules="rules"
          ref="formRef"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入提示词名称" />
          </n-form-item>
          <n-form-item label="类型" path="type">
            <n-select v-model:value="formData.type" :options="typeOptions" placeholder="请选择提示词类型" />
          </n-form-item>
          <n-form-item label="内容" path="content">
            <n-input
              v-model:value="formData.content"
              type="textarea"
              placeholder="请输入提示词内容"
              :autosize="{ minRows: 5, maxRows: 10 }"
            />
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
  } from '@vicons/antd';
  import { getPromptConfigList, savePromptConfig, deletePromptConfig } from '@/api/admin';
  import { FormInst } from 'naive-ui';

  export default defineComponent({
    name: 'PromptConfig',
    components: {
      PlusOutlined,
      SearchOutlined,
      ReloadOutlined,
      EditOutlined,
      DeleteOutlined,
    },
    setup() {
      const message = useMessage();
      const dialog = useDialog();
      const formRef = ref<FormInst | null>(null);
      const loading = ref(false);
      const formSubmitting = ref(false);
      const showModal = ref(false);
      
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
        name: '',
        type: null,
        status: null,
      });

      // 表单数据
      const defaultFormData = {
        id: '',
        name: '',
        content: '',
        type: 'general',
        status: 1,
      };

      const formData = reactive({ ...defaultFormData });

      // 表单验证规则
      const rules = {
        name: [{ required: true, message: '请输入提示词名称', trigger: 'blur' }],
        content: [{ required: true, message: '请输入提示词内容', trigger: 'blur' }],
        type: [{ required: true, message: '请选择提示词类型', trigger: 'change' }],
      };

      // 提示词类型选项
      const typeOptions = [
        { label: '通用', value: 'general' },
        { label: '代码', value: 'code' },
        { label: '营销', value: 'marketing' },
        { label: '翻译', value: 'translation' },
        { label: '创意', value: 'creative' },
      ];

      // 状态选项
      const statusOptions = [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ];

      // 表格列定义
      const columns = [
        {
          title: '名称',
          key: 'name',
          width: 200,
        },
        {
          title: '类型',
          key: 'type',
          width: 120,
          render(row) {
            const type = typeOptions.find((t) => t.value === row.type);
            return type ? type.label : row.type;
          },
        },
        {
          title: '内容',
          key: 'content',
          ellipsis: {
            tooltip: true,
          },
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
          title: '创建时间',
          key: 'createTime',
          width: 180,
        },
        {
          title: '操作',
          key: 'actions',
          width: 150,
          render(row) {
            return [
              h(
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
              ),
            ];
          },
        },
      ];

      const tableData = ref([]);

      // 加载数据
      const loadData = async () => {
        try {
          loading.value = true;
          const res = await getPromptConfigList({
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
          console.error('加载提示词配置数据出错:', error);
        } finally {
          loading.value = false;
        }
      };

      // 重置查询参数
      const resetParams = () => {
        searchParams.name = '';
        searchParams.type = null;
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

      // 添加提示词
      const handleAdd = () => {
        Object.assign(formData, defaultFormData);
        showModal.value = true;
      };

      // 编辑提示词
      const handleEdit = (row) => {
        Object.assign(formData, row);
        showModal.value = true;
      };

      // 删除提示词
      const handleDelete = (row) => {
        dialog.warning({
          title: '警告',
          content: '确定要删除该提示词吗？删除后将无法恢复。',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            try {
              const res = await deletePromptConfig(row.id);
              if (res.code === 0) {
                message.success('删除成功');
                loadData();
              } else {
                message.error(res.message || '删除失败');
              }
            } catch (error) {
              message.error('删除出错');
              console.error('删除提示词出错:', error);
            }
          },
        });
      };

      // 关闭表单弹窗
      const closeModal = () => {
        showModal.value = false;
      };

      // 提交表单数据
      const confirmForm = () => {
        formRef.value?.validate(async (errors) => {
          if (!errors) {
            try {
              formSubmitting.value = true;
              const res = await savePromptConfig(formData);
              if (res.code === 0) {
                message.success(`${formData.id ? '修改' : '添加'}成功`);
                closeModal();
                loadData();
              } else {
                message.error(res.message || `${formData.id ? '修改' : '添加'}失败`);
              }
            } catch (error) {
              message.error(`${formData.id ? '修改' : '添加'}出错`);
              console.error('提交提示词配置数据出错:', error);
            } finally {
              formSubmitting.value = false;
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
        formData,
        rules,
        showModal,
        formSubmitting,
        typeOptions,
        statusOptions,
        loadData,
        resetParams,
        handlePageChange,
        handlePageSizeChange,
        handleAdd,
        handleEdit,
        handleDelete,
        closeModal,
        confirmForm,
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
