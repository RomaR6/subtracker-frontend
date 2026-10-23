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
const errorMsg = ref("");
const parsedResult = ref<any>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const uploadInvoice = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  errorMsg.value = "";
  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("workspace_id", String(props.workspaceId));

    const res = await api.post("/invoices/upload", formData, {
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
  try {
    await api.post("/subscriptions/", {
      workspace_id: props.workspaceId,
      name: parsedResult.value.extracted_vendor || "Новий постачальник (Invoice)",
      domain: "",
      category: "Infrastructure",
      owner_name: "Бухгалтерія / Інвойс",
      billing_period: "monthly",
      currency_code: "USD",
      cost_usd: parsedResult.value.extracted_amount || 45.0,
      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
      description: `Автоматично імпортовано з PDF-інвойсу #${parsedResult.value.invoice_number || ""}`
    });
    emit("imported");
    emit("close");
  } catch (err: any) {
    errorMsg.value = "Не вдалося автоматично створити підписку з інвойсу.";
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
      <div class="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
        <h3 class="font-bold text-base text-[#1e293b]">Аналіз та імпорт PDF-інвойсу</h3>
        <button @click="emit('close')" class="text-[#78716C] hover:text-[#1e293b] text-sm p-1">✕</button>
      </div>

      <div v-if="errorMsg" class="mt-3 p-2.5 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded-lg text-xs font-medium">
        {{ errorMsg }}
      </div>

      <!-- Upload Zone -->
      <div v-if="!parsedResult" class="mt-4 space-y-4">
        <label class="border-2 border-dashed border-[#D6D3D1] hover:border-[#881337] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5] transition text-center">
          <span class="text-3xl mb-2">📑</span>
          <span class="text-xs font-bold text-[#1e293b]">
            {{ selectedFile ? selectedFile.name : "Оберіть або перетягніть PDF-рахунок" }}
          </span>
          <span class="text-[10px] text-[#78716C] mt-1">Підтримуються рахунки AWS, JetBrains, Figma, Google (до 10 МБ)</span>
          <input type="file" accept=".pdf" class="hidden" @change="onFileChange" />
        </label>

        <div class="flex justify-end gap-2.5 pt-2">
          <button @click="emit('close')" class="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold text-[#44403C]">
            Скасувати
          </button>
          <button
            @click="uploadInvoice"
            :disabled="!selectedFile || isUploading"
            class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            {{ isUploading ? "Парсинг через PyPDF..." : "Розпізнати інвойс" }}
          </button>
        </div>
      </div>

      <!-- Parsed Success Result Card -->
      <div v-else class="mt-4 space-y-3.5 text-xs">
        <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[#065F46]">
          <p class="font-bold">✓ Файл успішно розпізнано модулем InvoiceParser</p>
          <p class="text-[11px] mt-0.5">Дані підготовлено для синхронізації з підписками.</p>
        </div>

        <div class="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E7E5E4] space-y-1.5">
          <div class="flex justify-between">
            <span class="text-[#78716C]">Постачальник:</span>
            <span class="font-bold text-[#1e293b]">{{ parsedResult.extracted_vendor || "Не визначено" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Сума до оплати:</span>
            <span class="font-bold text-[#881337]">${{ parsedResult.extracted_amount || "0.00" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Номер документа:</span>
            <span class="font-bold text-[#1e293b]">{{ parsedResult.invoice_number || "INV-MOCK-001" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Дата виставлення:</span>
            <span class="font-bold text-[#1e293b]">{{ parsedResult.invoice_date || "2026-10-15" }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
          <button @click="parsedResult = null; selectedFile = null" class="px-3.5 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] rounded-lg text-xs font-bold text-[#44403C]">
            Інший файл
          </button>
          <button @click="createSubscriptionFromInvoice" class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold shadow-sm">
            + Створити підписку з рахунку
          </button>
        </div>
      </div>
    </div>
  </div>
</template>