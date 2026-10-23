<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useWorkspaceStore } from "../stores/workspace";
import ServicesShowcase from "../components/landing/ServicesShowcase.vue";
import RoiCalculator from "../components/landing/RoiCalculator.vue";
import PricingSection from "../components/landing/PricingSection.vue";

const router = useRouter();
const wsStore = useWorkspaceStore();

onMounted(async () => {
  await wsStore.fetchRates();
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1e293b] font-sans antialiased selection:bg-[#881337] selection:text-white">
    <!-- Public Header -->
    <header class="bg-white border-b border-[#E7E5E4] px-6 py-4 sticky top-0 z-40 shadow-xs">
      <div class="max-w-[1240px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#881337] text-white flex items-center justify-center font-black text-xl shadow-sm">
            S
          </div>
          <div>
            <span class="font-black text-lg tracking-tight text-[#1e293b]">SubTracker B2B</span>
            <span class="text-[10px] text-[#78716C] block leading-none">Enterprise Asset Management</span>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-8 text-xs font-bold text-[#78716C]">
          <a href="#features" class="hover:text-[#881337] transition">Можливості</a>
          <a href="#services" class="hover:text-[#881337] transition">Каталог сервісів</a>
          <a href="#roi-calculator" class="hover:text-[#881337] transition">Калькулятор економії</a>
          <a href="#pricing" class="hover:text-[#881337] transition">Тарифи</a>
        </nav>

        <div class="flex items-center gap-3">
          <!-- NBU USD Pill -->
          <div class="hidden sm:flex bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full text-xs font-bold items-center gap-1">
            <span>НБУ: $1 = {{ wsStore.usdRate.toFixed(2) }} ₴</span>
          </div>

          <router-link
            to="/login"
            class="px-4 py-2 text-xs font-bold text-[#44403C] hover:text-[#881337] transition"
          >
            Увійти
          </router-link>

          <router-link
            to="/register"
            class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          >
            Створити простір
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-20 lg:py-28 overflow-hidden relative">
      <div class="max-w-[1240px] mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FEF2F2] border border-[#FECDD3] rounded-full text-xs font-bold text-[#881337] mb-6 shadow-xs">
          <span>🚀 B2B SaaS платформа обліку підписок для IT-підприємств</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1e293b] tracking-tight max-w-4xl mx-auto leading-tight">
          Повний контроль корпоративного софту, ліцензій та бюджету в <span class="text-[#881337]">UAH</span>
        </h1>

        <p class="text-sm sm:text-base text-[#78716C] max-w-2xl mx-auto mt-6 leading-relaxed">
          Централізований облік підписок, калькулятор собівартості фахівців за моделлю ФОП 3-ї групи (5% + ЄСВ), попередження про списання в Telegram та узгодження нових витрат команди.
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <router-link
            to="/register"
            class="w-full sm:w-auto px-6 py-3 bg-[#881337] hover:bg-[#9F1239] text-white rounded-xl text-sm font-black shadow-lg transition active:scale-95"
          >
            Розпочати безкоштовно
          </router-link>
          <a
            href="#roi-calculator"
            class="w-full sm:w-auto px-6 py-3 bg-white border border-[#E7E5E4] hover:bg-[#FAF8F5] text-[#1e293b] rounded-xl text-sm font-bold shadow-xs transition"
          >
            📊 Розрахувати ROI економії
          </a>
        </div>

        <!-- Metric Proof Pills -->
        <div class="mt-14 pt-8 border-t border-[#E7E5E4] grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-left">
          <div>
            <span class="text-2xl font-black text-[#1e293b]">до 30%</span>
            <p class="text-[11px] text-[#78716C] mt-0.5">Зниження щомісячних витрат</p>
          </div>
          <div>
            <span class="text-2xl font-black text-[#1e293b]">100%</span>
            <p class="text-[11px] text-[#78716C] mt-0.5">Відповідність податкам ФОП</p>
          </div>
          <div>
            <span class="text-2xl font-black text-[#1e293b]">14 днів</span>
            <p class="text-[11px] text-[#78716C] mt-0.5">Попередження про списання</p>
          </div>
          <div>
            <span class="text-2xl font-black text-[#1e293b]">PDF / CSV</span>
            <p class="text-[11px] text-[#78716C] mt-0.5">Звітність для бухгалтерії</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Catalog Preview -->
    <ServicesShowcase />

    <!-- Features Section -->
    <section id="features" class="py-20 bg-[#FAF8F5]">
      <div class="max-w-[1240px] mx-auto px-6 text-left">
        <div class="max-w-xl mb-12">
          <span class="text-xs font-bold uppercase tracking-wider text-[#881337]">Архітектура системи</span>
          <h2 class="text-3xl font-black text-[#1e293b] mt-1 tracking-tight">
            Чому фінансові директори та лідери команд обирають SubTracker
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#881337] flex items-center justify-center font-bold text-lg mb-4">
              🧮
            </div>
            <h3 class="font-bold text-base text-[#1e293b]">Калькулятор ФОП 5% + ЄСВ</h3>
            <p class="text-xs text-[#78716C] mt-2 leading-relaxed">
              Розрахунок повної собівартості спеціаліста за формулою (1.2): чиста винагорода Net, єдиний податок 5%, ЄСВ 1 760 грн та сумарна вартість закріпленого софту.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-bold text-lg mb-4">
              📑
            </div>
            <h3 class="font-bold text-base text-[#1e293b]">Парсер PDF-рахунків</h3>
            <p class="text-xs text-[#78716C] mt-2 leading-relaxed">
              Автоматичне вилучення сум, номерів замовлень та дат оплати з інвойсів сервісів за допомогою бібліотеки PyPDF для швидкої звітності без ручного введення.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-lg mb-4">
              🔔
            </div>
            <h3 class="font-bold text-base text-[#1e293b]">Telegram-сповіщення</h3>
            <p class="text-xs text-[#78716C] mt-2 leading-relaxed">
              Календарні нагадування про платіжні зобов'язання за 14 днів із можливістю підтвердження оплати або скасування ліцензії через інтерактивні Inline-кнопки.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive ROI Calculator -->
    <RoiCalculator />

    <!-- Pricing Section -->
    <PricingSection />

    <!-- Footer -->
    <footer class="bg-white border-t border-[#E7E5E4] py-10 text-xs text-[#78716C]">
      <div class="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 font-bold text-[#1e293b]">
          <div class="w-6 h-6 rounded bg-[#881337] text-white flex items-center justify-center text-xs font-black">S</div>
          <span>SubTracker B2B © 2026. Всі права захищено.</span>
        </div>
        <p class="text-[11px]">Курсова робота з дисципліни «Конструювання програмного забезпечення»</p>
      </div>
    </footer>
  </div>
</template>