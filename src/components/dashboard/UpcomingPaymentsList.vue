<script setup lang="ts">
import { ref } from "vue";
import api from "../../api/axios";

interface UpcomingItem {
  id: number;
  name: string;
  category: string;
  domain?: string;
  logo_url?: string;
  cost_usd: number;
  cost_uah: number;
  next_billing_date: string;
  days_left: number;
}

const props = defineProps<{
  items: UpcomingItem[];
  currency: "UAH" | "USD";
}>();

const sendingId = ref<number | null>(null);
const successMap = ref<Record<number, boolean>>({});

const sendSingleTelegramAlert = async (item: UpcomingItem) => {
  sendingId.value = item.id;
  try {
    const chatId = localStorage.getItem("subtracker_tg_chat_id") || "1344321904";
    await api.post(`/subscriptions/${item.id}/send-telegram?chat_id=${chatId}`);
    successMap.value[item.id] = true;
    setTimeout(() => {
      successMap.value[item.id] = false;
    }, 3000);
  } catch (err) {
    console.error("Не вдалося надіслати сповіщення в Telegram:", err);
  } finally {
    sendingId.value = null;
  }
};
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="item in props.items"
      :key="item.id"
      class="p-3.5 bg-white border border-[#E7E5E4] hover:border-[#881337]/40 rounded-xl transition flex items-center justify-between gap-3 shadow-2xs"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-center p-1 overflow-hidden shrink-0">
          <img
            v-if="item.logo_url"
            :src="item.logo_url"
            :alt="item.name"
            class="w-full h-full object-contain"
            @error="($event.target as HTMLElement).style.display = 'none'"
          />
          <span v-else class="text-[10px] font-black text-[#881337]">{{ item.name.substring(0, 2).toUpperCase() }}</span>
        </div>
        <div class="text-left truncate">
          <h4 class="font-bold text-xs text-[#1e293b] truncate">{{ item.name }}</h4>
          <div class="flex items-center gap-1.5 text-[10px] text-[#78716C] mt-0.5">
            <span>{{ item.category }}</span>
            <span>•</span>
            <span :class="item.days_left <= 3 ? 'text-[#DC2626] font-bold' : 'text-[#78716C]'">
              {{ item.days_left === 0 ? 'Сьогодні' : (item.days_left < 0 ? 'Прострочено' : `Через ${item.days_left} дн.`) }}
            </span>
          </div>
        </div>
      </div>

      <div class="text-right shrink-0">
        <div class="font-black text-xs text-[#1e293b]">
          <span v-if="props.currency === 'UAH'">₴{{ Math.round(item.cost_uah).toLocaleString('uk-UA') }}</span>
          <span v-else>${{ item.cost_usd.toFixed(2) }}</span>
        </div>
        <button
          @click="sendSingleTelegramAlert(item)"
          :disabled="sendingId === item.id"
          class="text-[10px] font-bold text-[#881337] hover:text-[#9F1239] transition mt-0.5 flex items-center gap-1 ml-auto cursor-pointer disabled:opacity-50"
        >
          <span v-if="sendingId === item.id" class="animate-spin text-xs">🔄</span>
          <span v-else-if="successMap[item.id]" class="text-[#059669]">Надіслано ✓</span>
          <span v-else>Нагадати в TG ➔</span>
        </button>
      </div>
    </div>

    <div v-if="props.items.length === 0" class="py-8 text-center text-xs text-[#78716C]">
      Немає запланованих списань на найближчі 14 днів.
    </div>
  </div>
</template>