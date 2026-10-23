<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";

const logs = ref<any[]>([]);
const isLoading = ref(true);

const fetchAuditLogs = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/admin/audit-logs");
    logs.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAuditLogs);
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-[#7C3AED] tracking-tight">Журнал системного аудиту (AuditLog)</h1>
        <p class="text-xs text-[#78716C] mt-1">Хронологія критичних дій безпеки у форматі структурованих подій JSONB</p>
      </div>

      <router-link to="/app/admin/workspaces" class="text-xs font-bold text-[#7C3AED] hover:underline">
        ← Повернутися до реєстру організацій
      </router-link>
    </div>

    <div class="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
            <th class="py-3 px-4">Час</th>
            <th class="py-3 px-4">Користувач</th>
            <th class="py-3 px-4">Дія</th>
            <th class="py-3 px-4">Деталі зміни (JSONB)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E7E5E4]">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-[#FAF8F5]/80">
            <td class="py-3 px-4 text-[#78716C] font-mono whitespace-nowrap">{{ new Date(log.timestamp).toLocaleString('uk-UA') }}</td>
            <td class="py-3 px-4 font-bold text-[#1e293b]">{{ log.user_email || 'System' }}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] border border-[#E7E5E4]">
                {{ log.action }}
              </span>
            </td>
            <td class="py-3 px-4 font-mono text-[11px] text-[#44403C] max-w-md truncate">
              {{ JSON.stringify(log.details) }}
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="4" class="py-12 text-center text-xs text-[#78716C]">
              Поки що немає записів у системному журналі.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>