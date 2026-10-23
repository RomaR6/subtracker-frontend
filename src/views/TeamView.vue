<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";

const wsStore = useWorkspaceStore();

const members = ref<any[]>([]);
const isLoading = ref(true);
const inviteEmail = ref("");
const inviteRole = ref("Member");
const generatedInviteLink = ref("");
const copySuccess = ref(false);
const errorMsg = ref("");

const fetchMembers = async () => {
  isLoading.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get(`/workspaces/${wsId}/members`);
    members.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchMembers();
});

const generateInvite = async () => {
  if (!inviteEmail.value.trim()) {
    errorMsg.value = "Будь ласка, введіть корпоративний email співробітника.";
    return;
  }
  errorMsg.value = "";
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.post(`/workspaces/${wsId}/invites`, {
      email: inviteEmail.value.trim(),
      role_name: inviteRole.value
    });

    const token = res.data?.invite_token || res.data?.token || res.data;
    const tokenStr = typeof token === "object" ? (token.invite_token || token.token) : token;
    generatedInviteLink.value = `${window.location.origin}/accept-invite?token=${tokenStr}`;
    inviteEmail.value = "";
    await fetchMembers();
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail 
      ? JSON.stringify(err.response.data.detail) 
      : "Помилка при генерації токена запрошення.";
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(generatedInviteLink.value);
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Команда та права доступу</h1>
        <p class="text-xs text-[#78716C] mt-1">Керування учасниками простору, розподіл ролей та запрошення колег</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-8 bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
              <th class="py-3 px-4">Спеціаліст</th>
              <th class="py-3 px-4">Email</th>
              <th class="py-3 px-4">Роль у просторі</th>
              <th class="py-3 px-4">Статус</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E7E5E4]">
            <tr v-for="m in members" :key="m.id" class="hover:bg-[#FAF8F5]/80">
              <td class="py-3 px-4 font-bold text-[#1e293b]">
                {{ m.user?.first_name || m.first_name || "Користувач" }} {{ m.user?.last_name || m.last_name || "" }}
              </td>
              <td class="py-3 px-4 text-[#78716C]">{{ m.user?.email || m.email }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
                  {{ m.role_name || m.role }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-[#059669]">Активний</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="lg:col-span-4 bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-[#1e293b]">Запросити інженера в команду</h3>

        <div v-if="errorMsg" class="p-2.5 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded-lg text-xs font-mono">
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Корпоративний Email *:</label>
          <input
            v-model="inviteEmail"
            type="email"
            required
            placeholder="engineer@novatech.com"
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Рівень прав (Роль):</label>
          <select v-model="inviteRole" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs">
            <option value="Member">Member (Співробітник)</option>
            <option value="Manager">Manager (Керівник)</option>
            <option value="Admin">Admin (Адміністратор)</option>
          </select>
        </div>

        <button
          @click="generateInvite"
          class="w-full py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          Згенерувати інвайт-посилання
        </button>

        <div v-if="generatedInviteLink" class="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl space-y-2">
          <span class="text-[10px] text-[#78716C] font-bold block">Посилання для запрошення:</span>
          <input :value="generatedInviteLink" readonly class="w-full px-2 py-1 bg-white border border-[#E7E5E4] rounded text-[11px] font-mono select-all" />
          <button @click="copyLink" class="w-full py-1 bg-[#1e293b] text-white rounded text-[11px] font-bold cursor-pointer">
            {{ copySuccess ? "Скопійовано ✓" : "Копіювати посилання" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>