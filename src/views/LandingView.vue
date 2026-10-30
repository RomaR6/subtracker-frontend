<script setup lang="ts">
import { ref, computed } from "vue";
import subtrackLogo from "../assets/subtrack_logo.jpg";

import awsIcon from "../assets/integrations/aws.svg";
import figmaIcon from "../assets/integrations/figma.svg";
import jetbrainsIcon from "../assets/integrations/jetbrains.svg";
import slackIcon from "../assets/integrations/slack.svg";
import githubIcon from "../assets/integrations/github.svg";
import notionIcon from "../assets/integrations/notion.svg";
import zoomIcon from "../assets/integrations/zoom.svg";
import dockerIcon from "../assets/integrations/docker.svg";

const teamSize = ref(25);
const avgSeatCost = ref(35);
const duplicateRate = ref(15);
const uahRate = ref(45.35);

const annualSaaSExpense = computed(() => {
  return teamSize.value * avgSeatCost.value * 12;
});

const estimatedSavingsUsd = computed(() => {
  return Math.round(annualSaaSExpense.value * (duplicateRate.value / 100));
});

const estimatedSavingsUah = computed(() => {
  return Math.round(estimatedSavingsUsd.value * uahRate.value);
});

const integrations = [
  {
    name: "AWS Cloud Infrastructure",
    category: "Хмарна інфраструктура",
    cost: "840",
    uah: "38 096",
    iconSrc: awsIcon
  },
  {
    name: "Figma Organization",
    category: "Дизайн та прототипування",
    cost: "180",
    uah: "8 163",
    iconSrc: figmaIcon
  },
  {
    name: "JetBrains All Products",
    category: "IDE та засоби розробки",
    cost: "249",
    uah: "11 293",
    iconSrc: jetbrainsIcon
  },
  {
    name: "Slack Business+",
    category: "Корпоративні комунікації",
    cost: "150",
    uah: "6 803",
    iconSrc: slackIcon
  },
  {
    name: "GitHub Enterprise",
    category: "Контроль версій та CI/CD",
    cost: "420",
    uah: "19 048",
    iconSrc: githubIcon
  },
  {
    name: "Notion Enterprise",
    category: "База знань і документація",
    cost: "160",
    uah: "7 256",
    iconSrc: notionIcon
  },
  {
    name: "Zoom One Business",
    category: "Відеоконференції",
    cost: "250",
    uah: "11 338",
    iconSrc: zoomIcon
  },
  {
    name: "Docker Team Pro",
    category: "Контейнеризація",
    cost: "135",
    uah: "6 123",
    iconSrc: dockerIcon
  }
];
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1e293b]">
    <!-- Головний екран -->
    <section class="max-w-7xl mx-auto px-6 pt-12 pb-16 text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
      <div class="md:col-span-7 space-y-6">
        <div class="flex items-center gap-3 justify-center md:justify-start">
          <div class="h-12 w-12 rounded-xl border border-[#E7E5E4] bg-white overflow-hidden shadow-xs flex items-center justify-center p-1 shrink-0">
            <img :src="subtrackLogo" alt="SubTracker" class="w-full h-full object-contain scale-110 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <span class="text-2xl font-black tracking-tight text-[#881337] block leading-none">
              Sub<span class="text-[#1e293b]">Tracker</span>
            </span>
            <span class="text-[10px] font-bold text-[#78716C] tracking-widest uppercase block mt-1">
              Enterprise Asset Management
            </span>
          </div>
        </div>

        <span class="inline-block bg-[#FEF2F2] border border-[#FECDD3] text-[#881337] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
          🚀 Вільний інструмент оптимізації IT-бюджету
        </span>

        <h1 class="text-3xl md:text-5xl font-black text-[#1e293b] leading-tight">
          Повний контроль IT-ліцензій та підписок компанії
        </h1>

        <p class="text-sm md:text-base text-[#78716C] leading-relaxed max-w-2xl">
          Автоматизуйте облік ліцензій, проводьте аудит зайвих робочих місць, контролюйте Cash Flow та нормалізуйте витрати в UAH за курсом НБУ ($1 = {{ uahRate }} ₴).
        </p>

        <div class="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
          <router-link
            to="/register"
            class="bg-[#881337] hover:bg-[#9F1239] text-white px-7 py-3 rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
          >
            Створити робочий простір
          </router-link>
          <router-link
            to="/login"
            class="bg-white border border-[#E7E5E4] hover:bg-[#FAF8F5] text-[#44403C] px-7 py-3 rounded-xl font-bold text-sm transition shadow-xs cursor-pointer"
          >
            Увійти в акаунт
          </router-link>
        </div>
      </div>

      <div class="md:col-span-5 bg-white border border-[#E7E5E4] rounded-2xl p-7 shadow-xs border-b-4 border-b-[#881337] text-left space-y-4">
        <h3 class="font-black text-lg text-[#1e293b]">Що отримує ваша команда:</h3>
        
        <ul class="space-y-3 text-xs text-[#44403C]">
          <li class="flex items-start gap-2.5">
            <span class="text-[#059669] font-black">✓</span>
            <span><strong>Єдиний реєстр підписок:</strong> облік тарифів, дат списань та відповідальних менеджерів.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="text-[#059669] font-black">✓</span>
            <span><strong>Календар автопролонгацій:</strong> завчасні нагадування перед плановими платежами.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="text-[#059669] font-black">✓</span>
            <span><strong>Конвертер валют:</strong> пряма синхронізація з щоденним курсом НБУ.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="text-[#059669] font-black">✓</span>
            <span><strong>Центр погоджень:</strong> заявки співробітників на закупівлю ПЗ із контролем статусів.</span>
          </li>
        </ul>

        <div class="pt-3 border-t border-[#E7E5E4]">
          <router-link to="/register" class="text-xs font-bold text-[#881337] hover:underline block text-center">
            Розпочати роботу з компанією →
          </router-link>
        </div>
      </div>
    </section>

    <!-- Каталог інтеграцій -->
    <section class="bg-white border-y border-[#E7E5E4] py-14">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <span class="bg-[#FEF2F2] border border-[#FECDD3] text-[#881337] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Каталог інтеграцій
          </span>
          <h2 class="text-2xl md:text-3xl font-black text-[#1e293b] mt-2">
            Контролюйте ліцензії будь-яких IT-сервісів команди
          </h2>
          <p class="text-xs text-[#78716C] mt-2">
            SubTracker нормалізує всі тарифи в гривню за курсом НБУ та систематизує витрати за категоріями.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="item in integrations"
            :key="item.name"
            class="border border-[#E7E5E4] bg-[#FAF8F5] p-5 rounded-2xl space-y-4 hover:border-[#881337] transition text-left"
          >
            <div class="flex justify-between items-start">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center p-2.5 bg-white border border-[#E7E5E4] shadow-xs shrink-0">
                <img :src="item.iconSrc" :alt="item.name" class="w-full h-full object-contain" />
              </div>
              <span class="bg-white border border-[#E7E5E4] text-[10px] text-[#059669] font-bold px-2.5 py-0.5 rounded-full">
                Підключено
              </span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-[#1e293b] truncate">{{ item.name }}</h4>
              <p class="text-[10px] text-[#78716C] mt-0.5">{{ item.category }}</p>
            </div>
            <div class="pt-2 border-t border-[#E7E5E4] flex justify-between items-baseline">
              <span class="text-[10px] text-[#78716C]">Орієнтовний тариф:</span>
              <span class="font-black text-xs text-[#1e293b]">${{ item.cost }} <span class="font-normal text-[9px] text-[#78716C]">({{ item.uah }} ₴)</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Інтерактивний ROI Калькулятор -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl p-6 md:p-12 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        <div class="md:col-span-6 space-y-5">
          <div>
            <span class="bg-[#FEF2F2] border border-[#FECDD3] text-[#881337] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Інтерактивний розрахунок
            </span>
            <h3 class="text-xl md:text-2xl font-black text-[#1e293b] mt-2">
              Калькулятор потенційної економії (ROI)
            </h3>
            <p class="text-xs text-[#78716C] mt-1 leading-relaxed">
              Вкажіть параметри вашої команди, щоб оцінити суму збережених коштів завдяки аудиту та вчасному скасуванню невикористовуваних підписок.
            </p>
          </div>

          <div class="space-y-4 text-xs font-bold text-[#44403C]">
            <div>
              <div class="flex justify-between mb-1.5">
                <span>Кількість співробітників у команді:</span>
                <span class="text-[#881337] font-black">{{ teamSize }} осіб</span>
              </div>
              <input v-model.number="teamSize" type="range" min="3" max="250" class="w-full accent-[#881337]" />
            </div>

            <div>
              <div class="flex justify-between mb-1.5">
                <span>Середні витрати на SaaS / співробітника на місяць:</span>
                <span class="text-[#881337] font-black">${{ avgSeatCost }} / міс</span>
              </div>
              <input v-model.number="avgSeatCost" type="range" min="10" max="150" class="w-full accent-[#881337]" />
            </div>

            <div>
              <div class="flex justify-between mb-1.5">
                <span>Очікуваний відсоток оптимізації (зайві місця, дублікати):</span>
                <span class="text-[#881337] font-black">{{ duplicateRate }}%</span>
              </div>
              <input v-model.number="duplicateRate" type="range" min="5" max="40" class="w-full accent-[#881337]" />
            </div>
          </div>
        </div>

        <div class="md:col-span-6 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="border-b border-[#E7E5E4] pb-4">
              <span class="text-xs text-[#78716C] block">Загальний бюджет на ПЗ / рік:</span>
              <span class="text-xl font-black text-[#1e293b]">${{ annualSaaSExpense.toLocaleString() }}</span>
            </div>

            <div class="border-b border-[#E7E5E4] pb-4">
              <span class="text-xs text-[#78716C] block">Очікувана річна економія:</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-3xl font-black text-[#881337]">${{ estimatedSavingsUsd.toLocaleString() }}</span>
                <span class="text-sm font-bold text-[#059669]">≈ {{ estimatedSavingsUah.toLocaleString() }} ₴</span>
              </div>
              <span class="text-[11px] text-[#78716C]">Розраховано за курсом НБУ: 1 USD = {{ uahRate }} UAH</span>
            </div>

            <div class="text-[11px] text-[#44403C] space-y-1.5">
              <p class="font-bold">Шляхи досягнення результату:</p>
              <p class="text-[#78716C]">• Виявлення та блокування ліцензій звільнених співробітників</p>
              <p class="text-[#78716C]">• Відмова від паралельних інструментів з однаковим функціоналом</p>
              <p class="text-[#78716C]">• Перехід на річні тарифи з корпоративним дисконтом</p>
            </div>
          </div>

          <div class="pt-5">
            <router-link
              to="/register"
              class="w-full bg-[#881337] hover:bg-[#9F1239] text-white py-2.5 rounded-xl text-xs font-bold block text-center transition shadow-xs"
            >
              Зареєструватися та оптимізувати витрати
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Підвал -->
    <footer class="bg-white border-t border-[#E7E5E4] py-10 text-xs text-[#78716C]">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-lg border border-[#E7E5E4] bg-white overflow-hidden shadow-xs flex items-center justify-center p-0.5 shrink-0">
            <img :src="subtrackLogo" alt="SubTracker" class="w-full h-full object-contain scale-110 -translate-x-0.5 translate-y-0.5" />
          </div>
          <span>SubTracker B2B © 2026. Всі права захищено.</span>
        </div>
        <div>
          <span>Курсова робота з дисципліни «Конструювання програмного забезпечення»</span>
        </div>
      </div>
    </footer>
  </div>
</template>