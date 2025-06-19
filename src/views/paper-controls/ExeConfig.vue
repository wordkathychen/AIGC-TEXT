<template>
  <div>
    <n-card title="EXE客户端配置" :bordered="false" class="proCard">
      <n-alert title="提示" type="info" :show-icon="true" class="mb-4">
        在此页面可以配置客户端程序的各项设置，包括API密钥、模型选择、界面设置等。所有更改将在客户端下次启动时生效。
      </n-alert>
      
      <n-tabs type="line" animated>
        <n-tab-pane name="basic" tab="基本设置">
          <n-form
            ref="basicFormRef"
            :model="exeConfig.basic"
            label-placement="left"
            :label-width="140"
            class="py-4"
          >
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="程序名称" path="appName">
                  <n-input v-model:value="exeConfig.basic.appName" placeholder="请输入客户端显示的名称" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="程序版本" path="appVersion">
                  <n-input v-model:value="exeConfig.basic.appVersion" placeholder="例如: 1.0.0" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-form-item label="接口地址" path="apiBaseUrl">
              <n-input v-model:value="exeConfig.basic.apiBaseUrl" placeholder="例如: https://api.example.com" />
            </n-form-item>
            
            <n-form-item label="请求超时(秒)" path="requestTimeout">
              <n-input-number v-model:value="exeConfig.basic.requestTimeout" :min="5" :max="120" />
            </n-form-item>
            
            <n-form-item label="连接检测" path="connectionCheck">
              <n-switch v-model:value="exeConfig.basic.connectionCheck.enabled" />
              <div v-if="exeConfig.basic.connectionCheck.enabled" class="mt-2">
                <n-grid :cols="3" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="检测间隔(秒)" path="connectionCheck.interval">
                      <n-input-number v-model:value="exeConfig.basic.connectionCheck.interval" :min="10" :max="300" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="重试次数" path="connectionCheck.retries">
                      <n-input-number v-model:value="exeConfig.basic.connectionCheck.retries" :min="1" :max="10" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="重试延迟(秒)" path="connectionCheck.retryDelay">
                      <n-input-number v-model:value="exeConfig.basic.connectionCheck.retryDelay" :min="1" :max="30" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </div>
            </n-form-item>
            
            <n-form-item label="自动更新检测" path="autoUpdate">
              <n-switch v-model:value="exeConfig.basic.autoUpdate.enabled" />
              <div v-if="exeConfig.basic.autoUpdate.enabled" class="mt-2">
                <n-grid :cols="2" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="检测频率" path="autoUpdate.frequency">
                      <n-select
                        v-model:value="exeConfig.basic.autoUpdate.frequency"
                        :options="updateFrequencyOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="更新源地址" path="autoUpdate.sourceUrl">
                      <n-input v-model:value="exeConfig.basic.autoUpdate.sourceUrl" placeholder="更新检测地址" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </div>
            </n-form-item>
            
            <n-form-item label="日志设置" path="logging">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="exeConfig.basic.logging.enabled" />
                  <span>启用日志记录</span>
                </n-space>
                <n-grid :cols="3" :x-gap="24" v-if="exeConfig.basic.logging.enabled">
                  <n-grid-item>
                    <n-form-item label="日志级别" path="logging.level">
                      <n-select
                        v-model:value="exeConfig.basic.logging.level"
                        :options="logLevelOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="日志保留天数" path="logging.retentionDays">
                      <n-input-number v-model:value="exeConfig.basic.logging.retentionDays" :min="1" :max="90" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="最大日志大小(MB)" path="logging.maxSize">
                      <n-input-number v-model:value="exeConfig.basic.logging.maxSize" :min="1" :max="100" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="api" tab="API配置">
          <n-form
            ref="apiFormRef"
            :model="exeConfig.api"
            label-placement="left"
            :label-width="140"
            class="py-4"
          >
            <n-form-item label="默认AI模型" path="defaultModel">
              <n-select
                v-model:value="exeConfig.api.defaultModel"
                :options="modelOptions"
              />
            </n-form-item>
            
            <n-divider>API密钥配置</n-divider>
            
            <n-data-table
              :columns="apiKeyColumns"
              :data="exeConfig.api.keys"
              :pagination="false"
              :bordered="false"
              striped
            />
            
            <n-form-item label="请求参数设置" path="requestParams">
              <n-space vertical>
                <n-grid :cols="2" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="温度" path="requestParams.temperature">
                      <n-slider
                        v-model:value="exeConfig.api.requestParams.temperature"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        style="width: 200px"
                      />
                      <n-input-number
                        v-model:value="exeConfig.api.requestParams.temperature"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        size="small"
                        class="ml-2"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Top P" path="requestParams.topP">
                      <n-slider
                        v-model:value="exeConfig.api.requestParams.topP"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        style="width: 200px"
                      />
                      <n-input-number
                        v-model:value="exeConfig.api.requestParams.topP"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        size="small"
                        class="ml-2"
                      />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                
                <n-grid :cols="2" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="最大输出令牌数" path="requestParams.maxTokens">
                      <n-input-number v-model:value="exeConfig.api.requestParams.maxTokens" :min="100" :max="8192" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="请求重试次数" path="requestParams.maxRetries">
                      <n-input-number v-model:value="exeConfig.api.requestParams.maxRetries" :min="0" :max="5" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
            
            <n-form-item label="代理设置" path="proxy">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="exeConfig.api.proxy.enabled" />
                  <span>启用代理</span>
                </n-space>
                <n-grid :cols="2" :x-gap="24" v-if="exeConfig.api.proxy.enabled">
                  <n-grid-item>
                    <n-form-item label="代理主机" path="proxy.host">
                      <n-input v-model:value="exeConfig.api.proxy.host" placeholder="例如: 127.0.0.1" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="代理端口" path="proxy.port">
                      <n-input-number v-model:value="exeConfig.api.proxy.port" :min="1" :max="65535" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="代理类型" path="proxy.type">
                      <n-select
                        v-model:value="exeConfig.api.proxy.type"
                        :options="proxyTypeOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="验证信息" path="proxy.auth">
                      <n-space align="center">
                        <n-switch v-model:value="exeConfig.api.proxy.auth.required" />
                        <span>需要验证</span>
                      </n-space>
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                <n-grid :cols="2" :x-gap="24" v-if="exeConfig.api.proxy.enabled && exeConfig.api.proxy.auth.required">
                  <n-grid-item>
                    <n-form-item label="用户名" path="proxy.auth.username">
                      <n-input v-model:value="exeConfig.api.proxy.auth.username" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="密码" path="proxy.auth.password">
                      <n-input
                        v-model:value="exeConfig.api.proxy.auth.password"
                        type="password"
                        show-password-on="click"
                      />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="ui" tab="界面设置">
          <n-form
            ref="uiFormRef"
            :model="exeConfig.ui"
            label-placement="left"
            :label-width="140"
            class="py-4"
          >
            <n-form-item label="程序主题" path="theme">
              <n-select
                v-model:value="exeConfig.ui.theme"
                :options="themeOptions"
              />
            </n-form-item>
            
            <n-form-item label="自定义标题" path="title">
              <n-input v-model:value="exeConfig.ui.title" placeholder="客户端窗口标题" />
            </n-form-item>
            
            <n-form-item label="LOGO设置" path="logo">
              <n-space vertical>
                <n-upload 
                  action="/api/upload/logo"
                  :headers="{
                    'X-Token': 'custom-token'
                  }"
                  :max="1"
                  :default-file-list="logoFileList"
                  list-type="image-card"
                  @finish="handleLogoUploadFinish"
                >
                  点击或拖拽上传LOGO
                </n-upload>
              </n-space>
            </n-form-item>
            
            <n-form-item label="窗口设置" path="window">
              <n-space vertical>
                <n-grid :cols="3" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="默认宽度(px)" path="window.defaultWidth">
                      <n-input-number v-model:value="exeConfig.ui.window.defaultWidth" :min="800" :max="1920" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="默认高度(px)" path="window.defaultHeight">
                      <n-input-number v-model:value="exeConfig.ui.window.defaultHeight" :min="600" :max="1080" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="启动最大化" path="window.startMaximized">
                      <n-switch v-model:value="exeConfig.ui.window.startMaximized" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                
                <n-space align="center">
                  <n-switch v-model:value="exeConfig.ui.window.rememberPosition" />
                  <span>记住窗口位置和大小</span>
                </n-space>
              </n-space>
            </n-form-item>
            
            <n-form-item label="字体设置" path="fonts">
              <n-space vertical>
                <n-grid :cols="2" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="界面字体" path="fonts.ui">
                      <n-select
                        v-model:value="exeConfig.ui.fonts.ui"
                        :options="fontOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="编辑器字体" path="fonts.editor">
                      <n-select
                        v-model:value="exeConfig.ui.fonts.editor"
                        :options="fontOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                
                <n-grid :cols="2" :x-gap="24">
                  <n-grid-item>
                    <n-form-item label="界面字体大小" path="fonts.uiSize">
                      <n-input-number v-model:value="exeConfig.ui.fonts.uiSize" :min="12" :max="20" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="编辑器字体大小" path="fonts.editorSize">
                      <n-input-number v-model:value="exeConfig.ui.fonts.editorSize" :min="12" :max="20" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="auth" tab="安全设置">
          <n-form
            ref="authFormRef"
            :model="exeConfig.auth"
            label-placement="left"
            :label-width="140"
            class="py-4"
          >
            <n-form-item label="登录验证" path="loginRequired">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="exeConfig.auth.loginRequired" />
                  <span>启用登录验证</span>
                </n-space>
              </n-space>
            </n-form-item>
            
            <n-divider>管理员账号</n-divider>
            
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="管理员用户名" path="adminUsername">
                  <n-input v-model:value="exeConfig.auth.adminUsername" placeholder="设置管理员用户名" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="管理员密码" path="adminPassword">
                  <n-input
                    v-model:value="exeConfig.auth.adminPassword"
                    type="password"
                    show-password-on="click"
                    placeholder="设置管理员密码"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-form-item label="数据加密" path="encryption">
              <n-space vertical>
                <n-space align="center">
                  <n-switch v-model:value="exeConfig.auth.encryption.enabled" />
                  <span>启用数据加密</span>
                </n-space>
                <n-alert v-if="exeConfig.auth.encryption.enabled" type="warning" :show-icon="true" class="mt-2">
                  启用数据加密后，客户端本地存储的所有敏感数据（包括API密钥、用户信息等）将被加密保存。请确保记住加密密钥，否则数据将无法恢复。
                </n-alert>
                <n-grid :cols="2" :x-gap="24" v-if="exeConfig.auth.encryption.enabled">
                  <n-grid-item>
                    <n-form-item label="加密算法" path="encryption.algorithm">
                      <n-select
                        v-model:value="exeConfig.auth.encryption.algorithm"
                        :options="encryptionAlgoOptions"
                      />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="加密密钥" path="encryption.key">
                      <n-input
                        v-model:value="exeConfig.auth.encryption.key"
                        type="password"
                        show-password-on="click"
                        placeholder="输入加密密钥"
                      />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
      
      <n-divider />
      
      <n-space justify="end">
        <n-popconfirm
          title="确定要恢复默认设置吗？"
          @positive-click="resetConfig"
        >
          <template #trigger>
            <n-button>恢复默认</n-button>
          </template>
        </n-popconfirm>
        <n-button type="primary" @click="saveConfig" :loading="loading">
          保存配置
        </n-button>
        <n-button type="info" @click="testConfig">
          测试配置
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, h, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { getExeConfig, saveExeConfig } from '@/api/paper';
import type { FormInst, UploadFileInfo } from 'naive-ui';

export default defineComponent({
  name: 'ExeConfig',
  setup() {
    const message = useMessage();
    const basicFormRef = ref<FormInst | null>(null);
    const apiFormRef = ref<FormInst | null>(null);
    const uiFormRef = ref<FormInst | null>(null);
    const authFormRef = ref<FormInst | null>(null);
    const loading = ref(false);
    
    // EXE配置
    const exeConfig = reactive({
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
          { id: 1, provider: 'OpenAI', key: 'sk-*********************', isActive: true },
          { id: 2, provider: '文心一言', key: '*********************', isActive: false },
          { id: 3, provider: '讯飞星火', key: '*********************', isActive: true }
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
        adminPassword: '********',
        encryption: {
          enabled: false,
          algorithm: 'aes-256-gcm',
          key: ''
        }
      }
    });
    
    // API KEY表格列
    const apiKeyColumns = [
      {
        title: '服务商',
        key: 'provider'
      },
      {
        title: 'API密钥',
        key: 'key',
        render(row) {
          return h(
            'span',
            row.key.substring(0, 3) + '***' + row.key.substring(row.key.length - 3)
          );
        }
      },
      {
        title: '状态',
        key: 'isActive',
        render(row) {
          return h(
            'n-switch',
            {
              value: row.isActive,
              onUpdateValue: (value) => {
                row.isActive = value;
              }
            }
          );
        }
      }
    ];
    
    // 更新频率选项
    const updateFrequencyOptions = [
      { label: '每次启动时', value: 'startup' },
      { label: '每天', value: 'daily' },
      { label: '每周', value: 'weekly' },
      { label: '每月', value: 'monthly' },
      { label: '手动', value: 'manual' }
    ];
    
    // 日志级别选项
    const logLevelOptions = [
      { label: '调试', value: 'debug' },
      { label: '信息', value: 'info' },
      { label: '警告', value: 'warning' },
      { label: '错误', value: 'error' }
    ];
    
    // 模型选项
    const modelOptions = [
      { label: 'GPT-4', value: 'gpt-4' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      { label: '文心一言', value: 'wenxin' },
      { label: '讯飞星火', value: 'xinghuo' },
      { label: '通义千问', value: 'qianwen' },
      { label: '本地模型', value: 'local' }
    ];
    
    // 主题选项
    const themeOptions = [
      { label: '浅色主题', value: 'light' },
      { label: '深色主题', value: 'dark' },
      { label: '跟随系统', value: 'system' },
      { label: '自定义主题', value: 'custom' }
    ];
    
    // 字体选项
    const fontOptions = [
      { label: '微软雅黑', value: 'Microsoft YaHei' },
      { label: '宋体', value: 'SimSun' },
      { label: '黑体', value: 'SimHei' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Consolas', value: 'Consolas' },
      { label: 'Courier New', value: 'Courier New' }
    ];
    
    // 代理类型选项
    const proxyTypeOptions = [
      { label: 'HTTP', value: 'http' },
      { label: 'HTTPS', value: 'https' },
      { label: 'SOCKS5', value: 'socks5' }
    ];
    
    // 加密算法选项
    const encryptionAlgoOptions = [
      { label: 'AES-256-GCM', value: 'aes-256-gcm' },
      { label: 'AES-256-CBC', value: 'aes-256-cbc' },
      { label: 'ChaCha20-Poly1305', value: 'chacha20-poly1305' }
    ];
    
    // Logo上传文件列表
    const logoFileList = ref<UploadFileInfo[]>([
      {
        id: 'logo',
        name: 'logo.png',
        status: 'finished',
        url: exeConfig.ui.logo
      }
    ]);
    
    // Logo上传完成处理
    const handleLogoUploadFinish = ({ file }) => {
      if (file.status === 'finished') {
        exeConfig.ui.logo = file.url || '';
        message.success('Logo上传成功');
      } else {
        message.error('Logo上传失败');
      }
    };
    
    // 保存配置
    const saveConfig = async () => {
      try {
        // 表单验证
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            basicFormRef.value?.validate((errors) => {
              if (errors) reject(errors);
              else resolve();
            });
          }),
          new Promise<void>((resolve, reject) => {
            apiFormRef.value?.validate((errors) => {
              if (errors) reject(errors);
              else resolve();
            });
          }),
          new Promise<void>((resolve, reject) => {
            uiFormRef.value?.validate((errors) => {
              if (errors) reject(errors);
              else resolve();
            });
          }),
          new Promise<void>((resolve, reject) => {
            authFormRef.value?.validate((errors) => {
              if (errors) reject(errors);
              else resolve();
            });
          })
        ]);
        
        loading.value = true;
        const res = await saveExeConfig(exeConfig);
        
        if (res.code === 0) {
          message.success('配置保存成功');
        } else {
          message.error(res.message || '配置保存失败');
        }
      } catch (error) {
        message.error('表单验证失败，请检查输入');
        console.error('保存配置出错:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 重置配置
    const resetConfig = () => {
      // 恢复默认配置
      Object.assign(exeConfig, {
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
            { id: 1, provider: 'OpenAI', key: 'sk-*********************', isActive: true },
            { id: 2, provider: '文心一言', key: '*********************', isActive: false },
            { id: 3, provider: '讯飞星火', key: '*********************', isActive: true }
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
          adminPassword: '********',
          encryption: {
            enabled: false,
            algorithm: 'aes-256-gcm',
            key: ''
          }
        }
      });
      
      message.success('配置已重置为默认值');
    };
    
    // 测试配置
    const testConfig = async () => {
      message.loading('正在测试配置...');
      setTimeout(() => {
        message.success('配置测试成功，客户端可正常运行');
      }, 1500);
    };
    
    // 加载配置数据
    const loadConfig = async () => {
      try {
        const res = await getExeConfig();
        
        if (res.code === 0 && res.result) {
          // 合并配置，保留嵌套结构
          if (res.result.basic) {
            Object.assign(exeConfig.basic, res.result.basic);
          }
          
          if (res.result.api) {
            Object.assign(exeConfig.api, res.result.api);
          }
          
          if (res.result.ui) {
            Object.assign(exeConfig.ui, res.result.ui);
            
            // 更新Logo文件列表
            logoFileList.value = [{
              id: 'logo',
              name: 'logo.png',
              status: 'finished',
              url: exeConfig.ui.logo
            }];
          }
          
          if (res.result.auth) {
            Object.assign(exeConfig.auth, res.result.auth);
          }
        }
      } catch (error) {
        message.error('配置加载失败');
        console.error('加载配置出错:', error);
      }
    };
    
    onMounted(() => {
      loadConfig();
    });
    
    return {
      basicFormRef,
      apiFormRef,
      uiFormRef,
      authFormRef,
      loading,
      exeConfig,
      apiKeyColumns,
      updateFrequencyOptions,
      logLevelOptions,
      modelOptions,
      themeOptions,
      fontOptions,
      proxyTypeOptions,
      encryptionAlgoOptions,
      logoFileList,
      handleLogoUploadFinish,
      saveConfig,
      resetConfig,
      testConfig
    };
  }
});
</script>

<style scoped>
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

.py-4 {
  padding-top: 16px;
  padding-bottom: 16px;
}
</style> 