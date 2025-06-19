import { MockMethod } from 'vite-plugin-mock';
import { resultSuccess, resultError } from '../_util';

// 提示词配置mock数据
const promptConfigList = [
  {
    id: '1',
    name: '通用提示词',
    content: '你是一个智能AI助手，请用简洁专业的语言回答问题。',
    type: 'general',
    status: 1,
    createTime: '2023-05-01 12:00:00',
  },
  {
    id: '2',
    name: '代码生成提示词',
    content: '你是一位资深的软件工程师，精通多种编程语言。请帮助我生成高质量、可维护的代码。',
    type: 'code',
    status: 1,
    createTime: '2023-05-02 14:30:00',
  },
  {
    id: '3',
    name: '市场营销提示词',
    content: '你是一位营销专家，擅长创意文案和品牌宣传。请帮助我撰写有吸引力的市场营销内容。',
    type: 'marketing',
    status: 0,
    createTime: '2023-05-03 09:15:00',
  },
];

// 会员额度mock数据
const memberQuotaList = [
  {
    id: '1',
    username: 'user001',
    memberLevel: '普通会员',
    totalQuota: 100,
    usedQuota: 45,
    remainQuota: 55,
    expireTime: '2023-12-31 23:59:59',
    createTime: '2023-01-15 10:00:00',
  },
  {
    id: '2',
    username: 'user002',
    memberLevel: '高级会员',
    totalQuota: 500,
    usedQuota: 120,
    remainQuota: 380,
    expireTime: '2023-12-31 23:59:59',
    createTime: '2023-02-18 15:30:00',
  },
  {
    id: '3',
    username: 'user003',
    memberLevel: 'VIP会员',
    totalQuota: 1000,
    usedQuota: 300,
    remainQuota: 700,
    expireTime: '2024-06-30 23:59:59',
    createTime: '2023-03-22 09:45:00',
  },
];

// 账户管理mock数据
const accountList = [
  {
    id: '1',
    accountName: 'admin',
    role: '管理员',
    status: 1,
    lastLoginTime: '2023-06-15 08:30:45',
    createTime: '2023-01-01 00:00:00',
    apiKey: 'sk-admin-xxxxxxxxxxxx',
  },
  {
    id: '2',
    accountName: 'operator',
    role: '运营人员',
    status: 1,
    lastLoginTime: '2023-06-14 16:22:10',
    createTime: '2023-02-15 10:30:00',
    apiKey: 'sk-operator-xxxxxxxxxxxx',
  },
  {
    id: '3',
    accountName: 'viewer',
    role: '只读用户',
    status: 0,
    lastLoginTime: '2023-06-10 09:15:30',
    createTime: '2023-03-20 14:15:00',
    apiKey: 'sk-viewer-xxxxxxxxxxxx',
  },
];

// 模板管理mock数据
const templateList = [
  {
    id: '1',
    name: '通用文档模板',
    description: '适用于一般文档生成的模板',
    filePath: '/templates/general_doc.docx',
    fileSize: '125KB',
    downloadCount: 156,
    status: 1,
    createTime: '2023-04-10 11:20:00',
  },
  {
    id: '2',
    name: '简历模板',
    description: '专业求职简历模板',
    filePath: '/templates/resume.pdf',
    fileSize: '380KB',
    downloadCount: 320,
    status: 1,
    createTime: '2023-04-15 16:40:00',
  },
  {
    id: '3',
    name: '项目报告模板',
    description: '项目总结与分析报告模板',
    filePath: '/templates/project_report.pptx',
    fileSize: '2.5MB',
    downloadCount: 87,
    status: 0,
    createTime: '2023-04-22 09:30:00',
  },
];

// 系统概览mock数据
const systemOverview = {
  userCount: 1280,
  activeUserToday: 368,
  totalRequests: 12653,
  requestsToday: 1289,
  cpuUsage: 42,
  memoryUsage: 3.8,
  diskUsage: 56,
  topModels: [
    { name: 'GPT-4', count: 3560 },
    { name: 'GPT-3.5', count: 6290 },
    { name: 'Claude', count: 2180 },
    { name: 'DALL-E', count: 623 },
  ],
  dailyStats: [
    { date: '2023-06-10', requests: 985 },
    { date: '2023-06-11', requests: 1052 },
    { date: '2023-06-12', requests: 891 },
    { date: '2023-06-13', requests: 1145 },
    { date: '2023-06-14', requests: 1267 },
    { date: '2023-06-15', requests: 1323 },
    { date: '2023-06-16', requests: 1289 },
  ],
};

// 环境配置mock数据
const exeConfig = {
  pythonPath: '/usr/bin/python3',
  nodeJsPath: '/usr/local/bin/node',
  aiModels: [
    { id: 'gpt-3.5', name: 'GPT-3.5', status: 'active' },
    { id: 'gpt-4', name: 'GPT-4', status: 'active' },
    { id: 'claude-instant', name: 'Claude Instant', status: 'inactive' },
    { id: 'dall-e', name: 'DALL-E', status: 'active' },
  ],
  systemSettings: {
    maxConcurrentRequests: 50,
    requestTimeout: 60000,
    enableCache: true,
    cacheExpiry: 3600000,
  },
  apiKeys: {
    openai: 'sk-xxxx-xxxxxxxxxxxxx',
    azure: 'az-xxxx-xxxxxxxxxxxxx',
    anthropic: 'sk-ant-xxxxxxxxxxxxx',
  },
};

// Docker状态mock数据
const dockerStatus = {
  isRunning: true,
  containers: [
    {
      id: 'abc123def456',
      name: 'aigc-api-server',
      image: 'aigc-api:latest',
      status: 'running',
      cpu: '0.5%',
      memory: '128MB',
      uptime: '3天2小时',
    },
    {
      id: 'ghi789jkl012',
      name: 'aigc-web-server',
      image: 'aigc-web:latest',
      status: 'running',
      cpu: '0.3%',
      memory: '85MB',
      uptime: '3天2小时',
    },
    {
      id: 'mno345pqr678',
      name: 'aigc-db',
      image: 'postgres:13',
      status: 'running',
      cpu: '0.8%',
      memory: '256MB',
      uptime: '5天18小时',
    },
    {
      id: 'stu901vwx234',
      name: 'aigc-redis',
      image: 'redis:6',
      status: 'running',
      cpu: '0.1%',
      memory: '32MB',
      uptime: '5天18小时',
    },
  ],
  dockerVersion: '20.10.14',
  dockerApiVersion: '1.41',
  hostSystem: 'Linux 5.15.0-generic',
};

export default [
  // 提示词配置相关接口
  {
    url: '/api/admin/prompt/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const pageStart = (Number(page) - 1) * Number(pageSize);
      const pageEnd = pageStart + Number(pageSize);
      const data = promptConfigList.slice(pageStart, pageEnd);
      
      return resultSuccess({
        list: data,
        total: promptConfigList.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    },
  },
  {
    url: '/api/admin/prompt/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      if (body.id) {
        // 编辑
        const index = promptConfigList.findIndex(item => item.id === body.id);
        if (index !== -1) {
          promptConfigList[index] = { ...promptConfigList[index], ...body };
        }
      } else {
        // 新增
        const newItem = {
          id: String(promptConfigList.length + 1),
          createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
          ...body,
        };
        promptConfigList.push(newItem);
      }
      return resultSuccess(null);
    },
  },
  {
    url: '/api/admin/prompt/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = promptConfigList.findIndex(item => item.id === query.id);
      if (index !== -1) {
        promptConfigList.splice(index, 1);
        return resultSuccess(null);
      }
      return resultError('删除失败，提示词不存在');
    },
  },
  
  // 会员额度相关接口
  {
    url: '/api/admin/member/quota/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const pageStart = (Number(page) - 1) * Number(pageSize);
      const pageEnd = pageStart + Number(pageSize);
      const data = memberQuotaList.slice(pageStart, pageEnd);
      
      return resultSuccess({
        list: data,
        total: memberQuotaList.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    },
  },
  {
    url: '/api/admin/member/quota/adjust',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { id, adjustAmount } = body;
      const index = memberQuotaList.findIndex(item => item.id === id);
      if (index !== -1) {
        const totalQuota = memberQuotaList[index].totalQuota + Number(adjustAmount);
        const remainQuota = memberQuotaList[index].remainQuota + Number(adjustAmount);
        memberQuotaList[index].totalQuota = totalQuota;
        memberQuotaList[index].remainQuota = remainQuota;
        return resultSuccess(null);
      }
      return resultError('调整失败，会员不存在');
    },
  },
  
  // 账户管理相关接口
  {
    url: '/api/admin/account/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const pageStart = (Number(page) - 1) * Number(pageSize);
      const pageEnd = pageStart + Number(pageSize);
      const data = accountList.slice(pageStart, pageEnd);
      
      return resultSuccess({
        list: data,
        total: accountList.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    },
  },
  {
    url: '/api/admin/account/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      if (body.id) {
        // 编辑
        const index = accountList.findIndex(item => item.id === body.id);
        if (index !== -1) {
          accountList[index] = { ...accountList[index], ...body };
        }
      } else {
        // 新增
        const newItem = {
          id: String(accountList.length + 1),
          lastLoginTime: '-',
          createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
          ...body,
        };
        accountList.push(newItem);
      }
      return resultSuccess(null);
    },
  },
  {
    url: '/api/admin/account/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = accountList.findIndex(item => item.id === query.id);
      if (index !== -1) {
        accountList.splice(index, 1);
        return resultSuccess(null);
      }
      return resultError('删除失败，账户不存在');
    },
  },
  {
    url: '/api/admin/account/key/edit',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { id, apiKey } = body;
      const index = accountList.findIndex(item => item.id === id);
      if (index !== -1) {
        accountList[index].apiKey = apiKey;
        return resultSuccess(null);
      }
      return resultError('修改失败，账户不存在');
    },
  },
  
  // 模板管理相关接口
  {
    url: '/api/admin/template/list',
    timeout: 200,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query;
      const pageStart = (Number(page) - 1) * Number(pageSize);
      const pageEnd = pageStart + Number(pageSize);
      const data = templateList.slice(pageStart, pageEnd);
      
      return resultSuccess({
        list: data,
        total: templateList.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    },
  },
  {
    url: '/api/admin/template/save',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      if (body.id) {
        // 编辑
        const index = templateList.findIndex(item => item.id === body.id);
        if (index !== -1) {
          templateList[index] = { ...templateList[index], ...body };
        }
      } else {
        // 新增
        const newItem = {
          id: String(templateList.length + 1),
          downloadCount: 0,
          createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
          ...body,
        };
        templateList.push(newItem);
      }
      return resultSuccess(null);
    },
  },
  {
    url: '/api/admin/template/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = templateList.findIndex(item => item.id === query.id);
      if (index !== -1) {
        templateList.splice(index, 1);
        return resultSuccess(null);
      }
      return resultError('删除失败，模板不存在');
    },
  },
  {
    url: '/api/admin/template/upload',
    timeout: 500,
    method: 'post',
    response: () => {
      return resultSuccess({
        filePath: '/templates/uploaded_template.docx',
        fileSize: '256KB',
      });
    },
  },
  
  // 系统概览相关接口
  {
    url: '/api/admin/system/overview',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(systemOverview);
    },
  },
  
  // 环境配置相关接口
  {
    url: '/api/admin/system/exe-config',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(exeConfig);
    },
  },
  {
    url: '/api/admin/system/exe-config',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      Object.assign(exeConfig, body);
      return resultSuccess(null);
    },
  },
  
  // Docker状态相关接口
  {
    url: '/api/admin/system/docker-status',
    timeout: 200,
    method: 'get',
    response: () => {
      return resultSuccess(dockerStatus);
    },
  },
  {
    url: '/api/admin/system/docker-operate',
    timeout: 500,
    method: 'post',
    response: ({ body }) => {
      const { action, containerId } = body;
      
      if (action === 'start') {
        const container = dockerStatus.containers.find(item => item.id === containerId);
        if (container) {
          container.status = 'running';
          return resultSuccess(null);
        }
      } else if (action === 'stop') {
        const container = dockerStatus.containers.find(item => item.id === containerId);
        if (container) {
          container.status = 'stopped';
          return resultSuccess(null);
        }
      } else if (action === 'restart') {
        const container = dockerStatus.containers.find(item => item.id === containerId);
        if (container) {
          container.status = 'running';
          container.uptime = '0天0小时';
          return resultSuccess(null);
        }
      }
      
      return resultError('操作失败，容器不存在或操作无效');
    },
  },
] as MockMethod[]; 