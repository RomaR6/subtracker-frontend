<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "../../api/axios";

const teamSize = ref(35);
const subscriptionsCount = ref(18);
const monthlySpendUsd = ref(4200);

const isLoading = ref(false);
const calculationResult = ref<{
  nbu_usd_rate: number;
  monthly_savings_usd: number;
  monthly_savings_uah: number;
  yearly_savings_usd: number;
  yearly_savings_uah: number;
  estimated_zombie_licenses: number;
  finance_hours_saved_per_month: number;
  breakdown: {
    unused_seats_usd: number;
    duplicate_saas_usd: number;
    auto_renewal_prevention_usd: number;
  };
} | null>(null);

const calculateSavings = async () => {
  isLoading.value = true;
  try {
    const res = await api.post("/public/calculate-savings", {
      team_size: teamSize.value,
      subscriptions_count: subscriptionsCount.value,
      monthly_spend_usd: monthlySpendUsd.value
    });
    calculationResult.value = res.data;
  } catch (err) {
    // Автономний резервний розрахунок при відсутності мережі
    const rate = 41.52;
    const spend = monthlySpendUsd.value;
    const m_save = Math.round(spend * 0.265 * 100) / 100;
    calculationResult.value = {
      nbu_usd_rate: rate,
      monthly_savings_usd: m_save,
      monthly_savings_uah: Math.round(m_save * rate),
      yearly_savings_usd: Math.round(m_save * 12),
      yearly_savings_uah: Math.round(m_save * 12 * rate),
      estimated_zombie_licenses: Math.max(1, Math.round(subscriptionsCount.value * 0.18)),
      finance_hours_saved_per_month: Math.round(teamSize.value * 0.2 * 10) / 10,
      breakdown: {
        unused_seats_usd: Math.round(m_save * 0.52),
        duplicate_saas_usd: Math.round(m_save * 0.32),
        auto_renewal_prevention_usd: Math.round(m_save * 0.16)
      }
    };
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  calculateSavings();
});

watch([teamSize, subscriptionsCount, monthlySpendUsd], () => {
  calculateSavings();
});
</script>

<template>
  <section id="roi-calculator" class="py-20 bg-[#FAF8F5]">
    <div class="max-w-[1240px] mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] border border-[#FDE68A] rounded-full text-xs font-bold text-[#92400E] mb-3">
          <span>Економічний ефект</span>
        </div>
        <h2 class="text-3xl font-black text-[#1e293b] tracking-tight">
          Розрахуйте потенційну економію бюджету вашої IT-компанії
        </h2>
        <p class="text-xs text-[#78716C] mt-2">
          За статистикою, до 30% ліцензій у технологічних компаніях залишаються неактивними («зомбі-підписки») після звільнення або переходу фахівців на інші проекти.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Sliders Box -->
        <div class="lg:col-span-6 bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-xs text-left space-y-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-[#44403C]">Кількість спеціалістів у команді:</label>
              <span class="text-sm font-black text-[#881337] bg-[#FEF2F2] px-2.5 py-0.5 rounded-lg border border-[#FECDD3]">
                {{ teamSize }} осіб
              </span>
            </div>
            <input
              v-model.number="teamSize"
              type="range"
              min="5"
              max="300"
              step="1"
              class="w-full accent-[#881337] cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-[#78716C] mt-1 font-medium">
              <span>5 стартап</span>
              <span>150 компанія</span>
              <span>300+ enterprise</span>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-[#44403C]">Кількість корпоративних підписок (SaaS):</label>
              <span class="text-sm font-black text-[#881337] bg-[#FEF2F2] px-2.5 py-0.5 rounded-lg border border-[#FECDD3]">
                {{ subscriptionsCount }} сервісів
              </span>
            </div>
            <input
              v-model.number="subscriptionsCount"
              type="range"
              min="2"
              max="80"
              step="1"
              class="w-full accent-[#881337] cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-[#78716C] mt-1 font-medium">
              <span>2 сервіси</span>
              <span>40 стек</span>
              <span>80+ систем</span>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold text-[#44403C]">Орієнтовний місячний бюджет на софт (USD):</label>
              <span class="text-sm font-black text-[#881337] bg-[#FEF2F2] px-2.5 py-0.5 rounded-lg border border-[#FECDD3]">
                ${{ monthlySpendUsd.toLocaleString('en-US') }}
              </span>
            </div>
            <input
              v-model.number="monthlySpendUsd"
              type="range"
              min="300"
              max="25000"
              step="100"
              class="w-full accent-[#881337] cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-[#78716C] mt-1 font-medium">
              <span>$300</span>
              <span>$10,000</span>
              <span>$25,000+</span>
            </div>
          </div>

          <div class="p-4 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl flex items-center justify-between text-xs">
            <span class="text-[#78716C]">Курс розрахунку НБУ:</span>
            <span class="font-bold text-[#1e293b]">
              $1 = {{ calculationResult?.nbu_usd_rate ? calculationResult.nbu_usd_rate.toFixed(2) : '41.52' }} ₴
            </span>
          </div>
        </div>

        <!-- Real-time Output Metric Cards -->
        <div class="lg:col-span-6 bg-gradient-to-br from-[#881337] to-[#4C0519] text-white rounded-2xl p-6 sm:p-8 shadow-xl text-left flex flex-col justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-rose-200">
              Орієнтовна прогнозована оптимізація:
            </span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-4xl sm:text-5xl font-black tracking-tight text-white">
                ${{ calculationResult ? calculationResult.monthly_savings_usd.toLocaleString('en-US') : '1,113' }}
              </span>
              <span class="text-sm text-rose-200 font-bold">/ місяць</span>
            </div>
            <p class="text-sm text-amber-300 font-bold mt-1">
              ≈ ₴{{ calculationResult ? calculationResult.monthly_savings_uah.toLocaleString('uk-UA') : '46,211' }} грн збережених коштів щомісяця
            </p>

            <div class="h-px bg-white/20 my-6"></div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/10 rounded-xl p-3.5 border border-white/10">
                <span class="text-[10px] text-rose-200 uppercase font-bold">Річна економія</span>
                <p class="text-lg font-black text-white mt-1">
                  ${{ calculationResult ? calculationResult.yearly_savings_usd.toLocaleString('en-US') : '13,356' }}
                </p>
                <p class="text-[10px] text-rose-200">
                  ≈ ₴{{ calculationResult ? Math.round(calculationResult.yearly_savings_uah / 1000) : '554' }} тис. грн/рік
                </p>
              </div>

              <div class="bg-white/10 rounded-xl p-3.5 border border-white/10">
                <span class="text-[10px] text-rose-200 uppercase font-bold">Зомбі-підписки</span>
                <p class="text-lg font-black text-amber-300 mt-1">
                  {{ calculationResult ? calculationResult.estimated_zombie_licenses : 3 }} сервіси
                </p>
                <p class="text-[10px] text-rose-200">Неактивні або дубльовані</p>
              </div>
            </div>

            <!-- Detailed breakdown list -->
            <div class="mt-6 space-y-2 text-xs">
              <div class="flex justify-between items-center text-rose-100">
                <span>• Відмова від незадіяних робочих місць (seats):</span>
                <span class="font-bold text-white">${{ calculationResult?.breakdown.unused_seats_usd || 580 }}</span>
              </div>
              <div class="flex justify-between items-center text-rose-100">
                <span>• Ліквідація дублюючих інструментів між відділами:</span>
                <span class="font-bold text-white">${{ calculationResult?.breakdown.duplicate_saas_usd || 356 }}</span>
              </div>
              <div class="flex justify-between items-center text-rose-100">
                <span>• Запобігання небажаним автопродовженням:</span>
                <span class="font-bold text-white">${{ calculationResult?.breakdown.auto_renewal_prevention_usd || 177 }}</span>
              </div>
              <div class="flex justify-between items-center text-rose-100">
                <span>• Економія часу фінвідділу та лідів:</span>
                <span class="font-bold text-white">{{ calculationResult?.finance_hours_saved_per_month || 7.0 }} год/міс</span>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-xs text-rose-200 text-center sm:text-left">
              Бажаєте автоматично провести аудит вашого робочого простору?
            </span>
            <router-link
              to="/register"
              class="w-full sm:w-auto text-center px-5 py-2.5 bg-white text-[#881337] rounded-lg text-xs font-black shadow-md hover:bg-rose-50 transition active:scale-95"
            >
              Спробувати безкоштовно
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>