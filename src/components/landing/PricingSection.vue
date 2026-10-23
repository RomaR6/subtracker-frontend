<script setup lang="ts">
import { ref, computed } from "vue";
import { useWorkspaceStore } from "../../stores/workspace";

const wsStore = useWorkspaceStore();
const usdRate = computed(() => wsStore.usdRate || 41.52);

const isAnnual = ref(true);

const plans = [
  {
    name: "Starter",
    tagline: "Для невеликих команд та стартапів",
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      "До 15 активних підписок",
      "До 10 учасників команди",
      "Календар планових списань",
      "Синхронізація з курсом НБУ",
      "Експорт звітів у CSV"
    ],
    highlight: false,
    buttonText: "Почати з Starter"
  },
  {
    name: "Professional",
    tagline: "Для зростаючих IT-компаній та агенцій",
    monthlyPrice: 79,
    annualPrice: 65,
    features: [
      "Необмежена кількість підписок",
      "До 50 учасників команди",
      "Центр погодження витрат (Approval Requests)",
      "Парсер PDF-рахунків та інвойсів",
      "Калькулятор собівартості ФОП (5% + ЄСВ)",
      "Прогнозування Cash Flow на 6 місяців",
      "Офіційні аудиторські звіти в PDF"
    ],
    highlight: true,
    badge: "Найпопулярніший",
    buttonText: "Обрати Professional"
  },
  {
    name: "Enterprise",
    tagline: "Для великих компаній з підвищеними вимогами безпеки",
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      "Всі можливості Professional без обмежень",
      "Необмежена кількість користувачів",
      "Підключення Telegram-бота сповіщень",
      "Кастомні вихідні Webhooks (Slack/Discord)",
      "Повний аудит дій AuditLog (JSONB)",
      "Персональний менеджер та SLA 99.9%"
    ],
    highlight: false,
    buttonText: "Зв'язатися для Enterprise"
  }
];
</script>

<template>
  <section id="pricing" class="py-20 bg-white">
    <div class="max-w-[1240px] mx-auto px-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF2F2] border border-[#FECDD3] rounded-full text-xs font-bold text-[#881337] mb-3">
        <span>Прозорі тарифи</span>
      </div>
      <h2 class="text-3xl font-black text-[#1e293b] tracking-tight">
        Тарифні плани, що окупаються з першого знайденого дубліката
      </h2>
      <p class="text-xs text-[#78716C] max-w-xl mx-auto mt-2">
        Обирайте план відповідно до масштабу вашої команди. Жодних прихованих платежів.
      </p>

      <!-- Period Switcher -->
      <div class="inline-flex items-center gap-3 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E7E5E4] mt-8">
        <button
          @click="isAnnual = false"
          :class="!isAnnual ? 'bg-white shadow-xs text-[#881337] font-bold' : 'text-[#78716C]'"
          class="px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          Щомісячно
        </button>
        <button
          @click="isAnnual = true"
          :class="isAnnual ? 'bg-white shadow-xs text-[#881337] font-bold' : 'text-[#78716C]'"
          class="px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Щорічно</span>
          <span class="text-[10px] bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-1.5 py-0.2 rounded-full font-bold">
            -20%
          </span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 text-left items-stretch">
        <div
          v-for="plan in plans"
          :key="plan.name"
          :class="plan.highlight ? 'border-[#881337] ring-2 ring-[#881337]/15 bg-white shadow-xl' : 'border-[#E7E5E4] bg-[#FAF8F5]'"
          class="rounded-2xl p-8 border flex flex-col justify-between relative transition duration-200"
        >
          <div v-if="plan.badge" class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#881337] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {{ plan.badge }}
          </div>

          <div>
            <h3 class="font-black text-xl text-[#1e293b]">{{ plan.name }}</h3>
            <p class="text-xs text-[#78716C] mt-1">{{ plan.tagline }}</p>

            <div class="mt-6 flex items-baseline gap-1.5">
              <span class="text-4xl font-black text-[#1e293b]">
                ${{ isAnnual ? plan.annualPrice : plan.monthlyPrice }}
              </span>
              <span class="text-xs text-[#78716C]">/ місяць</span>
            </div>
            <p class="text-[11px] text-[#059669] font-bold mt-1">
              ≈ {{ Math.round((isAnnual ? plan.annualPrice : plan.monthlyPrice) * usdRate).toLocaleString('uk-UA') }} ₴ за курсом НБУ
            </p>

            <div class="h-px bg-[#E7E5E4] my-6"></div>

            <ul class="space-y-2.5 text-xs">
              <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2">
                <span class="text-[#059669] font-bold">✓</span>
                <span class="text-[#44403C]">{{ feat }}</span>
              </li>
            </ul>
          </div>

          <router-link
            to="/register"
            :class="plan.highlight ? 'bg-[#881337] hover:bg-[#9F1239] text-white shadow-md' : 'bg-white hover:bg-[#F5F5F4] text-[#1e293b] border border-[#E7E5E4]'"
            class="mt-8 block text-center py-2.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            {{ plan.buttonText }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>