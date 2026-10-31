<script setup lang="ts">
import subtrackLogo from "../assets/subtrack_logo.jpg";
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


declare const google: any;

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const handleGoogleAuth = () => {
  authStore.errorMessage = "";

  if (typeof google === "undefined" || !google.accounts) {
    authStore.errorMessage = "Сервіс Google ще завантажується. Спробуйте через 2 секунди.";
    return;
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: "121294238610-s3jjh8si07a1nd922knms218mn3hamgm.apps.googleusercontent.com",
    scope: "email profile openid",
    callback: async (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        authStore.isLoading = true;
        try {
          // Отримуємо реальні дані обраного Google-профілю
          const gProfileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          const gUser = await gProfileRes.json();

          const res = await api.post("/auth/google", {
            email: gUser.email,
            first_name: gUser.given_name || gUser.name || "Google",
            last_name: gUser.family_name || "Користувач",
            company_name: "Мій IT-Простір"
          });

          if (res.data?.access_token) {
            localStorage.setItem("subtracker_token", res.data.access_token);
            localStorage.setItem("token", res.data.access_token);
            if (res.data.user) {
              localStorage.setItem("subtracker_user", JSON.stringify(res.data.user));
              localStorage.setItem("user", JSON.stringify(res.data.user));
              authStore.user = res.data.user;
            }
            authStore.token = res.data.access_token;
            router.push("/app/dashboard");
          }
        } catch (err: any) {
          authStore.errorMessage = err.response?.data?.detail 
            ? JSON.stringify(err.response.data.detail) 
            : "Не вдалося авторизуватись через Google.";
        } finally {
          authStore.isLoading = false;
        }
      }
    }
  });

  client.requestAccessToken();
};


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
        <div class="w-14 h-14 rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden shadow-sm flex items-center justify-center p-1 mx-auto mb-3">
          <img :src="subtrackLogo" alt="SubTracker" class="w-full h-full object-contain scale-110 -translate-x-0.5 translate-y-0.5" />
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
      
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-[#E7E5E4]"></div>
        </div>
        <div class="relative flex justify-center text-[10px] uppercase">
          <span class="bg-white px-2 text-[#78716C] font-bold">або через SSO</span>
        </div>
      </div>

      <button
        type="button"
        @click="handleGoogleAuth"
        class="w-full py-2.5 px-4 bg-white border border-[#E7E5E4] hover:bg-[#FAF8F5] text-[#1e293b] text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Продовжити з Google Workspace</span>
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