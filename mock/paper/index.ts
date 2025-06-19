import { MockMethod } from 'vite-plugin-mock';
import { resultSuccess, resultError, getRequestToken, requestParams } from '../_util';
import { createFakeUserList } from '../sys/user';

// mock用户数据
const paperTemplateList = [
  {
    id: 1,
    name: '本科毕业论文模板',
    schoolId: 'school-1',
    schoolName: '北京大学',
    categoryId: 'category-1',
    categoryName: '本科论文',
    fileType: 'docx',
    fileSize: '2.5MB',
    downloads: 245,
    createTime: '2023-05-10 14:25:36',
    updateTime: '2023-05-10 14:25:36',
    status: 1,
    description: '北京大学本科生毕业论文标准模板，包含论文封面、摘要、目录、正文、参考文献等部分的统一格式要求。',
    previewUrl: 'https://example.com/preview/template1.png',
  },
  {
    id: 2,
    name: '硕士研究生学位论文模板',
    schoolId: 'school-1',
    schoolName: '北京大学',
    categoryId: 'category-2',
    categoryName: '硕士论文',
    fileType: 'docx',
    fileSize: '3.1MB',
    downloads: 187,
    createTime: '2023-04-22 09:15:27',
    updateTime: '2023-06-12 11:35:42',
    status: 1,
    description: '北京大学硕士研究生学位论文标准模板，根据研究生院最新要求制定，包含各部分详细格式说明。',
    previewUrl: 'https://example.com/preview/template2.png',
  },
  {
    id: 3,
    name: '博士研究生学位论文模板',
    schoolId: 'school-1',
    schoolName: '北京大学',
    categoryId: 'category-3',
    categoryName: '博士论文',
    fileType: 'pdf',
    fileSize: '4.2MB',
    downloads: 156,
    createTime: '2023-04-18 16:44:20',
    updateTime: '2023-06-12 11:35:45',
    status: 1,
    description: '北京大学博士研究生学位论文标准模板，符合国家和学校关于博士学位论文的最新格式要求。',
    previewUrl: 'https://example.com/preview/template3.png',
  },
];

// 论文提示词数据
const paperPrompts = {
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

// Docker配置数据
const dockerConfig = {
  config: {
    imageName: 'aigc-text-server',
    imageVersion: 'latest',
    containerName: 'aigc-text-container',
    restartPolicy: 'unless-stopped',
    ports: [
      { host: 8080, container: 8080 }
    ],
    envs: [
      { name: 'NODE_ENV', value: 'production' }
    ],
    volumes: [
      { host: '/data/aigc-text', container: '/app/data' }
    ],
    resources: {
      cpuLimit: 2,
      memoryLimit: 2048
    },
    logPath: '/var/log/aigc-text',
    network: {
      type: 'bridge',
      name: ''
    }
  },
  advancedConfig: {
    autoUpdate: false,
    autoClearLogs: false,
    logRetentionDays: 30,
    healthCheck: {
      enabled: true,
      interval: 30,
      timeout: 10,
      retries: 3,
      command: 'curl -f http://localhost:8080/health || exit 1'
    },
    customCommand: '',
    useCompose: false,
    composeFile: 'version: "3"\nservices:\n  aigc-text:\n    image: aigc-text-server:latest\n    container_name: aigc-text-container\n    restart: unless-stopped\n    ports:\n      - 8080:8080'
  }
};

// Docker状态数据
const dockerStatus = {
  running: true,
  status: '运行中',
  containerId: 'a72f3627b8cc',
  imageVersion: 'aigc-text-server:latest',
  uptime: '3天14小时25分钟',
  cpuUsage: '12.5%',
  memoryUsage: '256MB',
  memoryLimit: '2048MB',
  networkStatus: '正常',
  lastUpdated: '2023-06-15 10:25:36'
};

// EXE配置数据
const exeConfig = {
  basic: {
    appName: 'AIGC论文生成器',
    appVersion: '1.0.0',
    apiBaseUrl: 'https://api.example.com',
    requestTimeout: 30,
    connectionCheck: {
      enabled: true,
      interval: 30,
      retries: 3,
      retryDelay: 5
    },
    autoUpdate: {
      enabled: true,
      frequency: 'daily',
      sourceUrl: 'https://update.example.com/aigc-text'
    },
    logging: {
      enabled: true,
      level: 'info',
      retentionDays: 7,
      maxSize: 10
    }
  },
  api: {
    defaultModel: 'gpt-4',
    keys: [
      { id: 1, provider: 'OpenAI', key: 'sk-API_KEY_HIDDEN_FOR_SECURITY', isActive: true },
      { id: 2, provider: '文心一言', key: 'API_KEY_HIDDEN_FOR_SECURITY', isActive: false },
      { id: 3, provider: '讯飞星火', key: 'API_KEY_HIDDEN_FOR_SECURITY', isActive: true }
    ],
    requestParams: {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4000,
      maxRetries: 3
    },
    proxy: {
      enabled: false,
      host: '127.0.0.1',
      port: 7890,
      type: 'http',
      auth: {
        required: false,
        username: '',
        password: ''
      }
    }
  },
  ui: {
    theme: 'light',
    title: 'AIGC论文生成助手',
    logo: '/assets/logo.png',
    window: {
      defaultWidth: 1280,
      defaultHeight: 800,
      startMaximized: false,
      rememberPosition: true
    },
    fonts: {
      ui: 'Microsoft YaHei',
      editor: 'Consolas',
      uiSize: 14,
      editorSize: 16
    }
  },
  auth: {
    loginRequired: true,
    adminUsername: 'admin',
    adminPassword: 'password123',
    encryption: {
      enabled: false,
      algorithm: 'aes-256-gcm',
      key: ''
    }
  }
};

export default [
  // 获取论文模板列表
  {
    url: '/basic-api/paper/template/list',
    timeout: 200,
    method: 'get',
    response: (request: requestParams) => {
      const { schoolId, categoryId } = request.query;
      const items = paperTemplateList.filter(item => {
        if (schoolId && item.schoolId !== schoolId) return false;
        if (categoryId && item.categoryId !== categoryId) return false;
        return true;
      });
      
      return resultSuccess({
        items,
        total: items.length
      });
    }
  },
  
  // 获取模板详情
  {
    url: '/basic-api/paper/template/detail/:id',
    method: 'get',
    response: ({ query }) => {
      const { id } = query;
      const template = paperTemplateList.find(item => item.id == id);
      if (!template) {
        return resultError('未找到模板');
      }
      return resultSuccess(template);
    }
  },
  
  // 上传模板
  {
    url: '/basic-api/paper/template/upload',
    timeout: 1000,
    method: 'post',
    response: ({ body }) => {
      return resultSuccess({ id: Date.now() });
    }
  },
  
  // 保存模板
  {
    url: '/basic-api/paper/template/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      return resultSuccess({ id: body.id || Date.now() });
    }
  },
  
  // 删除模板
  {
    url: '/basic-api/paper/template/delete/:id',
    timeout: 200,
    method: 'delete',
    response: ({ query }) => {
      return resultSuccess(true);
    }
  },
  
  // 获取提示词列表
  {
    url: '/basic-api/paper/prompt/list',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(paperPrompts);
    }
  },
  
  // 保存提示词
  {
    url: '/basic-api/paper/prompt/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { type, data } = body;
      if (!type || !data) {
        return resultError('参数错误');
      }
      
      if (paperPrompts[type]) {
        paperPrompts[type] = data;
      }
      
      return resultSuccess(true);
    }
  },
  
  // 获取Docker配置
  {
    url: '/basic-api/paper/docker-config',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(dockerConfig);
    }
  },
  
  // 保存Docker配置
  {
    url: '/basic-api/paper/docker-config',
    timeout: 500,
    method: 'post',
    response: ({ body }) => {
      if (body.config) {
        Object.assign(dockerConfig.config, body.config);
      }
      
      if (body.advancedConfig) {
        Object.assign(dockerConfig.advancedConfig, body.advancedConfig);
      }
      
      return resultSuccess(true);
    }
  },
  
  // 获取Docker状态
  {
    url: '/basic-api/paper/docker-status',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(dockerStatus);
    }
  },
  
  // 操作Docker
  {
    url: '/basic-api/paper/docker-operate',
    timeout: 1000,
    method: 'post',
    response: ({ body }) => {
      const { action } = body;
      
      if (action === 'start') {
        dockerStatus.running = true;
        dockerStatus.status = '运行中';
        dockerStatus.uptime = '0分钟';
      } else if (action === 'stop') {
        dockerStatus.running = false;
        dockerStatus.status = '已停止';
        dockerStatus.uptime = '0分钟';
      } else if (action === 'restart') {
        dockerStatus.running = true;
        dockerStatus.status = '运行中';
        dockerStatus.uptime = '0分钟';
      } else if (action === 'logs') {
        return resultSuccess({
          logs: '2023-06-15 10:25:36 [INFO] 服务已启动\n2023-06-15 10:25:36 [INFO] 监听端口 8080\n2023-06-15 10:30:12 [INFO] 接收到API请求\n2023-06-15 10:30:15 [INFO] 请求处理完成'
        });
      } else if (action === 'clearLogs') {
        return resultSuccess(true);
      } else if (action === 'downloadLogs') {
        return resultSuccess({
          downloadUrl: '/logs/docker.log'
        });
      }
      
      return resultSuccess(dockerStatus);
    }
  },
  
  // 获取EXE配置
  {
    url: '/basic-api/paper/exe-config',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(exeConfig);
    }
  },
  
  // 保存EXE配置
  {
    url: '/basic-api/paper/exe-config',
    timeout: 500,
    method: 'post',
    response: ({ body }) => {
      if (body.basic) {
        Object.assign(exeConfig.basic, body.basic);
      }
      
      if (body.api) {
        Object.assign(exeConfig.api, body.api);
      }
      
      if (body.ui) {
        Object.assign(exeConfig.ui, body.ui);
      }
      
      if (body.auth) {
        Object.assign(exeConfig.auth, body.auth);
      }
      
      return resultSuccess(true);
    }
  }
] as MockMethod[]; 