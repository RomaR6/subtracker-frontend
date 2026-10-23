import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../stores/auth";

describe("Ітерація 1: Перевірка автентифікації та збереження токенів", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("authStore ініціалізується з неавторизованим станом за замовчуванням", () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  it("setToken коректно записує токен у пам'ять та в localStorage", () => {
    const store = useAuthStore();
    store.setToken("demo_test_token_123");
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe("demo_test_token_123");
    expect(localStorage.getItem("subtracker_token")).toBe("demo_test_token_123");
  });

  it("геттер isAdminOrManager коректно валідує ролі користувача", () => {
    const store = useAuthStore();
    store.role = "Admin";
    expect(store.isAdminOrManager).toBe(true);

    store.role = "Manager";
    expect(store.isAdminOrManager).toBe(true);

    store.role = "Member";
    expect(store.isAdminOrManager).toBe(false);
  });
});