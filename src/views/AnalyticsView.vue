<script setup lang="ts">
import { ref } from "vue";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";

const wsStore = useWorkspaceStore();

const netSalary = ref(65000);
const customSoftwareCost = ref(3200);
const calculationResult = ref<any>(null);
const isCalculating = ref(false);

const calculateFop = async () => {
  isCalculating.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.post("/analytics/fop-calculator", {
      net_salary_uah: Number(netSalary.value),
      custom_software_cost_uah: Number(customSoftwareCost.value)
    }, {
      params: { workspace_id: wsId }
    });
    calculationResult.value = res.data;
  } catch (err: any) {
    if (err.response?.status === 422) {
      try {
        const wsId = wsStore.currentWorkspace?.id || 1;
        const res2 = await api.post("/analytics/fop-calculator", {
          workspace_id: wsId,
          net_salary_uah: Number(netSalary.value),
          custom_software_cost_uah: Number(customSoftwareCost.value)
        });
        calculationResult.value = res2.data;
      } catch (e) {
        console.error(e);
      }
    }
  } finally {
    isCalculating.value = false;
  }
};

calculateFop();

const exportPdf = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://127.0.0.1:8000/api/v1/analytics/export/pdf?workspace_id=${wsId}`, "_blank");
};

const exportCsv = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://127.0.0.1:8000/api/v1/analytics/export/csv?workspace_id=${wsId}`, "_blank");
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Фінансова аналітика та собівартість ФОП</h1>
        <p class="text-xs text-[#78716C] mt-1">Розрахунок сукупного навантаження за моделлю 3-ї групи (5% + ЄСВ 1 760 ₴ + софт)</p>
      </div>

      <div class="flex gap-2">
        <button @click="exportCsv" class="px-3.5 py-2 bg-white border border-[#E7E5E4] rounded-lg text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer">
          📥 Звіт CSV
        </button>
        <button @click="exportPdf" class="px-3.5 py-2 bg-[#881337] text-white rounded-lg text-xs font-bold hover:bg-[#9F1239] cursor-pointer">
          📄 Офіційний аудит PDF
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-5 bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-[#1e293b]">Вхідні параметри спеціаліста</h3>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Чиста винагорода інженера на руки (Net, UAH):</label>
          <input
            v-model.number="netSalary"
            type="number"
            step="1000"
            @input="calculateFop"
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm font-bold text-[#1e293b]"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Вартість закріпленого софту на місяць (UAH):</label>
          <input
            v-model.number="customSoftwareCost"
            type="number"
            step="100"
            @input="calculateFop"
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm font-bold text-[#1e293b]"
          />
        </div>

        <div class="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl text-xs text-[#78716C]">
          Розрахунок базується на формулі повної собівартості: Gross = Net / 0.95, Єдиний податок = 5%, ЄСВ фіксований = 1 760.00 ₴.
        </div>
      </div>

      <div class="lg:col-span-7 bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs">
        <h3 class="font-bold text-sm text-[#1e293b] mb-4">Структура сукупних витрат компанії (Cost to Company)</h3>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between items-center p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
            <span class="text-[#78716C]">Винагорода Gross (для договору):</span>
            <span class="font-bold text-sm text-[#1e293b]">₴{{ calculationResult ? calculationResult.gross_income_uah.toLocaleString('uk-UA') : '0' }}</span>
          </div>

          <div class="flex justify-between items-center p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
            <span class="text-[#78716C]">Єдиний податок 3-ї групи (5%):</span>
            <span class="font-bold text-[#881337]">₴{{ calculationResult ? calculationResult.single_tax_5_percent.toLocaleString('uk-UA') : '0' }}</span>
          </div>

          <div class="flex justify-between items-center p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
            <span class="text-[#78716C]">Єдиний соціальний внесок (ЄСВ):</span>
            <span class="font-bold text-[#881337]">₴{{ calculationResult ? calculationResult.esv_uah.toFixed(2) : '1,760.00' }}</span>
          </div>

          <div class="flex justify-between items-center p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
            <span class="text-[#78716C]">Цифрове робоче місце (Tooling / SaaS):</span>
            <span class="font-bold text-[#1e293b]">₴{{ calculationResult ? calculationResult.total_software_cost_uah.toLocaleString('uk-UA') : '0' }}</span>
          </div>

          <div class="mt-4 p-4 bg-[#881337] text-white rounded-xl flex justify-between items-center shadow-xs">
            <div>
              <span class="text-[10px] uppercase font-bold text-rose-200 block">Повна місячна собівартість спеціаліста:</span>
              <span class="text-2xl font-black">₴{{ calculationResult ? calculationResult.total_cost_to_company_uah.toLocaleString('uk-UA') : '0' }}</span>
            </div>
            <span class="text-xs text-rose-200">100% покриття витрат</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>