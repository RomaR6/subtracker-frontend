<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

const route = useRoute();
const router = useRouter();

const token = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const statusMsg = ref("");
const isError = ref(false);
const isSuccess = ref(false);

onMounted(() => {
  token.value = (route.query.token as string) || "";
  if (!token.value) {
    isError.value = true;
    statusMsg.value = "Токен відновлення пароля відсутній або посилання пошкоджено.";
  }
});

const handleReset = async () => {
  statusMsg.value = "";
  isError.value = false;

  if (newPassword.value.length < 4) {
    isError.value = true;
    statusMsg.value = "Пароль має містити щонайменше 4 символи.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    isError.value = true;
    statusMsg.value = "Введені паролі не співпадають.";
    return;
  }

  isLoading.value = true;
  try {
    await api.post("/auth/reset-password", {
      token: token.value,
      new_password: newPassword.value
    });
    isSuccess.value = true;
    statusMsg.value = "Пароль успішно змінено! Перенаправляємо на сторінку входу...";
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err: any) {
    isError.value = true;
    statusMsg.value = err.response?.data?.detail || "Недійсний токен або термін його дії (15 хв) вичерпано.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-sm text-left">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-[#881337] text-white rounded-xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
          S
        </div>
        <h1 class="text-2xl font-black text-[#1e293b]">Встановлення нового пароля</h1>
        <p class="text-xs text-[#78716C] mt-1">Введіть новий пароль для доступу до облікового запису</p>
      </div>

      <div v-if="statusMsg" class="mb-4 p-3 rounded-lg text-xs font-semibold" :class="isError ? 'bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626]' : 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]'">
        {{ statusMsg }}
      </div>

      <form v-if="!isSuccess && token" @submit.prevent="handleReset" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-[#44403C] mb-1">Новий пароль</label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:border-[#881337] transition"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1e293b] p-1 cursor-pointer"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">Повторіть новий пароль</label>
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:border-[#881337] transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-[#881337] hover:bg-[#9F1239] text-white py-2.5 rounded-lg text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {{ isLoading ? "Збереження..." : "Зберегти новий пароль" }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-xs text-[#881337] font-bold hover:underline">
          ← Повернутися до входу
        </router-link>
      </div>
    </div>
  </div>
</template>