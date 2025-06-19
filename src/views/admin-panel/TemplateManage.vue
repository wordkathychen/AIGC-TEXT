<template>
  <div>
    <n-card title="模板管理" :bordered="false" class="proCard">
      <div class="n-layout-page-header">
        <n-grid :cols="24">
          <n-gi :span="12">
            <n-space>
              <n-button type="primary" @click="handleAdd">
                <template #icon>
                  <n-icon>
                    <PlusOutlined />
                  </n-icon>
                </template>
                新增模板
              </n-button>
              <n-upload
                :custom-request="customRequest"
                :show-file-list="false"
                :max-size="10 * 1024 * 1024"
                accept=".docx,.pdf,.pptx,.xlsx"
                @before-upload="beforeUpload"
              >
                <n-button type="info">
                  <template #icon>
                    <n-icon>
                      <UploadOutlined />
                    </n-icon>
                  </template>
                  上传文件
                </n-button>
              </n-upload>
            </n-space>
          </n-gi>
          <n-gi :span="12">
            <div class="n-layout-page-header-right">
              <n-space>
                <n-input
                  v-model:value="searchParams.name"
                  placeholder="输入模板名称搜索"
                  @keyup.enter="loadData"
                >
                  <template #prefix>
                    <n-icon>
                      <SearchOutlined />
                    </n-icon>
                  </template>
                </n-input>
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

      <!-- 新增/编辑模板 -->
      <n-modal v-model:show="showModal" preset="dialog" title="模板信息" :style="{ width: '600px' }">
        <n-form
          :model="formData"
          :rules="rules"
          ref="formRef"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formData.name" placeholder="请输入模板名称" />
          </n-form-item>
          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入模板描述"
            />
          </n-form-item>
          <n-form-item label="文件路径" path="filePath" v-if="formData.filePath">
            <n-input v-model:value="formData.filePath" disabled />
          </n-form-item>
          <n-form-item label="文件大小" v-if="formData.fileSize">
            <n-input v-model:value="formData.fileSize" disabled />
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

      <!-- 文件预览弹窗 -->
      <n-modal v-model:show="showPreviewModal" style="width: 70%; max-width: 1000px">
        <n-card :title="previewTitle" :bordered="false" size="huge">
          <template #header-extra>
            <n-button circle size="small" @click="closePreviewModal">
              <template #icon>
                <n-icon>
                  <CloseOutlined />
                </n-icon>
              </template>
            </n-button>
          </template>

          <!-- 预览区域 -->
          <div class="preview-content">
            <!-- PDF预览 -->
            <div v-if="previewData.fileType === 'pdf'" class="h-96">
              <iframe
                :src="previewData.url"
                frameborder="0"
                width="100%"
                height="100%"
                v-if="previewData.url"
              ></iframe>
              <div v-else class="flex h-full items-center justify-center">
                无法预览PDF文件，请下载后查看
              </div>
            </div>

            <!-- 图片预览 -->
            <div v-else-if="previewData.fileType === 'image'" class="flex justify-center">
              <img :src="previewData.url" class="max-w-full max-h-96" />
            </div>

            <!-- Office文档预览 -->
            <div v-else-if="['docx', 'pptx', 'xlsx'].includes(previewData.fileType)" class="h-96">
              <div class="flex h-full items-center justify-center">
                Office文档无法直接预览，请下载后查看
              </div>
            </div>

            <!-- 其他格式 -->
            <div v-else class="flex h-96 items-center justify-center">
              该文件格式不支持预览，请下载后查看
            </div>
          </div>

          <template #action>
            <div class="flex justify-end">
              <n-space>
                <n-button type="primary" @click="handleDownload">
                  <template #icon>
                    <n-icon>
                      <DownloadOutlined />
                    </n-icon>
                  </template>
                  下载文件
                </n-button>
                <n-button @click="closePreviewModal">关闭</n-button>
              </n-space>
            </div>
          </template>
        </n-card>
      </n-modal>

      <!-- 上传进度条 -->
      <n-modal v-model:show="showUploadModal" preset="dialog" :title="uploadData.fileName" :closable="false">
        <div class="py-4">
          <div class="text-center mb-3">上传中，请稍候...</div>
          <n-progress
            type="line"
            :percentage="uploadData.percentage"
            :processing="uploadData.percentage < 100"
            :indicator-placement="'inside'"
          />
        </div>
        <template #action>
          <div class="flex justify-end">
            <n-button @click="cancelUpload" :disabled="uploadData.percentage >= 100">取消</n-button>
          </div>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, onMounted, h, computed } from 'vue';
  import { useMessage, useDialog } from 'naive-ui';
  import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    UploadOutlined,
    CloseOutlined,
    FileOutlined,
  } from '@vicons/antd';
  import { getTemplateList, saveTemplate, deleteTemplate, uploadTemplate } from '@/api/admin';
  import { FormInst } from 'naive-ui';

  export default defineComponent({
    name: 'TemplateManage',
    components: {
      PlusOutlined,
      SearchOutlined,
      ReloadOutlined,
      EditOutlined,
      DeleteOutlined,
      EyeOutlined,
      DownloadOutlined,
      UploadOutlined,
      CloseOutlined,
      FileOutlined,
    },
    setup() {
      const message = useMessage();
      const dialog = useDialog();
      const formRef = ref<FormInst | null>(null);
      const loading = ref(false);
      const formSubmitting = ref(false);
      const showModal = ref(false);
      const showPreviewModal = ref(false);
      const showUploadModal = ref(false);
      
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
        status: null,
      });

      // 表单数据
      const defaultFormData = {
        id: '',
        name: '',
        description: '',
        filePath: '',
        fileSize: '',
        status: 1,
      };

      const formData = reactive({ ...defaultFormData });
      
      // 预览数据
      const previewData = reactive({
        url: '',
        fileType: '',
      });
      
      // 上传数据
      const uploadData = reactive({
        fileName: '',
        percentage: 0,
        xhr: null as XMLHttpRequest | null,
      });
      
      // 计算属性
      const previewTitle = computed(() => {
        return `文件预览 - ${formData.name || ''}`;
      });

      // 表单验证规则
      const rules = {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入模板描述', trigger: 'blur' }],
      };

      // 状态选项
      const statusOptions = [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ];

      // 文件类型图标映射
      const fileIconMap = {
        docx: h(FileOutlined, { style: 'color: #4285F4' }),
        pdf: h(FileOutlined, { style: 'color: #DB4437' }),
        pptx: h(FileOutlined, { style: 'color: #F4B400' }),
        xlsx: h(FileOutlined, { style: 'color: #0F9D58' }),
      };

      // 获取文件图标
      const getFileIcon = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        return fileIconMap[ext] || h(FileOutlined);
      };

      // 表格列定义
      const columns = [
        {
          title: '名称',
          key: 'name',
          width: 200,
          render(row) {
            return h(
              'div',
              {
                class: 'flex items-center gap-2',
              },
              [
                getFileIcon(row.filePath),
                row.name,
              ]
            );
          },
        },
        {
          title: '描述',
          key: 'description',
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '文件大小',
          key: 'fileSize',
          width: 100,
        },
        {
          title: '下载次数',
          key: 'downloadCount',
          width: 100,
        },
        {
          title: '状态',
          key: 'status',
          width: 80,
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
          width: 220,
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
                      'p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded cursor-pointer',
                    onClick: () => handlePreview(row),
                  },
                  [
                    h(EyeOutlined, {
                      class: 'cursor-pointer',
                    }),
                    ' 预览',
                  ]
                ),
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
            );
          },
        },
      ];

      const tableData = ref([]);

      // 加载数据
      const loadData = async () => {
        try {
          loading.value = true;
          const res = await getTemplateList({
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
          console.error('加载模板数据出错:', error);
        } finally {
          loading.value = false;
        }
      };

      // 重置查询参数
      const resetParams = () => {
        searchParams.name = '';
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

      // 添加模板
      const handleAdd = () => {
        Object.assign(formData, defaultFormData);
        showModal.value = true;
      };

      // 编辑模板
      const handleEdit = (row) => {
        Object.assign(formData, row);
        showModal.value = true;
      };

      // 删除模板
      const handleDelete = (row) => {
        dialog.warning({
          title: '警告',
          content: `确定要删除模板 "${row.name}" 吗？删除后将无法恢复。`,
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            try {
              const res = await deleteTemplate(row.id);
              if (res.code === 0) {
                message.success('删除成功');
                loadData();
              } else {
                message.error(res.message || '删除失败');
              }
            } catch (error) {
              message.error('删除出错');
              console.error('删除模板出错:', error);
            }
          },
        });
      };

      // 预览模板
      const handlePreview = (row) => {
        Object.assign(formData, row);
        
        // 根据文件类型决定预览方式
        const fileExt = row.filePath.split('.').pop().toLowerCase();
        let fileType = '';
        let url = '';
        
        switch (fileExt) {
          case 'pdf':
            fileType = 'pdf';
            url = row.filePath; // 实际项目中应该是完整的URL
            break;
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
            fileType = 'image';
            url = row.filePath; // 实际项目中应该是完整的URL
            break;
          case 'docx':
            fileType = 'docx';
            break;
          case 'pptx':
            fileType = 'pptx';
            break;
          case 'xlsx':
            fileType = 'xlsx';
            break;
          default:
            fileType = 'other';
        }
        
        previewData.fileType = fileType;
        previewData.url = url;
        
        showPreviewModal.value = true;
      };

      // 下载文件
      const handleDownload = () => {
        // 在实际项目中，这里应该是文件的完整下载URL
        const url = formData.filePath;
        const link = document.createElement('a');
        link.href = url;
        link.download = formData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success('文件开始下载');
      };

      // 上传前检查
      const beforeUpload = (data) => {
        const { file } = data;
        
        // 检查文件类型
        const acceptedTypes = ['.docx', '.pdf', '.pptx', '.xlsx'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!acceptedTypes.includes(fileExt)) {
          message.error('只支持上传 Office 文档和 PDF 文件');
          return false;
        }
        
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) {
          message.error('文件大小不能超过 10MB');
          return false;
        }
        
        return true;
      };

      // 自定义上传请求
      const customRequest = ({ file, onFinish, onError }) => {
        const formData = new FormData();
        formData.append('file', file.file);
        
        // 显示进度条
        uploadData.fileName = file.name;
        uploadData.percentage = 0;
        showUploadModal.value = true;
        
        // 创建 XMLHttpRequest
        const xhr = new XMLHttpRequest();
        uploadData.xhr = xhr;
        
        // 监听上传进度
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.floor((e.loaded / e.total) * 100);
            uploadData.percentage = percent;
          }
        };
        
        // 上传完成
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const res = JSON.parse(xhr.responseText);
              
              if (res.code === 0) {
                uploadData.percentage = 100;
                setTimeout(() => {
                  showUploadModal.value = false;
                  
                  // 上传成功后，打开模板编辑窗口
                  Object.assign(formData, {
                    ...defaultFormData,
                    name: file.name.split('.')[0],
                    filePath: res.result.filePath,
                    fileSize: res.result.fileSize,
                  });
                  
                  showModal.value = true;
                  message.success('文件上传成功，请填写模板信息');
                }, 500);
                
                onFinish();
              } else {
                message.error(res.message || '上传失败');
                onError();
              }
            } catch (error) {
              message.error('解析响应数据出错');
              onError();
            }
          } else {
            message.error(`上传失败，状态码：${xhr.status}`);
            onError();
          }
        };
        
        // 上传出错
        xhr.onerror = () => {
          message.error('网络错误，上传失败');
          onError();
        };
        
        // 发送请求
        xhr.open('POST', '/api/admin/template/upload', true);
        xhr.send(formData);
        
        // 返回终止上传的方法
        return {
          abort: () => {
            xhr.abort();
            message.info('上传已取消');
          }
        };
      };

      // 取消上传
      const cancelUpload = () => {
        if (uploadData.xhr) {
          uploadData.xhr.abort();
          showUploadModal.value = false;
        }
      };

      // 关闭表单弹窗
      const closeModal = () => {
        showModal.value = false;
      };

      // 关闭预览弹窗
      const closePreviewModal = () => {
        showPreviewModal.value = false;
      };

      // 提交表单数据
      const confirmForm = () => {
        formRef.value?.validate(async (errors) => {
          if (!errors) {
            try {
              formSubmitting.value = true;
              const res = await saveTemplate(formData);
              if (res.code === 0) {
                message.success(`${formData.id ? '修改' : '添加'}成功`);
                closeModal();
                loadData();
              } else {
                message.error(res.message || `${formData.id ? '修改' : '添加'}失败`);
              }
            } catch (error) {
              message.error(`${formData.id ? '修改' : '添加'}出错`);
              console.error('提交模板数据出错:', error);
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
        previewData,
        uploadData,
        previewTitle,
        rules,
        statusOptions,
        showModal,
        showPreviewModal,
        showUploadModal,
        formSubmitting,
        loadData,
        resetParams,
        handlePageChange,
        handlePageSizeChange,
        handleAdd,
        handleEdit,
        handleDelete,
        handlePreview,
        handleDownload,
        beforeUpload,
        customRequest,
        cancelUpload,
        closeModal,
        closePreviewModal,
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

.preview-content {
  margin: 16px 0;
  min-height: 200px;
}
</style>
