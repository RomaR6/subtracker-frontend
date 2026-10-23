<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";
import CashFlowChart from "../components/dashboard/CashFlowChart.vue";
import UpcomingPaymentsList from "../components/dashboard/UpcomingPaymentsList.vue";

const wsStore = useWorkspaceStore();
const activeCurrency = ref<"UAH" | "USD">("UAH");
const dashboardData = ref<any>(null);
const isLoading = ref(true);

const fetchDashboard = async () => {
  isLoading.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get(`/analytics/dashboard?workspace_id=${wsId}`);
    dashboardData.value = res.data;
  } catch (err) {
    console.error("Не вдалося завантажити аналітику дашборду:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchDashboard();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Dashboard Header with Currency Switcher -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="text-left">
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">
          Зведена аналітика та фінансовий моніторинг
        </h1>
        <p class="text-xs text-[#78716C] mt-1">
          Оперативний стан цифрових активів та предиктивний аналіз руху коштів
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Currency Toggle -->
        <div class="bg-white border border-[#E7E5E4] p-1 rounded-xl shadow-xs flex items-center text-xs font-bold">
          <button
            @click="activeCurrency = 'UAH'"
            :class="activeCurrency === 'UAH' ? 'bg-[#881337] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1e293b]'"
            class="px-3 py-1 rounded-lg transition cursor-pointer"
          >
            ₴ UAH
          </button>
          <button
            @click="activeCurrency = 'USD'"
            :class="activeCurrency === 'USD' ? 'bg-[#881337] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1e293b]'"
            class="px-3 py-1 rounded-lg transition cursor-pointer"
          >
            $ USD
          </button>
        </div>

        <button
          @click="fetchDashboard"
          title="Оновити дані"
          class="bg-white border border-[#E7E5E4] p-2 rounded-xl text-xs text-[#78716C] hover:text-[#1e293b] shadow-xs transition cursor-pointer"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- 4 KPI Metrics Matrix -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Monthly Budget -->
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Місячні витрати</span>
          <span class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#881337] flex items-center justify-center text-xs font-black">
            {{ activeCurrency === 'UAH' ? '₴' : '$' }}
          </span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          <span v-if="activeCurrency === 'UAH'">
            ₴{{ dashboardData ? dashboardData.monthly_budget_uah.toLocaleString('uk-UA') : '0' }}
          </span>
          <span v-else>
            ${{ dashboardData ? dashboardData.monthly_budget_usd.toLocaleString('en-US') : '0' }}
          </span>
        </div>
        <p class="text-[11px] text-[#059669] font-semibold mt-1">
          Курс НБУ: $1 = {{ dashboardData ? dashboardData.nbu_usd_rate.toFixed(2) : wsStore.usdRate.toFixed(2) }} ₴
        </p>
      </div>

      <!-- 2. Active Licenses -->
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Активні ліцензії</span>
          <span class="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded text-[11px] font-bold">
            {{ dashboardData?.active_subscriptions_count || 0 }} од.
          </span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          {{ dashboardData?.active_subscriptions_count || 0 }} активних
        </div>
        <p class="text-[11px] text-[#78716C] mt-1">
          Неактивних / зомбі: {{ dashboardData?.inactive_subscriptions_count || 0 }} од.
        </p>
      </div>

      <!-- 3. Pending Approvals -->
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Заявки на розгляді</span>
          <span class="bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded text-[11px] font-bold">
            {{ dashboardData?.pending_approvals_count || 0 }}
          </span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          {{ dashboardData?.pending_approvals_count || 0 }} очікують
        </div>
        <p class="text-[11px] text-[#78716C] mt-1">
          Бюджет: ₴{{ dashboardData ? dashboardData.pending_approvals_budget_uah.toLocaleString('uk-UA') : '0' }}
        </p>
      </div>

      <!-- 4. Avg Check per Engineer -->
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Середній чек / спеціаліст</span>
          <span class="text-sm">👤</span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          ₴{{ dashboardData ? dashboardData.avg_check_per_engineer_uah.toLocaleString('uk-UA') : '0' }}
        </div>
        <p class="text-[11px] text-[#78716C] mt-1">
          Штат команди: {{ dashboardData?.engineers_count || 1 }} фахівців
        </p>
      </div>
    </div>

    <!-- Charts and Upcoming Payments Split -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Cash Flow Bar Chart (8 cols) -->
      <div class="lg:col-span-8 bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs text-left">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-sm text-[#1e293b]">Динаміка витрат та прогноз (Cash Flow)</h3>
            <p class="text-[11px] text-[#78716C]">Історичні дані за 6 місяців та предиктивний прогноз наступного місяця (*)</p>
          </div>
          <span class="text-[10px] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E7E5E4] font-bold text-[#78716C]">
            {{ activeCurrency }}
          </span>
        </div>

        <CashFlowChart
          :points="dashboardData?.cash_flow || []"
          :currency="activeCurrency"
        />
      </div>

      <!-- Upcoming 14-days Payments (4 cols) -->
      <div class="lg:col-span-4 bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs text-left">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm text-[#1e293b]">Найближчі списання</h3>
          <span class="text-[10px] bg-[#FEF2F2] text-[#881337] border border-[#FECDD3] px-2 py-0.5 rounded font-bold">
            14 днів
          </span>
        </div>

        <UpcomingPaymentsList
          :items="dashboardData?.upcoming_payments_14_days || []"
          :currency="activeCurrency"
        />
      </div>
    </div>
  </div>
</template>