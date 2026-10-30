<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { verifyTotpToken } from "../utils/totp";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("roman@novatech.com");
const password = ref("admin");
const showPassword = ref(false);

const show2FaModal = ref(false);
const totpCode = ref("");
const totpError = ref("");
const isVerifying = ref(false);

const showForgotModal = ref(false);
const forgotEmail = ref("");
const forgotSent = ref(false);
const isSendingReset = ref(false);
const forgotError = ref("");

const handleLogin = async () => {
  authStore.errorMessage = "";
  const is2FaEnabled = localStorage.getItem(`subtracker_2fa_${email.value.trim()}_enabled`) === "true";

  if (is2FaEnabled) {
    authStore.isLoading = true;
    const ok = await authStore.login(email.value, password.value);
    authStore.isLoading = false;
    if (ok) {
      show2FaModal.value = true;
      totpCode.value = "";
      totpError.value = "";
    }
    return;
  }

  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push("/app/dashboard");
  }
};

const handle2FaVerify = async () => {
  totpError.value = "";
  if (!/^\d{6}$/.test(totpCode.value.trim())) {
    totpError.value = "Введіть 6-значний числовий код із додатка";
    return;
  }

  isVerifying.value = true;
  try {
    const secret = localStorage.getItem(`subtracker_2fa_${email.value.trim()}_secret`) || "JBSWY3DPEHPK3PXP";
    const isValid = await verifyTotpToken(secret, totpCode.value);

    if (!isValid) {
      totpError.value = "Невірний або прострочений код TOTP. Спробуйте ще раз.";
      return;
    }

    show2FaModal.value = false;
    router.push("/app/dashboard");
  } finally {
    isVerifying.value = false;
  }
};

const openForgotModal = () => {
  forgotEmail.value = email.value;
  forgotSent.value = false;
  forgotError.value = "";
  showForgotModal.value = true;
};

const handlePasswordReset = async () => {
  if (!forgotEmail.value.trim()) return;
  isSendingReset.value = true;
  forgotError.value = "";
  try {
    await api.post("/auth/forgot-password", {
      email: forgotEmail.value.trim()
    });
    forgotSent.value = true;
  } catch (err: any) {
    forgotError.value = err.response?.data?.detail || "Помилка при запиті відновлення.";
  } finally {
    isSendingReset.value = false;
  }
};

const quickFill = (userEmail: string) => {
  email.value = userEmail;
  password.value = "admin";
};
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-sm">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-[#881337] text-white rounded-xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
          S
        </div>
        <h1 class="text-2xl font-black text-[#1e293b]">Вхід до SubTracker B2B</h1>
        <p class="text-xs text-[#78716C] mt-1">Система оптимізації IT-витрат та обліку підписок</p>
      </div>

      <div v-if="authStore.errorMessage" class="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs font-medium text-[#DC2626]">
        {{ authStore.errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Корпоративний Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="name@company.com"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:border-[#881337] transition"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-bold text-[#44403C]">Пароль</label>
            <button
              type="button"
              @click="openForgotModal"
              class="text-[11px] text-[#881337] hover:underline cursor-pointer font-semibold"
            >
              Забули пароль?
            </button>
          </div>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:border-[#881337] transition"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1e293b] p-1 cursor-pointer transition select-none"
              :title="showPassword ? 'Приховати пароль' : 'Показати пароль'"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-[#881337] hover:bg-[#9F1239] text-white py-2.5 rounded-lg text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span v-if="!authStore.isLoading">Увійти в робочий простір</span>
          <span v-else>Перевірка даних...</span>
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-[#E7E5E4] text-left">
        <p class="text-[10px] font-bold text-[#78716C] uppercase tracking-wider mb-2">Швидкий демо-вхід:</p>
        <div class="flex flex-wrap gap-2 text-[11px]">
          <button @click="quickFill('roman@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C] cursor-pointer">
            Суперадмін (Роман)
          </button>
          <button @click="quickFill('kravchenko@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C] cursor-pointer">
            Менеджер (Кравченко)
          </button>
          <button @click="quickFill('kovalchuk@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C] cursor-pointer">
            Дизайнер (Ковальчук)
          </button>
        </div>
      </div>

      <p class="text-xs text-[#78716C] mt-6 text-center">
        Немає акаунту?
        <router-link to="/register" class="text-[#881337] font-bold hover:underline">
          Зареєструвати компанію
        </router-link>
      </p>
    </div>

    <!-- Модалка Забули пароль -->
    <div v-if="showForgotModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl p-6 max-w-sm w-full shadow-xl text-left">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-base text-[#1e293b]">Відновлення пароля</h3>
          <button @click="showForgotModal = false" class="text-[#78716C] hover:text-[#1e293b] text-sm p-1 cursor-pointer">✕</button>
        </div>

        <div v-if="!forgotSent" class="space-y-3.5 text-xs">
          <p class="text-[#78716C]">
            Вкажіть пошту облікового запису. Сервіс надішле лінк для відновлення доступу (діє 10 хвилин).
          </p>

          <div v-if="forgotError" class="p-2.5 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded-lg">
            {{ forgotError }}
          </div>

          <div>
            <label class="block font-bold text-[#44403C] mb-1">Email облікового запису</label>
            <input
              v-model="forgotEmail"
              type="email"
              required
              placeholder="name@company.com"
              class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showForgotModal = false"
              class="flex-1 py-2 bg-[#F5F5F4] text-[#44403C] font-bold rounded-lg cursor-pointer hover:bg-[#E7E5E4]"
            >
              Скасувати
            </button>
            <button
              type="button"
              @click="handlePasswordReset"
              :disabled="isSendingReset || !forgotEmail"
              class="flex-1 py-2 bg-[#881337] text-white font-bold rounded-lg cursor-pointer hover:bg-[#9F1239] disabled:opacity-50"
            >
              {{ isSendingReset ? "Надсилання..." : "Надіслати лінк" }}
            </button>
          </div>
        </div>

        <div v-else class="space-y-3.5 text-xs text-center py-2">
          <div class="w-10 h-10 bg-[#ECFDF5] text-[#059669] rounded-full flex items-center justify-center mx-auto text-lg font-black border border-[#A7F3D0]">
            ✓
          </div>
          <p class="font-bold text-sm text-[#1e293b]">Запит успішно оброблено!</p>
          <p class="text-[#78716C]">
            Інструкцію зі скидання пароля надіслано на <strong>{{ forgotEmail }}</strong>.
          </p>
          <button
            type="button"
            @click="showForgotModal = false"
            class="w-full py-2 bg-[#1e293b] text-white font-bold rounded-lg cursor-pointer hover:bg-[#334155]"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка 2FA з підтримкою Enter -->
    <div v-if="show2FaModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
        <h3 class="font-bold text-lg text-[#1e293b]">Двоетапна авторизація 2FA</h3>
        <p class="text-xs text-[#78716C] mt-1 mb-4">Введіть 6-значний код із вашого додатка Google Authenticator</p>
        
        <form @submit.prevent="handle2FaVerify">
          <input
            v-model="totpCode"
            maxlength="6"
            type="text"
            autofocus
            placeholder="123456"
            @keydown.enter.prevent="handle2FaVerify"
            class="w-full text-center tracking-[0.4em] font-mono font-black text-xl py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg mb-2 focus:outline-none focus:border-[#881337]"
          />
          <p v-if="totpError" class="text-xs text-[#DC2626] font-bold mb-3">{{ totpError }}</p>

          <div class="flex gap-2 mt-4">
            <button
              type="button"
              @click="show2FaModal = false"
              class="flex-1 py-2 bg-[#F5F5F4] text-xs font-bold rounded-lg hover:bg-[#E7E5E4] cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              :disabled="isVerifying || totpCode.length !== 6"
              class="flex-1 py-2 bg-[#881337] text-white text-xs font-bold rounded-lg hover:bg-[#9F1239] cursor-pointer disabled:opacity-50"
            >
              {{ isVerifying ? "Перевірка..." : "Підтвердити" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>