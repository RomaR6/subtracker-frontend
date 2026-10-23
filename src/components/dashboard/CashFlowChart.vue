<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{
  points: Array<{
    month_name: string;
    year: number;
    total_uah: number;
    total_usd: number;
    is_projected: boolean;
  }>;
  currency: "UAH" | "USD";
}>();

const chartData = computed(() => {
  const labels = props.points.map((p) => p.month_name);
  const dataValues = props.points.map((p) =>
    props.currency === "UAH" ? p.total_uah : p.total_usd
  );
  const backgroundColors = props.points.map((p) =>
    p.is_projected ? "rgba(245, 158, 11, 0.45)" : "#881337"
  );
  const borderColors = props.points.map((p) =>
    p.is_projected ? "#D97706" : "#881337"
  );

  return {
    labels,
    datasets: [
      {
        label: props.currency === "UAH" ? "Витрати (UAH ₴)" : "Витрати (USD $)",
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: props.points.map((p) => (p.is_projected ? 2 : 0)),
        borderDash: props.points.map((p) => (p.is_projected ? [4, 4] : [])),
        borderRadius: 6,
        data: dataValues
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const val = context.raw || 0;
          return props.currency === "UAH"
            ? ` ${Number(val).toLocaleString("uk-UA")} ₴`
            : ` $${Number(val).toLocaleString("en-US")}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11, family: "sans-serif" }, color: "#78716C" }
    },
    y: {
      grid: { color: "#F5F5F4" },
      ticks: {
        font: { size: 10, family: "sans-serif" },
        color: "#78716C",
        callback: (val: any) =>
          props.currency === "UAH"
            ? `${Math.round(val / 1000)}k ₴`
            : `$${Math.round(val / 1000)}k`
      }
    }
  }
}));
</script>

<template>
  <div class="h-64 w-full">
    <Bar v-if="points && points.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-xs text-[#78716C]">
      Завантаження аналітичних даних Cash Flow...
    </div>
  </div>
</template>