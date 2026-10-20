<template>
  <div class="dashboard-page">
    <div class="dash-header">
      <div class="dash-title">
        <h1>Зведена аналітика та фінансовий моніторинг</h1>
        <p>Оперативний огляд витрат робочого простору за жовтень 2026 року</p>
      </div>
      <div class="dash-date-picker">
        <span>Поточний місяць: Жовтень 2026 ▼</span>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">Місячні витрати</span>
          <span class="kpi-icon-pill" style="background: #ffe4e6; color: #9f1239;">₴</span>
        </div>
        <div class="kpi-value">₴{{ store.summary.monthly_budget_uah.toLocaleString() }}</div>
        <div class="kpi-sub positive">+4.2% порівняно з вереснем ($3,440)</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">Активні ліцензії</span>
          <span class="kpi-icon-pill" style="background: #fef3c7; color: #b45309;">28</span>
        </div>
        <div class="kpi-value">28 сервісів</div>
        <div class="kpi-sub" style="color: #047857;">100% закріплено за командою</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">Заявки на розгляд</span>
          <span class="kpi-icon-pill" style="background: #ffedd5; color: #c2410c;">3</span>
        </div>
        <div class="kpi-value">3 очікують</div>
        <div class="kpi-sub" style="color: #b45309;">₴18,500 бюджет нових запитів</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-label">Середній чек / спеціаліст</span>
          <span class="kpi-icon-pill" style="background: #f5f5f4; color: #78716c;">👤</span>
        </div>
        <div class="kpi-value">₴5,100 / міс</div>
        <div class="kpi-sub" style="color: #78716c;">Штат команди: 28 інженерів</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-box">
        <div class="box-head">
          <h3>Динаміка витрат та прогноз (Cash Flow)</h3>
          <span class="box-tag">UAH / Останні 6 місяців</span>
        </div>
        <div class="bars-container">
          <div class="bar-col"><div class="bar-fill" style="height: 60%;"></div><span>Травень</span></div>
          <div class="bar-col"><div class="bar-fill" style="height: 70%;"></div><span>Червень</span></div>
          <div class="bar-col"><div class="bar-fill" style="height: 78%;"></div><span>Липень</span></div>
          <div class="bar-col"><div class="bar-fill" style="height: 85%;"></div><span>Серпень</span></div>
          <div class="bar-col"><div class="bar-fill" style="height: 92%;"></div><span>Вересень</span></div>
          <div class="bar-col"><div class="bar-fill active-bar" style="height: 100%;"></div><span class="active-txt">Жовтень</span></div>
          <div class="bar-col"><div class="bar-fill forecast-bar" style="height: 80%;"></div><span>Листопад *</span></div>
        </div>
      </div>

      <div class="upcoming-box">
        <div class="box-head">
          <h3>Найближчі списання</h3>
          <span class="box-tag">Наступні 14 днів</span>
        </div>
        <div class="upcoming-list">
          <div class="upcoming-item">
            <div class="up-icon" style="background: #ff9900; color: #000;">AWS</div>
            <div class="up-meta">
              <strong>AWS Cloud Infrastructure</strong>
              <span>Хостинг та Сервери</span>
            </div>
            <div class="up-cost">
              <strong>$840.00</strong>
              <span style="color: #c2410c;">Через 3 дні</span>
            </div>
          </div>

          <div class="upcoming-item">
            <div class="up-icon" style="background: #0acf83; color: #fff;">F</div>
            <div class="up-meta">
              <strong>Figma Organization</strong>
              <span>UI/UX Дизайн</span>
            </div>
            <div class="up-cost">
              <strong>$180.00</strong>
              <span style="color: #c2410c;">Через 5 днів</span>
            </div>
          </div>

          <div class="upcoming-item">
            <div class="up-icon" style="background: #1c1917; color: #fff;">JB</div>
            <div class="up-meta">
              <strong>JetBrains All Products</strong>
              <span>DevTools</span>
            </div>
            <div class="up-cost">
              <strong>$249.00</strong>
              <span style="color: #c2410c;">Через 9 днів</span>
            </div>
          </div>

          <div class="upcoming-item">
            <div class="up-icon" style="background: #4a154b; color: #fff;">S</div>
            <div class="up-meta">
              <strong>Slack Business+</strong>
              <span>Комунікація</span>
            </div>
            <div class="up-cost">
              <strong>$150.00</strong>
              <span style="color: #78716c;">Через 12 днів</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="top-services-card">
      <div class="box-head">
        <h3>Реєстр ключових цифрових активів</h3>
        <span class="box-tag">Топ-4 за обсягом бюджету</span>
      </div>
      <table class="dash-table">
        <thead>
          <tr>
            <th>Назва сервісу</th>
            <th>Категорія витрат</th>
            <th>Відповідальний</th>
            <th>Періодичність</th>
            <th>Тарифна вартість</th>
            <th>Статус ліцензії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.subscriptions.slice(0, 4)" :key="item.id">
            <td><strong>{{ item.name }}</strong></td>
            <td><span class="badge">{{ item.category }}</span></td>
            <td>{{ item.owner_name }}</td>
            <td>{{ item.billing_period === 'monthly' ? 'Щомісячно' : 'Щорічно' }}</td>
            <td><strong>${{ item.cost_usd.toFixed(2) }}</strong> (₴{{ item.cost_uah.toLocaleString() }})</td>
            <td>
              <span :class="['badge-status', item.status]">
                {{ item.status === 'active' ? 'Активна' : 'На розгляді' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionStore } from '../stores/subscriptionStore'

const store = useSubscriptionStore()
</script>

<style scoped>
.dashboard-page {
  padding: 28px 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.dash-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 4px;
}

.dash-title p {
  font-size: 13px;
  color: #78716c;
}

.dash-date-picker {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  padding: 7px 14px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #44403c;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 12.5px;
  color: #78716c;
  font-weight: 500;
}

.kpi-icon-pill {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: #1c1917;
}

.kpi-sub {
  font-size: 11px;
  font-weight: 600;
}

.positive {
  color: #9f1239;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-box, .upcoming-box, .top-services-card {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 20px;
}

.box-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.box-head h3 {
  font-size: 14.5px;
  font-weight: 700;
  color: #1c1917;
}

.box-tag {
  font-size: 11px;
  background: #faf8f5;
  border: 1px solid #e7e5e4;
  padding: 4px 8px;
  border-radius: 6px;
  color: #78716c;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 180px;
  padding-bottom: 8px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
  width: 48px;
}

.bar-col span {
  font-size: 11px;
  color: #78716c;
}

.bar-fill {
  width: 32px;
  background: #9f1239;
  border-radius: 4px;
}

.active-bar {
  background: #881337;
}

.active-txt {
  font-weight: 700;
  color: #881337 !important;
}

.forecast-bar {
  background: #fde68a;
  border: 1px dashed #d97706;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: #faf8f5;
  border-radius: 8px;
}

.up-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 10px;
}

.up-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.up-meta strong {
  font-size: 12px;
  color: #1c1917;
}

.up-meta span {
  font-size: 10.5px;
  color: #78716c;
}

.up-cost {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.up-cost strong {
  font-size: 12.5px;
  color: #1c1917;
}

.up-cost span {
  font-size: 10.5px;
  font-weight: 600;
}

.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.dash-table th {
  text-align: left;
  padding: 10px 14px;
  background: #faf8f5;
  color: #78716c;
  font-weight: 600;
  border-bottom: 1px solid #e7e5e4;
}

.dash-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f5f5f4;
}

.badge {
  background: #faf8f5;
  border: 1px solid #e7e5e4;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
}

.badge-status {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.badge-status.active {
  background: #ecfdf5;
  color: #047857;
}

.badge-status.review {
  background: #fef3c7;
  color: #b45309;
}
</style>
