<script setup lang="ts">
import { ref } from "vue";
import api from "../../api/axios";

const props = defineProps<{
  items: Array<{
    id: number;
    name: string;
    category: string;
    domain?: string;
    logo_url: string;
    cost_usd: number;
    cost_uah: number;
    next_billing_date: string;
    days_left: number;
  }>;
  currency: "UAH" | "USD";
}>();

const sendingId = ref<number | null>(null);
const sentStatus = ref<Record<number, string>>({});

const sendTelegramAlert = async (subscriptionId: number) => {
  sendingId.value = subscriptionId;
  try {
    await api.post("/notifications/telegram/send-reminder", {
      chat_id: "demo_coursework_channel",
      subscription_id: subscriptionId
    });
    sentStatus.value[subscriptionId] = "Надіслано в TG ✓";
  } catch (err) {
    sentStatus.value[subscriptionId] = "Помилка відправки";
  } finally {
    sendingId.value = null;
  }
};
</script>

<template>
  <div class="space-y-2.5">
    <div
      v-for="sub in items"
      :key="sub.id"
      class="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] hover:border-[#D6D3D1] transition"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-white border border-[#E7E5E4] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          <img
            v-if="sub.logo_url"
            :src="sub.logo_url"
            :alt="sub.name"
            class="w-6 h-6 object-contain"
            @error="($event.target as HTMLElement).style.display = 'none'"
          />
          <span v-else class="font-bold text-xs text-[#881337]">{{ sub.name.substring(0, 2).toUpperCase() }}</span>
        </div>

        <div class="text-left">
          <p class="font-bold text-xs text-[#1e293b] leading-snug">{{ sub.name }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-[#78716C]">{{ sub.category }}</span>
            <span class="text-[10px] text-[#A8A29E]">•</span>
            <span
              :class="sub.days_left <= 3 ? 'text-[#DC2626] font-bold' : 'text-[#D97706] font-semibold'"
              class="text-[10px]"
            >
              {{ sub.days_left === 0 ? "Сьогодні" : `Через ${sub.days_left} дн.` }}
            </span>
          </div>
        </div>
      </div>

      <div class="text-right flex flex-col items-end gap-1">
        <span class="font-black text-xs text-[#1e293b]">
          {{ currency === "UAH" ? `₴${sub.cost_uah.toLocaleString('uk-UA')}` : `$${sub.cost_usd.toFixed(2)}` }}
        </span>

        <button
          v-if="!sentStatus[sub.id]"
          @click="sendTelegramAlert(sub.id)"
          :disabled="sendingId === sub.id"
          class="text-[10px] text-[#881337] hover:underline font-semibold cursor-pointer disabled:opacity-50"
        >
          {{ sendingId === sub.id ? "Відправка..." : "Нагадати в TG" }}
        </button>
        <span v-else class="text-[10px] font-bold text-[#059669]">
          {{ sentStatus[sub.id] }}
        </span>
      </div>
    </div>

    <div v-if="!items || items.length === 0" class="py-8 text-center text-xs text-[#78716C]">
      Немає планових списань на найближчі 14 днів.
    </div>
  </div>
</template>