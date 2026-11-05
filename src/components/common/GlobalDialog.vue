<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-vue';
import { useDialogStore } from '../../stores/dialog';

const dialog = useDialogStore();

const handleKeydown = (e: KeyboardEvent) => {
  if (!dialog.isOpen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    dialog.onCancel();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    dialog.onConfirm();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div
    v-if="dialog.isOpen"
    class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
    @click.self="dialog.onCancel"
  >
    <div
      class="w-full max-w-md bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-2xl transform transition-all duration-200 text-left"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-start gap-4">
        <div
          v-if="dialog.isDanger"
          class="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-[#DC2626] flex items-center justify-center shrink-0"
        >
          <IconAlertTriangle class="w-6 h-6" :stroke-width="2" />
        </div>
        <div
          v-else
          class="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] text-[#881337] flex items-center justify-center shrink-0"
        >
          <IconInfoCircle class="w-6 h-6" :stroke-width="2" />
        </div>

        <div class="flex-1">
          <h3 class="text-base font-black text-[#1e293b] leading-6">
            {{ dialog.title }}
          </h3>
          <p class="mt-2 text-xs text-[#78716C] leading-relaxed">
            {{ dialog.message }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
        <button
          v-if="dialog.type === 'confirm'"
          type="button"
          @click="dialog.onCancel"
          class="px-4 py-2 text-xs font-bold text-[#44403C] bg-[#FAF8F5] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl transition cursor-pointer"
        >
          {{ dialog.cancelText }}
        </button>

        <button
          type="button"
          @click="dialog.onConfirm"
          :class="[
            'px-5 py-2 text-xs font-bold text-white rounded-xl transition shadow-xs cursor-pointer',
            dialog.isDanger
              ? 'bg-[#881337] hover:bg-[#9F1239]'
              : 'bg-[#1e293b] hover:bg-[#334155]'
          ]"
        >
          {{ dialog.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>