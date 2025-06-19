import { http } from '@/utils/http/axios';

/**
 * 提示词配置相关API
 */
export function getPromptConfigList(params) {
  return http.request({
    url: '/admin/prompt/list',
    method: 'GET',
    params,
  });
}

export function savePromptConfig(data) {
  return http.request({
    url: '/admin/prompt/save',
    method: 'POST',
    data,
  });
}

export function deletePromptConfig(id: string) {
  return http.request({
    url: `/admin/prompt/delete/${id}`,
    method: 'DELETE',
  });
}

/**
 * 会员额度相关API
 */
export function getMemberQuotaList(params) {
  return http.request({
    url: '/admin/member/quota/list',
    method: 'GET',
    params,
  });
}

export function adjustMemberQuota(data) {
  return http.request({
    url: '/admin/member/quota/adjust',
    method: 'POST',
    data,
  });
}

/**
 * 账户管理相关API
 */
export function getAccountList(params) {
  return http.request({
    url: '/admin/account/list',
    method: 'GET',
    params,
  });
}

export function saveAccount(data) {
  return http.request({
    url: '/admin/account/save',
    method: 'POST',
    data,
  });
}

export function deleteAccount(id: string) {
  return http.request({
    url: `/admin/account/delete/${id}`,
    method: 'DELETE',
  });
}

export function editAccountKey(data) {
  return http.request({
    url: '/admin/account/key/edit',
    method: 'POST',
    data,
  });
}

/**
 * 模板管理相关API
 */
export function getTemplateList(params) {
  return http.request({
    url: '/admin/template/list',
    method: 'GET',
    params,
  });
}

export function saveTemplate(data) {
  return http.request({
    url: '/admin/template/save',
    method: 'POST',
    data,
  });
}

export function deleteTemplate(id: string) {
  return http.request({
    url: `/admin/template/delete/${id}`,
    method: 'DELETE',
  });
}

export function uploadTemplate(data) {
  return http.request({
    url: '/admin/template/upload',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 系统概览相关API
 */
export function getSystemOverview() {
  return http.request({
    url: '/admin/system/overview',
    method: 'GET',
  });
}

/**
 * 环境配置相关API
 */
export function getExeConfig() {
  return http.request({
    url: '/admin/system/exe-config',
    method: 'GET',
  });
}

export function saveExeConfig(data) {
  return http.request({
    url: '/admin/system/exe-config',
    method: 'POST',
    data,
  });
}

/**
 * Docker状态相关API
 */
export function getDockerStatus() {
  return http.request({
    url: '/admin/system/docker-status',
    method: 'GET',
  });
}

export function operateDocker(data) {
  return http.request({
    url: '/admin/system/docker-operate',
    method: 'POST',
    data,
  });
} 