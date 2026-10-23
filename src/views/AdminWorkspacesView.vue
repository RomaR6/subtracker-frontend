<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";

const workspaces = ref<any[]>([]);
const isLoading = ref(true);

const fetchAdminWorkspaces = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/admin/workspaces");
    workspaces.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAdminWorkspaces);
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-[#7C3AED] tracking-tight">Панель Суперадміністратора: Організації</h1>
        <p class="text-xs text-[#78716C] mt-1">Глобальний моніторинг усіх зареєстрованих просторів платформи SubTracker B2B</p>
      </div>

      <router-link to="/app/admin/audit-logs" class="text-xs font-bold text-[#7C3AED] hover:underline">
        Перейти до журналу безпеки AuditLog →
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
          <tr v-for="ws in workspaces" :key="ws.id" class="hover:bg-[#FAF8F5]/80">
            <td class="py-3 px-4 text-[#78716C] font-mono">#{{ ws.id }}</td>
            <td class="py-3 px-4 font-bold text-[#1e293b]">{{ ws.name }}</td>
            <td class="py-3 px-4 text-[#78716C]">{{ ws.owner_email }}</td>
            <td class="py-3 px-4 text-center font-bold">{{ ws.members_count }}</td>
            <td class="py-3 px-4 text-center font-bold">{{ ws.subscriptions_count }}</td>
            <td class="py-3 px-4 text-right font-black text-[#7C3AED]">
              ₴{{ ws.monthly_spend_uah ? ws.monthly_spend_uah.toLocaleString('uk-UA') : '0' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>