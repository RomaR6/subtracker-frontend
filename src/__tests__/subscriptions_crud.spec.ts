import { describe, it, expect } from "vitest";

describe("Ітерація 4: Перевірка логіки каталогу підписок та конвертації", () => {
  const sampleSubscriptions = [
    { id: 1, name: "AWS", category: "Infrastructure", cost_usd: 840, status: "active", days_until_payment: 3 },
    { id: 2, name: "Figma", category: "Design", cost_usd: 180, status: "active", days_until_payment: 12 },
    { id: 3, name: "Zoom", category: "Communication", cost_usd: 50, status: "inactive", days_until_payment: 25 }
  ];

  it("фільтрація за категорією повертає лише відповідні записи", () => {
    const infraOnly = sampleSubscriptions.filter((s) => s.category === "Infrastructure");
    expect(infraOnly).toHaveLength(1);
    expect(infraOnly[0].name).toBe("AWS");
  });

  it("фільтрація за статусом коректно відокремлює активні підписки", () => {
    const active = sampleSubscriptions.filter((s) => s.status === "active");
    expect(active).toHaveLength(2);
  });

  it("підрахунок суми витрат у гривнях коректно множиться на курс НБУ", () => {
    const rate = 45.05;
    const totalUsd = sampleSubscriptions.reduce((acc, curr) => acc + curr.cost_usd, 0);
    const totalUah = Math.round(totalUsd * rate);
    expect(totalUsd).toBe(1070);
    expect(totalUah).toBe(48204);
  });
});