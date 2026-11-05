<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IconChevronDown,
  IconPlus,
  IconRefresh,
  IconShieldCheck,
  IconLayoutDashboard,
  IconApps,
  IconClipboardCheck,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconUser,
  IconBuildingSkyscraper,
  IconMenu2,
  IconX
} from "@tabler/icons-vue";
import subtrackLogo from "../assets/subtrack_logo.jpg";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

const pendingRequestsCount = ref(0);
const showWsDropdown = ref(false);
const showNewWsModal = ref(false);
const newWsName = ref("");
const wsCreateError = ref("");
const isCreatingWs = ref(false);
const isSyncing = ref(false);
const syncFeedback = ref("");
const isMobileMenuOpen = ref(false);

const fetchPendingCount = async () => {
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get('/requests/', { params: { workspace_id: wsId } });
    if (Array.isArray(res.data)) {
      pendingRequestsCount.value = res.data.filter((r: any) => r.status === 'Pending').length;
    }
  } catch (e) {
    pendingRequestsCount.value = 0;
  }
};

watch(() => wsStore.currentWorkspace?.id, fetchPendingCount);
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

onMounted(() => {
  Promise.allSettled([
    wsStore.fetchRates(),
    wsStore.fetchWorkspaces().then(() => fetchPendingCount())
  ]);
});

const syncNbuRates = async () => {
  isSyncing.value = true;
  syncFeedback.value = "";
  try {
    const res = await api.post("/currencies/sync");
    await wsStore.fetchRates();
    syncFeedback.value = `$1 = ${res.data?.rates?.USD || wsStore.usdRate} ₴`;
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
      await wsStore.selectWorkspace(res.data);
    }
  } catch (err: any) {
    wsCreateError.value = err.response?.data?.detail 
      ? JSON.stringify(err.response.data.detail) 
      : "Не вдалося створити робочий простір.";
  } finally {
    isCreatingWs.value = false;
  }
};

const navLinks = computed(() => {
  const isMember = authStore.role === "Member";

  const allLinks = [
    { name: "Дашборд витрат", route: "/app/dashboard", icon: IconLayoutDashboard },
    { name: "Каталог підписок", route: "/app/subscriptions", icon: IconApps },
    { name: "Центр погоджень", route: "/app/requests", icon: IconClipboardCheck, hasBadge: true },
    { name: "Фінансова аналітика", route: "/app/analytics", icon: IconChartBar, adminOnly: true },
    { name: "Команда та ролі", route: "/app/team", icon: IconUsers },
    { name: "Налаштування", route: "/app/settings", icon: IconSettings, adminOnly: true },
    { name: "Особистий кабінет", route: "/app/profile", icon: IconUser }
  ];

  if (isMember) {
    return allLinks.filter(l => !l.adminOnly);
  }
  return allLinks;
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] text-[#1e293b] font-sans antialiased w-full overflow-x-hidden">
    <header class="bg-white border-b border-[#E7E5E4] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs w-full">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden p-1.5 rounded-xl border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#44403C] transition cursor-pointer shrink-0"
          title="Меню навігації"
        >
          <IconX v-if="isMobileMenuOpen" class="w-5 h-5 text-[#881337]" :stroke-width="2.5" />
          <IconMenu2 v-else class="w-5 h-5" :stroke-width="2.2" />
        </button>

        <router-link to="/app/dashboard" class="flex items-center gap-2 shrink-0">
          <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-xl border border-[#E7E5E4] bg-white overflow-hidden shadow-xs flex items-center justify-center p-0.5">
            <img :src="subtrackLogo" alt="SubTracker" class="w-full h-full object-contain" />
          </div>
          <span class="font-black text-lg sm:text-xl tracking-tight text-[#1e293b] hidden md:inline">SubTracker</span>
        </router-link>

        <div class="h-5 w-px bg-[#E7E5E4] mx-0.5 hidden sm:block"></div>

        <div class="relative min-w-0">
          <button
            @click="showWsDropdown = !showWsDropdown"
            class="flex items-center gap-1.5 sm:gap-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] px-2.5 py-1.5 rounded-xl border border-[#E7E5E4] text-xs font-bold transition cursor-pointer max-w-[130px] sm:max-w-[200px]"
          >
            <span class="truncate">{{ wsStore.currentWorkspace?.name || "NovaTech IT Core" }}</span>
            <IconChevronDown class="w-3.5 h-3.5 text-[#78716C] shrink-0" :stroke-width="2.2" />
          </button>

          <div
            v-if="showWsDropdown"
            class="absolute left-0 mt-1 w-60 bg-white border border-[#E7E5E4] rounded-xl shadow-lg p-1.5 z-50 text-left text-xs"
          >
            <div class="px-2 py-1 text-[10px] font-bold text-[#78716C] uppercase">Робочі простори:</div>
            <button
              v-for="ws in wsStore.workspaces"
              :key="ws.id"
              @click="wsStore.selectWorkspace(ws); showWsDropdown = false"
              :class="ws.id === wsStore.currentWorkspace?.id ? 'bg-[#FEF2F2] text-[#881337] font-bold' : 'text-[#1e293b] hover:bg-[#FAF8F5]'"
              class="w-full text-left px-3 py-2 rounded-lg transition cursor-pointer"
            >
              {{ ws.name }}
            </button>
            <div class="h-px bg-[#E7E5E4] my-1"></div>
            <button
              @click="showWsDropdown = false; showNewWsModal = true; wsCreateError = ''"
              class="w-full text-left px-3 py-2 text-[#881337] font-bold hover:bg-[#FEF2F2] rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <IconPlus class="w-4 h-4" :stroke-width="2.5" />
              <span>Створити новий простір</span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          @click="syncNbuRates"
          :disabled="isSyncing"
          class="hidden sm:flex bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] px-3 py-1.5 rounded-full text-xs font-bold items-center gap-1.5 shadow-xs transition cursor-pointer"
          title="Оновити котирування через API НБУ"
        >
          <span>НБУ: $1 = {{ wsStore.usdRate.toFixed(2) }} ₴</span>
          <IconRefresh class="w-3.5 h-3.5" :class="isSyncing ? 'animate-spin' : ''" :stroke-width="2.2" />
        </button>

        <button
          v-if="authStore.isAdminOrManager"
          @click="router.push('/app/subscriptions')"
          class="hidden sm:flex bg-[#881337] hover:bg-[#9F1239] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
        >
          <IconPlus class="w-4 h-4" :stroke-width="2.5" />
          <span>Додати підписку</span>
        </button>

        <router-link
          to="/app/profile"
          class="flex items-center gap-2 pl-2 border-l border-[#E7E5E4] cursor-pointer hover:opacity-80 transition"
          title="Особистий кабінет"
        >
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E7E5E4] text-[#881337] font-bold text-xs flex items-center justify-center border border-[#D6D3D1]">
            {{ authStore.user?.first_name ? authStore.user.first_name[0] : "U" }}
          </div>
          <div class="text-left text-xs leading-tight hidden lg:block">
            <p class="font-bold text-[#1e293b]">{{ authStore.userFullName }}</p>
            <p class="text-[10px] text-[#78716C]">{{ authStore.role }}</p>
          </div>
        </router-link>
      </div>
    </header>

    <div v-if="isMobileMenuOpen" class="lg:hidden bg-white border-b border-[#E7E5E4] p-3 shadow-md space-y-2">
      <div class="flex items-center justify-between pb-2 border-b border-[#E7E5E4] gap-2">
        <button
          @click="syncNbuRates"
          :disabled="isSyncing"
          class="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
        >
          <span>НБУ: $1 = {{ wsStore.usdRate.toFixed(2) }} ₴</span>
          <IconRefresh class="w-3.5 h-3.5" :class="isSyncing ? 'animate-spin' : ''" :stroke-width="2.2" />
        </button>

        <button
          v-if="authStore.isAdminOrManager"
          @click="router.push('/app/subscriptions'); isMobileMenuOpen = false"
          class="bg-[#881337] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <IconPlus class="w-3.5 h-3.5" :stroke-width="2.5" />
          <span>Підписка</span>
        </button>
      </div>

      <router-link
        v-for="link in navLinks"
        :key="link.route"
        :to="link.route"
        class="text-sm font-semibold px-3.5 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer"
        :class="route.path === link.route ? 'bg-[#FEF2F2] text-[#881337] font-bold border border-[#FECDD3]' : 'text-[#78716C] hover:text-[#1e293b] hover:bg-[#FAF8F5]'"
      >
        <div class="flex items-center gap-2.5">
          <component :is="link.icon" class="w-4 h-4 shrink-0" :stroke-width="route.path === link.route ? 2.5 : 2" />
          <span>{{ link.name }}</span>
        </div>
        <span
          v-if="link.hasBadge && pendingRequestsCount > 0"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#881337] text-white shadow-xs"
        >
          {{ pendingRequestsCount }}
        </span>
      </router-link>

      <div class="h-px bg-[#E7E5E4] my-1"></div>

      <router-link
        v-if="authStore.user?.email === 'roman@novatech.com'"
        to="/app/admin/workspaces"
        class="text-xs font-bold py-2.5 px-3.5 rounded-xl bg-[#FEF2F2] text-[#881337] border border-[#FECDD3] flex items-center gap-2 transition cursor-pointer"
      >
        <IconBuildingSkyscraper class="w-4 h-4" :stroke-width="2" />
        <span>Платформа (Організації)</span>
      </router-link>

      <router-link
        v-else-if="authStore.role === 'Admin'"
        to="/app/admin/audit-logs"
        class="text-xs font-bold py-2.5 px-3.5 rounded-xl bg-[#FEF2F2] text-[#881337] border border-[#FECDD3] flex items-center gap-2 transition cursor-pointer"
      >
        <IconShieldCheck class="w-4 h-4" :stroke-width="2" />
        <span>Журнал аудиту</span>
      </router-link>
    </div>

    <nav class="bg-white border-b border-[#E7E5E4] px-6 py-2.5 hidden lg:flex items-center gap-3 overflow-x-auto">
      <router-link
        v-for="link in navLinks"
        :key="link.route"
        :to="link.route"
        class="text-sm font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer"
        :class="route.path === link.route ? 'bg-[#FEF2F2] text-[#881337] font-bold border border-[#FECDD3]' : 'text-[#78716C] hover:text-[#1e293b] hover:bg-[#FAF8F5]'"
      >
        <component :is="link.icon" class="w-4 h-4 shrink-0" :stroke-width="route.path === link.route ? 2.5 : 2" />
        <span>{{ link.name }}</span>
        <span
          v-if="link.hasBadge && pendingRequestsCount > 0"
          class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#881337] text-white shadow-xs"
        >
          {{ pendingRequestsCount }}
        </span>
      </router-link>

      <router-link
        v-if="authStore.user?.email === 'roman@novatech.com'"
        to="/app/admin/workspaces"
        class="text-xs font-bold py-2 px-3.5 ml-auto rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#881337] border border-[#FECDD3] flex items-center gap-2 transition cursor-pointer shrink-0"
      >
        <IconBuildingSkyscraper class="w-4 h-4" :stroke-width="2" />
        <span>Платформа (Організації)</span>
      </router-link>

      <router-link
        v-else-if="authStore.role === 'Admin'"
        to="/app/admin/audit-logs"
        class="text-xs font-bold py-2 px-3.5 ml-auto rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#881337] border border-[#FECDD3] flex items-center gap-2 transition cursor-pointer shrink-0"
      >
        <IconShieldCheck class="w-4 h-4" :stroke-width="2" />
        <span>Журнал аудиту</span>
      </router-link>
    </nav>

    <main class="p-3 sm:p-6 max-w-[1400px] mx-auto w-full">
      <router-view />
    </main>

    <div v-if="showNewWsModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl text-left max-h-[90vh] overflow-y-auto">
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
          <button @click="showNewWsModal = false" class="px-3.5 py-1.5 bg-[#F5F5F4] rounded-lg text-xs font-bold cursor-pointer">Скасувати</button>
          <button @click="createWorkspace" :disabled="isCreatingWs" class="px-4 py-1.5 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
            {{ isCreatingWs ? "Створення..." : "Створити" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>