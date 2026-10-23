<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

onMounted(async () => {
  await wsStore.fetchRates();
  await wsStore.fetchWorkspaces();
});

const navLinks = [
  { name: "Дашборд витрат", route: "/dashboard", badge: null },
  { name: "Каталог підписок", route: "/subscriptions", badge: null },
  { name: "Центр погоджень", route: "/requests", badge: "3" },
  { name: "Фінансова аналітика", route: "/analytics", badge: null },
  { name: "Команда та ролі", route: "/team", badge: null },
  { name: "Налаштування", route: "/settings", badge: null }
];
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1e293b] font-sans antialiased">
    <header class="bg-white border-b border-[#E7E5E4] px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-[#881337] text-white flex items-center justify-center font-black text-lg shadow-sm">
            S
          </div>
          <span class="font-bold text-lg tracking-tight text-[#1e293b]">SubTracker B2B</span>
        </div>

        <div class="h-5 w-px bg-[#E7E5E4] mx-1"></div>

        <div class="flex items-center gap-2 bg-[#F5F5F4] px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold cursor-pointer hover:bg-[#E7E5E4] transition">
          <span>{{ wsStore.currentWorkspace?.name || "NovaTech IT Core" }}</span>
          <span class="text-[#78716C] bg-white px-1.5 py-0.5 rounded text-[10px] border border-[#E7E5E4]">₴ UAH</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <span>НБУ: $1 = {{ wsStore.usdRate.toFixed(2) }} ₴</span>
        </div>

        <button
          v-if="authStore.isAdminOrManager"
          @click="router.push('/subscriptions')"
          class="bg-[#881337] hover:bg-[#9F1239] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <span class="text-sm leading-none">+</span>
          <span>Додати підписку</span>
        </button>

        <div class="flex items-center gap-2.5 pl-2 border-l border-[#E7E5E4]">
          <div class="w-8 h-8 rounded-full bg-[#E7E5E4] text-[#881337] font-bold text-xs flex items-center justify-center border border-[#D6D3D1]">
            {{ authStore.user?.first_name ? authStore.user.first_name[0] : "R" }}
          </div>
          <div class="text-left text-xs leading-tight">
            <p class="font-bold text-[#1e293b]">{{ authStore.userFullName }}</p>
            <p class="text-[10px] text-[#78716C] capitalize">{{ authStore.role }}</p>
          </div>
          <button @click="authStore.logout" title="Вийти з системи" class="text-xs text-[#78716C] hover:text-[#DC2626] ml-1 p-1">
            ✕
          </button>
        </div>
      </div>
    </header>

    <nav class="bg-white border-b border-[#E7E5E4] px-6 py-2 flex items-center gap-6 overflow-x-auto">
      <router-link
        v-for="link in navLinks"
        :key="link.route"
        :to="link.route"
        class="text-xs font-semibold py-2 relative flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
        :class="route.path.startsWith(link.route) ? 'text-[#881337] font-bold border-b-2 border-[#881337]' : 'text-[#78716C] hover:text-[#1e293b]'"
      >
        <span>{{ link.name }}</span>
        <span
          v-if="link.badge"
          class="bg-[#F59E0B] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight"
        >
          {{ link.badge }}
        </span>
      </router-link>

      <router-link
        v-if="authStore.isSuperadmin"
        to="/admin/audit-logs"
        class="text-xs font-bold py-2 ml-auto text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer"
      >
        <span>🛡 Журнал безпеки (Admin)</span>
      </router-link>
    </nav>

    <main class="p-6 max-w-[1400px] mx-auto">
      <router-view />
    </main>
  </div>
</template>