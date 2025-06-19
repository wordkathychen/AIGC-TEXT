import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { SettingOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 */

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/overview',
    component: Layout,
    meta: {
      title: '系统管理',
      icon: renderIcon(SettingOutlined),
      sort: 1,
    },
    children: [
      {
        path: 'overview',
        name: 'Overview',
        meta: {
          title: '系统概览',
        },
        component: () => import('@/views/admin-panel/Overview.vue'),
      },
      {
        path: 'prompt-config',
        name: 'PromptConfig',
        meta: {
          title: '提示词配置',
        },
        component: () => import('@/views/admin-panel/PromptConfig.vue'),
      },
      {
        path: 'member-quota',
        name: 'MemberQuota',
        meta: {
          title: '会员额度管理',
        },
        component: () => import('@/views/admin-panel/MemberQuota.vue'),
      },
      {
        path: 'account-manage',
        name: 'AccountManage',
        meta: {
          title: '账户管理',
        },
        component: () => import('@/views/admin-panel/AccountManage.vue'),
      },
      {
        path: 'template-manage',
        name: 'TemplateManage',
        meta: {
          title: '模板管理',
        },
        component: () => import('@/views/admin-panel/TemplateManage.vue'),
      },
      {
        path: 'exe-config',
        name: 'ExeConfig',
        meta: {
          title: '环境配置',
        },
        component: () => import('@/views/admin-panel/ExeConfig.vue'),
      },
      {
        path: 'docker-status',
        name: 'DockerStatus',
        meta: {
          title: 'Docker状态',
        },
        component: () => import('@/views/admin-panel/DockerStatus.vue'),
      },
    ],
  },
];

export default routes; 