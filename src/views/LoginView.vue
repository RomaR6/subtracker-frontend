<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("roman@novatech.com");
const password = ref("admin");
const show2FaModal = ref(false);
const totpCode = ref("");
const totpError = ref("");

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push("/dashboard");
  }
};

const handle2FaVerify = () => {
  if (totpCode.value.length === 6 && /^\d+$/.test(totpCode.value)) {
    show2FaModal.value = false;
    router.push("/dashboard");
  } else {
    totpError.value = "Введіть коректний 6-значний числовий код";
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
            <span class="text-[11px] text-[#881337] hover:underline cursor-pointer">Забули пароль?</span>
          </div>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:border-[#881337] transition"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-[#881337] hover:bg-[#9F1239] text-white py-2.5 rounded-lg text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span v-if="!authStore.isLoading">Увійти в робочий простір</span>
          <span v-else>Перевірка сесії...</span>
        </button>

        <button
          type="button"
          @click="show2FaModal = true"
          class="w-full bg-white hover:bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4] py-2 rounded-lg text-xs font-semibold transition"
        >
          🔐 Вхід із двоетапною перевіркою 2FA
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-[#E7E5E4] text-left">
        <p class="text-[10px] font-bold text-[#78716C] uppercase tracking-wider mb-2">Швидкий демо-вхід:</p>
        <div class="flex flex-wrap gap-2 text-[11px]">
          <button @click="quickFill('roman@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C]">
            👑 Суперадмін (Роман)
          </button>
          <button @click="quickFill('kravchenko@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C]">
            🛠 Менеджер (Кравченко)
          </button>
          <button @click="quickFill('kovalchuk@novatech.com')" class="px-2 py-1 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded font-medium text-[#44403C]">
            🎨 Дизайнер (Ковальчук)
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

    <div v-if="show2FaModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
        <h3 class="font-bold text-lg text-[#1e293b]">Двоетапна авторизація 2FA</h3>
        <p class="text-xs text-[#78716C] mt-1 mb-4">Введіть 6-значний код з вашого додатку Google Authenticator</p>
        
        <input
          v-model="totpCode"
          maxlength="6"
          type="text"
          placeholder="482910"
          class="w-full text-center tracking-[0.5em] font-mono font-black text-xl py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg mb-2"
        />
        <p v-if="totpError" class="text-xs text-[#DC2626] mb-3">{{ totpError }}</p>

        <div class="flex gap-2 mt-4">
          <button @click="show2FaModal = false" class="flex-1 py-2 bg-[#F5F5F4] text-xs font-bold rounded-lg hover:bg-[#E7E5E4]">
            Скасувати
          </button>
          <button @click="handle2FaVerify" class="flex-1 py-2 bg-[#881337] text-white text-xs font-bold rounded-lg hover:bg-[#9F1239]">
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  </div>
</template>