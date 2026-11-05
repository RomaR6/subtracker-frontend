<script setup lang="ts">
import { useDialogStore } from "../stores/dialog";
import { ref, computed, onMounted, watch } from "vue";
import {
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFileImport,
  IconPlus,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";
import SubscriptionModal from "../components/subscriptions/SubscriptionModal.vue";
import InvoiceUploadModal from "../components/subscriptions/InvoiceUploadModal.vue";

const dialog = useDialogStore();
const wsStore = useWorkspaceStore();
const authStore = useAuthStore();

const getCachedSubs = () => {
  try {
    const cached = localStorage.getItem("subtracker_subs_cache");
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const cachedSubs = getCachedSubs();
const subscriptions = ref<any[]>(cachedSubs);
const isLoading = ref(cachedSubs.length === 0);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedStatus = ref("all");

const currentPage = ref(1);
const itemsPerPage = ref(10);

const showAddModal = ref(false);
const showInvoiceModal = ref(false);
const editingItem = ref<any | null>(null);
const renewingId = ref<number | null>(null);

const fetchSubscriptions = async () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  try {
    const res = await api.get(`/subscriptions/?workspace_id=${wsId}`);
    if (Array.isArray(res.data)) {
      subscriptions.value = res.data;
      localStorage.setItem("subtracker_subs_cache", JSON.stringify(res.data));
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const markAsRenewed = async (sub: any) => {
  renewingId.value = sub.id;
  try {
    await api.post(`/subscriptions/item/${sub.id}/renew`);
    await fetchSubscriptions();
  } catch (err) {
    console.error(err);
  } finally {
    renewingId.value = null;
  }
};

watch(() => wsStore.currentWorkspace?.id, () => {
  currentPage.value = 1;
  fetchSubscriptions();
});

watch([searchQuery, selectedCategory, selectedStatus], () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchSubscriptions();
  if (wsStore.workspaces.length === 0) {
    wsStore.fetchWorkspaces();
  }
});

const filteredSubscriptions = computed(() => {
  return subscriptions.value.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.owner_name && item.owner_name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesCat = selectedCategory.value === "all" || item.category === selectedCategory.value;
    const matchesStatus =
      selectedStatus.value === "all" ||
      (selectedStatus.value === "active" ? item.status === "active" : item.status !== "active");
    return matchesSearch && matchesCat && matchesStatus;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredSubscriptions.value.length / itemsPerPage.value) || 1;
});

const paginatedSubscriptions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSubscriptions.value.slice(start, start + itemsPerPage.value);
});

const openEditModal = (item: any) => {
  if (!authStore.isAdminOrManager) return;
  editingItem.value = item;
  showAddModal.value = true;
};

const toggleStatus = async (item: any) => {
  if (!authStore.isAdminOrManager) return;
  try {
    await api.patch(`/subscriptions/item/${item.id}/toggle-status`);
    await fetchSubscriptions();
  } catch (err) {
    console.error(err);
  }
};

const deleteSubscription = async (id: number) => {
  if (!authStore.isAdminOrManager) return;
  const confirmed = await dialog.confirm({
    title: "Вилучення ліцензії",
    message: "Ви дійсно бажаєте видалити цю підписку з реєстру компанії? Цю дію неможливо скасувати.",
    confirmText: "Видалити",
    cancelText: "Скасувати",
    isDanger: true
  });
  if (!confirmed) return;

  try {
    await api.delete(`/subscriptions/item/${id}`);
    subscriptions.value = subscriptions.value.filter((s) => s.id !== id);
    localStorage.setItem("subtracker_subs_cache", JSON.stringify(subscriptions.value));
  } catch (err) {
    console.error(err);
  }
};

const exportCsv = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://localhost:8000/api/v1/analytics/export/csv?workspace_id=${wsId}`, "_blank");
};

const exportPdf = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://localhost:8000/api/v1/analytics/export/pdf?workspace_id=${wsId}`, "_blank");
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Реєстр корпоративних підписок</h1>
        <p class="text-xs text-[#78716C] mt-1">Централізований облік ліцензій, витрат та закріплених спеціалістів</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          v-if="authStore.isAdminOrManager"
          @click="exportCsv"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#1e293b] border border-[#E7E5E4] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <IconFileSpreadsheet class="w-4 h-4 text-[#059669]" :stroke-width="2" />
          <span>Експорт CSV</span>
        </button>

        <button
          v-if="authStore.isAdminOrManager"
          @click="exportPdf"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#1e293b] border border-[#E7E5E4] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <IconFileTypePdf class="w-4 h-4 text-[#881337]" :stroke-width="2" />
          <span>Експорт PDF</span>
        </button>

        <button
          v-if="authStore.isAdminOrManager"
          @click="showInvoiceModal = true"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#881337] border border-[#FECDD3] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <IconFileImport class="w-4 h-4" :stroke-width="2" />
          <span>Імпорт PDF-інвойсу</span>
        </button>

        <button
          v-if="authStore.isAdminOrManager"
          @click="editingItem = null; showAddModal = true"
          class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <IconPlus class="w-4 h-4" :stroke-width="2.5" />
          <span>Додати ліцензію</span>
        </button>
      </div>
    </div>

    <div class="bg-white border border-[#E7E5E4] p-4 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      <div class="sm:col-span-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук за назвою софту або співробітником..."
          class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs text-[#1e293b]"
        />
      </div>

      <div>
        <select v-model="selectedCategory" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs text-[#44403C]">
          <option value="all">Усі категорії</option>
          <option value="DevTools">DevTools</option>
          <option value="DevOps & Cloud">DevOps & Cloud</option>
          <option value="Design">Design</option>
          <option value="Комунікація">Комунікація</option>
        </select>
      </div>

      <div>
        <select v-model="selectedStatus" class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-xs text-[#44403C]">
          <option value="all">Усі статуси</option>
          <option value="active">Лише активні</option>
          <option value="inactive">Неактивні / Пауза</option>
        </select>
      </div>
    </div>

    <div class="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#78716C] font-bold">
            <th class="py-3 px-4">Сервіс</th>
            <th class="py-3 px-4">Категорія</th>
            <th class="py-3 px-4">Відповідальний</th>
            <th class="py-3 px-4">Період</th>
            <th class="py-3 px-4 text-right">Вартість</th>
            <th class="py-3 px-4">Наступне списання</th>
            <th class="py-3 px-4 text-center">Статус</th>
            <th v-if="authStore.isAdminOrManager" class="py-3 px-4 text-right">Дії</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E7E5E4]">
          <tr v-for="item in paginatedSubscriptions" :key="item.id" class="hover:bg-[#FAF8F5]/80 transition">
            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-white border border-[#E7E5E4] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    v-if="item.logo_url"
                    :src="item.logo_url"
                    :alt="item.name"
                    class="w-5 h-5 object-contain"
                    @error="($event.target as HTMLElement).style.display = 'none'"
                  />
                  <span v-else class="font-bold text-[10px] text-[#881337]">{{ item.name.substring(0, 2).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-bold text-xs text-[#1e293b] leading-tight">{{ item.name }}</p>
                  <p class="text-[10px] text-[#78716C]">{{ item.domain || "saas-app" }}</p>
                </div>
              </div>
            </td>

            <td class="py-3 px-4 text-[#44403C] font-medium">{{ item.category }}</td>
            <td class="py-3 px-4 text-[#44403C] font-medium">{{ item.owner_name || "Загальний пул" }}</td>
            <td class="py-3 px-4 capitalize text-[#78716C]">{{ item.billing_period }}</td>

            <td class="py-3 px-4 text-right">
              <p class="font-black text-xs text-[#1e293b]">${{ item.cost_usd.toFixed(2) }}</p>
              <p class="text-[10px] text-[#78716C]">₴{{ Math.round(item.cost_uah).toLocaleString('uk-UA') }}</p>
            </td>

            <td class="py-3 px-4 font-mono">
              <div class="flex items-center gap-2">
                <div>
                  <span class="block text-xs font-semibold text-[#1e293b]">{{ item.next_payment_date }}</span>
                  <span
                    v-if="item.days_until_payment < 0"
                    class="text-[10px] text-[#DC2626] font-bold block"
                  >
                    Прострочено на {{ Math.abs(item.days_until_payment) }} дн.
                  </span>
                  <span
                    v-else-if="item.days_until_payment <= 3"
                    class="text-[10px] text-[#DC2626] font-bold block"
                  >
                    {{ item.days_until_payment === 0 ? "Сьогодні" : `Через ${item.days_until_payment} дн.` }}
                  </span>
                  <span v-else class="text-[10px] text-[#78716C] block">
                    Через {{ item.days_until_payment }} дн.
                  </span>
                </div>

                <button
                  v-if="item.days_until_payment <= 0 && item.status === 'active'"
                  @click="markAsRenewed(item)"
                  :disabled="renewingId === item.id"
                  title="Підтвердити оплату та продовжити період"
                  class="px-2 py-0.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] rounded text-[10px] font-bold transition cursor-pointer shadow-2xs whitespace-nowrap inline-flex items-center gap-1"
                >
                  <span>{{ renewingId === item.id ? "..." : "Оплачено" }}</span>
                  <IconRefresh v-if="renewingId !== item.id" class="w-3 h-3" :stroke-width="2.5" />
                </button>
              </div>
            </td>

            <td class="py-3 px-4 text-center">
              <button
                v-if="authStore.isAdminOrManager"
                @click="toggleStatus(item)"
                :class="item.status === 'active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'"
                class="px-2.5 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer transition hover:opacity-80"
              >
                {{ item.status === "active" ? "Активна" : "Пауза" }}
              </button>
              <span
                v-else
                :class="item.status === 'active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'"
                class="px-2.5 py-0.5 rounded-full border text-[10px] font-bold inline-block"
              >
                {{ item.status === "active" ? "Активна" : "Пауза" }}
              </span>
            </td>

            <td v-if="authStore.isAdminOrManager" class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEditModal(item)" class="text-[#78716C] hover:text-[#881337] font-semibold text-xs p-1 cursor-pointer transition" title="Редагувати">
                  <IconEdit class="w-4 h-4" :stroke-width="2" />
                </button>
                <button @click="deleteSubscription(item.id)" class="text-[#78716C] hover:text-[#DC2626] font-semibold text-xs p-1 cursor-pointer transition" title="Видалити">
                  <IconTrash class="w-4 h-4" :stroke-width="2" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredSubscriptions.length === 0">
            <td :colspan="authStore.isAdminOrManager ? 8 : 7" class="py-12 text-center text-xs text-[#78716C]">
              За вашим запитом не знайдено жодної підписки.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="px-4 py-3 bg-[#FAF8F5] border-t border-[#E7E5E4] flex items-center justify-between text-xs">
        <span class="text-[#78716C]">
          Сторінка <strong class="text-[#1e293b]">{{ currentPage }}</strong> з <strong class="text-[#1e293b]">{{ totalPages }}</strong> (усього {{ filteredSubscriptions.length }} записів)
        </span>
        <div class="flex items-center gap-1.5">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#44403C] hover:bg-[#F5F5F4] transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <IconChevronLeft class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>Назад</span>
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#44403C] hover:bg-[#F5F5F4] transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Вперед</span>
            <IconChevronRight class="w-3.5 h-3.5" :stroke-width="2.2" />
          </button>
        </div>
      </div>
    </div>

    <SubscriptionModal
      :show="showAddModal"
      :edit-item="editingItem"
      :workspace-id="wsStore.currentWorkspace?.id || 1"
      @close="showAddModal = false"
      @saved="fetchSubscriptions"
    />

    <InvoiceUploadModal
      :show="showInvoiceModal"
      :workspace-id="wsStore.currentWorkspace?.id || 1"
      @close="showInvoiceModal = false"
      @imported="fetchSubscriptions"
    />
  </div>
</template>