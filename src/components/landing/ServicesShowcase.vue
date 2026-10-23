<script setup lang="ts">
import { computed } from "vue";
import { useWorkspaceStore } from "../../stores/workspace";

const wsStore = useWorkspaceStore();
const usdRate = computed(() => wsStore.usdRate || 41.52);

const services = [
  { name: "AWS Cloud Infrastructure", domain: "aws.amazon.com", category: "Хмарна інфраструктура", basePrice: 840, logoBg: "#FF9900", abbr: "AWS" },
  { name: "Figma Organization", domain: "figma.com", category: "Дизайн та прототипування", basePrice: 180, logoBg: "#0ACF83", abbr: "F" },
  { name: "JetBrains All Products", domain: "jetbrains.com", category: "IDE та засоби розробки", basePrice: 249, logoBg: "#000000", abbr: "JB" },
  { name: "Slack Business+", domain: "slack.com", category: "Корпоративні комунікації", basePrice: 150, logoBg: "#4A154B", abbr: "S" },
  { name: "GitHub Enterprise", domain: "github.com", category: "Контроль версій та CI/CD", basePrice: 420, logoBg: "#24292E", abbr: "GH" },
  { name: "Notion Enterprise", domain: "notion.so", category: "База знань і документація", basePrice: 160, logoBg: "#000000", abbr: "N" },
  { name: "Zoom One Business", domain: "zoom.us", category: "Відеоконференції", basePrice: 250, logoBg: "#2D8CFF", abbr: "Z" },
  { name: "Docker Team Pro", domain: "docker.com", category: "Контейнеризація", basePrice: 135, logoBg: "#2496ED", abbr: "D" }
];
</script>

<template>
  <section id="services" class="py-16 bg-white border-y border-[#E7E5E4]">
    <div class="max-w-[1240px] mx-auto px-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF2F2] border border-[#FECDD3] rounded-full text-xs font-bold text-[#881337] mb-3">
        <span>Каталог інтеграцій</span>
      </div>
      <h2 class="text-3xl font-black text-[#1e293b] tracking-tight">
        Контролюйте ліцензії будь-яких IT-сервісів команди
      </h2>
      <p class="text-xs text-[#78716C] max-w-xl mx-auto mt-2">
        SubTracker автоматично підтягує офіційні логотипи, синхронізує дати списань та нормалізує витрати в UAH за курсом НБУ.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 text-left">
        <div
          v-for="item in services"
          :key="item.name"
          class="p-4 rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] hover:border-[#881337] hover:shadow-md transition duration-200 group"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs" :style="{ backgroundColor: item.logoBg }">
              {{ item.abbr }}
            </div>
            <span class="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              Синхронізовано
            </span>
          </div>
          <h4 class="font-bold text-sm text-[#1e293b] group-hover:text-[#881337] transition">
            {{ item.name }}
          </h4>
          <p class="text-[11px] text-[#78716C] mt-0.5">{{ item.category }}</p>

          <div class="mt-4 pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
            <span class="text-[11px] text-[#78716C]">Орієнтовний тариф:</span>
            <div class="text-right">
              <span class="font-bold text-xs text-[#1e293b]">${{ item.basePrice }}</span>
              <span class="text-[10px] text-[#78716C] ml-1">({{ Math.round(item.basePrice * usdRate).toLocaleString('uk-UA') }} ₴)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>