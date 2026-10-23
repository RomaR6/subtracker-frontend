<script setup lang="ts">
import { ref, watch } from "vue";
import api from "../../api/axios";

const props = defineProps<{
  show: boolean;
  editItem?: any | null;
  workspaceId: number;
}>();

const emit = defineEmits(["close", "saved"]);

const todayDate = new Date().toISOString().split("T")[0];

const form = ref({
  name: "",
  domain: "",
  category: "DevTools",
  owner_name: "Роман Олексюк",
  billing_period: "monthly",
  currency_code: "USD",
  cost_usd: 50.0,
  next_payment_date: todayDate,
  status: "active",
  description: ""
});

const isSubmitting = ref(false);
const errorMsg = ref("");

watch(
  () => props.editItem,
  (val) => {
    if (val) {
      form.value = {
        name: val.name,
        domain: val.domain || "",
        category: val.category || "DevTools",
        owner_name: val.owner_name || "Роман Олексюк",
        billing_period: val.billing_period || "monthly",
        currency_code: val.currency_code || "USD",
        cost_usd: val.cost_usd,
        next_payment_date: val.next_payment_date,
        status: val.status || "active",
        description: val.description || ""
      };
    } else {
      form.value = {
        name: "",
        domain: "",
        category: "DevTools",
        owner_name: "Роман Олексюк",
        billing_period: "monthly",
        currency_code: "USD",
        cost_usd: 50.0,
        next_payment_date: todayDate,
        status: "active",
        description: ""
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMsg.value = "";
  try {
    if (props.editItem) {
      const updatePayload = {
        name: form.value.name,
        domain: form.value.domain,
        category: form.value.category,
        owner_name: form.value.owner_name,
        billing_period: form.value.billing_period,
        currency_code: form.value.currency_code,
        cost_usd: Number(form.value.cost_usd),
        next_payment_date: form.value.next_payment_date,
        status: form.value.status,
        description: form.value.description
      };
      await api.put(`/subscriptions/item/${props.editItem.id}`, updatePayload);
    } else {
      const createPayload = {
        ...form.value,
        workspace_id: props.workspaceId,
        cost_usd: Number(form.value.cost_usd)
      };
      await api.post("/subscriptions/", createPayload);
    }
    emit("saved");
    emit("close");
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail || "Помилка при збереженні підписки.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left">
      <div class="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
        <h3 class="font-bold text-base text-[#1e293b]">
          {{ editItem ? "Редагування підписки" : "Додати нову підписку" }}
        </h3>
        <button @click="emit('close')" class="text-[#78716C] hover:text-[#1e293b] text-sm p-1">✕</button>
      </div>

      <div v-if="errorMsg" class="mt-3 p-2.5 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded-lg text-xs font-medium">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-3.5 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Назва сервісу *</label>
            <input v-model="form.name" required placeholder="GitHub Enterprise" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs" />
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Домен (для логотипу)</label>
            <input v-model="form.domain" placeholder="github.com" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Категорія</label>
            <select v-model="form.category" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs">
              <option value="DevTools">DevTools (Розробка)</option>
              <option value="Infrastructure">Infrastructure (Хмара)</option>
              <option value="Design">Design (UI/UX)</option>
              <option value="Communication">Communication (Комунікації)</option>
              <option value="Management">Management (Управління)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Відповідальний</label>
            <input v-model="form.owner_name" placeholder="Роман Олексюк" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Вартість (USD) *</label>
            <input v-model.number="form.cost_usd" type="number" step="0.01" min="0.01" required class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs" />
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Період</label>
            <select v-model="form.billing_period" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs">
              <option value="monthly">Щомісячно</option>
              <option value="yearly">Щорічно</option>
              <option value="quarterly">Щоквартально</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Наступна сплата *</label>
            <input v-model="form.next_payment_date" type="date" :min="todayDate" required class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">Опис / Нотатки</label>
          <textarea v-model="form.description" rows="2" placeholder="Призначення ліцензії або проект..." class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"></textarea>
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
          <button type="button" @click="emit('close')" class="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg font-bold text-[#44403C] transition cursor-pointer">
            Скасувати
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg font-bold transition disabled:opacity-50 cursor-pointer">
            {{ isSubmitting ? "Збереження..." : "Зберегти ліцензію" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>