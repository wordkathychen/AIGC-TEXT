<template>
  <div>
    <n-card title="论文模板管理" :bordered="false" class="proCard">
      <n-alert title="提示" type="info" :show-icon="true" class="mb-4">
        在此页面可以上传和管理各个学校的论文模板，系统将根据模板格式生成符合要求的论文。
      </n-alert>
      
      <n-grid :cols="24" :x-gap="24">
        <n-grid-item :span="6">
          <n-card title="模板分类" size="small" class="filter-card">
            <n-space vertical>
              <n-input
                v-model:value="searchValue"
                placeholder="搜索学校名称"
                clearable
              >
                <template #prefix>
                  <n-icon><search-outlined /></n-icon>
                </template>
              </n-input>
              
              <n-divider />
              
              <n-tree
                :data="schoolTreeData"
                :default-expanded-keys="expandedKeys"
                :pattern="searchValue"
                :render-label="renderTreeLabel"
                :selected-keys="selectedKeys"
                :expanded-keys="expandedKeys"
                @update:selected-keys="handleSelectNode"
                @update:expanded-keys="handleExpandedKeys"
                block-line
                selectable
                class="school-tree"
              />
              
              <n-divider />
              
              <n-space justify="space-between">
                <n-button size="small" @click="addSchoolCategory">
                  添加分类
                </n-button>
                <n-button size="small" type="primary" @click="addSchool">
                  添加学校
                </n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-grid-item>
        
        <n-grid-item :span="18">
          <div class="flex justify-between items-center mb-4">
            <n-breadcrumb>
              <n-breadcrumb-item v-for="item in breadcrumbItems" :key="item.key">
                {{ item.label }}
              </n-breadcrumb-item>
            </n-breadcrumb>
            
            <n-space>
              <n-input-group>
                <n-input
                  v-model:value="templateSearch"
                  placeholder="搜索模板名称"
                />
                <n-button type="primary">
                  <template #icon>
                    <n-icon><search-outlined /></n-icon>
                  </template>
                  搜索
                </n-button>
              </n-input-group>
              <n-button type="primary" @click="showUploadModal = true">
                <template #icon>
                  <n-icon><upload-outlined /></n-icon>
                </template>
                上传模板
              </n-button>
            </n-space>
          </div>
          
          <n-data-table
            ref="table"
            :columns="columns"
            :data="templateData"
            :loading="loading"
            :pagination="pagination"
            @update:page="handlePageChange"
          />
          
        </n-grid-item>
      </n-grid>
      
      <!-- 模板上传对话框 -->
      <n-modal
        v-model:show="showUploadModal"
        title="上传论文模板"
        preset="dialog"
        class="modal-template"
        style="width: 600px"
      >
        <n-form
          ref="uploadFormRef"
          :model="uploadForm"
          :rules="uploadRules"
          label-placement="left"
          :label-width="80"
        >
          <n-form-item label="模板名称" path="name">
            <n-input v-model:value="uploadForm.name" placeholder="输入模板名称" />
          </n-form-item>
          
          <n-form-item label="所属学校" path="schoolId">
            <n-select
              v-model:value="uploadForm.schoolId"
              :options="schoolSelectOptions"
              placeholder="选择所属学校"
              filterable
            />
          </n-form-item>
          
          <n-form-item label="专业类别" path="categoryId">
            <n-select
              v-model:value="uploadForm.categoryId"
              :options="categoryOptions"
              placeholder="选择专业类别"
              filterable
            />
          </n-form-item>
          
          <n-form-item label="模板文件" path="fileList">
            <n-upload
              v-model:file-list="uploadForm.fileList"
              :max="1"
              :custom-request="customRequest"
              list-type="text"
            >
              <n-upload-trigger>选择文件</n-upload-trigger>
            </n-upload>
            <n-text depth="3" class="text-xs mt-1">
              支持 .docx, .doc, .pdf 格式，单文件不超过10MB
            </n-text>
          </n-form-item>
          
          <n-form-item label="模板说明" path="description">
            <n-input
              v-model:value="uploadForm.description"
              type="textarea"
              placeholder="简要描述模板用途、适用范围等"
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </n-form-item>
        </n-form>
        
        <template #action>
          <n-space justify="end">
            <n-button @click="showUploadModal = false">取消</n-button>
            <n-button type="primary" @click="handleTemplateUpload" :loading="uploadLoading">
              确认上传
            </n-button>
          </n-space>
        </template>
      </n-modal>
      
      <!-- 预览模板对话框 -->
      <n-modal
        v-model:show="showPreviewModal"
        title="模板预览"
        preset="dialog"
        class="modal-preview"
        style="width: 800px"
      >
        <div v-if="previewTemplate">
          <n-descriptions
            :column="2"
            label-placement="left"
            bordered
          >
            <n-descriptions-item label="模板名称">
              {{ previewTemplate.name }}
            </n-descriptions-item>
            <n-descriptions-item label="所属学校">
              {{ previewTemplate.schoolName }}
            </n-descriptions-item>
            <n-descriptions-item label="上传时间">
              {{ previewTemplate.createTime }}
            </n-descriptions-item>
            <n-descriptions-item label="更新时间">
              {{ previewTemplate.updateTime }}
            </n-descriptions-item>
            <n-descriptions-item label="文件格式">
              {{ previewTemplate.fileType }}
            </n-descriptions-item>
            <n-descriptions-item label="文件大小">
              {{ previewTemplate.fileSize }}
            </n-descriptions-item>
            <n-descriptions-item label="模板说明" :span="2">
              {{ previewTemplate.description }}
            </n-descriptions-item>
          </n-descriptions>
          
          <n-divider>模板预览</n-divider>
          
          <div class="preview-container">
            <n-spin :show="previewLoading">
              <div class="preview-content">
                <!-- 根据文件类型显示不同的预览组件 -->
                <img v-if="previewTemplate.previewType === 'image'" :src="previewTemplate.previewUrl" alt="模板预览" class="preview-image" />
                <iframe v-else-if="previewTemplate.previewType === 'pdf'" :src="previewTemplate.previewUrl" class="preview-frame" />
                <div v-else class="preview-placeholder">
                  该文件格式暂不支持在线预览，请下载后查看
                </div>
              </div>
            </n-spin>
          </div>
          
          <n-divider />
          
          <n-space justify="end">
            <n-button @click="downloadTemplate(previewTemplate)">
              <template #icon>
                <n-icon><download-outlined /></n-icon>
              </template>
              下载模板
            </n-button>
            <n-button type="primary" @click="useTemplate(previewTemplate)">
              使用此模板
            </n-button>
          </n-space>
        </div>
      </n-modal>
      
      <!-- 添加学校对话框 -->
      <n-modal
        v-model:show="showSchoolModal"
        title="添加学校"
        preset="dialog"
        class="modal-school"
        style="width: 500px"
      >
        <n-form
          ref="schoolFormRef"
          :model="schoolForm"
          :rules="schoolRules"
          label-placement="left"
          :label-width="80"
        >
          <n-form-item label="上级分类" path="parentId">
            <n-select
              v-model:value="schoolForm.parentId"
              :options="categorySelectOptions"
              placeholder="选择上级分类"
            />
          </n-form-item>
          
          <n-form-item label="学校名称" path="name">
            <n-input v-model:value="schoolForm.name" placeholder="输入学校名称" />
          </n-form-item>
          
          <n-form-item label="排序" path="sort">
            <n-input-number v-model:value="schoolForm.sort" :min="0" :max="999" />
          </n-form-item>
        </n-form>
        
        <template #action>
          <n-space justify="end">
            <n-button @click="showSchoolModal = false">取消</n-button>
            <n-button type="primary" @click="handleAddSchool" :loading="schoolSaving">
              确认添加
            </n-button>
          </n-space>
        </template>
      </n-modal>
      
      <!-- 添加分类对话框 -->
      <n-modal
        v-model:show="showCategoryModal"
        title="添加分类"
        preset="dialog"
        class="modal-category"
        style="width: 500px"
      >
        <n-form
          ref="categoryFormRef"
          :model="categoryForm"
          :rules="categoryRules"
          label-placement="left"
          :label-width="80"
        >
          <n-form-item label="上级分类" path="parentId">
            <n-select
              v-model:value="categoryForm.parentId"
              :options="categorySelectOptions"
              placeholder="选择上级分类"
            />
          </n-form-item>
          
          <n-form-item label="分类名称" path="name">
            <n-input v-model:value="categoryForm.name" placeholder="输入分类名称" />
          </n-form-item>
          
          <n-form-item label="排序" path="sort">
            <n-input-number v-model:value="categoryForm.sort" :min="0" :max="999" />
          </n-form-item>
        </n-form>
        
        <template #action>
          <n-space justify="end">
            <n-button @click="showCategoryModal = false">取消</n-button>
            <n-button type="primary" @click="handleAddCategory" :loading="categorySaving">
              确认添加
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, h, onMounted, computed } from 'vue';
import { 
  SearchOutlined, DownloadOutlined, UploadOutlined, 
  EyeOutlined, DeleteOutlined, EditOutlined, FolderOutlined, CopyOutlined
} from '@vicons/antd';
import { useMessage } from 'naive-ui';
import { getPaperTemplateList, getPaperTemplateDetail, savePaperTemplate, uploadPaperTemplate, deletePaperTemplate } from '@/api/paper';
import type { UploadFileInfo, FormInst, DataTableColumns, TreeOption } from 'naive-ui';

export default defineComponent({
  name: 'TemplateManage',
  components: {
    SearchOutlined,
    DownloadOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOutlined,
    CopyOutlined
  },
  setup() {
    const message = useMessage();
    const table = ref(null);
    const uploadFormRef = ref<FormInst | null>(null);
    const schoolFormRef = ref<FormInst | null>(null);
    const categoryFormRef = ref<FormInst | null>(null);
    
    // 加载状态
    const loading = ref(false);
    const uploadLoading = ref(false);
    const previewLoading = ref(false);
    const schoolSaving = ref(false);
    const categorySaving = ref(false);
    
    // 对话框状态
    const showUploadModal = ref(false);
    const showPreviewModal = ref(false);
    const showSchoolModal = ref(false);
    const showCategoryModal = ref(false);
    
    // 学校树形数据
    const searchValue = ref('');
    const selectedKeys = ref<string[]>([]);
    const expandedKeys = ref<string[]>(['root']);
    const schoolTreeData = ref<TreeOption[]>([
      {
        key: 'root',
        label: '全部学校',
        children: [
          {
            key: 'category-1',
            label: '985高校',
            children: [
              { key: 'school-1', label: '北京大学' },
              { key: 'school-2', label: '清华大学' },
              { key: 'school-3', label: '复旦大学' }
            ]
          },
          {
            key: 'category-2',
            label: '211高校',
            children: [
              { key: 'school-4', label: '南京大学' },
              { key: 'school-5', label: '武汉大学' }
            ]
          },
          {
            key: 'category-3',
            label: '普通本科',
            children: [
              { key: 'school-6', label: '南京工业大学' },
              { key: 'school-7', label: '扬州大学' }
            ]
          }
        ]
      }
    ]);
    
    // 面包屑导航
    const breadcrumbItems = ref([
      { key: 'root', label: '全部学校' }
    ]);
    
    // 模板搜索
    const templateSearch = ref('');
    
    // 模板列表
    const templateData = ref([
      {
        id: 1,
        name: '本科毕业论文模板',
        schoolId: 'school-1',
        schoolName: '北京大学',
        categoryName: '本科论文',
        fileType: 'docx',
        fileSize: '2.5MB',
        downloads: 245,
        createTime: '2023-05-10 14:25:36',
        updateTime: '2023-05-10 14:25:36',
        status: 1
      },
      {
        id: 2,
        name: '硕士研究生学位论文模板',
        schoolId: 'school-1',
        schoolName: '北京大学',
        categoryName: '硕士论文',
        fileType: 'docx',
        fileSize: '3.1MB',
        downloads: 187,
        createTime: '2023-04-22 09:15:27',
        updateTime: '2023-06-12 11:35:42', 
        status: 1
      },
      {
        id: 3,
        name: '博士研究生学位论文模板',
        schoolId: 'school-1',
        schoolName: '北京大学',
        categoryName: '博士论文',
        fileType: 'pdf',
        fileSize: '4.2MB',
        downloads: 156,
        createTime: '2023-04-18 16:44:20',
        updateTime: '2023-06-12 11:35:45',
        status: 1
      }
    ]);
    
    // 分页
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      itemCount: 0,
      pageSizes: [10, 20, 30, 40]
    });
    
    // 表格列定义
    const columns = [
      {
        title: '模板名称',
        key: 'name',
        width: 250
      },
      {
        title: '所属学校',
        key: 'schoolName'
      },
      {
        title: '文件类型',
        key: 'fileType',
        width: 100
      },
      {
        title: '文件大小',
        key: 'fileSize',
        width: 100
      },
      {
        title: '下载次数',
        key: 'downloads',
        width: 100
      },
      {
        title: '更新时间',
        key: 'updateTime',
        width: 180
      },
      {
        title: '状态',
        key: 'status',
        width: 100,
        render(row) {
          return row.status === 1
            ? h('n-tag', { type: 'success' }, { default: () => '启用' })
            : h('n-tag', { type: 'error' }, { default: () => '禁用' });
        }
      },
      {
        title: '操作',
        key: 'actions',
        width: 200,
        fixed: 'right',
        render(row) {
          return h('div', { class: 'flex gap-2' }, [
            h(
              'n-button',
              {
                size: 'small',
                onClick: () => previewTemplate(row)
              },
              { default: () => '预览', icon: () => h(EyeOutlined) }
            ),
            h(
              'n-button',
              {
                size: 'small',
                onClick: () => downloadTemplate(row)
              },
              { default: () => '下载', icon: () => h(DownloadOutlined) }
            ),
            h(
              'n-popconfirm',
              {
                onPositiveClick: () => deleteTemplate(row),
                negativeText: '取消',
                positiveText: '确定'
              },
              {
                trigger: () =>
                  h(
                    'n-button',
                    {
                      size: 'small',
                      type: 'error'
                    },
                    { default: () => '删除', icon: () => h(DeleteOutlined) }
                  ),
                default: () => '确定删除该模板？'
              }
            )
          ]);
        }
      }
    ];
    
    // 上传表单
    const uploadForm = reactive({
      name: '',
      schoolId: null,
      categoryId: null,
      fileList: [],
      description: ''
    });
    
    // 上传表单验证规则
    const uploadRules = {
      name: {
        required: true,
        message: '请输入模板名称',
        trigger: 'blur'
      },
      schoolId: {
        required: true,
        message: '请选择所属学校',
        trigger: ['blur', 'change']
      },
      categoryId: {
        required: true,
        message: '请选择专业类别',
        trigger: ['blur', 'change']
      },
      fileList: {
        required: true,
        message: '请上传模板文件',
        trigger: ['blur', 'change']
      }
    };
    
    // 添加学校表单
    const schoolForm = reactive({
      parentId: 'root',
      name: '',
      sort: 0
    });
    
    // 学校表单验证规则
    const schoolRules = {
      name: {
        required: true,
        message: '请输入学校名称',
        trigger: 'blur'
      }
    };
    
    // 添加分类表单
    const categoryForm = reactive({
      parentId: 'root',
      name: '',
      sort: 0
    });
    
    // 分类表单验证规则
    const categoryRules = {
      name: {
        required: true,
        message: '请输入分类名称',
        trigger: 'blur'
      }
    };
    
    // 预览模板数据
    const previewTemplate = ref(null);
    
    // 学校下拉选项
    const schoolSelectOptions = ref([
      { label: '北京大学', value: 'school-1' },
      { label: '清华大学', value: 'school-2' },
      { label: '复旦大学', value: 'school-3' },
      { label: '南京大学', value: 'school-4' },
      { label: '武汉大学', value: 'school-5' },
      { label: '南京工业大学', value: 'school-6' },
      { label: '扬州大学', value: 'school-7' }
    ]);
    
    // 分类下拉选项
    const categoryOptions = ref([
      { label: '本科论文', value: 'category-1' },
      { label: '硕士论文', value: 'category-2' },
      { label: '博士论文', value: 'category-3' }
    ]);
    
    // 分类选择选项
    const categorySelectOptions = ref([
      { label: '根目录', value: 'root' },
      { label: '985高校', value: 'category-1' },
      { label: '211高校', value: 'category-2' },
      { label: '普通本科', value: 'category-3' }
    ]);
    
    // 自定义文件上传
    const customRequest = ({ file }) => {
      const formData = new FormData();
      formData.append('file', file.file);
      // 这里可以实现文件上传逻辑
    };
    
    // 渲染树节点标签
    const renderTreeLabel = (info) => {
      const { option } = info;
      return h(
        'div',
        {
          class: 'flex items-center'
        },
        [
          h(
            'div',
            {
              class: 'mr-1'
            },
            [
              option.key.startsWith('school')
                ? h(CopyOutlined)
                : h(FolderOutlined)
            ]
          ),
          option.label
        ]
      );
    };
    
    // 处理节点选择
    const handleSelectNode = (keys) => {
      selectedKeys.value = keys;
      if (keys.length > 0) {
        // 更新面包屑和加载对应模板
        const key = keys[0];
        updateBreadcrumb(key);
        loadTemplates(key);
      }
    };
    
    // 处理节点展开
    const handleExpandedKeys = (keys) => {
      expandedKeys.value = keys;
    };
    
    // 更新面包屑
    const updateBreadcrumb = (key) => {
      // 简化实现，实际应该递归查找节点路径
      breadcrumbItems.value = [{ key: 'root', label: '全部学校' }];
      
      if (key === 'root') return;
      
      if (key.startsWith('category')) {
        // 查找分类
        const category = findTreeNode(schoolTreeData.value, key);
        if (category) {
          breadcrumbItems.value.push({ key, label: category.label as string });
        }
      } else if (key.startsWith('school')) {
        // 查找学校及其父级分类
        const school = findTreeNodeWithParent(schoolTreeData.value, key);
        if (school && school.parent) {
          breadcrumbItems.value.push({ 
            key: school.parent.key as string, 
            label: school.parent.label as string 
          });
          breadcrumbItems.value.push({ 
            key, 
            label: school.node.label as string 
          });
        } else if (school) {
          breadcrumbItems.value.push({ 
            key, 
            label: school.node.label as string 
          });
        }
      }
    };
    
    // 在树中查找节点
    const findTreeNode = (tree, key) => {
      for (const node of tree) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findTreeNode(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    
    // 在树中查找节点及其父节点
    const findTreeNodeWithParent = (tree, key, parent = null) => {
      for (const node of tree) {
        if (node.key === key) return { node, parent };
        if (node.children) {
          const found = findTreeNodeWithParent(node.children, key, node);
          if (found) return found;
        }
      }
      return null;
    };
    
    // 加载模板数据
    const loadTemplates = async (key) => {
      loading.value = true;
      try {
        // 根据不同类型的节点加载不同的数据
        let params = {};
        
        if (key === 'root') {
          // 加载全部模板
          params = {};
        } else if (key.startsWith('category')) {
          // 加载分类下的模板
          params = { categoryId: key };
        } else if (key.startsWith('school')) {
          // 加载学校的模板
          params = { schoolId: key };
        }
        
        const res = await getPaperTemplateList(params);
        
        if (res.code === 0 && res.result) {
          templateData.value = res.result.items || [];
          pagination.itemCount = res.result.total || 0;
        } else {
          message.error(res.message || '模板数据加载失败');
        }
      } catch (error) {
        message.error('模板数据加载出错');
        console.error('模板数据加载出错:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 处理分页变化
    const handlePageChange = (page) => {
      pagination.page = page;
      loadTemplates(selectedKeys.value[0] || 'root');
    };
    
    // 预览模板
    const previewTemplate = async (row) => {
      previewLoading.value = true;
      showPreviewModal.value = true;
      
      try {
        const res = await getPaperTemplateDetail(row.id);
        
        if (res.code === 0 && res.result) {
          previewTemplate.value = {
            ...row,
            ...res.result,
            previewType: res.result.fileType === 'pdf' ? 'pdf' : 'image',
            previewUrl: res.result.previewUrl || ''
          };
        } else {
          message.error(res.message || '模板详情获取失败');
        }
      } catch (error) {
        message.error('模板详情获取出错');
        console.error('模板详情获取出错:', error);
      } finally {
        previewLoading.value = false;
      }
    };
    
    // 下载模板
    const downloadTemplate = (row) => {
      message.info(`正在下载模板：${row.name}`);
      // 实现下载逻辑
      window.open(`/api/paper/template/download/${row.id}`, '_blank');
    };
    
    // 使用模板
    const useTemplate = (template) => {
      message.success(`已选择使用模板：${template.name}`);
      showPreviewModal.value = false;
      // 实现使用模板逻辑
    };
    
    // 删除模板
    const deleteTemplate = async (row) => {
      try {
        const res = await deletePaperTemplate(row.id);
        
        if (res.code === 0) {
          message.success('模板删除成功');
          loadTemplates(selectedKeys.value[0] || 'root');
        } else {
          message.error(res.message || '模板删除失败');
        }
      } catch (error) {
        message.error('模板删除出错');
        console.error('模板删除出错:', error);
      }
    };
    
    // 处理模板上传
    const handleTemplateUpload = () => {
      uploadFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        uploadLoading.value = true;
        try {
          // 构建表单数据
          const formData = new FormData();
          formData.append('name', uploadForm.name);
          formData.append('schoolId', uploadForm.schoolId);
          formData.append('categoryId', uploadForm.categoryId);
          formData.append('description', uploadForm.description);
          
          if (uploadForm.fileList.length > 0 && uploadForm.fileList[0].file) {
            formData.append('file', uploadForm.fileList[0].file);
          }
          
          const res = await uploadPaperTemplate(formData);
          
          if (res.code === 0) {
            message.success('模板上传成功');
            showUploadModal.value = false;
            loadTemplates(selectedKeys.value[0] || 'root');
            
            // 重置表单
            uploadForm.name = '';
            uploadForm.schoolId = null;
            uploadForm.categoryId = null;
            uploadForm.description = '';
            uploadForm.fileList = [];
          } else {
            message.error(res.message || '模板上传失败');
          }
        } catch (error) {
          message.error('模板上传出错');
          console.error('模板上传出错:', error);
        } finally {
          uploadLoading.value = false;
        }
      });
    };
    
    // 添加学校
    const addSchool = () => {
      schoolForm.parentId = 'root';
      schoolForm.name = '';
      schoolForm.sort = 0;
      showSchoolModal.value = true;
    };
    
    // 处理添加学校
    const handleAddSchool = () => {
      schoolFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        schoolSaving.value = true;
        try {
          // 模拟API请求
          setTimeout(() => {
            message.success('学校添加成功');
            showSchoolModal.value = false;
            
            // 更新树形数据
            const parentNode = findTreeNode(schoolTreeData.value, schoolForm.parentId);
            if (parentNode) {
              const newKey = `school-${Date.now()}`;
              if (!parentNode.children) parentNode.children = [];
              
              parentNode.children.push({
                key: newKey,
                label: schoolForm.name
              });
              
              // 更新学校下拉选项
              schoolSelectOptions.value.push({
                label: schoolForm.name,
                value: newKey
              });
            }
            
            schoolSaving.value = false;
          }, 1000);
        } catch (error) {
          message.error('学校添加出错');
          console.error('学校添加出错:', error);
          schoolSaving.value = false;
        }
      });
    };
    
    // 添加分类
    const addSchoolCategory = () => {
      categoryForm.parentId = 'root';
      categoryForm.name = '';
      categoryForm.sort = 0;
      showCategoryModal.value = true;
    };
    
    // 处理添加分类
    const handleAddCategory = () => {
      categoryFormRef.value?.validate(async (errors) => {
        if (errors) return;
        
        categorySaving.value = true;
        try {
          // 模拟API请求
          setTimeout(() => {
            message.success('分类添加成功');
            showCategoryModal.value = false;
            
            // 更新树形数据
            const parentNode = findTreeNode(schoolTreeData.value, categoryForm.parentId);
            if (parentNode) {
              const newKey = `category-${Date.now()}`;
              if (!parentNode.children) parentNode.children = [];
              
              parentNode.children.push({
                key: newKey,
                label: categoryForm.name,
                children: []
              });
              
              // 更新分类下拉选项
              categorySelectOptions.value.push({
                label: categoryForm.name,
                value: newKey
              });
            }
            
            categorySaving.value = false;
          }, 1000);
        } catch (error) {
          message.error('分类添加出错');
          console.error('分类添加出错:', error);
          categorySaving.value = false;
        }
      });
    };
    
    onMounted(() => {
      loadTemplates('root');
    });
    
    return {
      table,
      uploadFormRef,
      schoolFormRef,
      categoryFormRef,
      loading,
      uploadLoading,
      previewLoading,
      schoolSaving,
      categorySaving,
      showUploadModal,
      showPreviewModal,
      showSchoolModal,
      showCategoryModal,
      searchValue,
      templateSearch,
      selectedKeys,
      expandedKeys,
      schoolTreeData,
      breadcrumbItems,
      templateData,
      pagination,
      columns,
      uploadForm,
      uploadRules,
      schoolForm,
      schoolRules,
      categoryForm,
      categoryRules,
      previewTemplate,
      schoolSelectOptions,
      categoryOptions,
      categorySelectOptions,
      customRequest,
      renderTreeLabel,
      handleSelectNode,
      handleExpandedKeys,
      handlePageChange,
      previewTemplate,
      downloadTemplate,
      useTemplate,
      deleteTemplate,
      handleTemplateUpload,
      addSchool,
      handleAddSchool,
      addSchoolCategory,
      handleAddCategory
    };
  }
});
</script>

<style scoped>
.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-1 {
  margin-top: 4px;
}

.mr-1 {
  margin-right: 4px;
}

.text-xs {
  font-size: 12px;
}

.filter-card {
  height: 100%;
}

.school-tree {
  max-height: 600px;
  overflow-y: auto;
}

.preview-container {
  height: 500px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
}

.preview-content {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
}

.preview-frame {
  width: 100%;
  height: 500px;
  border: none;
}

.preview-placeholder {
  text-align: center;
  padding: 20px;
  color: #888;
}
</style> 