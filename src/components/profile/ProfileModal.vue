<script setup lang="ts">
import { ref } from "vue";
import api from "../../api/axios";
import { useAuthStore } from "../../stores/auth";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["close"]);
const authStore = useAuthStore();

const step = ref<"info" | "2fa">("info");
const qrSecret = ref("");
const totpCode = ref("");
const statusMsg = ref("");
const isError = ref(false);
const isLoading = ref(false);

const init2FaSetup = async () => {
  isLoading.value = true;
  statusMsg.value = "";
  try {
    const res = await api.post("/auth/2fa/setup");
    qrSecret.value = res.data.secret || "JBSWY3DPEHPK3PXP";
    step.value = "2fa";
  } catch (err: any) {
    statusMsg.value = err.response?.data?.detail || "Не вдалося отримати ключ 2FA.";
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const verify2Fa = async () => {
  isLoading.value = true;
  statusMsg.value = "";
  try {
    await api.post("/auth/2fa/verify", { code: totpCode.value });
    isError.value = false;
    statusMsg.value = "Двоетапну перевірку успішно підтверджено та активовано!";
    setTimeout(() => {
      step.value = "info";
      statusMsg.value = "";
    }, 1500);
  } catch (err: any) {
    isError.value = true;
    statusMsg.value = err.response?.data?.detail || "Невірний код перевірки TOTP.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
      <div class="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
        <h3 class="font-bold text-base text-[#1e293b]">Особистий профіль та безпека</h3>
        <button @click="emit('close')" class="text-[#78716C] hover:text-[#1e293b] text-sm p-1 cursor-pointer">✕</button>
      </div>

      <div v-if="step === 'info'" class="mt-4 space-y-4 text-xs">
        <div class="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
          <div class="w-12 h-12 rounded-full bg-[#881337] text-white flex items-center justify-center font-black text-base shadow-xs">
            {{ authStore.user?.first_name ? authStore.user.first_name[0] : "R" }}
          </div>
          <div>
            <p class="font-black text-sm text-[#1e293b]">{{ authStore.userFullName }}</p>
            <p class="text-[#78716C]">{{ authStore.user?.email }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
              Роль: {{ authStore.role }}
            </span>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <div class="flex justify-between p-2.5 rounded-lg border border-[#E7E5E4]">
            <span class="text-[#78716C]">Статус облікового запису:</span>
            <span class="font-bold text-[#059669]">Активний ✓</span>
          </div>
          <div class="flex justify-between p-2.5 rounded-lg border border-[#E7E5E4]">
            <span class="text-[#78716C]">Права суперадміністратора:</span>
            <span class="font-bold" :class="authStore.isSuperadmin ? 'text-[#7C3AED]' : 'text-[#78716C]'">
              {{ authStore.isSuperadmin ? "Надано" : "Ні" }}
            </span>
          </div>
        </div>

        <div class="pt-2 border-t border-[#E7E5E4] flex flex-col gap-2">
          <button
            @click="init2FaSetup"
            :disabled="isLoading"
            class="w-full py-2.5 bg-white border border-[#E7E5E4] hover:bg-[#FAF8F5] text-[#1e293b] font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔐 Налаштувати 2FA (Google Authenticator)</span>
          </button>
          <button
            @click="authStore.logout"
            class="w-full py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-bold rounded-lg transition cursor-pointer"
          >
            Вийти з акаунту
          </button>
        </div>
      </div>

      <div v-else class="mt-4 space-y-4 text-xs">
        <p class="text-[#78716C]">
          Введіть ключ у додаток Google Authenticator або 1Password для генерації кодів:
        </p>

        <div class="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl text-center">
          <span class="text-[10px] uppercase font-bold text-[#78716C] block">Секретний ключ TOTP:</span>
          <span class="font-mono text-sm font-black text-[#881337] select-all tracking-wider">{{ qrSecret }}</span>
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">6-значний код перевірки:</label>
          <input
            v-model="totpCode"
            maxlength="6"
            placeholder="123456"
            class="w-full text-center tracking-[0.4em] font-mono font-black text-lg py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg"
          />
        </div>

        <div v-if="statusMsg" class="p-2.5 rounded-lg text-xs font-semibold" :class="isError ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#ECFDF5] text-[#059669]'">
          {{ statusMsg }}
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="step = 'info'" class="flex-1 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg font-bold text-[#44403C] cursor-pointer">
            Назад
          </button>
          <button @click="verify2Fa" :disabled="isLoading || totpCode.length !== 6" class="flex-1 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg font-bold transition disabled:opacity-50 cursor-pointer">
            {{ isLoading ? "Перевірка..." : "Підтвердити" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>