<template>
  <div>
    <n-card title="会员额度管理" :bordered="false" class="proCard">
      <div class="n-layout-page-header">
        <n-grid :cols="24">
          <n-gi :span="24">
            <div class="n-layout-page-header-right">
              <n-space>
                <n-input
                  v-model:value="searchParams.username"
                  placeholder="输入会员名称搜索"
                  @keyup.enter="loadData"
                >
                  <template #prefix>
                    <n-icon>
                      <SearchOutlined />
                    </n-icon>
                  </template>
                </n-input>
                <n-select
                  v-model:value="searchParams.memberLevel"
                  :options="memberLevelOptions"
                  placeholder="会员等级"
                  style="width: 120px"
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

      <!-- 额度调整弹窗 -->
      <n-modal v-model:show="showModal" preset="dialog" title="调整会员额度" :style="{ width: '500px' }">
        <n-form
          :model="formData"
          :rules="rules"
          ref="formRef"
          label-placement="left"
          :label-width="100"
          class="py-4"
        >
          <n-form-item label="会员名称">
            <n-input v-model:value="formData.username" disabled />
          </n-form-item>
          <n-form-item label="会员等级">
            <n-input v-model:value="formData.memberLevel" disabled />
          </n-form-item>
          <n-form-item label="当前总额度">
            <n-input-number v-model:value="formData.totalQuota" disabled />
          </n-form-item>
          <n-form-item label="当前剩余额度">
            <n-input-number v-model:value="formData.remainQuota" disabled />
          </n-form-item>
          <n-divider />
          <n-form-item label="调整额度" path="adjustAmount">
            <n-input-number
              v-model:value="formData.adjustAmount"
              clearable
              :min="-formData.totalQuota"
              placeholder="正数为增加，负数为减少"
            >
              <template #prefix>
                <span>
                  <n-icon v-if="formData.adjustAmount && formData.adjustAmount > 0">
                    <PlusOutlined />
                  </n-icon>
                  <n-icon v-else-if="formData.adjustAmount && formData.adjustAmount < 0">
                    <MinusOutlined />
                  </n-icon>
                </span>
              </template>
            </n-input-number>
          </n-form-item>
          <n-form-item label="调整后总额度">
            <n-input-number
              :value="
                formData.totalQuota + (formData.adjustAmount ? Number(formData.adjustAmount) : 0)
              "
              disabled
            />
          </n-form-item>
          <n-form-item label="调整后剩余额度">
            <n-input-number
              :value="
                formData.remainQuota + (formData.adjustAmount ? Number(formData.adjustAmount) : 0)
              "
              disabled
            />
          </n-form-item>
          <n-form-item label="调整原因" path="adjustReason">
            <n-input
              v-model:value="formData.adjustReason"
              type="textarea"
              placeholder="请输入额度调整原因"
            />
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
  import { useMessage } from 'naive-ui';
  import {
    SearchOutlined,
    ReloadOutlined,
    ToolOutlined,
    PlusOutlined,
    MinusOutlined,
  } from '@vicons/antd';
  import { getMemberQuotaList, adjustMemberQuota } from '@/api/admin';
  import { FormInst } from 'naive-ui';

  export default defineComponent({
    name: 'MemberQuota',
    components: {
      SearchOutlined,
      ReloadOutlined,
      ToolOutlined,
      PlusOutlined,
      MinusOutlined,
    },
    setup() {
      const message = useMessage();
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
        username: '',
        memberLevel: null,
      });

      // 表单数据
      const defaultFormData = {
        id: '',
        username: '',
        memberLevel: '',
        totalQuota: 0,
        usedQuota: 0,
        remainQuota: 0,
        adjustAmount: null,
        adjustReason: '',
      };

      const formData = reactive({ ...defaultFormData });

      // 表单验证规则
      const rules = {
        adjustAmount: [
          { required: true, message: '请输入调整额度', trigger: 'blur' },
          {
            validator: (rule, value) => {
              if (value === 0) {
                return new Error('调整额度不能为0');
              }
              return true;
            },
            trigger: 'blur',
          },
        ],
        adjustReason: [
          { required: true, message: '请输入调整原因', trigger: 'blur' },
          { min: 2, max: 100, message: '调整原因长度在2-100个字符之间', trigger: 'blur' },
        ],
      };

      // 会员等级选项
      const memberLevelOptions = [
        { label: '普通会员', value: '普通会员' },
        { label: '高级会员', value: '高级会员' },
        { label: 'VIP会员', value: 'VIP会员' },
      ];

      // 表格列定义
      const columns = [
        {
          title: '会员名称',
          key: 'username',
          width: 120,
        },
        {
          title: '会员等级',
          key: 'memberLevel',
          width: 100,
        },
        {
          title: '总额度',
          key: 'totalQuota',
          width: 120,
        },
        {
          title: '已使用额度',
          key: 'usedQuota',
          width: 120,
        },
        {
          title: '剩余额度',
          key: 'remainQuota',
          width: 120,
          render(row) {
            return h(
              'div',
              {
                class:
                  row.remainQuota > row.totalQuota * 0.2
                    ? 'text-green-500'
                    : row.remainQuota > 0
                    ? 'text-orange-500'
                    : 'text-red-500',
              },
              row.remainQuota
            );
          },
        },
        {
          title: '到期时间',
          key: 'expireTime',
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
          width: 100,
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
                      onClick: () => handleAdjust(row),
                    },
                    [
                      h(ToolOutlined, {
                        class: 'cursor-pointer',
                      }),
                      ' 调整额度',
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
          const res = await getMemberQuotaList({
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
          console.error('加载会员额度数据出错:', error);
        } finally {
          loading.value = false;
        }
      };

      // 重置查询参数
      const resetParams = () => {
        searchParams.username = '';
        searchParams.memberLevel = null;
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

      // 额度调整
      const handleAdjust = (row) => {
        Object.assign(formData, {
          ...defaultFormData,
          id: row.id,
          username: row.username,
          memberLevel: row.memberLevel,
          totalQuota: row.totalQuota,
          usedQuota: row.usedQuota,
          remainQuota: row.remainQuota,
        });
        showModal.value = true;
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
              const res = await adjustMemberQuota({
                id: formData.id,
                adjustAmount: formData.adjustAmount,
                adjustReason: formData.adjustReason,
              });
              if (res.code === 0) {
                message.success('额度调整成功');
                closeModal();
                loadData();
              } else {
                message.error(res.message || '额度调整失败');
              }
            } catch (error) {
              message.error('额度调整出错');
              console.error('提交会员额度调整数据出错:', error);
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
        memberLevelOptions,
        formRef,
        formData,
        rules,
        showModal,
        formSubmitting,
        loadData,
        resetParams,
        handlePageChange,
        handlePageSizeChange,
        handleAdjust,
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
