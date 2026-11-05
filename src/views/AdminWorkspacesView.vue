<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const getCachedWorkspaces = () => {
  try {
    const cached = localStorage.getItem("subtracker_admin_ws_cache");
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const cachedWs = getCachedWorkspaces();
const workspaces = ref<any[]>(cachedWs);
const isLoading = ref(cachedWs.length === 0);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchAdminWorkspaces = async () => {
  if (authStore.user?.email !== "roman@novatech.com") {
    router.push("/app/dashboard");
    return;
  }

  try {
    const res = await api.get("/admin/workspaces");
    if (Array.isArray(res.data)) {
      workspaces.value = res.data;
      localStorage.setItem("subtracker_admin_ws_cache", JSON.stringify(res.data));
    }
  } catch (err: any) {
    console.error(err);
    if (err.response?.status === 403) {
      router.push("/app/dashboard");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAdminWorkspaces();
});

const totalPages = computed(() => {
  return Math.ceil(workspaces.value.length / itemsPerPage.value) || 1;
});

const paginatedWorkspaces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return workspaces.value.slice(start, start + itemsPerPage.value);
});
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Панель Суперадміністратора: Організації</h1>
        <p class="text-xs text-[#78716C] mt-1">Глобальний моніторинг усіх зареєстрованих просторів платформи SubTracker B2B</p>
      </div>

      <router-link to="/app/admin/audit-logs" class="text-xs font-bold text-[#881337] hover:underline flex items-center gap-1">
        <span>Перейти до журналу безпеки AuditLog</span>
        <IconArrowRight class="w-3.5 h-3.5" :stroke-width="2.5" />
      </router-link>
    </div>

    <div class="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
            <th class="py-3 px-4">ID</th>
            <th class="py-3 px-4">Компанія / Простір</th>
            <th class="py-3 px-4">Власник</th>
            <th class="py-3 px-4 text-center">Команда</th>
            <th class="py-3 px-4 text-center">Підписок</th>
            <th class="py-3 px-4 text-right">Місячний обсяг (UAH)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E7E5E4]">
          <tr v-for="ws in paginatedWorkspaces" :key="ws.id" class="hover:bg-[#FAF8F5]/80">
            <td class="py-3 px-4 text-[#78716C] font-mono">#{{ ws.id }}</td>
            <td class="py-3 px-4 font-bold text-[#1e293b]">{{ ws.name }}</td>
            <td class="py-3 px-4 text-[#78716C]">{{ ws.owner_email }}</td>
            <td class="py-3 px-4 text-center font-bold">{{ ws.members_count }}</td>
            <td class="py-3 px-4 text-center font-bold">{{ ws.subscriptions_count }}</td>
            <td class="py-3 px-4 text-right font-black text-[#881337]">
              ₴{{ ws.monthly_spend_uah ? ws.monthly_spend_uah.toLocaleString('uk-UA') : '0' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="px-4 py-3 bg-[#FAF8F5] border-t border-[#E7E5E4] flex items-center justify-between text-xs">
        <span class="text-[#78716C]">
          Сторінка <strong class="text-[#1e293b]">{{ currentPage }}</strong> з <strong class="text-[#1e293b]">{{ totalPages }}</strong> (усього {{ workspaces.length }} просторів)
        </span>
        <div class="flex items-center gap-1.5">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2.5 py-1 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#44403C] hover:bg-[#F5F5F4] transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <IconChevronLeft class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>Назад</span>
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-2.5 py-1 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#44403C] hover:bg-[#F5F5F4] transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Вперед</span>
            <IconChevronRight class="w-3.5 h-3.5" :stroke-width="2.2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>