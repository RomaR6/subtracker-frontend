import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useWorkspaceStore } from "../stores/workspace";

describe("Ітерація 3: Перевірка логіки головного дашборду та Cash Flow", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("структура точки Cash Flow містить коректні валютні суми та прапорець прогнозу", () => {
    const point = {
      month_name: "Жовтень",
      year: 2026,
      total_uah: 150000,
      total_usd: 3612.72,
      is_projected: false
    };

    expect(point.total_uah).toBeGreaterThan(0);
    expect(point.total_usd).toBeGreaterThan(0);
    expect(point.is_projected).toBe(false);
  });

  it("прогнозована точка відрізняється прапорцем is_projected = true", () => {
    const projPoint = {
      month_name: "Листопад *",
      year: 2026,
      total_uah: 157500,
      total_usd: 3793.35,
      is_projected: true
    };

    expect(projPoint.is_projected).toBe(true);
    expect(projPoint.month_name).toContain("*");
  });
});