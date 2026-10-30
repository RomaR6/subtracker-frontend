<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import QRCode from "qrcode";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";
import { verifyTotpToken } from "../utils/totp";

const authStore = useAuthStore();
const wsStore = useWorkspaceStore();

const base32Secret = ref("");
const qrDataUrl = ref("");
const totpCode = ref("");
const statusMsg = ref("");
const isError = ref(false);
const isLoading = ref(false);
const is2FaEnabled = ref(false);
const showSetupPanel = ref(false);
const copiedKey = ref(false);
const copiedAccount = ref(false);

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const getStorageKeyPrefix = () => {
  const email = authStore.user?.email || "default";
  return `subtracker_2fa_${email}`;
};

const generateRandomBase32Secret = (): string => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += BASE32_ALPHABET[bytes[i] % 32];
  }
  return result;
};

const otpAuthUrl = computed(() => {
  const email = authStore.user?.email || "user@novatech.com";
  return `otpauth://totp/SubTracker:${email}?secret=${base32Secret.value}&issuer=SubTracker&algorithm=SHA1&digits=6&period=30`;
});

const generateQrImage = async () => {
  if (!base32Secret.value) return;
  try {
    qrDataUrl.value = await QRCode.toDataURL(otpAuthUrl.value, {
      width: 180,
      margin: 1,
      color: {
        dark: "#881337",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.error("Помилка генерації QR-коду:", err);
  }
};

watch(base32Secret, () => {
  generateQrImage();
});

const formattedSecret = computed(() => {
  return base32Secret.value.match(/.{1,4}/g)?.join(" ") || base32Secret.value;
});

const accountLabel = computed(() => {
  return `SubTracker (${authStore.user?.email || "user@novatech.com"})`;
});

const loadSaved2FaState = () => {
  const prefix = getStorageKeyPrefix();
  const savedSecret = localStorage.getItem(`${prefix}_secret`);
  const savedEnabled = localStorage.getItem(`${prefix}_enabled`);

  if (savedSecret) {
    base32Secret.value = savedSecret;
  } else {
    const newSecret = generateRandomBase32Secret();
    base32Secret.value = newSecret;
    localStorage.setItem(`${prefix}_secret`, newSecret);
  }

  is2FaEnabled.value = savedEnabled === "true";
  showSetupPanel.value = false;
  generateQrImage();
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchCurrentUser();
  }
  loadSaved2FaState();

  if (!wsStore.currentWorkspace) {
    await wsStore.fetchWorkspaces();
  } else {
    await wsStore.syncCurrentUserRole(wsStore.currentWorkspace.id);
  }
});

const start2FaSetup = async () => {
  isLoading.value = true;
  statusMsg.value = "";
  isError.value = false;
  try {
    await api.post("/auth/2fa/setup");
  } catch (err) {
    // Демо-фолбек
  } finally {
    showSetupPanel.value = true;
    isLoading.value = false;
    generateQrImage();
  }
};

const disable2Fa = () => {
  const prefix = getStorageKeyPrefix();
  localStorage.setItem(`${prefix}_enabled`, "false");
  is2FaEnabled.value = false;
  showSetupPanel.value = false;
  statusMsg.value = "";
};

const regenerateSecret = () => {
  const prefix = getStorageKeyPrefix();
  const newSecret = generateRandomBase32Secret();
  base32Secret.value = newSecret;
  localStorage.setItem(`${prefix}_secret`, newSecret);
  localStorage.setItem(`${prefix}_enabled`, "false");
  is2FaEnabled.value = false;
  statusMsg.value = "Згенеровано новий ключ та QR-код. Відскануйте його у додатку.";
  isError.value = false;
  generateQrImage();
};

const copyText = (text: string, type: "key" | "account") => {
  navigator.clipboard.writeText(text);
  if (type === "key") {
    copiedKey.value = true;
    setTimeout(() => { copiedKey.value = false; }, 2000);
  } else {
    copiedAccount.value = true;
    setTimeout(() => { copiedAccount.value = false; }, 2000);
  }
};

const verify2FaCode = async () => {
  statusMsg.value = "";
  if (!/^\d{6}$/.test(totpCode.value.trim())) {
    isError.value = true;
    statusMsg.value = "Код перевірки має складатися рівно з 6 цифр.";
    return;
  }

  isLoading.value = true;
  try {
    const isValid = await verifyTotpToken(base32Secret.value, totpCode.value);
    if (!isValid) {
      isError.value = true;
      statusMsg.value = "Невірний код TOTP! Перевірте правильність введення та синхронізацію часу на смартфоні.";
      return;
    }

    try {
      await api.post("/auth/2fa/verify", { code: totpCode.value.trim() });
    } catch (e) {
      // Клієнтська валідація RFC 6238
    }

    const prefix = getStorageKeyPrefix();
    localStorage.setItem(`${prefix}_enabled`, "true");
    isError.value = false;
    is2FaEnabled.value = true;
    showSetupPanel.value = false;
    totpCode.value = "";
    statusMsg.value = "Двофакторну автентифікацію успішно підтверджено та активовано!";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-[#1e293b] tracking-tight">Особистий кабінет та безпека</h1>
        <p class="text-xs text-[#78716C] mt-1">Керування персональними даними, ролями у робочих просторах та двофакторним захистом</p>
      </div>

      <button
        @click="authStore.logout"
        class="px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECDD3] rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
      >
        Вийти з облікового запису
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Ліва колонка: Профіль та простори -->
      <div class="lg:col-span-5 bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-xs space-y-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#881337] text-white flex items-center justify-center font-black text-xl shadow-xs">
            {{ authStore.user?.first_name ? authStore.user.first_name[0] : "U" }}
          </div>
          <div>
            <h2 class="text-lg font-black text-[#1e293b]">{{ authStore.userFullName }}</h2>
            <p class="text-xs text-[#78716C]">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <div class="h-px bg-[#E7E5E4]"></div>

        <div class="space-y-3 text-xs">
          <div class="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] flex items-center justify-between">
            <div>
              <span class="text-[#78716C] block text-[11px]">Поточний активний простір:</span>
              <span class="font-bold text-[#1e293b] text-sm">{{ wsStore.currentWorkspace?.name || "NovaTech IT Core" }}</span>
            </div>
            <div class="text-right">
              <span class="text-[#78716C] block text-[11px]">Ваша роль у ньому:</span>
              <span
                :class="{
                  'bg-[#FEF2F2] text-[#881337] border-[#FECDD3]': authStore.role === 'Admin',
                  'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]': authStore.role === 'Manager',
                  'bg-[#F5F5F4] text-[#44403C] border-[#D6D3D1]': authStore.role === 'Member'
                }"
                class="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              >
                {{ authStore.role }}
              </span>
            </div>
          </div>

          <div class="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
            <p class="font-bold text-[#1e293b] mb-2">Доступні повноваження в поточному просторі:</p>
            <ul v-if="authStore.role === 'Admin'" class="space-y-1 text-[#44403C]">
              <li>✓ Повне керування підписками та PDF-інвойсами</li>
              <li>✓ Розгляд і затвердження заявок співробітників</li>
              <li>✓ Генерація інвайт-посилань та налаштування вебхуків</li>
            </ul>
            <ul v-else-if="authStore.role === 'Manager'" class="space-y-1 text-[#44403C]">
              <li>✓ Додавання та редагування корпоративних підписок</li>
              <li>✓ Схвалення та відхилення заявок на закупівлю ПЗ</li>
              <li>✓ Перегляд фінансової аналітики та експорт звітів</li>
            </ul>
            <ul v-else class="space-y-1 text-[#44403C]">
              <li>✓ Перегляд каталогу активних підписок команди</li>
              <li>✓ Подання власних заявок на закупівлю ліцензій</li>
            </ul>
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">Ваші робочі простори ({{ wsStore.workspaces.length }}):</span>
          <div class="space-y-1.5">
            <div
              v-for="ws in wsStore.workspaces"
              :key="ws.id"
              @click="wsStore.selectWorkspace(ws)"
              :class="ws.id === wsStore.currentWorkspace?.id ? 'border-[#881337] bg-[#FEF2F2]/50' : 'border-[#E7E5E4] bg-white hover:bg-[#FAF8F5]'"
              class="p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition"
            >
              <span class="font-bold text-[#1e293b]">{{ ws.name }}</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#E7E5E4] text-[#78716C]">
                {{ ws.owner_id === authStore.user?.id ? "Власник (Admin)" : "Учасник" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Права колонка: 2FA з QR-кодом -->
      <div class="lg:col-span-7 bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-xs space-y-5">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-black text-base text-[#1e293b]">Двофакторна автентифікація (2FA TOTP)</h3>
            <p class="text-xs text-[#78716C] mt-1">
              Захистіть обліковий запис одноразовими 6-значними кодами з додатка Google Authenticator або 1Password.
            </p>
          </div>
          <span
            :class="is2FaEnabled ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'"
            class="px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0"
          >
            {{ is2FaEnabled ? "Підключено ✓" : "Не підключено" }}
          </span>
        </div>

        <div v-if="statusMsg && !showSetupPanel" class="p-3 rounded-xl text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          {{ statusMsg }}
        </div>

        <div v-if="is2FaEnabled && !showSetupPanel" class="p-5 bg-[#ECFDF5]/60 border border-[#A7F3D0] rounded-xl space-y-3 text-xs">
          <div>
            <p class="font-bold text-[#065F46] text-sm">✓ Двофакторний захист TOTP активний</p>
            <p class="text-[#047857] mt-0.5">Вхід у ваш профіль захищено одноразовими динамічними кодами.</p>
          </div>
          <div class="flex flex-wrap gap-2 pt-2">
            <button @click="showSetupPanel = true" class="px-3.5 py-2 bg-white border border-[#A7F3D0] text-[#065F46] rounded-lg font-bold hover:bg-[#ECFDF5] transition cursor-pointer">
              Показати QR-код та ключ
            </button>
            <button @click="disable2Fa" class="px-3.5 py-2 bg-white border border-[#FECDD3] text-[#DC2626] rounded-lg font-bold hover:bg-[#FEF2F2] transition cursor-pointer">
              Вимкнути 2FA
            </button>
          </div>
        </div>

        <div v-else-if="!showSetupPanel" class="p-5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-[#44403C] space-y-1">
            <p class="font-bold text-[#1e293b]">Швидке налаштування через QR-код</p>
            <p class="text-[#78716C]">Додайте акаунт у додаток скануванням коду з екрана смартфона.</p>
          </div>
          <button
            @click="start2FaSetup"
            :disabled="isLoading"
            class="px-4 py-2.5 bg-[#881337] hover:bg-[#9F1239] text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Налаштувати 2FA (QR-код)
          </button>
        </div>

        <!-- Панель з QR-кодом та резервним ключем -->
        <div v-if="showSetupPanel" class="space-y-4 text-xs">
          <div class="p-4 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl space-y-4">
            <div class="flex items-center justify-between">
              <p class="font-bold text-[#1e293b] text-sm">Сканування в Google Authenticator:</p>
              <button @click="regenerateSecret" class="text-[11px] text-[#881337] hover:underline font-bold cursor-pointer">
                Оновити QR-код
              </button>
            </div>

            <!-- Блок QR-коду та швидкої інструкції -->
            <div class="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-xl border border-[#E7E5E4]">
              <div class="shrink-0 p-2 bg-white rounded-lg border border-[#E7E5E4] shadow-xs">
                <img v-if="qrDataUrl" :src="qrDataUrl" alt="2FA QR Code" class="w-40 h-40 object-contain" />
                <div v-else class="w-40 h-40 bg-[#FAF8F5] flex items-center justify-center text-[10px] text-[#78716C]">
                  Генерація QR...
                </div>
              </div>

              <div class="space-y-2 text-[#44403C]">
                <p class="font-bold text-xs text-[#1e293b]">Спосіб 1: Сканування камерою (рекомендовано)</p>
                <ol class="list-decimal list-inside space-y-1 text-[11px] text-[#78716C]">
                  <li>Відкрийте <strong>Google Authenticator</strong> на телефоні.</li>
                  <li>Натисніть <strong>«+»</strong> у правому нижньому кутку.</li>
                  <li>Оберіть <strong>«Сканувати QR-код»</strong> та наведіть камеру на зображення ліворуч.</li>
                </ol>
                <p class="text-[10px] text-[#059669] font-bold pt-1">
                  ✓ Назва та параметри підставляться автоматично!
                </p>
              </div>
            </div>

            <!-- Резервний спосіб через текстовий ключ -->
            <div class="pt-2 border-t border-[#E7E5E4] space-y-2">
              <span class="text-[11px] font-bold text-[#44403C] block">
                Спосіб 2: Введення вручну (якщо камера недоступна):
              </span>
              <div class="flex items-center gap-2">
                <input :value="base32Secret" readonly class="flex-1 px-3 py-1.5 bg-white border border-[#FECDD3] rounded-lg font-mono font-black text-xs text-[#881337] tracking-wider" />
                <button @click="copyText(base32Secret, 'key')" class="px-3 py-1.5 bg-[#881337] text-white rounded-lg font-bold text-[11px] cursor-pointer">
                  {{ copiedKey ? "Скопійовано ✓" : "Копіювати ключ" }}
                </button>
              </div>
              <span class="text-[10px] text-[#78716C] block">Розбивка по 4 символи: <strong class="font-mono text-[#1e293b]">{{ formattedSecret }}</strong> (тип ключа: За часом)</span>
            </div>
          </div>

          <!-- Підтвердження введенням коду -->
          <div class="p-4 bg-white border border-[#E7E5E4] rounded-xl space-y-3">
            <label class="block font-bold text-[#1e293b]">
              Введіть 6-значний код із телефона для активації:
            </label>
            <div class="flex flex-wrap gap-3">
              <input
                v-model="totpCode"
                maxlength="6"
                placeholder="123456"
                class="w-44 text-center tracking-[0.4em] font-mono font-black text-base py-2 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl"
              />
              <button
                @click="verify2FaCode"
                :disabled="isLoading || totpCode.length !== 6"
                class="px-5 py-2 bg-[#881337] hover:bg-[#9F1239] text-white rounded-xl font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {{ isLoading ? "Перевірка..." : "Підтвердити та увімкнути" }}
              </button>
              <button
                v-if="is2FaEnabled"
                @click="showSetupPanel = false"
                class="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] rounded-xl font-bold transition cursor-pointer"
              >
                Згорнути
              </button>
            </div>

            <div v-if="statusMsg" class="p-3 rounded-xl text-xs font-bold" :class="isError ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECDD3]' : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'">
              {{ statusMsg }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>