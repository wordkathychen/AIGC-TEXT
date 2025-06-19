<template>
  <div class="login-container">
    <n-card
      title="管理员登录"
      class="login-card"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <div class="login-header">
        <img src="/resource/images/logo.png" alt="Logo" class="logo" />
        <h2 class="title">AIGC论文生成系统</h2>
        <p class="subtitle">管理后台</p>
      </div>
      
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        :label-width="80"
        class="mt-4"
      >
        <n-form-item label="账号" path="username">
          <n-input
            v-model:value="formData.username"
            placeholder="请输入账号"
            autofocus
          >
            <template #prefix>
              <n-icon><user-outlined /></n-icon>
            </template>
          </n-input>
        </n-form-item>
        
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            @keydown.enter="handleLogin"
          >
            <template #prefix>
              <n-icon><lock-outlined /></n-icon>
            </template>
          </n-input>
        </n-form-item>
        
        <n-space vertical class="mt-6">
          <n-button
            type="primary"
            block
            :loading="loading"
            @click="handleLogin"
          >
            登录系统
          </n-button>
          
          <div class="flex justify-between items-center mt-2">
            <n-checkbox v-model:checked="formData.remember">
              记住账号
            </n-checkbox>
          </div>
        </n-space>
      </n-form>
      
      <div class="login-footer mt-6">
        <p class="notice">仅限授权人员访问，未经许可不得登录</p>
        <p class="copyright">© {{ new Date().getFullYear() }} AIGC论文生成系统 版权所有</p>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { UserOutlined, LockOutlined } from '@vicons/antd';
import type { FormInst } from 'naive-ui';

export default defineComponent({
  name: 'AdminLogin',
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const router = useRouter();
    const message = useMessage();
    const formRef = ref<FormInst | null>(null);
    const loading = ref(false);
    
    const formData = reactive({
      username: '',
      password: '',
      remember: true,
    });
    
    const rules = {
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    };
    
    const handleLogin = () => {
      formRef.value?.validate(async (errors) => {
        if (errors) return;
        
        loading.value = true;
        
        try {
          // 模拟登录请求
          setTimeout(() => {
            if (formData.username === 'admin' && formData.password === 'admin123') {
              message.success('登录成功');
              
              // 保存登录状态
              localStorage.setItem('paper-admin-token', 'admin-token');
              
              if (formData.remember) {
                localStorage.setItem('paper-admin-username', formData.username);
              } else {
                localStorage.removeItem('paper-admin-username');
              }
              
              // 跳转到管理页面
              router.push('/paper/overview');
            } else {
              message.error('账号或密码错误');
            }
            
            loading.value = false;
          }, 1500);
        } catch (error) {
          message.error('登录失败');
          loading.value = false;
        }
      });
    };
    
    return {
      formRef,
      formData,
      rules,
      loading,
      handleLogin
    };
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: url('/resource/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
}

.login-card {
  width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9);
}

.login-header {
  text-align: center;
  padding-bottom: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  color: #333;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-6 {
  margin-top: 24px;
}

.login-footer {
  text-align: center;
}

.notice {
  font-size: 12px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style> 