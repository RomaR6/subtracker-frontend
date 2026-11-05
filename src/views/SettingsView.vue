<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { IconArrowRight, IconCheck, IconTag, IconBrandTelegram } from "@tabler/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";

const wsStore = useWorkspaceStore();
const authStore = useAuthStore();

const webhookUrl = ref("");
const webhookFeedback = ref("");
const isSavingWebhook = ref(false);
const isSendingDiscord = ref(false);

const telegramChatId = ref(localStorage.getItem("subtracker_tg_chat_id") || "1344321904");
const tgFeedback = ref("");
const isSendingTelegram = ref(false);
const isAutoAlertsEnabled = ref(localStorage.getItem("subtracker_tg_enabled") !== "false");

const newCategoryName = ref("");
const categories = ref<any[]>([]);

const currentWsId = computed(() => wsStore.currentWorkspace?.id || 1);
const currentWsName = computed(() => wsStore.currentWorkspace?.name || "Поточний простір");

const fetchSettings = async () => {
  webhookFeedback.value = "";
  tgFeedback.value = "";
  try {
    const res = await api.get(`/workspaces/${currentWsId.value}/webhooks`);
    webhookUrl.value = res.data?.webhook_url || "";

    const catRes = await api.get("/subscriptions/categories");
    categories.value = catRes.data;
  } catch (err) {
    console.error("Помилка завантаження налаштувань простору:", err);
  }
};

watch(
  () => wsStore.currentWorkspace?.id,
  () => {
    fetchSettings();
  }
);

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchSettings();
});

const saveWebhook = async () => {
  if (!authStore.isAdminOrManager) return;
  if (!webhookUrl.value.trim()) return;
  isSavingWebhook.value = true;
  webhookFeedback.value = "";

  try {
    await api.post(`/workspaces/${currentWsId.value}/webhooks`, {
      webhook_url: webhookUrl.value.trim(),
      channel_name: "Slack / Discord Corporate"
    });
    webhookFeedback.value = "Webhook успішно збережено для цього простору!";
    setTimeout(() => { webhookFeedback.value = ""; }, 3000);
  } catch (err: any) {
    webhookFeedback.value = err.response?.data?.detail || "Помилка при збереженні вебхука.";
  } finally {
    isSavingWebhook.value = false;
  }
};

const sendDiscordReminders = async () => {
  if (!authStore.isAdminOrManager) return;
  if (!webhookUrl.value.trim()) {
    webhookFeedback.value = "Спочатку вкажіть та збережіть Webhook URL.";
    return;
  }

  isSendingDiscord.value = true;
  webhookFeedback.value = "";

  try {
    const res = await api.post(`/workspaces/${currentWsId.value}/webhooks/send-reminders`);
    webhookFeedback.value = `Успішно надіслано в Discord! Оброблено карток: ${res.data?.sent_discord_count || 0}`;
    setTimeout(() => { webhookFeedback.value = ""; }, 4000);
  } catch (err: any) {
    webhookFeedback.value = err.response?.data?.detail || "Не вдалося надіслати сповіщення у вебхук.";
  } finally {
    isSendingDiscord.value = false;
  }
};

const saveTelegramChatId = () => {
  localStorage.setItem("subtracker_tg_chat_id", telegramChatId.value.trim());
  tgFeedback.value = "Chat ID збережено!";
  setTimeout(() => { tgFeedback.value = ""; }, 2500);
};

const toggleAutoAlerts = () => {
  isAutoAlertsEnabled.value = !isAutoAlertsEnabled.value;
  localStorage.setItem("subtracker_tg_enabled", String(isAutoAlertsEnabled.value));
  tgFeedback.value = isAutoAlertsEnabled.value ? "Автосповіщення активовано" : "Автосповіщення призупинено";
  setTimeout(() => { tgFeedback.value = ""; }, 2500);
};

const sendTelegramReminders = async () => {
  isSendingTelegram.value = true;
  tgFeedback.value = "";

  try {
    const res = await api.post(
      `/workspaces/${currentWsId.value}/telegram/send-reminders?chat_id=${telegramChatId.value.trim()}`
    );
    tgFeedback.value = `Дедлайни простору надіслано в Telegram! Оброблено: ${res.data?.sent_telegram_count || 0}`;
    setTimeout(() => { tgFeedback.value = ""; }, 4000);
  } catch (err: any) {
    tgFeedback.value = err.response?.data?.detail || "Не вдалося відправити нагадування в Telegram.";
  } finally {
    isSendingTelegram.value = false;
  }
};

const addCategory = async () => {
  if (!authStore.isAdminOrManager || !newCategoryName.value.trim()) return;
  try {
    await api.post("/subscriptions/categories", { name: newCategoryName.value.trim() });
    newCategoryName.value = "";
    const catRes = await api.get("/subscriptions/categories");
    categories.value = catRes.data;
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div>
      <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Налаштування робочого простору</h1>
      <p class="text-xs text-[#78716C] mt-1">
        Поточний простір: <span class="font-bold text-[#1e293b]">{{ currentWsName }}</span>. Керування корпоративними вебхуками, каналами сповіщень та класифікатором активів.
      </p>
    </div>

    <div v-if="!authStore.isAdminOrManager" class="bg-[#FEF2F2] border border-[#FECDD3] p-6 rounded-2xl text-xs text-[#881337]">
      <p class="font-bold text-sm mb-1">Режим обмеженого доступу</p>
      <p>Зміна системних параметрів доступна лише адміністраторам простору.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 class="font-bold text-sm text-[#1e293b]">Корпоративні Webhooks (Slack / Discord)</h3>
          <p class="text-xs text-[#78716C] mt-0.5">Канал сповіщень виключно для простору «{{ currentWsName }}»</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Webhook URL:</label>
          <input
            v-model="webhookUrl"
            placeholder="https://discord.com/api/webhooks/..."
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs font-mono"
          />
        </div>

        <div v-if="webhookFeedback" class="p-2.5 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
          {{ webhookFeedback }}
        </div>

        <div class="flex gap-2 pt-2">
          <button
            @click="saveWebhook"
            :disabled="isSavingWebhook || !webhookUrl.trim()"
            class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs disabled:opacity-50"
          >
            {{ isSavingWebhook ? "Збереження..." : "Зберегти конфігурацію" }}
          </button>
          <button
            @click="sendDiscordReminders"
            :disabled="isSendingDiscord || !webhookUrl.trim()"
            class="px-4 py-2 bg-[#FAF8F5] border border-[#E7E5E4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold cursor-pointer transition disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <span>{{ isSendingDiscord ? "Надсилання..." : "Надіслати дедлайни простору в Discord" }}</span>
            <IconArrowRight v-if="!isSendingDiscord" class="w-3.5 h-3.5" :stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-[#1e293b]">Telegram-сповіщення (Bot Alerts)</h3>
            <p class="text-xs text-[#78716C] mt-0.5">Контроль оплат для простору «{{ currentWsName }}»</p>
          </div>
          <button
            @click="toggleAutoAlerts"
            :class="isAutoAlertsEnabled ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'"
            class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer inline-flex items-center gap-1"
          >
            <span>{{ isAutoAlertsEnabled ? "Активно" : "Призупинено" }}</span>
            <IconCheck v-if="isAutoAlertsEnabled" class="w-3 h-3" :stroke-width="2.5" />
          </button>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#44403C] mb-1">Telegram Chat ID отримувача:</label>
          <div class="flex gap-2">
            <input
              v-model="telegramChatId"
              placeholder="1344321904"
              class="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs font-mono"
            />
            <button
              @click="saveTelegramChatId"
              class="px-4 py-2 bg-[#FAF8F5] border border-[#E7E5E4] hover:bg-[#E7E5E4] text-[#1e293b] rounded-lg text-xs font-bold cursor-pointer transition"
            >
              Зберегти
            </button>
          </div>
          <span class="text-[10px] text-[#78716C] mt-1.5 block">
            Офіційний бот: <strong class="text-[#881337]">@subtracker_b2b_bot</strong>.
          </span>
        </div>

        <div v-if="tgFeedback" class="p-2.5 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#881337] border border-[#FECDD3]">
          {{ tgFeedback }}
        </div>

        <div class="pt-2 border-t border-[#E7E5E4]">
          <button
            @click="sendTelegramReminders"
            :disabled="isSendingTelegram"
            class="w-full py-2.5 px-4 bg-[#881337] hover:bg-[#9F1239] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <IconBrandTelegram class="w-4 h-4" :stroke-width="2" />
            <span>{{ isSendingTelegram ? "Аналіз дедлайнів..." : "Надіслати дедлайни цього простору в Telegram" }}</span>
            <IconArrowRight v-if="!isSendingTelegram" class="w-3.5 h-3.5" :stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="bg-white border border-[#E7E5E4] p-6 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
        <h3 class="font-bold text-sm text-[#1e293b]">Категорії цифрових активів</h3>
        <p class="text-xs text-[#78716C]">Керування довідником категорій підписок для аналітики та звітів.</p>

        <div class="flex gap-2 max-w-md">
          <input
            v-model="newCategoryName"
            placeholder="Нова категорія (напр. Security)"
            class="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
            @keyup.enter="addCategory"
          />
          <button
            @click="addCategory"
            :disabled="!newCategoryName.trim()"
            class="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg text-xs font-bold cursor-pointer transition disabled:opacity-50"
          >
            Додати
          </button>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="cat in categories"
            :key="cat.id"
            class="px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#44403C] inline-flex items-center gap-1.5"
          >
            <IconTag class="w-3.5 h-3.5 text-[#881337]" :stroke-width="2" />
            <span>{{ cat.name }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>