<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { IconPackageExport, IconArrowLeft, IconDownload } from "@tabler/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";

const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

const logs = ref<any[]>([]);
const isLoading = ref(true);

const isSuperadmin = authStore.user?.email === "roman@novatech.com";

const fetchAuditLogs = async () => {
  if (authStore.role !== "Admin" && !isSuperadmin) {
    router.push("/app/dashboard");
    return;
  }

  isLoading.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const params: any = {};
    if (!isSuperadmin) {
      params.workspace_id = wsId;
    }
    const res = await api.get("/admin/audit-logs", { params });
    logs.value = res.data;
  } catch (err: any) {
    console.error(err);
    if (err.response?.status === 403) {
      router.push("/app/dashboard");
    }
  } finally {
    isLoading.value = false;
  }
};

watch(() => wsStore.currentWorkspace?.id, fetchAuditLogs);

onMounted(fetchAuditLogs);

const formatLogDetails = (action: string, details: any): string => {
  if (!details || typeof details !== "object") return "Без додаткових параметрів";

  switch (action) {
    case "UPDATE_SUBSCRIPTION": {
      const name = details.name || "Підписка";
      if (details.changes?.cost) {
        return `Зміна вартості «${name}»: $${details.changes.cost.old} ➔ $${details.changes.cost.new}`;
      }
      return `Зміна параметрів ліцензії «${name}»`;
    }
    case "CREATE_SUBSCRIPTION":
      return `Створено нову підписку «${details.name || details.service_name}» ($${details.cost || details.cost_usd || 0})`;
    case "DELETE_SUBSCRIPTION":
      return `Вилучено підписку «${details.name || 'ID: ' + details.subscription_id}»`;
    case "CREATE_APPROVAL_REQUEST":
      return `Запит на погодження: «${details.software_name}» ($${details.estimated_cost || 0})`;
    case "APPROVAL_APPROVED":
      return `Схвалено заявку «${details.software_name || 'ID: ' + details.request_id}»${details.review_comment ? ' (' + details.review_comment + ')' : ''}`;
    case "APPROVAL_REJECTED":
      return `Відхилено заявку «${details.software_name || 'ID: ' + details.request_id}»${details.review_comment ? ' (Причина: ' + details.review_comment + ')' : ''}`;
    case "TELEGRAM_REMINDER_SENT":
      return `Надіслано Telegram-сповіщення (чат #${details.chat_id || 'корпоративний'})`;
    case "WORKSPACE_INITIALIZED":
      return `Ініціалізація простору «${details.workspace}» (версія: ${details.seed_version || '1.0'})`;
    default:
      return Object.entries(details)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(" | ");
  }
};

const downloadSingleLogJson = (log: any) => {
  const exportData = {
    audit_id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    user: log.user_email || "System",
    workspace_id: log.workspace_id,
    details: log.details
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit_event_${log.id}_${log.action.toLowerCase()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportAllAuditJson = () => {
  const wsName = wsStore.currentWorkspace?.name || "workspace";
  const jsonStr = JSON.stringify(logs.value, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit_logs_${wsName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">
          Журнал безпеки та аудиту (AuditLog)
        </h1>
        <p class="text-xs text-[#78716C] mt-1">
          Хронологія критичних дій у просторі
          <strong class="text-[#881337]">«{{ wsStore.currentWorkspace?.name || "Поточний простір" }}»</strong>
          у форматі структурованих подій JSONB
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          v-if="logs.length > 0"
          @click="exportAllAuditJson"
          class="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#881337] border border-[#FECDD3] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <IconPackageExport class="w-4 h-4" :stroke-width="2" />
          <span>Експорт аудиту (.json)</span>
        </button>

        <router-link
          v-if="isSuperadmin"
          to="/app/admin/workspaces"
          class="text-xs font-bold text-[#881337] hover:underline flex items-center gap-1"
        >
          <IconArrowLeft class="w-3.5 h-3.5" :stroke-width="2.5" />
          <span>До реєстру організацій</span>
        </router-link>
      </div>
    </div>

    <div class="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
            <th class="py-3 px-4">Час</th>
            <th class="py-3 px-4">Користувач</th>
            <th class="py-3 px-4">Дія</th>
            <th class="py-3 px-4">Зміст операції</th>
            <th class="py-3 px-4 text-right">Файл</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E7E5E4]">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-[#FAF8F5]/80 transition">
            <td class="py-3 px-4 text-[#78716C] font-mono whitespace-nowrap">
              {{ new Date(log.timestamp).toLocaleString('uk-UA') }}
            </td>
            <td class="py-3 px-4 font-bold text-[#1e293b]">
              {{ log.user_email || 'System' }}
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
                {{ log.action }}
              </span>
            </td>
            <td class="py-3 px-4 text-[#1e293b]">
              <span class="font-medium text-xs leading-relaxed block">
                {{ formatLogDetails(log.action, log.details) }}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button
                @click="downloadSingleLogJson(log)"
                title="Завантажити повний JSON зліпок події"
                class="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FEF2F2] hover:text-[#881337] hover:border-[#FECDD3] text-[#78716C] border border-[#E7E5E4] rounded-lg text-[10px] font-mono font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
              >
                <span>JSON</span>
                <IconDownload class="w-3 h-3" :stroke-width="2.2" />
              </button>
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="py-12 text-center text-xs text-[#78716C]">
              Поки що немає зафіксованих подій аудиту для цього простору.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>