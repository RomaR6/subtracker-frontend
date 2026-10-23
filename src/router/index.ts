import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import AppLayout from "../layouts/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { guestOnly: true }
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { guestOnly: true }
    },
    {
      path: "/accept-invite",
      name: "accept-invite",
      component: () => import("../views/AcceptInviteView.vue")
    },
    {
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: { name: "dashboard" }
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("../views/DashboardView.vue")
        },
        {
          path: "subscriptions",
          name: "subscriptions",
          component: () => import("../views/SubscriptionsView.vue")
        },
        {
          path: "requests",
          name: "requests",
          component: () => import("../views/RequestsView.vue")
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("../views/AnalyticsView.vue")
        },
        {
          path: "team",
          name: "team",
          component: () => import("../views/TeamView.vue")
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("../views/SettingsView.vue")
        },
        {
          path: "admin/workspaces",
          name: "admin-workspaces",
          component: () => import("../views/AdminWorkspacesView.vue"),
          meta: { superadminOnly: true }
        },
        {
          path: "admin/audit-logs",
          name: "admin-audit-logs",
          component: () => import("../views/AdminAuditLogsView.vue"),
          meta: { superadminOnly: true }
        }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/dashboard"
    }
  ]
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser();
  }

  const isAuth = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: "login" });
  }

  if (to.meta.guestOnly && isAuth) {
    return next({ name: "dashboard" });
  }

  if (to.meta.superadminOnly && !authStore.isSuperadmin) {
    return next({ name: "dashboard" });
  }

  next();
});

export default router;