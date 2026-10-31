import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const useDialogStore = defineStore('dialog', () => {
  const isOpen = ref(false);
  const type = ref<'confirm' | 'alert'>('confirm');
  const title = ref('');
  const message = ref('');
  const confirmText = ref('Підтвердити');
  const cancelText = ref('Скасувати');
  const isDanger = ref(false);

  let resolvePromise: ((value: boolean) => void) | null = null;

  const confirm = (options: DialogOptions): Promise<boolean> => {
    type.value = 'confirm';
    title.value = options.title || 'Підтвердження дії';
    message.value = options.message;
    confirmText.value = options.confirmText || 'Підтвердити';
    cancelText.value = options.cancelText || 'Скасувати';
    isDanger.value = options.isDanger ?? true;
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const alert = (options: DialogOptions | string): Promise<boolean> => {
    type.value = 'alert';
    if (typeof options === 'string') {
      title.value = 'Повідомлення системи';
      message.value = options;
      confirmText.value = 'Зрозуміло';
    } else {
      title.value = options.title || 'Повідомлення';
      message.value = options.message;
      confirmText.value = options.confirmText || 'Зрозуміло';
    }
    isDanger.value = false;
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const onConfirm = () => {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(true);
  };

  const onCancel = () => {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(false);
  };

  return {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    isDanger,
    confirm,
    alert,
    onConfirm,
    onCancel
  };
});
