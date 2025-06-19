<template>
  <div>
    <n-card title="Docker配置" :bordered="false" class="proCard">
      <n-alert title="提示" type="info" :show-icon="true" class="mb-4">
        在此页面可以配置Docker部署相关参数，确保系统正常运行需要正确配置Docker环境。
      </n-alert>
      
      <n-tabs type="line" animated>
        <n-tab-pane name="status" tab="运行状态">
          <n-grid :cols="1" :x-gap="12" :y-gap="12">
            <n-grid-item>
              <n-card title="Docker状态面板" size="small">
                <n-space vertical>
                  <n-space align="center" justify="space-between">
                    <div>
                      <n-tag :type="dockerStatus.running ? 'success' : 'error'" size="medium">
                        {{ dockerStatus.running ? '正在运行' : '未运行' }}
                      </n-tag>
                      <n-text class="ml-2">
                        状态: {{ dockerStatus.status }}
                      </n-text>
                    </div>
                    <div>
                      <n-button 
                        type="primary" 
                        @click="refreshStatus"
                        :loading="loading.refreshing"
                        size="small"
                      >
                        刷新状态
                      </n-button>
                    </div>
                  </n-space>
                  
                  <n-divider />
                  
                  <n-descriptions label-placement="left" bordered>
                    <n-descriptions-item label="容器ID">
                      {{ dockerStatus.containerId || '未知' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="镜像版本">
                      {{ dockerStatus.imageVersion || '未知' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="运行时间">
                      {{ dockerStatus.uptime || '0分钟' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="CPU使用率">
                      {{ dockerStatus.cpuUsage || '0%' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="内存使用">
                      {{ dockerStatus.memoryUsage || '0MB' }} / {{ dockerStatus.memoryLimit || '0MB' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="网络状态">
                      {{ dockerStatus.networkStatus || '未知' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="最后更新时间">
                      {{ dockerStatus.lastUpdated || '-' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="日志路径">
                      {{ dockerConfig.logPath || '未设置' }}
                    </n-descriptions-item>
                  </n-descriptions>
                  
                  <n-divider />
                  
                  <n-space justify="end">
                    <n-button 
                      type="primary" 
                      @click="startDocker"
                      :disabled="dockerStatus.running" 
                      :loading="loading.starting"
                    >
                      启动容器
                    </n-button>
                    <n-button 
                      type="error" 
                      @click="stopDocker"
                      :disabled="!dockerStatus.running" 
                      :loading="loading.stopping"
                    >
                      停止容器
                    </n-button>
                    <n-button 
                      type="warning" 
                      @click="restartDocker"
                      :disabled="!dockerStatus.running" 
                      :loading="loading.restarting"
                    >
                      重启容器
                    </n-button>
                  </n-space>
                </n-space>
              </n-card>
            </n-grid-item>
            
            <n-grid-item>
              <n-card title="运行日志" size="small">
                <n-space vertical>
                  <div class="flex justify-between items-center mb-2">
                    <n-text>最新日志记录</n-text>
                    <n-space>
                      <n-select
                        v-model:value="logLevel"
                        :options="logLevelOptions"
                        size="small"
                        style="width: 120px"
                      />
                      <n-button size="small" @click="fetchLogs">刷新日志</n-button>
                    </n-space>
                  </div>
                  
                  <n-code :code="dockerLogs" language="bash" :show-line-numbers="true" :word-wrap="true" class="log-container" />
                  
                  <n-space justify="end" class="mt-2">
                    <n-button size="small" @click="clearLogs">清空日志</n-button>
                    <n-button type="primary" size="small" @click="downloadLogs">下载完整日志</n-button>
                  </n-space>
                </n-space>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-tab-pane>
        
        <n-tab-pane name="config" tab="基本配置">
          <n-form
            ref="formRef"
            :model="dockerConfig"
            label-placement="left"
            :label-width="140"
            class="py-4"
          >
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="镜像名称" path="imageName">
                  <n-input v-model:value="dockerConfig.imageName" placeholder="例如: aigc-text-server" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="镜像版本" path="imageVersion">
                  <n-input v-model:value="dockerConfig.imageVersion" placeholder="例如: latest, v1.0.0" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="容器名称" path="containerName">
                  <n-input v-model:value="dockerConfig.containerName" placeholder="例如: aigc-text-container" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="重启策略" path="restartPolicy">
                  <n-select
                    v-model:value="dockerConfig.restartPolicy"
                    :options="restartPolicyOptions"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-form-item label="端口映射" path="ports">
              <n-space vertical>
                <n-space v-for="(port, index) in dockerConfig.ports" :key="index" align="center">
                  <n-input-number v-model:value="port.host" placeholder="主机端口" :min="1" :max="65535" />
                  <span>:</span>
                  <n-input-number v-model:value="port.container" placeholder="容器端口" :min="1" :max="65535" />
                  <n-button quaternary circle type="error" @click="removePort(index)">
                    <template #icon>
                      <n-icon><delete-outlined /></n-icon>
                    </template>
                  </n-button>
                </n-space>
                <n-button size="small" @click="addPort">添加端口映射</n-button>
              </n-space>
            </n-form-item>
            
            <n-form-item label="环境变量" path="envs">
              <n-space vertical>
                <n-space v-for="(env, index) in dockerConfig.envs" :key="index" align="center">
                  <n-input v-model:value="env.name" placeholder="名称" />
                  <span>=</span>
                  <n-input v-model:value="env.value" placeholder="值" />
                  <n-button quaternary circle type="error" @click="removeEnv(index)">
                    <template #icon>
                      <n-icon><delete-outlined /></n-icon>
                    </template>
                  </n-button>
                </n-space>
                <n-button size="small" @click="addEnv">添加环境变量</n-button>
              </n-space>
            </n-form-item>
            
            <n-form-item label="数据卷挂载" path="volumes">
              <n-space vertical>
                <n-space v-for="(volume, index) in dockerConfig.volumes" :key="index" align="center">
                  <n-input v-model:value="volume.host" placeholder="主机路径" style="width: 250px" />
                  <span>:</span>
                  <n-input v-model:value="volume.container" placeholder="容器路径" style="width: 250px" />
                  <n-button quaternary circle type="error" @click="removeVolume(index)">
                    <template #icon>
                      <n-icon><delete-outlined /></n-icon>
                    </template>
                  </n-button>
                </n-space>
                <n-button size="small" @click="addVolume">添加数据卷</n-button>
              </n-space>
            </n-form-item>
            
            <n-form-item label="资源限制">
              <n-grid :cols="2" :x-gap="24">
                <n-grid-item>
                  <n-form-item label="CPU限制" path="resources.cpuLimit">
                    <n-input-number
                      v-model:value="dockerConfig.resources.cpuLimit"
                      placeholder="CPU核心数"
                      :min="0.1"
                      :max="16"
                      :step="0.1"
                    />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="内存限制" path="resources.memoryLimit">
                    <n-input-number
                      v-model:value="dockerConfig.resources.memoryLimit"
                      placeholder="内存限制(MB)"
                      :min="128"
                      :step="128"
                    />
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-form-item>
            
            <n-form-item label="日志路径" path="logPath">
              <n-input v-model:value="dockerConfig.logPath" placeholder="例如: /var/log/aigc-text" />
            </n-form-item>
            
            <n-form-item label="网络设置" path="network">
              <n-select
                v-model:value="dockerConfig.network.type"
                :options="networkTypeOptions"
                placeholder="选择网络类型"
              />
              <n-input
                v-if="dockerConfig.network.type === 'custom'"
                v-model:value="dockerConfig.network.name"
                placeholder="自定义网络名称"
                class="mt-2"
              />
            </n-form-item>
            
            <n-divider />
            
            <n-space justify="end">
              <n-button @click="resetConfig">重置</n-button>
              <n-button type="primary" @click="saveConfig" :loading="loading.saving">
                保存配置
              </n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="advanced" tab="高级设置">
          <n-space vertical>
            <n-alert title="警告" type="warning" :show-icon="true" class="mb-4">
              高级设置可能影响系统稳定性，请谨慎修改。修改前请确保已备份配置。
            </n-alert>
            
            <n-form
              ref="advancedFormRef"
              :model="advancedConfig"
              label-placement="left"
              :label-width="160"
              class="py-4"
            >
              <n-form-item label="自动更新镜像" path="autoUpdate">
                <n-switch v-model:value="advancedConfig.autoUpdate" />
              </n-form-item>
              
              <n-form-item label="自动清理日志" path="autoClearLogs">
                <n-switch v-model:value="advancedConfig.autoClearLogs" />
                <n-input-number
                  v-if="advancedConfig.autoClearLogs"
                  v-model:value="advancedConfig.logRetentionDays"
                  placeholder="保留天数"
                  :min="1"
                  :max="365"
                  class="ml-4"
                />
              </n-form-item>
              
              <n-form-item label="健康检查" path="healthCheck">
                <n-switch v-model:value="advancedConfig.healthCheck.enabled" />
                <div v-if="advancedConfig.healthCheck.enabled" class="mt-2">
                  <n-grid :cols="2" :x-gap="24">
                    <n-grid-item>
                      <n-form-item label="检查间隔(秒)" path="healthCheck.interval">
                        <n-input-number
                          v-model:value="advancedConfig.healthCheck.interval"
                          :min="5"
                          :max="300"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="超时时间(秒)" path="healthCheck.timeout">
                        <n-input-number
                          v-model:value="advancedConfig.healthCheck.timeout"
                          :min="1"
                          :max="60"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="重试次数" path="healthCheck.retries">
                        <n-input-number
                          v-model:value="advancedConfig.healthCheck.retries"
                          :min="1"
                          :max="10"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="检查命令" path="healthCheck.command">
                        <n-input
                          v-model:value="advancedConfig.healthCheck.command"
                          placeholder="例如: curl -f http://localhost:8080/health || exit 1"
                        />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </div>
              </n-form-item>
              
              <n-form-item label="自定义启动命令" path="customCommand">
                <n-input
                  v-model:value="advancedConfig.customCommand"
                  type="textarea"
                  placeholder="输入自定义启动命令，每行一条"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                />
              </n-form-item>
              
              <n-form-item label="Docker Compose配置" path="useCompose">
                <n-switch v-model:value="advancedConfig.useCompose" />
                <div v-if="advancedConfig.useCompose" class="mt-2">
                  <n-input
                    v-model:value="advancedConfig.composeFile"
                    type="textarea"
                    placeholder="输入docker-compose.yml内容"
                    :autosize="{ minRows: 10, maxRows: 20 }"
                  />
                </div>
              </n-form-item>
              
              <n-divider />
              
              <n-space justify="end">
                <n-button @click="resetAdvanced">重置</n-button>
                <n-button type="primary" @click="saveAdvanced" :loading="loading.savingAdvanced">
                  保存高级设置
                </n-button>
              </n-space>
            </n-form>
          </n-space>
        </n-tab-pane>
      </n-tabs>
      
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { DeleteOutlined } from '@vicons/antd';
import { 
  getDockerConfig, saveDockerConfig, getDockerStatus, operateDocker 
} from '@/api/paper';
import type { FormInst } from 'naive-ui';

export default defineComponent({
  name: 'DockerConfig',
  components: {
    DeleteOutlined
  },
  setup() {
    const message = useMessage();
    const formRef = ref<FormInst | null>(null);
    const advancedFormRef = ref<FormInst | null>(null);
    
    // 加载状态
    const loading = reactive({
      refreshing: false,
      starting: false,
      stopping: false,
      restarting: false,
      saving: false,
      savingAdvanced: false
    });
    
    // Docker运行状态
    const dockerStatus = reactive({
      running: false,
      status: '未知',
      containerId: '',
      imageVersion: '',
      uptime: '',
      cpuUsage: '',
      memoryUsage: '',
      memoryLimit: '',
      networkStatus: '',
      lastUpdated: ''
    });
    
    // Docker基本配置
    const dockerConfig = reactive({
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
    });
    
    // Docker高级配置
    const advancedConfig = reactive({
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
    });
    
    // 重启策略选项
    const restartPolicyOptions = [
      { label: '总是重启', value: 'always' },
      { label: '异常退出时重启', value: 'on-failure' },
      { label: '除非手动停止，否则重启', value: 'unless-stopped' },
      { label: '不自动重启', value: 'no' }
    ];
    
    // 网络类型选项
    const networkTypeOptions = [
      { label: '桥接(bridge)', value: 'bridge' },
      { label: '主机(host)', value: 'host' },
      { label: '无(none)', value: 'none' },
      { label: '自定义网络', value: 'custom' }
    ];
    
    // 日志级别选项
    const logLevelOptions = [
      { label: '所有', value: 'all' },
      { label: '信息', value: 'info' },
      { label: '警告', value: 'warning' },
      { label: '错误', value: 'error' }
    ];
    const logLevel = ref('info');
    const dockerLogs = ref('# 暂无日志数据');
    
    // 获取Docker状态
    const refreshStatus = async () => {
      loading.refreshing = true;
      try {
        const res = await getDockerStatus();
        
        if (res.code === 0 && res.result) {
          Object.assign(dockerStatus, res.result);
          dockerStatus.lastUpdated = new Date().toLocaleString();
        } else {
          message.error(res.message || 'Docker状态获取失败');
        }
      } catch (error) {
        message.error('Docker状态获取出错');
        console.error('Docker状态获取出错:', error);
      } finally {
        loading.refreshing = false;
      }
    };
    
    // 启动Docker
    const startDocker = async () => {
      loading.starting = true;
      try {
        const res = await operateDocker({ action: 'start' });
        
        if (res.code === 0) {
          message.success('Docker容器启动成功');
          refreshStatus();
        } else {
          message.error(res.message || 'Docker容器启动失败');
        }
      } catch (error) {
        message.error('Docker容器启动出错');
        console.error('Docker容器启动出错:', error);
      } finally {
        loading.starting = false;
      }
    };
    
    // 停止Docker
    const stopDocker = async () => {
      loading.stopping = true;
      try {
        const res = await operateDocker({ action: 'stop' });
        
        if (res.code === 0) {
          message.success('Docker容器已停止');
          refreshStatus();
        } else {
          message.error(res.message || 'Docker容器停止失败');
        }
      } catch (error) {
        message.error('Docker容器停止出错');
        console.error('Docker容器停止出错:', error);
      } finally {
        loading.stopping = false;
      }
    };
    
    // 重启Docker
    const restartDocker = async () => {
      loading.restarting = true;
      try {
        const res = await operateDocker({ action: 'restart' });
        
        if (res.code === 0) {
          message.success('Docker容器已重启');
          refreshStatus();
        } else {
          message.error(res.message || 'Docker容器重启失败');
        }
      } catch (error) {
        message.error('Docker容器重启出错');
        console.error('Docker容器重启出错:', error);
      } finally {
        loading.restarting = false;
      }
    };
    
    // 获取日志
    const fetchLogs = async () => {
      try {
        const res = await operateDocker({ 
          action: 'logs',
          params: { level: logLevel.value }
        });
        
        if (res.code === 0 && res.result) {
          dockerLogs.value = res.result.logs || '# 暂无日志数据';
        } else {
          message.error(res.message || '获取日志失败');
        }
      } catch (error) {
        message.error('获取日志出错');
        console.error('获取日志出错:', error);
      }
    };
    
    // 清空日志
    const clearLogs = async () => {
      try {
        const res = await operateDocker({ action: 'clearLogs' });
        
        if (res.code === 0) {
          message.success('日志已清空');
          dockerLogs.value = '# 日志已清空';
        } else {
          message.error(res.message || '清空日志失败');
        }
      } catch (error) {
        message.error('清空日志出错');
        console.error('清空日志出错:', error);
      }
    };
    
    // 下载完整日志
    const downloadLogs = async () => {
      try {
        const res = await operateDocker({ 
          action: 'downloadLogs',
          params: { full: true }
        });
        
        if (res.code === 0 && res.result) {
          // 创建下载链接
          const link = document.createElement('a');
          link.href = res.result.downloadUrl;
          link.download = `docker-logs-${new Date().toISOString().slice(0, 10)}.txt`;
          link.click();
        } else {
          message.error(res.message || '下载日志失败');
        }
      } catch (error) {
        message.error('下载日志出错');
        console.error('下载日志出错:', error);
      }
    };
    
    // 端口映射操作
    const addPort = () => {
      dockerConfig.ports.push({ host: 8080, container: 8080 });
    };
    
    const removePort = (index) => {
      dockerConfig.ports.splice(index, 1);
    };
    
    // 环境变量操作
    const addEnv = () => {
      dockerConfig.envs.push({ name: '', value: '' });
    };
    
    const removeEnv = (index) => {
      dockerConfig.envs.splice(index, 1);
    };
    
    // 数据卷操作
    const addVolume = () => {
      dockerConfig.volumes.push({ host: '', container: '' });
    };
    
    const removeVolume = (index) => {
      dockerConfig.volumes.splice(index, 1);
    };
    
    // 保存配置
    const saveConfig = async () => {
      formRef.value?.validate(async (errors) => {
        if (errors) {
          return;
        }
        
        loading.saving = true;
        try {
          const res = await saveDockerConfig({ 
            config: dockerConfig
          });
          
          if (res.code === 0) {
            message.success('配置保存成功');
          } else {
            message.error(res.message || '配置保存失败');
          }
        } catch (error) {
          message.error('配置保存出错');
          console.error('配置保存出错:', error);
        } finally {
          loading.saving = false;
        }
      });
    };
    
    // 保存高级设置
    const saveAdvanced = async () => {
      advancedFormRef.value?.validate(async (errors) => {
        if (errors) {
          return;
        }
        
        loading.savingAdvanced = true;
        try {
          const res = await saveDockerConfig({ 
            advancedConfig: advancedConfig
          });
          
          if (res.code === 0) {
            message.success('高级设置保存成功');
          } else {
            message.error(res.message || '高级设置保存失败');
          }
        } catch (error) {
          message.error('高级设置保存出错');
          console.error('高级设置保存出错:', error);
        } finally {
          loading.savingAdvanced = false;
        }
      });
    };
    
    // 重置配置
    const resetConfig = () => {
      // 恢复默认配置
      Object.assign(dockerConfig, {
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
      });
      
      message.success('配置已重置');
    };
    
    // 重置高级设置
    const resetAdvanced = () => {
      // 恢复默认高级设置
      Object.assign(advancedConfig, {
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
      });
      
      message.success('高级设置已重置');
    };
    
    // 加载配置数据
    const loadConfig = async () => {
      try {
        const res = await getDockerConfig();
        
        if (res.code === 0 && res.result) {
          if (res.result.config) {
            Object.assign(dockerConfig, res.result.config);
          }
          
          if (res.result.advancedConfig) {
            Object.assign(advancedConfig, res.result.advancedConfig);
          }
        }
      } catch (error) {
        message.error('Docker配置加载出错');
        console.error('Docker配置加载出错:', error);
      }
    };
    
    onMounted(() => {
      refreshStatus();
      loadConfig();
      fetchLogs();
    });
    
    return {
      formRef,
      advancedFormRef,
      loading,
      dockerStatus,
      dockerConfig,
      advancedConfig,
      restartPolicyOptions,
      networkTypeOptions,
      logLevelOptions,
      logLevel,
      dockerLogs,
      refreshStatus,
      startDocker,
      stopDocker,
      restartDocker,
      fetchLogs,
      clearLogs,
      downloadLogs,
      addPort,
      removePort,
      addEnv,
      removeEnv,
      addVolume,
      removeVolume,
      saveConfig,
      resetConfig,
      saveAdvanced,
      resetAdvanced
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

.mt-2 {
  margin-top: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style> 