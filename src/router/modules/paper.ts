import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { FileTextOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

/**
 * 论文管理系统
 */
const paperRouter: Array<RouteRecordRaw> = [
  {
    path: '/paper/login',
    name: 'PaperLogin',
    component: () => import('@/views/paper-controls/AdminLogin.vue'),
    meta: {
      title: '论文系统登录',
      hidden: true,
      ignoreAuth: true,
    },
  },
  {
    path: '/paper',
    name: 'Paper',
    redirect: '/paper/overview',
    component: Layout,
    meta: {
      title: '论文生成系统',
      icon: renderIcon(FileTextOutlined),
      sort: 10,
    },
    children: [
      {
        path: 'prompt',
        name: 'PaperPrompt',
        meta: {
          title: '提示词管理',
        },
        component: () => import('@/views/paper-controls/PaperPrompt.vue'),
      },
      {
        path: 'templates',
        name: 'PaperTemplates',
        meta: {
          title: '论文模板管理',
        },
        component: () => import('@/views/paper-controls/TemplateManage.vue'),
      },
      {
        path: 'member',
        name: 'PaperMember',
        meta: {
          title: '会员额度管理',
        },
        component: () => import('@/views/paper-controls/UserManagement.vue'),
      },
      {
        path: 'docker',
        name: 'DockerConfig',
        meta: {
          title: 'Docker配置',
        },
        component: () => import('@/views/paper-controls/DockerConfig.vue'),
      },
      {
        path: 'execonfig',
        name: 'ExeConfig',
        meta: {
          title: '客户端配置',
        },
        component: () => import('@/views/paper-controls/ExeConfig.vue'),
      },
      {
        path: 'accounts',
        name: 'AccountManage',
        meta: {
          title: '账号管理',
        },
        component: () => import('@/views/admin-panel/AccountManage.vue'),
      },
      {
        path: 'overview',
        name: 'PaperOverview',
        meta: {
          title: '系统概览',
        },
        component: () => import('@/views/admin-panel/Overview.vue'),
      },
    ],
  },
];

export default paperRouter; 