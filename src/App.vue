<template>
  <div class="app-layout">
    <header class="top-header">
      <div class="header-main-row">
        <div class="header-left">
          <router-link to="/" class="brand-logo">
            <div class="brand-icon">S</div>
            <span>SubTracker B2B</span>
          </router-link>

          <div class="workspace-pill">
            <span class="ws-name">NovaTech IT Core</span>
            <span class="ws-tag">₴ UAH</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <div class="header-right">
          <div class="currency-pill">
            <span>НБУ: $1 = 41.52 ₴</span>
          </div>
          <button class="btn-primary" @click="$router.push('/subscriptions')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            <span>Додати підписку</span>
          </button>

          <div class="user-profile">
            <div class="user-avatar">RO</div>
            <div class="user-info">
              <span class="user-name">Роман Олексюк</span>
              <span class="user-role">Workspace Owner</span>
            </div>
          </div>
        </div>
      </div>

      <nav class="header-nav-row">
        <router-link to="/" class="nav-tab" active-class="active" exact>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Дашборд витрат</span>
        </router-link>
        <router-link to="/subscriptions" class="nav-tab" active-class="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Каталог підписок</span>
        </router-link>
        <div class="nav-tab disabled-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Центр погоджень</span>
          <span class="nav-badge">3</span>
        </div>
        <div class="nav-tab disabled-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
          <span>Фінансова аналітика</span>
        </div>
        <div class="nav-tab disabled-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>Команда та ролі</span>
        </div>
        <div class="nav-tab disabled-tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Налаштування</span>
        </div>
      </nav>
    </header>

    <main class="page-body">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSubscriptionStore } from './stores/subscriptionStore'

const store = useSubscriptionStore()

onMounted(() => {
  store.fetchSubscriptions()
  store.fetchSummary()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.top-header {
  background: #ffffff;
  border-bottom: 1px solid #e7e5e4;
  display: flex;
  flex-direction: column;
}

.header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 40px;
  border-bottom: 1px solid #f5f5f4;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 17px;
  color: #1c1917;
  text-decoration: none;
}

.brand-icon {
  width: 34px;
  height: 34px;
  background: #881337;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 16px;
}

.workspace-pill {
  background: #faf8f5;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ws-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #44403c;
}

.ws-tag {
  font-size: 10.5px;
  background: #f5f5f4;
  color: #78716c;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-pill {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
}

.btn-primary {
  background: #9f1239;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  border-left: 1px solid #e7e5e4;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: #f5f5f4;
  border: 1px solid #d6d3d1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #881337;
  font-size: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 12px;
  font-weight: 700;
  color: #1c1917;
}

.user-role {
  font-size: 10.5px;
  color: #c2410c;
  font-weight: 600;
}

.header-nav-row {
  display: flex;
  align-items: center;
  padding: 0 40px;
  gap: 32px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 13.5px;
  font-weight: 500;
  color: #78716c;
  position: relative;
  text-decoration: none;
  cursor: pointer;
}

.nav-tab.active {
  color: #9f1239;
  font-weight: 600;
}

.nav-tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: #9f1239;
  border-radius: 4px 4px 0 0;
}

.disabled-tab {
  cursor: default;
  opacity: 0.8;
}

.nav-badge {
  background: #d97706;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

.page-body {
  flex: 1;
}
</style>
