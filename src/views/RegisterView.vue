<script setup lang="ts">
import subtrackLogo from "../assets/subtrack_logo.jpg";
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  workspace_name: "Моя IT-Команда"
});


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


const handleRegister = async () => {
  const ok = await authStore.register(form.value);
  if (ok) {
    router.push("/app/dashboard");
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-sm text-left">
      <div class="text-center mb-6">
        <div class="w-14 h-14 rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden shadow-sm flex items-center justify-center p-1 mx-auto mb-3">
          <img :src="subtrackLogo" alt="SubTracker" class="w-full h-full object-contain scale-110 -translate-x-0.5 translate-y-0.5" />
        </div>
        <h1 class="text-2xl font-black text-[#1e293b]">Реєстрація простору</h1>
        <p class="text-xs text-[#78716C] mt-1">Створіть робочий простір для керування ліцензіями</p>
      </div>

      <div v-if="authStore.errorMessage" class="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs font-medium text-[#DC2626]">
        {{ authStore.errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-3.5">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#44403C] mb-1">Ім'я</label>
            <input v-model="form.first_name" type="text" required placeholder="Олександр" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#44403C] mb-1">Прізвище</label>
            <input v-model="form.last_name" type="text" required placeholder="Кравченко" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Корпоративний Email</label>
          <input v-model="form.email" type="email" required placeholder="alex@company.com" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Пароль (мін. 4 символи)</label>
          <input v-model="form.password" type="password" required minlength="4" placeholder="••••••••" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm" />
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Назва вашої компанії або команди</label>
          <input v-model="form.workspace_name" type="text" required placeholder="NovaTech R&D Team" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm" />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full mt-4 bg-[#881337] hover:bg-[#9F1239] text-white py-2.5 rounded-lg text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span v-if="!authStore.isLoading">Створити простір та розпочати</span>
          <span v-else>Створення акаунту...</span>
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

      <p class="text-xs text-[#78716C] mt-6 text-center">
        Вже маєте акаунт?
        <router-link to="/login" class="text-[#881337] font-bold hover:underline">
          Увійти
        </router-link>
      </p>
    </div>
  </div>
</template>