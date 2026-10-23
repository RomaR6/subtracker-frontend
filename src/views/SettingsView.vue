<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";

const wsStore = useWorkspaceStore();

const webhookUrl = ref("");
const statusFeedback = ref("");
const isTestingWebhook = ref(false);
const newCategoryName = ref("");
const categories = ref<any[]>([]);

const fetchSettings = async () => {
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get(`/workspaces/${wsId}/webhooks`);
    if (res.data?.webhook_url) {
      webhookUrl.value = res.data.webhook_url;
    }
    const catRes = await api.get("/subscriptions/categories");
    categories.value = catRes.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchSettings();
});

const saveWebhook = async () => {
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    await api.post(`/workspaces/${wsId}/webhooks`, { webhook_url: webhookUrl.value });
    statusFeedback.value = "Webhook успішно збережено!";
    setTimeout(() => { statusFeedback.value = ""; }, 2000);
  } catch (err) {
    statusFeedback.value = "Помилка при збереженні.";
  }
};

const testWebhook = async () => {
  isTestingWebhook.value = true;
  statusFeedback.value = "";
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    await api.post(`/workspaces/${wsId}/webhooks/test`);
    statusFeedback.value = "Тестове сповіщення відправлено на вебхук ✓";
  } catch (err) {
    statusFeedback.value = "Не вдалося доставити тестове сповіщення.";
  } finally {
    isTestingWebhook.value = false;
  }
};

const addCategory = async () => {
  if (!newCategoryName.value.trim()) return;
  try {
    await api.post("/subscriptions/categories", { name: newCategoryName.value.trim() });
    newCategoryName.value = "";
    const catRes = await api.get("/subscriptions/categories");
    categories.value = catRes.data;
  } catch (err) {
    console.error(err);
  }
};

const selectCategoryChip = (catName: string) => {
  newCategoryName.value = catName;
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div>
      <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Налаштування робочого простору</h1>
      <p class="text-xs text-[#78716C] mt-1">Інтеграції вихідних вебхуків, підключення Telegram-сповіщень та довідники категорій</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-[#1e293b]">Вихідні сповіщення (Webhooks Slack / Discord)</h3>
        <p class="text-xs text-[#78716C]">
          Вкажіть URL вхідного вебхука вашого корпоративного каналу для надсилання сповіщень про наближення оплат та нові заявки.
        </p>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Webhook URL:</label>
          <input
            v-model="webhookUrl"
            placeholder="https://hooks.slack.com/services/..."
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs font-mono"
          />
        </div>

        <div v-if="statusFeedback" class="p-2.5 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
          {{ statusFeedback }}
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="testWebhook" :disabled="isTestingWebhook" class="px-4 py-2 bg-[#FAF8F5] border border-[#E7E5E4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold cursor-pointer">
            {{ isTestingWebhook ? "Відправка..." : "Тестувати Webhook" }}
          </button>
          <button @click="saveWebhook" class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold cursor-pointer">
            Зберегти конфігурацію
          </button>
        </div>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-[#1e293b]">Категорії цифрових активів</h3>
        <p class="text-xs text-[#78716C]">
          Клікайте на чіпси нижче для швидкого редагування або вводьте власні назви для каталогу.
        </p>

        <div class="flex gap-2">
          <input
            v-model="newCategoryName"
            placeholder="Нова категорія (напр. Analytics)"
            class="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
          />
          <button @click="addCategory" class="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg text-xs font-bold cursor-pointer">
            Додати
          </button>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategoryChip(cat.name)"
            class="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F5F4] active:bg-[#E7E5E4] border border-[#E7E5E4] hover:border-[#881337] rounded-xl text-xs font-semibold text-[#44403C] cursor-pointer transition shadow-2xs"
            title="Натисніть для вибору"
          >
            🏷 {{ cat.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>