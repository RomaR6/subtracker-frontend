<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "../api/axios";
import { useWorkspaceStore } from "../stores/workspace";
import SubscriptionModal from "../components/subscriptions/SubscriptionModal.vue";
import InvoiceUploadModal from "../components/subscriptions/InvoiceUploadModal.vue";

const wsStore = useWorkspaceStore();

const subscriptions = ref<any[]>([]);
const isLoading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("all");
const selectedStatus = ref("all");

const showAddModal = ref(false);
const showInvoiceModal = ref(false);
const editingItem = ref<any | null>(null);

const fetchSubscriptions = async () => {
  isLoading.value = true;
  try {
    const wsId = wsStore.currentWorkspace?.id || 1;
    const res = await api.get(`/subscriptions/?workspace_id=${wsId}`);
    subscriptions.value = res.data;
  } catch (err) {
    console.error("Не вдалося завантажити підписки:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  }
  await fetchSubscriptions();
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

const openEditModal = (item: any) => {
  editingItem.value = item;
  showAddModal.value = true;
};

const toggleStatus = async (item: any) => {
  try {
    const newStatus = item.status === "active" ? "inactive" : "active";
    await api.patch(`/subscriptions/${item.id}/toggle-status`, null, {
      params: { is_active: newStatus === "active" }
    });
    item.status = newStatus;
  } catch (err) {
    console.error("Не вдалося перемкнути статус:", err);
  }
};

const deleteSubscription = async (id: number) => {
  if (!confirm("Ви дійсно бажаєте видалити цю підписку з реєстру?")) return;
  try {
    await api.delete(`/subscriptions/${id}`);
    subscriptions.value = subscriptions.value.filter((s) => s.id !== id);
  } catch (err) {
    console.error("Помилка видалення:", err);
  }
};

const exportCsv = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://127.0.0.1:8000/api/v1/analytics/export/csv?workspace_id=${wsId}`, "_blank");
};

const exportPdf = () => {
  const wsId = wsStore.currentWorkspace?.id || 1;
  window.open(`http://127.0.0.1:8000/api/v1/analytics/export/pdf?workspace_id=${wsId}`, "_blank");
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
          @click="exportCsv"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#1e293b] border border-[#E7E5E4] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>📥 Експорт CSV</span>
        </button>

        <button
          @click="exportPdf"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#1e293b] border border-[#E7E5E4] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>📄 Експорт PDF</span>
        </button>

        <button
          @click="showInvoiceModal = true"
          class="px-3.5 py-2 bg-white hover:bg-[#F5F5F4] text-[#881337] border border-[#FECDD3] rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>📑 Імпорт PDF-інвойсу</span>
        </button>

        <button
          @click="editingItem = null; showAddModal = true"
          class="px-4 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>+ Додати ліцензію</span>
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
          <option value="Infrastructure">Infrastructure</option>
          <option value="Design">Design</option>
          <option value="Communication">Communication</option>
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
            <th class="py-3 px-4 text-right">Дії</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E7E5E4]">
          <tr v-for="item in filteredSubscriptions" :key="item.id" class="hover:bg-[#FAF8F5]/80 transition">
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
            <td class="py-3 px-4 text-[#44403C] font-medium">{{ item.owner_name || "Загальний" }}</td>
            <td class="py-3 px-4 capitalize text-[#78716C]">{{ item.billing_period }}</td>

            <td class="py-3 px-4 text-right">
              <p class="font-black text-xs text-[#1e293b]">${{ item.cost_usd.toFixed(2) }}</p>
              <p class="text-[10px] text-[#78716C]">₴{{ Math.round(item.cost_uah).toLocaleString('uk-UA') }}</p>
            </td>

            <td class="py-3 px-4">
              <p class="font-semibold text-[#1e293b]">{{ item.next_payment_date }}</p>
              <p :class="item.days_until_payment < 0 ? 'text-[#DC2626] font-black' : (item.days_until_payment <= 3 ? 'text-[#DC2626] font-bold' : 'text-[#78716C]')" class="text-[10px]">
                <span v-if="item.days_until_payment === 0">Сьогодні</span>
                <span v-else-if="item.days_until_payment < 0">Прострочено на {{ Math.abs(item.days_until_payment) }} дн.</span>
                <span v-else>Через {{ item.days_until_payment }} дн.</span>
              </p>
            </td>

            <td class="py-3 px-4 text-center">
              <button
                @click="toggleStatus(item)"
                :class="item.status === 'active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'"
                class="px-2.5 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer transition hover:opacity-80"
              >
                {{ item.status === "active" ? "Активна" : "Пауза" }}
              </button>
            </td>

            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEditModal(item)" class="text-[#78716C] hover:text-[#881337] font-semibold text-xs p-1 cursor-pointer" title="Редагувати">
                  ✏️
                </button>
                <button @click="deleteSubscription(item.id)" class="text-[#78716C] hover:text-[#DC2626] font-semibold text-xs p-1 cursor-pointer" title="Видалити">
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredSubscriptions.length === 0">
            <td colspan="8" class="py-12 text-center text-xs text-[#78716C]">
              За вашим запитом не знайдено жодної підписки.
            </td>
          </tr>
        </tbody>
      </table>
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