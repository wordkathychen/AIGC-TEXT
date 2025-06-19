import { RouteRecordRaw } from 'vue-router';
import { isNavigationFailure } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import { PageEnum } from '@/enums/pageEnum';

export function createAuthGuard(router) {
  // 白名单路由列表
  const whitePathList = [
    PageEnum.BASE_LOGIN,
    '/paper/login'
  ];

  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    
    // 判断是否是论文系统的路由
    if (to.path.startsWith('/paper') && to.path !== '/paper/login') {
      // 检查是否已登录论文系统
      const token = localStorage.getItem('paper-admin-token');
      
      if (!token) {
        // 未登录，重定向到论文系统登录页面
        next({ path: '/paper/login', query: { redirect: to.fullPath } });
        NProgress.done();
        return;
      }
    }
    
    // 其他路由正常处理
    next();
  });

  router.afterEach((to, from, failure) => {
    if (isNavigationFailure(failure)) {
      console.error('navigation error', failure);
    }
    NProgress.done();
  });
} 