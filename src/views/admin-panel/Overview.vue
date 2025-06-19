<template>
  <div>
    <n-card title="系统概览" :bordered="false" class="proCard">
      <n-grid :cols="24" :x-gap="16" :y-gap="16">
        <!-- 统计卡片 -->
        <n-gi :span="6">
          <n-card title="用户总数" :segmented="{ content: true }" size="small">
            <n-statistic
              :value="overview.userCount"
              :precision="0"
            >
              <template #prefix>
                <n-icon>
                  <UsergroupAddOutlined />
                </n-icon>
              </template>
            </n-statistic>
            <n-divider />
            <div class="flex items-center justify-between">
              <span class="text-gray-500">今日活跃</span>
              <span class="text-green-500 font-semibold">{{ overview.activeUserToday }}</span>
            </div>
          </n-card>
        </n-gi>

        <n-gi :span="6">
          <n-card title="请求总数" :segmented="{ content: true }" size="small">
            <n-statistic
              :value="overview.totalRequests"
              :precision="0"
            >
              <template #prefix>
                <n-icon>
                  <ApiOutlined />
                </n-icon>
              </template>
            </n-statistic>
            <n-divider />
            <div class="flex items-center justify-between">
              <span class="text-gray-500">今日请求</span>
              <span class="text-blue-500 font-semibold">{{ overview.requestsToday }}</span>
            </div>
          </n-card>
        </n-gi>

        <n-gi :span="6">
          <n-card title="CPU 使用率" :segmented="{ content: true }" size="small">
            <n-statistic
              :value="overview.cpuUsage"
              :precision="0"
              suffix="%"
            >
              <template #prefix>
                <n-icon>
                  <ClockCircleOutlined />
                </n-icon>
              </template>
            </n-statistic>
            <n-divider />
            <div class="flex">
              <n-progress
                type="line"
                :percentage="overview.cpuUsage"
                :indicator-placement="'inside'"
                :color="getCpuUsageColor(overview.cpuUsage)"
                :height="14"
              />
            </div>
          </n-card>
        </n-gi>

        <n-gi :span="6">
          <n-card title="内存使用" :segmented="{ content: true }" size="small">
            <n-statistic
              :value="overview.memoryUsage"
              :precision="1"
              suffix="GB"
            >
              <template #prefix>
                <n-icon>
                  <DatabaseOutlined />
                </n-icon>
              </template>
            </n-statistic>
            <n-divider />
            <div class="flex items-center justify-between">
              <span class="text-gray-500">磁盘使用率</span>
              <span class="text-purple-500 font-semibold">{{ overview.diskUsage }}%</span>
            </div>
          </n-card>
        </n-gi>

        <!-- 图表 -->
        <n-gi :span="16">
          <n-card title="近7天请求统计" :bordered="false">
            <div ref="dailyChartRef" style="width: 100%; height: 300px"></div>
          </n-card>
        </n-gi>

        <n-gi :span="8">
          <n-card title="模型使用分布" :bordered="false">
            <div ref="modelChartRef" style="width: 100%; height: 300px"></div>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, onMounted, computed } from 'vue';
  import { useMessage } from 'naive-ui';
  import {
    UsergroupAddOutlined,
    ApiOutlined,
    ClockCircleOutlined,
    DatabaseOutlined,
  } from '@vicons/antd';
  import { getSystemOverview } from '@/api/admin';
  import * as echarts from 'echarts';

  export default defineComponent({
    name: 'SystemOverview',
    components: {
      UsergroupAddOutlined,
      ApiOutlined,
      ClockCircleOutlined,
      DatabaseOutlined,
    },
    setup() {
      const message = useMessage();
      const dailyChartRef = ref<HTMLDivElement | null>(null);
      const modelChartRef = ref<HTMLDivElement | null>(null);
      let dailyChart: echarts.ECharts | null = null;
      let modelChart: echarts.ECharts | null = null;
      
      // 系统概览数据
      const overview = reactive({
        userCount: 0,
        activeUserToday: 0,
        totalRequests: 0,
        requestsToday: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        topModels: [] as { name: string; count: number }[],
        dailyStats: [] as { date: string; requests: number }[],
      });
      
      // 根据CPU使用率获取颜色
      const getCpuUsageColor = (usage: number) => {
        if (usage < 50) {
          return '#18a058'; // 绿色
        } else if (usage < 80) {
          return '#f0a020'; // 黄色
        } else {
          return '#d03050'; // 红色
        }
      };
      
      // 初始化每日请求统计图表
      const initDailyChart = () => {
        if (!dailyChartRef.value) return;
        
        dailyChart = echarts.init(dailyChartRef.value);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: overview.dailyStats.map(item => item.date),
            axisLabel: {
              rotate: 0,
            },
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '请求数量',
              type: 'bar',
              data: overview.dailyStats.map(item => item.requests),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' },
                ]),
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2378f7' },
                    { offset: 1, color: '#83bff6' },
                  ]),
                },
              },
            },
          ],
        };
        
        dailyChart.setOption(option);
        window.addEventListener('resize', () => dailyChart?.resize());
      };
      
      // 初始化模型使用分布图表
      const initModelChart = () => {
        if (!modelChartRef.value) return;
        
        modelChart = echarts.init(modelChartRef.value);
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
          },
          series: [
            {
              name: '模型使用',
              type: 'pie',
              radius: '65%',
              center: ['50%', '50%'],
              data: overview.topModels.map(item => ({
                name: item.name,
                value: item.count,
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                formatter: '{b}: {d}%',
              },
              itemStyle: {
                borderRadius: 4,
              },
            },
          ],
        };
        
        modelChart.setOption(option);
        window.addEventListener('resize', () => modelChart?.resize());
      };
      
      // 加载数据
      const loadData = async () => {
        try {
          const res = await getSystemOverview();
          if (res.code === 0) {
            Object.assign(overview, res.result);
            // 初始化图表
            initDailyChart();
            initModelChart();
          } else {
            message.error(res.message || '获取数据失败');
          }
        } catch (error) {
          message.error('获取数据出错');
          console.error('加载系统概览数据出错:', error);
        }
      };
      
      onMounted(() => {
        loadData();
      });
      
      return {
        overview,
        dailyChartRef,
        modelChartRef,
        getCpuUsageColor,
      };
    },
  });
</script>

<style scoped>
/* 无需额外样式，使用Tailwind CSS */
</style>
