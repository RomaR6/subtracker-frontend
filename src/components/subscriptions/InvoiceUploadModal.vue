<script setup lang="ts">
import { ref } from "vue";
import api from "../../api/axios";

const props = defineProps<{
  show: boolean;
  workspaceId: number;
}>();

const emit = defineEmits(["close", "imported"]);

const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const isCreating = ref(false);
const errorMsg = ref("");
const parsedResult = ref<any>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    errorMsg.value = "";
  }
};

const uploadInvoice = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  errorMsg.value = "";

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const res = await api.post("/subscriptions/parse-invoice", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    parsedResult.value = res.data;
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail || "Помилка обробки PDF-інвойсу.";
  } finally {
    isUploading.value = false;
  }
};

const createSubscriptionFromInvoice = async () => {
  if (!parsedResult.value) return;
  isCreating.value = true;
  errorMsg.value = "";

  try {
    await api.post("/subscriptions/", {
      workspace_id: props.workspaceId,
      name: parsedResult.value.name,
      domain: parsedResult.value.domain,
      category: parsedResult.value.category,
      owner_name: parsedResult.value.owner_name,
      billing_period: parsedResult.value.billing_period,
      currency_code: parsedResult.value.currency_code,
      cost_usd: Number(parsedResult.value.cost_usd),
      next_payment_date: parsedResult.value.next_payment_date,
      status: parsedResult.value.status,
      description: parsedResult.value.description
    });

    emit("imported");
    emit("close");
    resetModal();
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail || "Не вдалося автоматично створити підписку з інвойсу.";
  } finally {
    isCreating.value = false;
  }
};

const resetModal = () => {
  selectedFile.value = null;
  parsedResult.value = null;
  errorMsg.value = "";
};

const handleClose = () => {
  resetModal();
  emit("close");
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
      <div class="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
        <h3 class="font-bold text-base text-[#1e293b]">Аналіз та імпорт PDF-інвойсу</h3>
        <button @click="handleClose" class="text-[#78716C] hover:text-[#1e293b] text-sm p-1 cursor-pointer">✕</button>
      </div>

      <div v-if="errorMsg" class="mt-3 p-2.5 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded-lg text-xs font-medium">
        {{ errorMsg }}
      </div>

      <!-- Зона завантаження -->
      <div v-if="!parsedResult" class="mt-4 space-y-4">
        <label class="border-2 border-dashed border-[#D6D3D1] hover:border-[#881337] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5] transition text-center">
          <span class="text-3xl mb-2">📑</span>
          <span class="text-xs font-bold text-[#1e293b]">
            {{ selectedFile ? selectedFile.name : "Оберіть або перетягніть PDF-рахунок" }}
          </span>
          <span class="text-[10px] text-[#78716C] mt-1">Підтримуються інвойси Anthropic, OpenAI, AWS, JetBrains, Figma (до 10 МБ)</span>
          <input type="file" accept=".pdf" class="hidden" @change="onFileChange" />
        </label>

        <div class="flex justify-end gap-2.5 pt-2">
          <button @click="handleClose" class="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold text-[#44403C] cursor-pointer">
            Скасувати
          </button>
          <button
            @click="uploadInvoice"
            :disabled="!selectedFile || isUploading"
            class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {{ isUploading ? "Аналіз через PyPDF..." : "Розпізнати інвойс" }}
          </button>
        </div>
      </div>

      <!-- Картка результатів розпізнавання -->
      <div v-else class="mt-4 space-y-3.5 text-xs">
        <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[#065F46]">
          <p class="font-bold">✓ Файл успішно розпізнано модулем InvoiceParser</p>
          <p class="text-[11px] mt-0.5">Параметри вилучено та підготовлено для внесення в реєстр.</p>
        </div>

        <div class="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E7E5E4] space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[#78716C]">Сервіс / Постачальник:</span>
            <span class="font-bold text-[#1e293b]">{{ parsedResult.name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#78716C]">Сума до оплати:</span>
            <span class="font-black text-[#881337] text-sm">${{ Number(parsedResult.cost_usd).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#78716C]">Категорія:</span>
            <span class="font-semibold text-[#1e293b]">{{ parsedResult.category }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#78716C]">Номер документа:</span>
            <span class="font-mono text-[#1e293b]">{{ parsedResult.invoice_number }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#78716C]">Дата наступної пролонгації:</span>
            <span class="font-semibold text-[#1e293b]">{{ parsedResult.next_payment_date }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
          <button @click="resetModal" class="px-3.5 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold text-[#44403C] cursor-pointer">
            Інший файл
          </button>
          <button
            @click="createSubscriptionFromInvoice"
            :disabled="isCreating"
            class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ isCreating ? "Створення..." : "+ Створити підписку з рахунку" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>