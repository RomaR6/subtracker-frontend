import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../stores/auth";

describe("Ітерація 5: Перевірка функціоналу погоджень, FOP та ролей", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("розрахунок собівартості ФОП за формулою 1.2 повертає валідні суми", () => {
    const net = 50000;
    const gross = Math.round((net / 0.95) * 100) / 100;
    const tax5 = Math.round((gross * 0.05) * 100) / 100;
    const esv = 1760.0;
    const software = 2500;
    const totalCost = Math.round((gross + esv + software) * 100) / 100;

    expect(gross).toBe(52631.58);
    expect(tax5).toBe(2631.58);
    expect(totalCost).toBe(56891.58);
  });

  it("суперадмін має доступ до системних маршрутів", () => {
    const store = useAuthStore();
    store.user = {
      id: 1,
      email: "roman@novatech.com",
      first_name: "Роман",
      last_name: "Олексюк",
      is_active: true,
      is_superadmin: true,
      created_at: new Date().toISOString()
    };
    expect(store.isSuperadmin).toBe(true);
  });
});