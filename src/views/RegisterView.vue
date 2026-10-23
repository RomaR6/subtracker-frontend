<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
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

const handleRegister = async () => {
  const ok = await authStore.register(form.value);
  if (ok) {
    router.push("/dashboard");
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