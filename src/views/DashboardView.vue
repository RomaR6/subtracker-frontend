<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { IconCurrencyHryvnia, IconCurrencyDollar, IconUser, IconArrowRight } from "@tabler/icons-vue";
import { analyticsApi, type AnalyticsDashboardData } from "../api/analytics";
import { subscriptionApi } from "../api/subscriptions";
import { useWorkspaceStore } from "../stores/workspace";
import CashFlowChart from "../components/dashboard/CashFlowChart.vue";
import UpcomingPaymentsList from "../components/dashboard/UpcomingPaymentsList.vue";

const wsStore = useWorkspaceStore();
const activeCurrency = ref<"UAH" | "USD">("UAH");

const formatPeriod = (period: string | null | undefined): string => {
  const p = (period || "monthly").toLowerCase().trim();
  if (p === "yearly" || p === "annual" || p === "щорічно" || p === "річний") return "Щорічно";
  if (p === "quarterly" || p === "щоквартально" || p === "квартальний") return "Щоквартально";
  return "Щомісячно";
};

const getCachedDashboard = (): AnalyticsDashboardData | null => {
  try {
    const cached = localStorage.getItem("subtracker_dashboard_cache");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const cachedData = getCachedDashboard();
const dashboardData = ref<AnalyticsDashboardData | null>(cachedData);
const topSubscriptions = ref<any[]>([]);
const isLoading = ref(!cachedData);

const fetchDashboard = async () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  try {
    const [dashRes, subs] = await Promise.all([
      analyticsApi.getDashboard(wsId).catch(() => null),
      subscriptionApi.getAll({ workspace_id: wsId }).catch(() => [])
    ]);

    if (dashRes) {
      dashboardData.value = dashRes;
      localStorage.setItem("subtracker_dashboard_cache", JSON.stringify(dashRes));
    }

    if (Array.isArray(subs)) {
      topSubscriptions.value = [...subs]
        .sort((a, b) => (Number(b.cost_usd) || 0) - (Number(a.cost_usd) || 0))
        .slice(0, 5);
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

watch(() => wsStore.currentWorkspace?.id, () => {
  fetchDashboard();
});

onMounted(() => {
  fetchDashboard();
  if (wsStore.workspaces.length === 0) {
    wsStore.fetchWorkspaces();
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="text-left">
        <h1 class="text-xl sm:text-2xl font-black text-[#1e293b] tracking-tight">
          Зведена аналітика та фінансовий моніторинг
        </h1>
        <p class="text-xs text-[#78716C] mt-1">
          Оперативний стан цифрових активів та предиктивний аналіз руху коштів
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-white border border-[#E7E5E4] p-1 rounded-xl shadow-xs flex items-center text-xs font-bold">
          <button
            @click="activeCurrency = 'UAH'"
            :class="activeCurrency === 'UAH' ? 'bg-[#881337] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1e293b]'"
            class="px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <IconCurrencyHryvnia class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>UAH</span>
          </button>
          <button
            @click="activeCurrency = 'USD'"
            :class="activeCurrency === 'USD' ? 'bg-[#881337] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1e293b]'"
            class="px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <IconCurrencyDollar class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>USD</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Місячні витрати</span>
          <span class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#881337] flex items-center justify-center">
            <IconCurrencyHryvnia v-if="activeCurrency === 'UAH'" class="w-4 h-4" :stroke-width="2.2" />
            <IconCurrencyDollar v-else class="w-4 h-4" :stroke-width="2.2" />
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

      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Середній чек / спеціаліст</span>
          <span class="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] text-[#881337] flex items-center justify-center">
            <IconUser class="w-4 h-4" :stroke-width="2" />
          </span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          ₴{{ dashboardData ? dashboardData.avg_check_per_engineer_uah.toLocaleString('uk-UA') : '0' }}
        </div>
        <p class="text-[11px] text-[#78716C] mt-1">
          Штат команди: {{ dashboardData?.engineers_count || 1 }} фахівців
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-8 bg-white border border-[#E7E5E4] p-4 sm:p-6 rounded-2xl shadow-xs text-left">
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

      <div class="lg:col-span-4 bg-white border border-[#E7E5E4] p-4 sm:p-6 rounded-2xl shadow-xs text-left">
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

    <div class="mt-8 bg-white border border-[#E7E5E4] rounded-2xl p-4 sm:p-6 shadow-xs text-left">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-black text-sm text-[#1e293b]">Ключові цифрові активи за обсягом витрат</h3>
          <p class="text-[11px] text-[#78716C] mt-0.5">Підписки з найбільшим впливом на щомісячний бюджет компанії</p>
        </div>
        <router-link to="/app/subscriptions" class="text-xs font-bold text-[#881337] hover:underline cursor-pointer flex items-center gap-1">
          <span>Усі підписки</span>
          <IconArrowRight class="w-3.5 h-3.5" :stroke-width="2.5" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr class="border-b border-[#E7E5E4] text-[#78716C] font-bold pb-2">
              <th class="py-2.5 px-3">Сервіс</th>
              <th class="py-2.5 px-3">Категорія</th>
              <th class="py-2.5 px-3">Відповідальний</th>
              <th class="py-2.5 px-3">Період</th>
              <th class="py-2.5 px-3">Вартість ($ / ₴)</th>
              <th class="py-2.5 px-3">Статус</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5F5F4]">
            <tr v-for="sub in topSubscriptions" :key="sub.id" class="hover:bg-[#FAF8F5] transition">
              <td class="py-3 px-3 flex items-center gap-2.5 font-bold text-[#1e293b]">
                <img :src="sub.logo_url || 'https://www.google.com/s2/favicons?domain=' + (sub.domain || 'cloud.google.com') + '&sz=64'" class="w-7 h-7 rounded-lg border border-[#E7E5E4] p-0.5 object-contain" />
                <div>
                  <div>{{ sub.name }}</div>
                  <div class="text-[10px] text-[#78716C] font-normal">{{ sub.domain }}</div>
                </div>
              </td>
              <td class="py-3 px-3 text-[#44403C]">{{ sub.category || 'DevTools' }}</td>
              <td class="py-3 px-3 text-[#44403C] font-medium">{{ sub.owner_name || 'Загальний пул команди' }}</td>
              <td class="py-3 px-3 font-medium text-[#1e293b]">{{ formatPeriod(sub.billing_period) }}</td>
              <td class="py-3 px-3 font-bold text-[#1e293b]">
                <div>${{ Number(sub.cost_usd).toFixed(2) }}</div>
                <div class="text-[10px] text-[#78716C] font-normal">₴{{ Math.round(Number(sub.cost_uah || sub.cost_usd * (wsStore.usdRate || 45.35))).toLocaleString('uk-UA') }}</div>
              </td>
              <td class="py-3 px-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Активна
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
