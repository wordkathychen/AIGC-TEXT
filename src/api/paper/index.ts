import { http } from '@/utils/http/axios';

/**
 * 论文提示词相关API
 */
export function getPaperPromptList() {
  return http.request({
    url: '/paper/prompt/list',
    method: 'GET',
  });
}

export function savePaperPrompt(data) {
  return http.request({
    url: '/paper/prompt/save',
    method: 'POST',
    data,
  });
}

/**
 * 论文模板相关API
 */
export function getPaperTemplateList(params) {
  return http.request({
    url: '/paper/template/list',
    method: 'GET',
    params,
  });
}

export function getPaperTemplateDetail(id: string) {
  return http.request({
    url: `/paper/template/detail/${id}`,
    method: 'GET',
  });
}

export function savePaperTemplate(data) {
  return http.request({
    url: '/paper/template/save',
    method: 'POST',
    data,
  });
}

export function uploadPaperTemplate(data) {
  return http.request({
    url: '/paper/template/upload',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function deletePaperTemplate(id: string) {
  return http.request({
    url: `/paper/template/delete/${id}`,
    method: 'DELETE',
  });
}

/**
 * 论文生成数据统计API
 */
export function getPaperStatistics(params) {
  return http.request({
    url: '/paper/statistics',
    method: 'GET',
    params,
  });
}

/**
 * EXE配置相关API
 */
export function getExeConfig() {
  return http.request({
    url: '/paper/exe-config',
    method: 'GET',
  });
}

export function saveExeConfig(data) {
  return http.request({
    url: '/paper/exe-config',
    method: 'POST',
    data,
  });
}

/**
 * Docker配置相关API
 */
export function getDockerConfig() {
  return http.request({
    url: '/paper/docker-config',
    method: 'GET',
  });
}

export function saveDockerConfig(data) {
  return http.request({
    url: '/paper/docker-config',
    method: 'POST',
    data,
  });
}

export function getDockerStatus() {
  return http.request({
    url: '/paper/docker-status',
    method: 'GET',
  });
}

export function operateDocker(data) {
  return http.request({
    url: '/paper/docker-operate',
    method: 'POST',
    data,
  });
} 