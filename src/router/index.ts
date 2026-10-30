import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import AppLayout from "../layouts/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("../views/LandingView.vue")
    },
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
      path: "/reset-password",
      name: "reset-password",
      component: () => import("../views/ResetPasswordView.vue")
    },
    {
      path: "/accept-invite",
      name: "accept-invite",
      component: () => import("../views/AcceptInviteView.vue")
    },
    {
      path: "/app",
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
          path: "profile",
          name: "profile",
          component: () => import("../views/ProfileView.vue")
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
      path: "/dashboard",
      redirect: "/app/dashboard"
    },
    {
      path: "/subscriptions",
      redirect: "/app/subscriptions"
    },
    {
      path: "/requests",
      redirect: "/app/requests"
    },
    {
      path: "/analytics",
      redirect: "/app/analytics"
    },
    {
      path: "/team",
      redirect: "/app/team"
    },
    {
      path: "/settings",
      redirect: "/app/settings"
    },
    {
      path: "/profile",
      redirect: "/app/profile"
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/"
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser();
  }

  const isAuth = authStore.isAuthenticated;

  if (to.path === "/" && isAuth) {
    return { name: "dashboard" };
  }

  if (to.meta.requiresAuth && !isAuth) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && isAuth) {
    return { name: "dashboard" };
  }

  if (to.meta.superadminOnly && !authStore.isSuperadmin) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;