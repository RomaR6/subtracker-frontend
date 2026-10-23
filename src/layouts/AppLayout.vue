<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";
import ProfileModal from "../components/profile/ProfileModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

const showProfileModal = ref(false);
const showWsDropdown = ref(false);
const showNewWsModal = ref(false);
const newWsName = ref("");
const wsCreateError = ref("");
const isCreatingWs = ref(false);
const isSyncing = ref(false);
const syncFeedback = ref("");

onMounted(async () => {
  await wsStore.fetchRates();
  await wsStore.fetchWorkspaces();
});

const syncNbuRates = async () => {
  isSyncing.value = true;
  syncFeedback.value = "";
  try {
    const res = await api.post("/currencies/sync");
    await wsStore.fetchRates();
    syncFeedback.value = `✓ $1 = ${res.data?.rates?.USD || wsStore.usdRate} ₴`;
    setTimeout(() => { syncFeedback.value = ""; }, 2500);
  } catch (err) {
    syncFeedback.value = "Помилка НБУ";
  } finally {
    isSyncing.value = false;
  }
};

const createWorkspace = async () => {
  if (!newWsName.value.trim()) return;
  wsCreateError.value = "";
  isCreatingWs.value = true;
  try {
    const res = await api.post("/workspaces/", {
      name: newWsName.value.trim()
    });
    newWsName.value = "";
    showNewWsModal.value = false;
    await wsStore.fetchWorkspaces();
    if (res.data?.id) {
      wsStore.selectWorkspace(res.data);
    }
  } catch (err: any) {
    wsCreateError.value = err.response?.data?.detail 
      ? JSON.stringify(err.response.data.detail) 
      : "Не вдалося створити робочий простір.";
  } finally {
    isCreatingWs.value = false;
  }
};

const navLinks = [
  { name: "Дашборд витрат", route: "/app/dashboard", badge: null },
  { name: "Каталог підписок", route: "/app/subscriptions", badge: null },
  { name: "Центр погоджень", route: "/app/requests", badge: null },
  { name: "Фінансова аналітика", route: "/app/analytics", badge: null },
  { name: "Команда та ролі", route: "/app/team", badge: null },
  { name: "Налаштування", route: "/app/settings", badge: null }
];
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1e293b] font-sans antialiased">
    <header class="bg-white border-b border-[#E7E5E4] px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div class="flex items-center gap-4">
        <router-link to="/app/dashboard" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-[#881337] text-white flex items-center justify-center font-black text-lg shadow-xs">
            S
          </div>
          <span class="font-bold text-lg tracking-tight text-[#1e293b]">SubTracker B2B</span>
        </router-link>

        <div class="h-5 w-px bg-[#E7E5E4] mx-1"></div>

        <div class="relative">
          <button
            @click="showWsDropdown = !showWsDropdown"
            class="flex items-center gap-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold transition cursor-pointer"
          >
            <span>{{ wsStore.currentWorkspace?.name || "NovaTech IT Core" }}</span>
            <span class="text-[#78716C] bg-white px-1.5 py-0.5 rounded text-[10px] border border-[#E7E5E4]">₴ UAH</span>
            <span class="text-[10px] text-[#78716C]">▼</span>
          </button>

          <div
            v-if="showWsDropdown"
            class="absolute left-0 mt-1 w-56 bg-white border border-[#E7E5E4] rounded-xl shadow-lg p-1.5 z-50 text-left text-xs"
          >
            <div class="px-2 py-1 text-[10px] font-bold text-[#78716C] uppercase">Робочі простори:</div>
            <button
              v-for="ws in wsStore.workspaces"
              :key="ws.id"
              @click="wsStore.selectWorkspace(ws); showWsDropdown = false"
              :class="ws.id === wsStore.currentWorkspace?.id ? 'bg-[#FEF2F2] text-[#881337] font-bold' : 'text-[#1e293b] hover:bg-[#FAF8F5]'"
              class="w-full text-left px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              {{ ws.name }}
            </button>
            <div class="h-px bg-[#E7E5E4] my-1"></div>
            <button
              @click="showWsDropdown = false; showNewWsModal = true; wsCreateError = ''"
              class="w-full text-left px-2.5 py-1.5 text-[#881337] font-bold hover:bg-[#FEF2F2] rounded-lg transition cursor-pointer"
            >
              + Створити новий простір
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="syncNbuRates"
          :disabled="isSyncing"
          class="bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          title="Оновити котирування через API НБУ"
        >
          <span>НБУ: $1 = {{ wsStore.usdRate.toFixed(2) }} ₴</span>
          <span :class="isSyncing ? 'animate-spin' : ''">🔄</span>
        </button>
        <span v-if="syncFeedback" class="text-[11px] font-bold text-[#059669]">{{ syncFeedback }}</span>

        <button
          @click="router.push('/app/subscriptions')"
          class="bg-[#881337] hover:bg-[#9F1239] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
        >
          <span>+ Додати підписку</span>
        </button>

        <div
          @click="showProfileModal = true"
          class="flex items-center gap-2.5 pl-2 border-l border-[#E7E5E4] cursor-pointer hover:opacity-80 transition"
        >
          <div class="w-8 h-8 rounded-full bg-[#E7E5E4] text-[#881337] font-bold text-xs flex items-center justify-center border border-[#D6D3D1]">
            {{ authStore.user?.first_name ? authStore.user.first_name[0] : "R" }}
          </div>
          <div class="text-left text-xs leading-tight hidden sm:block">
            <p class="font-bold text-[#1e293b]">{{ authStore.userFullName }}</p>
            <p class="text-[10px] text-[#78716C] capitalize">{{ authStore.role }}</p>
          </div>
        </div>
      </div>
    </header>

    <nav class="bg-white border-b border-[#E7E5E4] px-6 py-2 flex items-center gap-6 overflow-x-auto">
      <router-link
        v-for="link in navLinks"
        :key="link.route"
        :to="link.route"
        class="text-xs font-semibold py-2 relative flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
        :class="route.path === link.route ? 'text-[#881337] font-bold border-b-2 border-[#881337]' : 'text-[#78716C] hover:text-[#1e293b]'"
      >
        <span>{{ link.name }}</span>
      </router-link>

      <router-link
        v-if="authStore.isSuperadmin"
        to="/app/admin/workspaces"
        class="text-xs font-bold py-2 ml-auto text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer"
      >
        <span>🛡 Адмін-панель</span>
      </router-link>
    </nav>

    <main class="p-6 max-w-[1400px] mx-auto">
      <router-view />
    </main>

    <ProfileModal :show="showProfileModal" @close="showProfileModal = false" />

    <div v-if="showNewWsModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-sm w-full p-6 shadow-xl text-left">
        <h3 class="font-bold text-base text-[#1e293b]">Створити робочий простір</h3>
        
        <div v-if="wsCreateError" class="mt-2 p-2 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded text-xs font-mono">
          {{ wsCreateError }}
        </div>

        <input
          v-model="newWsName"
          placeholder="Назва нової компанії чи відділу"
          class="w-full px-3 py-2 mt-4 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
        />
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showNewWsModal = false" class="px-3 py-1.5 bg-[#F5F5F4] rounded-lg text-xs font-bold cursor-pointer">Скасувати</button>
          <button @click="createWorkspace" :disabled="isCreatingWs" class="px-4 py-1.5 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
            {{ isCreatingWs ? "Створення..." : "Створити" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>