<script setup lang="ts">
import { useDialogStore } from "../stores/dialog";
import { ref, onMounted, watch } from "vue";
import { IconTrash, IconCheck, IconCopy } from "@tabler/icons-vue";
import { useAuthStore } from "../stores/auth";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";

const dialog = useDialogStore();
const wsStore = useWorkspaceStore();
const authStore = useAuthStore();

const getCachedMembers = () => {
  try {
    const cached = localStorage.getItem("subtracker_team_cache");
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const cachedMembers = getCachedMembers();
const members = ref<any[]>(cachedMembers);
const isLoading = ref(cachedMembers.length === 0);
const inviteEmail = ref("");
const inviteRole = ref("Member");
const generatedInviteLink = ref("");
const copySuccess = ref(false);
const errorMsg = ref("");

const fetchMembers = async () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  try {
    const res = await api.get(`/workspaces/${wsId}/members`);
    if (Array.isArray(res.data)) {
      members.value = res.data;
      localStorage.setItem("subtracker_team_cache", JSON.stringify(res.data));
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

watch(() => wsStore.currentWorkspace?.id, () => {
  fetchMembers();
});

onMounted(() => {
  fetchMembers();
  if (wsStore.workspaces.length === 0) {
    wsStore.fetchWorkspaces();
  }
});

const isCurrentUser = (member: any): boolean => {
  const currentEmail = authStore.user?.email?.toLowerCase();
  const memberEmail = (member.user?.email || member.email || "").toLowerCase();
  if (currentEmail && memberEmail && currentEmail === memberEmail) return true;
  if (authStore.user?.id && member.user?.id && String(authStore.user.id) === String(member.user.id)) return true;
  return false;
};

const isOwner = (member: any): boolean => {
  const ownerId = wsStore.currentWorkspace?.owner_id;
  if (!ownerId) return false;
  return String(ownerId) === String(member.user?.id || member.user_id);
};

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

const handleRoleChange = async (member: any, newRole: string) => {
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    await api.patch(`/workspaces/${wsId}/members/${member.id}`, { role_name: newRole });
    member.role_name = newRole;
    await fetchMembers();
  } catch (err: any) {
    dialog.alert(err.response?.data?.detail || "Не вдалося змінити роль користувача.");
    await fetchMembers();
  }
};

const removeMember = async (member: any) => {
  const confirmed = await dialog.confirm({
    title: "Вилучення співробітника з простору",
    message: `Ви дійсно бажаєте вилучити ${member.user?.first_name || 'користувача'} (${member.user?.email}) з робочого простору? Усі його закріплені підписки автоматично перейдуть на паузу.`,
    confirmText: "Вилучити",
    cancelText: "Скасувати",
    isDanger: true
  });
  if (!confirmed) return;

  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    await api.delete(`/workspaces/${wsId}/members/${member.id}`);
    members.value = members.value.filter(m => m.id !== member.id);
    localStorage.setItem("subtracker_team_cache", JSON.stringify(members.value));
  } catch (err: any) {
    dialog.alert(err.response?.data?.detail || "Помилка при вилученні співробітника.");
  }
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-[#1e293b] tracking-tight">Команда та права доступу</h1>
        <p class="text-xs text-[#78716C] mt-1">Керування учасниками простору, розподіл ролей та запрошення колег</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div :class="authStore.isAdminOrManager ? 'lg:col-span-8' : 'lg:col-span-12'" class="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[340px] sm:min-w-[540px]">
            <thead>
              <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
                <th class="py-3 px-3 sm:px-4">Спеціаліст</th>
                <th class="py-3 px-3 sm:px-4 hidden sm:table-cell">Email</th>
                <th class="py-3 px-3 sm:px-4">Роль у просторі</th>
                <th class="py-3 px-3 sm:px-4 text-center hidden md:table-cell">Статус</th>
                <th v-if="authStore.role === 'Admin'" class="py-3 px-3 sm:px-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E7E5E4]">
              <tr v-for="m in members" :key="m.id" class="hover:bg-[#FAF8F5]/80 transition">
                <td class="py-3 px-3 sm:px-4">
                  <div class="font-bold text-[#1e293b] leading-tight">
                    {{ m.user?.first_name || m.first_name || "Користувач" }} {{ m.user?.last_name || m.last_name || "" }}
                    <span v-if="isCurrentUser(m)" class="ml-1 text-[10px] text-[#881337] font-semibold">(Ви)</span>
                  </div>
                  <div class="text-[11px] text-[#78716C] mt-0.5 break-all sm:hidden">
                    {{ m.user?.email || m.email }}
                  </div>
                </td>
                <td class="py-3 px-3 sm:px-4 text-[#78716C] break-all hidden sm:table-cell">
                  {{ m.user?.email || m.email }}
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span
                    v-if="isOwner(m)"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3] inline-block whitespace-nowrap"
                  >
                    Admin (Власник)
                  </span>

                  <span
                    v-else-if="isCurrentUser(m)"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3] inline-block whitespace-nowrap"
                  >
                    {{ m.role_name || m.role }}
                  </span>

                  <select
                    v-else-if="authStore.role === 'Admin'"
                    :value="m.role_name || m.role"
                    @change="handleRoleChange(m, ($event.target as HTMLSelectElement).value)"
                    class="bg-white border border-[#E7E5E4] hover:border-[#881337] text-[#1e293b] rounded-lg px-2 py-1 font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Member">Member</option>
                  </select>

                  <span
                    v-else
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#44403C] border border-[#E7E5E4] inline-block whitespace-nowrap"
                  >
                    {{ m.role_name || m.role }}
                  </span>
                </td>
                <td class="py-3 px-3 sm:px-4 text-center font-semibold text-[#059669] hidden md:table-cell">
                  Активний
                </td>
                <td v-if="authStore.role === 'Admin'" class="py-3 px-3 sm:px-4 text-right">
                  <button
                    v-if="!isOwner(m) && !isCurrentUser(m)"
                    @click="removeMember(m)"
                    title="Вилучити з команди"
                    class="text-[#78716C] hover:text-[#DC2626] font-semibold text-xs p-1 cursor-pointer transition inline-flex items-center"
                  >
                    <IconTrash class="w-4 h-4" :stroke-width="2" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="authStore.isAdminOrManager" class="lg:col-span-4 bg-white border border-[#E7E5E4] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
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
            <option v-if="authStore.role === 'Admin'" value="Admin">Admin (Адміністратор)</option>
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
          <button @click="copyLink" class="w-full py-1.5 bg-[#1e293b] text-white rounded text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1">
            <IconCheck v-if="copySuccess" class="w-3.5 h-3.5" :stroke-width="2.5" />
            <IconCopy v-else class="w-3.5 h-3.5" :stroke-width="2" />
            <span>{{ copySuccess ? "Скопійовано" : "Копіювати посилання" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>