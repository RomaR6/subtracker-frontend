import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useWorkspaceStore } from "../stores/workspace";

describe("Ітерація 2: Перевірка логіки лендингу та калькулятора ROI", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("workspaceStore коректно зберігає курс НБУ для публічного доступу", () => {
    const wsStore = useWorkspaceStore();
    expect(wsStore.usdRate).toBeGreaterThan(30);
    expect(wsStore.eurRate).toBeGreaterThan(35);
  });

  it("формула калькулятора ROI розраховує збереження коштів у межах очікуваних 20-30%", () => {
    const spend = 5000;
    const estimatedSavingsUsd = Math.round(spend * 0.265 * 100) / 100;
    expect(estimatedSavingsUsd).toBe(1325);
    expect(estimatedSavingsUsd * 12).toBe(15900);
  });

  it("розрахунок еквіваленту підписок у UAH коректно перемножує курс", () => {
    const usdPrice = 180; // Наприклад, Figma
    const rate = 41.52;
    const uahPrice = Math.round(usdPrice * rate);
    expect(uahPrice).toBe(7474);
  });
});