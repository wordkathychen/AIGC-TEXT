<template>
  <div>
    <n-card title="论文提示词管理" :bordered="false" class="proCard">
      <n-alert title="提示" type="info" :show-icon="true" class="mb-4">
        在此页面可以为论文的各个部分设置专用提示词，这些提示词将用于控制EXE程序生成高质量的论文内容。
      </n-alert>

      <n-tabs type="line" animated>
        <n-tab-pane name="title" tab="题目">
          <n-form
            ref="titleFormRef"
            :model="promptData.title"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.title.content"
                type="textarea"
                placeholder="请输入论文题目生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="promptData.title.params.useKeywords" /> 
                  <span>使用关键词引导</span>
                </n-space>
                <n-space align="center">
                  <span>最小长度:</span>
                  <n-input-number v-model:value="promptData.title.params.minLength" :min="10" :max="50" />
                  <span>最大长度:</span>
                  <n-input-number v-model:value="promptData.title.params.maxLength" :min="20" :max="100" />
                </n-space>
                <n-space align="center">
                  <span>创造性:</span>
                  <n-slider v-model:value="promptData.title.params.creativity" :min="0" :max="1" :step="0.1" style="width: 200px" />
                  <n-input-number v-model:value="promptData.title.params.creativity" :min="0" :max="1" :step="0.1" size="small" />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('title')">保存设置</n-button>
              <n-button @click="resetPrompt('title')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="abstract" tab="中文摘要">
          <n-form
            ref="abstractFormRef"
            :model="promptData.abstract"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.abstract.content"
                type="textarea"
                placeholder="请输入论文中文摘要生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="promptData.abstract.params.useTitleReference" /> 
                  <span>参考论文标题</span>
                </n-space>
                <n-space align="center">
                  <span>最小字数:</span>
                  <n-input-number v-model:value="promptData.abstract.params.minWords" :min="100" :max="300" />
                  <span>最大字数:</span>
                  <n-input-number v-model:value="promptData.abstract.params.maxWords" :min="150" :max="500" />
                </n-space>
                <n-space align="center">
                  <span>专业性级别:</span>
                  <n-slider v-model:value="promptData.abstract.params.professionalLevel" :min="1" :max="5" :step="1" style="width: 200px" />
                  <n-input-number v-model:value="promptData.abstract.params.professionalLevel" :min="1" :max="5" :step="1" size="small" />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('abstract')">保存设置</n-button>
              <n-button @click="resetPrompt('abstract')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="keywords" tab="关键词">
          <n-form
            ref="keywordsFormRef"
            :model="promptData.keywords"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.keywords.content"
                type="textarea"
                placeholder="请输入论文关键词生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <span>关键词数量:</span>
                  <n-input-number v-model:value="promptData.keywords.params.count" :min="3" :max="8" />
                </n-space>
                <n-space align="center">
                  <n-switch v-model:value="promptData.keywords.params.useTitleAndAbstract" /> 
                  <span>基于标题和摘要生成</span>
                </n-space>
                <n-space align="center">
                  <span>专业性级别:</span>
                  <n-slider v-model:value="promptData.keywords.params.professionalLevel" :min="1" :max="5" :step="1" style="width: 200px" />
                  <n-input-number v-model:value="promptData.keywords.params.professionalLevel" :min="1" :max="5" :step="1" size="small" />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('keywords')">保存设置</n-button>
              <n-button @click="resetPrompt('keywords')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="enAbstract" tab="英文摘要">
          <n-form
            ref="enAbstractFormRef"
            :model="promptData.enAbstract"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.enAbstract.content"
                type="textarea"
                placeholder="请输入论文英文摘要生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="promptData.enAbstract.params.basedOnChinese" /> 
                  <span>基于中文摘要翻译</span>
                </n-space>
                <n-space align="center">
                  <span>英文水平:</span>
                  <n-select 
                    v-model:value="promptData.enAbstract.params.englishLevel" 
                    :options="englishLevelOptions"
                    style="width: 150px"
                  />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('enAbstract')">保存设置</n-button>
              <n-button @click="resetPrompt('enAbstract')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="enKeywords" tab="英文关键词">
          <n-form
            ref="enKeywordsFormRef"
            :model="promptData.enKeywords"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.enKeywords.content"
                type="textarea"
                placeholder="请输入论文英文关键词生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="promptData.enKeywords.params.translateFromChinese" /> 
                  <span>从中文关键词翻译</span>
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('enKeywords')">保存设置</n-button>
              <n-button @click="resetPrompt('enKeywords')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="content" tab="正文内容">
          <n-form
            ref="contentFormRef"
            :model="promptData.content"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.content.content"
                type="textarea"
                placeholder="请输入论文正文内容生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="正文结构设置">
              <n-space vertical>
                <n-data-table
                  :columns="structureColumns"
                  :data="promptData.content.structure"
                  :pagination="false"
                  :bordered="false"
                  striped
                />
                <n-button 
                  size="small" 
                  type="primary" 
                  @click="addStructureItem"
                  secondary
                  :disabled="promptData.content.structure.length >= 10"
                >
                  添加章节
                </n-button>
              </n-space>
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <span>最小字数:</span>
                  <n-input-number v-model:value="promptData.content.params.minWords" :min="1000" :max="10000" />
                  <span>最大字数:</span>
                  <n-input-number v-model:value="promptData.content.params.maxWords" :min="1500" :max="20000" />
                </n-space>
                <n-space align="center">
                  <span>引用频率:</span>
                  <n-slider v-model:value="promptData.content.params.citationFrequency" :min="1" :max="10" :step="1" style="width: 200px" />
                  <n-input-number v-model:value="promptData.content.params.citationFrequency" :min="1" :max="10" :step="1" size="small" />
                </n-space>
                <n-space align="center">
                  <span>专业术语使用:</span>
                  <n-slider v-model:value="promptData.content.params.termUsage" :min="1" :max="5" :step="1" style="width: 200px" />
                  <n-input-number v-model:value="promptData.content.params.termUsage" :min="1" :max="5" :step="1" size="small" />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('content')">保存设置</n-button>
              <n-button @click="resetPrompt('content')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="references" tab="参考文献">
          <n-form
            ref="referencesFormRef"
            :model="promptData.references"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.references.content"
                type="textarea"
                placeholder="请输入论文参考文献生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <span>文献数量:</span>
                  <n-input-number v-model:value="promptData.references.params.count" :min="5" :max="30" />
                </n-space>
                <n-space align="center">
                  <n-switch v-model:value="promptData.references.params.chinaProportion" /> 
                  <span>中文文献比例:</span>
                  <n-slider v-model:value="promptData.references.params.chinaProportionValue" :min="0" :max="1" :step="0.1" :disabled="!promptData.references.params.chinaProportion" style="width: 200px" />
                  <n-input-number v-model:value="promptData.references.params.chinaProportionValue" :min="0" :max="1" :step="0.1" :disabled="!promptData.references.params.chinaProportion" size="small" />
                </n-space>
                <n-alert type="info" :show-icon="true">
                  参考文献格式为：GB/T 7714-2015
                </n-alert>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('references')">保存设置</n-button>
              <n-button @click="resetPrompt('references')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="acknowledgement" tab="致谢">
          <n-form
            ref="acknowledgementFormRef"
            :model="promptData.acknowledgement"
            label-placement="left"
            :label-width="120"
          >
            <n-form-item label="提示词内容" path="content">
              <n-input
                v-model:value="promptData.acknowledgement.content"
                type="textarea"
                placeholder="请输入论文致谢生成的提示词"
                :autosize="{ minRows: 5, maxRows: 12 }"
              />
            </n-form-item>
            <n-form-item label="参数设置" path="params">
              <n-space vertical>
                <n-space align="center">
                  <span>致谢风格:</span>
                  <n-select 
                    v-model:value="promptData.acknowledgement.params.style" 
                    :options="acknowledgementStyleOptions"
                    style="width: 150px"
                  />
                </n-space>
                <n-space align="center">
                  <span>最小字数:</span>
                  <n-input-number v-model:value="promptData.acknowledgement.params.minWords" :min="100" :max="300" />
                  <span>最大字数:</span>
                  <n-input-number v-model:value="promptData.acknowledgement.params.maxWords" :min="150" :max="500" />
                </n-space>
              </n-space>
            </n-form-item>
            <n-divider />
            <n-space justify="end">
              <n-button type="primary" @click="savePrompt('acknowledgement')">保存设置</n-button>
              <n-button @click="resetPrompt('acknowledgement')">重置</n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, h, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { getPaperPromptList, savePaperPrompt } from '@/api/paper';
import type { FormInst, DataTableColumns } from 'naive-ui';
import { EditOutlined, DeleteOutlined } from '@vicons/antd';

export default defineComponent({
  name: 'PaperPrompt',
  components: {
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const message = useMessage();
    const titleFormRef = ref<FormInst | null>(null);
    const abstractFormRef = ref<FormInst | null>(null);
    const keywordsFormRef = ref<FormInst | null>(null);
    const enAbstractFormRef = ref<FormInst | null>(null);
    const enKeywordsFormRef = ref<FormInst | null>(null);
    const contentFormRef = ref<FormInst | null>(null);
    const referencesFormRef = ref<FormInst | null>(null);
    const acknowledgementFormRef = ref<FormInst | null>(null);
    
    // 默认的提示词数据
    const defaultPromptData = {
      title: {
        content: '请生成一篇学术论文的标题，标题应当准确、简洁地概括论文的主要内容，避免过于笼统或过于具体。标题应当使用专业术语，但不要使用不必要的缩写或行话。',
        params: {
          useKeywords: true,
          minLength: 15,
          maxLength: 40,
          creativity: 0.7
        }
      },
      abstract: {
        content: '请生成一篇学术论文的中文摘要。摘要应当包括研究目的、方法、主要结果和结论。摘要应当独立、完整、简明扼要，不包含图表、参考文献和不常用的缩略词。',
        params: {
          useTitleReference: true,
          minWords: 180,
          maxWords: 350,
          professionalLevel: 4
        }
      },
      keywords: {
        content: '请根据论文的标题和摘要，生成3-6个关键词。关键词应当反映论文的核心内容和研究方向，有助于文献检索。关键词之间使用分号隔开。',
        params: {
          count: 5,
          useTitleAndAbstract: true,
          professionalLevel: 4
        }
      },
      enAbstract: {
        content: '请将中文摘要翻译成英文。翻译应当准确表达原意，同时符合英文学术写作的语法和表达习惯，避免直译。',
        params: {
          basedOnChinese: true,
          englishLevel: 'professional'
        }
      },
      enKeywords: {
        content: '请将中文关键词翻译成英文。翻译应当使用该领域通用的术语，以便于国际检索。',
        params: {
          translateFromChinese: true
        }
      },
      content: {
        content: '请根据提供的标题、摘要和关键词，生成一篇完整的学术论文正文。论文结构应包括引言、研究方法、结果与分析、讨论和结论等部分。论文内容应当具有逻辑性和连贯性，论点应当有理有据，且引用相关文献支持。',
        structure: [
          { id: 1, name: '引言', proportion: 0.15 },
          { id: 2, name: '研究方法', proportion: 0.25 },
          { id: 3, name: '结果与分析', proportion: 0.3 },
          { id: 4, name: '讨论', proportion: 0.2 },
          { id: 5, name: '结论', proportion: 0.1 }
        ],
        params: {
          minWords: 3000,
          maxWords: 5000,
          citationFrequency: 5,
          termUsage: 3
        }
      },
      references: {
        content: '请根据论文内容生成符合GB/T 7714-2015格式的参考文献列表。参考文献应当包括近5年的相关研究成果，包括期刊文章、会议论文、专著等多种类型。',
        params: {
          count: 15,
          chinaProportion: true,
          chinaProportionValue: 0.6
        }
      },
      acknowledgement: {
        content: '请生成论文致谢部分。致谢应当对论文研究过程中提供帮助的个人、机构和基金等表示感谢。语言应当真诚、得体，避免过于夸张的表达。',
        params: {
          style: 'formal',
          minWords: 150,
          maxWords: 300
        }
      }
    };
    
    // 表单数据
    const promptData = reactive({ ...defaultPromptData });
    
    // 英文水平选项
    const englishLevelOptions = [
      { label: '专业学术级', value: 'professional' },
      { label: '高级', value: 'advanced' },
      { label: '标准', value: 'standard' }
    ];
    
    // 致谢风格选项
    const acknowledgementStyleOptions = [
      { label: '正式', value: 'formal' },
      { label: '诚恳', value: 'sincere' },
      { label: '简洁', value: 'brief' }
    ];
    
    // 结构表格列定义
    const structureColumns = reactive({
      id: {
        title: '序号',
        key: 'id',
        width: 60
      },
      name: {
        title: '章节名称',
        key: 'name',
        render(row) {
          return h(
            'div',
            {
              class: 'flex items-center gap-2',
            },
            [
              h('span', row.name),
              h(
                'div',
                {
                  class: 'ml-auto flex gap-2',
                },
                [
                  h(
                    'button',
                    {
                      class: 'p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded',
                      onClick: () => editStructureItem(row)
                    },
                    [h(EditOutlined, { size: 16 })]
                  )
                ]
              )
            ]
          );
        }
      },
      proportion: {
        title: '比例',
        key: 'proportion',
        width: 120,
        render(row) {
          return h(
            'div',
            {
              class: 'flex items-center gap-2',
            },
            [
              h('span', `${Math.round(row.proportion * 100)}%`),
              h(
                'div',
                {
                  class: 'ml-auto',
                },
                [
                  h(
                    'button',
                    {
                      class: 'p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded',
                      onClick: () => deleteStructureItem(row)
                    },
                    [h(DeleteOutlined, { size: 16 })]
                  )
                ]
              )
            ]
          );
        }
      }
    });
    
    // 添加章节结构
    const addStructureItem = () => {
      const maxId = promptData.content.structure.length > 0 
        ? Math.max(...promptData.content.structure.map(item => item.id))
        : 0;
        
      promptData.content.structure.push({
        id: maxId + 1,
        name: '新章节',
        proportion: 0.1
      });
      
      // 重新调整比例
      normalizeProportions();
    };
    
    // 编辑章节
    const editStructureItem = (row) => {
      const index = promptData.content.structure.findIndex(item => item.id === row.id);
      if (index !== -1) {
        message.info('请在表格中直接修改章节信息');
      }
    };
    
    // 删除章节
    const deleteStructureItem = (row) => {
      const index = promptData.content.structure.findIndex(item => item.id === row.id);
      if (index !== -1) {
        promptData.content.structure.splice(index, 1);
        normalizeProportions();
      }
    };
    
    // 规范化所有章节比例之和为1
    const normalizeProportions = () => {
      const total = promptData.content.structure.reduce((sum, item) => sum + item.proportion, 0);
      if (total === 0) return; // 避免除以零
      
      promptData.content.structure.forEach(item => {
        item.proportion = parseFloat((item.proportion / total).toFixed(2));
      });
      
      // 修正舍入误差
      const newTotal = promptData.content.structure.reduce((sum, item) => sum + item.proportion, 0);
      if (newTotal !== 1) {
        const diff = 1 - newTotal;
        promptData.content.structure[0].proportion = parseFloat((promptData.content.structure[0].proportion + diff).toFixed(2));
      }
    };
    
    // 保存提示词
    const savePrompt = async (type) => {
      try {
        const res = await savePaperPrompt({ 
          type, 
          data: promptData[type] 
        });
        
        if (res.code === 0) {
          message.success('保存成功');
        } else {
          message.error(res.message || '保存失败');
        }
      } catch (error) {
        message.error('保存出错');
        console.error('保存提示词出错:', error);
      }
    };
    
    // 重置提示词
    const resetPrompt = (type) => {
      Object.assign(promptData[type], defaultPromptData[type]);
      message.success('已重置');
    };
    
    // 加载提示词数据
    const loadData = async () => {
      try {
        const res = await getPaperPromptList();
        
        if (res.code === 0 && res.result) {
          Object.keys(res.result).forEach(key => {
            if (promptData[key]) {
              Object.assign(promptData[key], res.result[key]);
            }
          });
        }
      } catch (error) {
        message.error('获取提示词数据出错');
        console.error('获取提示词数据出错:', error);
      }
    };
    
    onMounted(() => {
      loadData();
    });
    
    return {
      titleFormRef,
      abstractFormRef,
      keywordsFormRef,
      enAbstractFormRef,
      enKeywordsFormRef,
      contentFormRef,
      referencesFormRef,
      acknowledgementFormRef,
      promptData,
      englishLevelOptions,
      acknowledgementStyleOptions,
      structureColumns,
      addStructureItem,
      editStructureItem,
      deleteStructureItem,
      savePrompt,
      resetPrompt
    };
  }
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style> 