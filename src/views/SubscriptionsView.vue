<template>
  <div class="catalog-page">
    <div class="page-title-row">
      <div class="title-text">
        <h1>Каталог корпоративних підписок та ліцензій</h1>
        <p>Централізований реєстр регулярних сервісів, платіжних графіків та закріплених спеціалістів</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportCsv">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Експорт звіту (CSV)</span>
        </button>
      </div>
    </div>

    <div class="summary-strip">
      <div class="summary-box">
        <div>
          <div class="summary-label">Всього в реєстрі</div>
          <div class="summary-val">{{ store.summary.total_subscriptions }} активів</div>
        </div>
        <div class="summary-pill" style="background: #f5f5f4; color: #44403c;">100%</div>
      </div>
      <div class="summary-box">
        <div>
          <div class="summary-label">Загальний щомісячний бюджет</div>
          <div class="summary-val">₴{{ store.summary.monthly_budget_uah.toLocaleString() }}</div>
        </div>
        <div class="summary-pill" style="background: #ffe4e6; color: #9f1239;">${{ store.summary.monthly_budget_usd.toFixed(2) }}</div>
      </div>
      <div class="summary-box">
        <div>
          <div class="summary-label">Активні ліцензії</div>
          <div class="summary-val">{{ store.summary.active_subscriptions }} підписки</div>
        </div>
        <div class="summary-pill" style="background: #ecfdf5; color: #047857;">85.7%</div>
      </div>
      <div class="summary-box">
        <div>
          <div class="summary-label">Найближчі оплати (7 днів)</div>
          <div class="summary-val">{{ store.summary.upcoming_payments_count }} рахунки</div>
        </div>
        <div class="summary-pill" style="background: #fef3c7; color: #b45309;">$1,020.00</div>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-input-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
        <input v-model="searchQuery" @input="onSearch" type="text" placeholder="Пошук за назвою сервісу, вендором або спеціалістом...">
      </div>

      <div class="filter-dropdowns">
        <div class="filter-select">
          <span>Категорія: Усі (6)</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="filter-select">
          <span>Період: Щомісячно</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="filter-select">
          <span>Статус: Усі активні</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>

    <div class="catalog-card">
      <div class="table-container">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>Сервіс / Вендор</th>
              <th>Категорія</th>
              <th>Відповідальний</th>
              <th>Періодичність</th>
              <th>Тарифна ставка</th>
              <th>Наступне списання</th>
              <th>Статус</th>
              <th style="text-align: right;">Дії</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredList" :key="item.id">
              <td>
                <div class="service-cell">
                  <div class="service-icon-box">{{ item.name.slice(0, 2).toUpperCase() }}</div>
                  <div class="service-details">
                    <span class="service-title">{{ item.name }}</span>
                    <span class="service-desc">{{ item.description || 'Корпоративна ліцензія' }}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge-cat">{{ item.category }}</span></td>
              <td>
                <div class="owner-info">
                  <span class="owner-name">{{ item.owner_name }}</span>
                  <span class="owner-dept">{{ item.owner_department || 'General' }}</span>
                </div>
              </td>
              <td>{{ item.billing_period === 'monthly' ? 'Щомісячно' : 'Щорічно' }}</td>
              <td>
                <div class="cost-dual">
                  <span class="cost-main">${{ item.cost_usd.toFixed(2) }}</span>
                  <span class="cost-secondary">₴{{ item.cost_uah.toLocaleString() }}</span>
                </div>
              </td>
              <td>
                <div class="date-badge-wrap">
                  <span class="date-exact">{{ item.next_payment_date }}</span>
                  <span class="date-countdown">Згідно плану</span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', item.status === 'active' ? 'status-active' : 'status-review']">
                  ● {{ item.status === 'active' ? 'Активна' : 'На розгляді' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action-icon" title="Редагувати">✎</button>
                  <button class="btn-action-icon" title="Історія рахунків">📄</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-pagination">
        <span>Показано 1–{{ filteredList.length }} із {{ store.subscriptions.length }} корпоративних підписок</span>
        <div class="page-numbers">
          <div class="page-btn active">1</div>
          <div class="page-btn">2</div>
          <div class="page-btn">3</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const store = useSubscriptionStore()
const searchQuery = ref('')

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return store.subscriptions
  const q = searchQuery.value.toLowerCase()
  return store.subscriptions.filter(
    s => s.name.toLowerCase().includes(q) || s.owner_name.toLowerCase().includes(q)
  )
})

function onSearch() {
  store.fetchSubscriptions(searchQuery.value)
}

function exportCsv() {
  const headers = 'ID,Name,Category,Owner,Period,CostUSD,CostUAH,NextPayment,Status\n'
  const rows = store.subscriptions.map(s => 
    `${s.id},"${s.name}","${s.category}","${s.owner_name}",${s.billing_period},${s.cost_usd},${s.cost_uah},${s.next_payment_date},${s.status}`
  ).join('\n')
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'subtracker_subscriptions.csv')
  link.click()
}
</script>

<style scoped>
.catalog-page {
  padding: 28px 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.title-text h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 4px;
}

.title-text p {
  font-size: 13px;
  color: #78716c;
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid #d6d3d1;
  padding: 7px 14px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: #44403c;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-box {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  font-size: 12px;
  color: #78716c;
  font-weight: 500;
  margin-bottom: 4px;
}

.summary-val {
  font-size: 18px;
  font-weight: 700;
  color: #1c1917;
}

.summary-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.filters-bar {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #faf8f5;
  border: 1px solid #e7e5e4;
  border-radius: 7px;
  padding: 8px 14px;
  flex-grow: 1;
  max-width: 420px;
}

.search-input-wrap input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: #1c1917;
  width: 100%;
}

.filter-dropdowns {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #44403c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.catalog-card {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.catalog-table th {
  background: #faf8f5;
  color: #78716c;
  font-weight: 600;
  padding: 12px 18px;
  border-bottom: 1px solid #e7e5e4;
  white-space: nowrap;
}

.catalog-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f5f5f4;
  vertical-align: middle;
}

.service-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #881337;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 11.5px;
  flex-shrink: 0;
}

.service-details {
  display: flex;
  flex-direction: column;
}

.service-title {
  font-size: 13px;
  font-weight: 700;
  color: #1c1917;
}

.service-desc {
  font-size: 11px;
  color: #78716c;
}

.badge-cat {
  background: #faf8f5;
  border: 1px solid #e7e5e4;
  color: #44403c;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.owner-info {
  display: flex;
  flex-direction: column;
}

.owner-name {
  font-weight: 600;
  color: #1c1917;
}

.owner-dept {
  font-size: 11px;
  color: #78716c;
}

.cost-dual {
  display: flex;
  flex-direction: column;
}

.cost-main {
  font-weight: 700;
  color: #1c1917;
  font-size: 13px;
}

.cost-secondary {
  font-size: 11px;
  color: #78716c;
}

.date-badge-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date-exact {
  font-weight: 500;
  color: #44403c;
}

.date-countdown {
  font-size: 10.5px;
  font-weight: 700;
  color: #c2410c;
}

.status-badge {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-active { background: #ecfdf5; color: #047857; }
.status-review { background: #fef3c7; color: #b45309; }

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-action-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e7e5e4;
  background: #faf8f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #78716c;
  cursor: pointer;
}

.table-pagination {
  padding: 12px 20px;
  background: #ffffff;
  border-top: 1px solid #e7e5e4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #78716c;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e7e5e4;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #44403c;
  cursor: pointer;
}

.page-btn.active {
  background: #881337;
  color: #ffffff;
  border-color: #881337;
}
</style>
