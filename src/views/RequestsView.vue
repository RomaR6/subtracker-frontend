<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";

const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

const requests = ref<any[]>([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const reviewModalItem = ref<any | null>(null);
const reviewComment = ref("");
const reviewError = ref("");
const isReviewing = ref(false);

const form = ref({
  service_name: "",
  estimated_cost: 45.0,
  currency_code: "USD",
  billing_period: "monthly",
  justification: ""
});

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get(`/requests/?workspace_id=${wsId}`);
    requests.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchRequests();
});

const submitRequest = async () => {
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    await api.post("/requests/", {
      ...form.value,
      workspace_id: wsId
    });
    showCreateModal.value = false;
    form.value.service_name = "";
    form.value.justification = "";
    await fetchRequests();
  } catch (err) {
    console.error(err);
  }
};

const handleReview = async (decision: "Approved" | "Rejected") => {
  if (!reviewModalItem.value) return;
  reviewError.value = "";
  isReviewing.value = true;
  const commentText = reviewComment.value.trim() || (decision === "Approved" ? "Погоджено керівником" : "Відхилено за лімітом бюджету");

  try {
    await api.patch(`/requests/${reviewModalItem.value.id}/review`, {
      status: decision,
      review_comment: commentText
    });
    reviewModalItem.value = null;
    reviewComment.value = "";
    await fetchRequests();
  } catch (err: any) {
    reviewError.value = err.response?.data?.detail 
      ? JSON.stringify(err.response.data.detail) 
      : "Помилка при зміні статусу заявки.";
  } finally {
    isReviewing.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Центр погоджень витрат (Approval Requests)</h1>
        <p class="text-xs text-[#78716C] mt-1">Подання співробітниками обґрунтованих заявок на софт та розгляд керівництвом</p>
      </div>

      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
      >
        <span>+ Подати заявку на софт</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="req in requests"
        :key="req.id"
        class="bg-white border border-[#E7E5E4] p-5 rounded-2xl shadow-xs flex flex-col justify-between"
      >
        <div>
          <div class="flex items-start justify-between">
            <span class="text-xs font-black text-[#1e293b]">{{ req.service_name }}</span>
            <span
              :class="{
                'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]': req.status?.toLowerCase() === 'pending',
                'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]': req.status?.toLowerCase() === 'approved',
                'bg-[#FEF2F2] text-[#DC2626] border-[#FECDD3]': req.status?.toLowerCase() === 'rejected'
              }"
              class="px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize"
            >
              {{ req.status }}
            </span>
          </div>

          <div class="mt-3 flex items-baseline gap-1 text-sm font-black text-[#881337]">
            <span>${{ req.estimated_cost }}</span>
            <span class="text-[10px] text-[#78716C] font-normal">/ {{ req.billing_period }}</span>
          </div>

          <p class="mt-2 text-xs text-[#44403C] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E7E5E4] italic">
            "{{ req.justification || 'Без додаткового коментаря' }}"
          </p>

          <p class="text-[10px] text-[#78716C] mt-3">
            Подав: <span class="font-bold text-[#1e293b]">{{ req.requester_name || req.requester?.first_name || 'Співробітник' }}</span>
          </p>
        </div>

        <div v-if="req.status?.toLowerCase() === 'pending' && authStore.isAdminOrManager" class="mt-4 pt-3 border-t border-[#E7E5E4]">
          <button
            @click="reviewModalItem = req; reviewComment = ''; reviewError = ''"
            class="w-full py-1.5 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Розглянути заявку
          </button>
        </div>
      </div>
    </div>

    <div v-if="requests.length === 0" class="bg-white border border-[#E7E5E4] p-12 rounded-2xl text-center text-xs text-[#78716C]">
      Немає активних заявок на розгляд у цьому просторі.
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-md w-full p-6 shadow-xl text-left">
        <h3 class="font-bold text-base text-[#1e293b]">Подання заявки на закупівлю</h3>
        <form @submit.prevent="submitRequest" class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Назва софту чи ліцензії *</label>
            <input v-model="form.service_name" required placeholder="JetBrains RustRover / Datadog" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#44403C] mb-1">Орієнтовна вартість ($) *</label>
              <input v-model.number="form.estimated_cost" type="number" step="0.1" required class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg" />
            </div>
            <div>
              <label class="block font-bold text-[#44403C] mb-1">Періодичність</label>
              <select v-model="form.billing_period" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg">
                <option value="monthly">Щомісячно</option>
                <option value="yearly">Щорічно</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">Виробниче обґрунтування необхідності *</label>
            <textarea v-model="form.justification" required rows="3" placeholder="Для якого проекту або стеку необхідний цей інструмент..." class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-[#E7E5E4]">
            <button type="button" @click="showCreateModal = false" class="px-3 py-1.5 bg-[#F5F5F4] rounded-lg font-bold cursor-pointer">Скасувати</button>
            <button type="submit" class="px-4 py-1.5 bg-[#881337] text-white rounded-lg font-bold cursor-pointer">Надіслати ліду</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="reviewModalItem" class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white border border-[#E7E5E4] rounded-2xl max-w-sm w-full p-6 shadow-xl text-left">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-base text-[#1e293b]">Розгляд: {{ reviewModalItem.service_name }}</h3>
          <button @click="reviewModalItem = null" class="text-[#78716C] p-1 text-sm cursor-pointer">✕</button>
        </div>
        <p class="text-xs text-[#78716C] mt-1">Орієнтовна вартість: ${{ reviewModalItem.estimated_cost }}</p>

        <div v-if="reviewError" class="mt-2 p-2 bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] rounded text-[11px] font-mono">
          {{ reviewError }}
        </div>

        <textarea
          v-model="reviewComment"
          rows="2"
          placeholder="Коментар ліда чи бухгалтерії..."
          class="w-full mt-3 px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs"
        ></textarea>
        <div class="flex gap-2 mt-4">
          <button
            @click="handleReview('Rejected')"
            :disabled="isReviewing"
            class="flex-1 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
          >
            Відхилити
          </button>
          <button
            @click="handleReview('Approved')"
            :disabled="isReviewing"
            class="flex-1 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
          >
            {{ isReviewing ? "Обробка..." : "Схвалити ✓" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>