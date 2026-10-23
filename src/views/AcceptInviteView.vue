<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = ref("");
const statusMsg = ref("Перевірка запрошення...");
const isSuccess = ref(false);

onMounted(async () => {
  const tokenQuery = route.query.token as string;
  if (!tokenQuery) {
    statusMsg.value = "Помилка: цифровий токен запрошення відсутній у посиланні.";
    return;
  }
  token.value = tokenQuery;

  if (!authStore.isAuthenticated) {
    statusMsg.value = "Будь ласка, увійдіть у свій акаунт, щоб прийняти запрошення.";
    setTimeout(() => {
      router.push(`/login?redirect=/accept-invite?token=${tokenQuery}`);
    }, 2000);
    return;
  }

  try {
    await api.post("/workspaces/accept-invite", { invite_token: tokenQuery });
    isSuccess.value = true;
    statusMsg.value = "Вітаємо! Ви успішно приєдналися до команди робочого простору.";
    setTimeout(() => router.push("/dashboard"), 1500);
  } catch (err: any) {
    statusMsg.value = err.response?.data?.detail || "Недійсний або прострочений цифровий токен.";
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
    <div class="bg-white border border-[#E7E5E4] rounded-2xl p-8 max-w-md w-full shadow-sm text-center">
      <div class="w-12 h-12 bg-[#FEF3C7] text-[#92400E] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
        ✉️
      </div>
      <h2 class="text-xl font-bold text-[#1e293b] mb-2">Запрошення до команди</h2>
      <p class="text-sm text-[#78716C] mb-6">{{ statusMsg }}</p>

      <button
        v-if="isSuccess"
        @click="router.push('/dashboard')"
        class="bg-[#881337] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#9F1239] transition"
      >
        Перейти до робочого простору
      </button>
      <button
        v-else
        @click="router.push('/login')"
        class="bg-[#F5F5F4] text-[#44403C] px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#E7E5E4] transition"
      >
        На головну
      </button>
    </div>
  </div>
</template>