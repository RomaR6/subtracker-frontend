<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";

const summary = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get("/subscriptions/summary?workspace_id=1");
    summary.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-end">
      <div class="text-left">
        <h1 class="text-2xl font-black text-[#1e293b]">Зведена аналітика та фінансовий моніторинг</h1>
        <p class="text-xs text-[#78716C] mt-1">Оперативний огляд витрат робочого простору за жовтень 2026 року</p>
      </div>
      <div class="text-xs font-bold text-[#78716C] bg-white border border-[#E7E5E4] px-3 py-1.5 rounded-lg shadow-xs">
        Поточний місяць: Жовтень 2026 ▼
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Місячні витрати</span>
          <span class="w-6 h-6 rounded-full bg-[#FEF2F2] text-[#881337] flex items-center justify-center text-xs font-bold">₴</span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          ₴{{ summary ? summary.monthly_budget_uah.toLocaleString('uk-UA') : '142,850' }}
        </div>
        <p class="text-[11px] text-[#059669] font-semibold mt-1">
          +4.2% порівняно з вереснем (${{ summary ? summary.monthly_budget_usd : '3,440' }})
        </p>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Активні ліцензії</span>
          <span class="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded text-[11px] font-bold">28</span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          {{ summary ? summary.active_subscriptions : 24 }} сервісів
        </div>
        <p class="text-[11px] text-[#059669] font-semibold mt-1">100% закріплено за командою</p>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Заявки на розгляд</span>
          <span class="bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded text-[11px] font-bold">3</span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">3 очікують</div>
        <p class="text-[11px] text-[#78716C] mt-1">₴18,500 бюджет нових запитів</p>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-start">
          <span class="text-xs font-bold text-[#78716C]">Середній чек / спеціаліст</span>
          <span class="text-sm">👤</span>
        </div>
        <div class="text-2xl font-black text-[#1e293b] mt-3">
          ₴{{ summary ? summary.avg_cost_per_member_uah.toLocaleString('uk-UA') : '5,100' }} / міс
        </div>
        <p class="text-[11px] text-[#78716C] mt-1">Штат команди: {{ summary ? summary.team_members_count : 28 }} інженерів</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-sm text-[#1e293b]">Динаміка витрат та прогноз (Cash Flow)</h3>
          <span class="text-[10px] bg-[#F5F5F4] px-2.5 py-1 rounded border border-[#E7E5E4] font-semibold text-[#78716C]">UAH / Останні 6 місяців</span>
        </div>
        <div class="h-48 flex items-end justify-between gap-4 px-4 pb-2 border-b border-[#E7E5E4]">
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[60%]"></div>
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[70%]"></div>
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[80%]"></div>
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[85%]"></div>
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[92%]"></div>
          <div class="flex-1 bg-[#881337] rounded-t-sm h-[100%]"></div>
          <div class="flex-1 bg-[#FDE68A] border border-[#F59E0B] border-dashed rounded-t-sm h-[85%]"></div>
        </div>
        <div class="flex justify-between text-[11px] text-[#78716C] pt-2 px-4">
          <span>Травень</span><span>Червень</span><span>Липень</span><span>Серпень</span><span>Вересень</span><span class="font-bold text-[#881337]">Жовтень</span><span>Листопад *</span>
        </div>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs text-left">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-sm text-[#1e293b]">Найближчі списання</h3>
          <span class="text-[10px] bg-[#F5F5F4] px-2 py-0.5 rounded border border-[#E7E5E4] text-[#78716C]">Наступні 14 днів</span>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4]">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs">AWS</span>
              <div>
                <p class="font-bold text-xs">AWS Cloud Infra</p>
                <p class="text-[10px] text-[#DC2626]">Через 3 дні</p>
              </div>
            </div>
            <span class="font-bold text-xs">$840.00</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4]">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded bg-[#10B981] text-white flex items-center justify-center font-bold text-xs">F</span>
              <div>
                <p class="font-bold text-xs">Figma Organization</p>
                <p class="text-[10px] text-[#F59E0B]">Через 5 днів</p>
              </div>
            </div>
            <span class="font-bold text-xs">$180.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>