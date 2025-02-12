import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { isCustomerPortal } from "@/utils";
import { useScreenSize } from "@/composables/screen";
const { isMobileView } = useScreenSize();

export const CUSTOMER_PORTAL_NEW_TICKET = "TicketNew";
export const CUSTOMER_PORTAL_TICKET = "TicketCustomer";

export const AGENT_PORTAL_AGENT_LIST = "AgentList";
export const AGENT_PORTAL_CONTACT_LIST = "ContactList";
export const AGENT_PORTAL_CUSTOMER_LIST = "CustomerList";
export const AGENT_PORTAL_ESCALATION_RULE_LIST = "EscalationRules";
export const AGENT_PORTAL_TEAM_LIST = "Teams";
export const AGENT_PORTAL_TEAM_SINGLE = "Team";
export const AGENT_PORTAL_TICKET = "TicketAgent";
export const AGENT_PORTAL_TICKET_LIST = "TicketsAgent";
export const AGENT_PORTAL_KNOWLEDGE_BASE = "DeskKBHome";
export const AGENT_PORTAL_KNOWLEDGE_BASE_CATEGORY = "DeskKBCategory";
export const AGENT_PORTAL_KNOWLEDGE_BASE_ARTICLE = "DeskKBArticle";

export const KB_PUBLIC_ARTICLE = "KBArticlePublic";
export const KB_PUBLIC_CATEGORY = "KBCategoryPublic";

export const CUSTOMER_PORTAL_LANDING = "TicketsCustomer";
export const AGENT_PORTAL_LANDING = AGENT_PORTAL_TICKET_LIST;
export const REDIRECT_PAGE = "/login?redirect-to=/helpdesk";

export const CUSTOMER_PORTAL_ROUTES = [
  "TicketsCustomer",
  "TicketNew",
  "TicketCustomer",
];

// type the meta fields
declare module "vue-router" {
  interface RouteMeta {
    auth?: boolean;
    agent?: boolean;
    admin?: boolean;
    public?: boolean;
    onSuccessRoute?: string;
    parent?: string;
  }
}

const routes = [
  {
    path: "",
    component: () => import("@/pages/HRoot.vue"),
  },
  // Customer portal routing
  {
    path: "",
    name: "CustomerRoot",
    // component: () => import("@/pages/CLayout.vue"), // old customer portal
    component: () => import("@/pages/CustomerPortalRoot.vue"),
    meta: {
      auth: true,
      public: true,
    },
    children: [
      // handle tickets routing
      {
        path: "my-tickets",
        children: [
          {
            path: "",
            name: "TicketsCustomer",
            component: () => import("@/pages/ticket/Tickets.vue"),
          },
          {
            path: "new/:templateId?",
            name: "TicketNew",
            component: () => import("@/pages/ticket/TicketNew.vue"),
            props: true,
            meta: {
              onSuccessRoute: "TicketCustomer",
              parent: "TicketsCustomer",
            },
          },
          {
            path: ":ticketId",
            name: "TicketCustomer",
            component: () => import("@/pages/ticket/TicketCustomer.vue"),
            props: true,
          },
        ],
      },
      {
        path: "kb-public",
        name: "CustomerKnowledgeBase",
        component: () =>
          import("@/pages/knowledge-base/KnowledgeBaseCustomer.vue"),
      },
      {
        path: "kb-public/:categoryId",
        name: "Articles",
        component: () => import("@/pages/knowledge-base/Articles.vue"),
        props: true,
      },
      {
        path: "kb-public/articles/:articleId",
        name: "ArticlePublic",
        component: () => import("@/pages/knowledge-base/Article.vue"),
        props: true,
      },
    ],
  },
  // Agent Portal Routing
  {
    path: "",
    name: "AgentRoot",
    component: () => import("@/pages/desk/AgentRoot.vue"),
    meta: {
      auth: true,
      agent: true,
      admin: false,
      public: false,
    },
    children: [
      {
        path: "tickets",
        name: AGENT_PORTAL_TICKET_LIST,
        component: () => import("@/pages/ticket/Tickets.vue"),
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/pages/MobileNotifications.vue"),
      },
      {
        path: "tickets/new/:templateId?",
        name: "TicketAgentNew",
        component: () => import("@/pages/ticket/TicketNew.vue"),
        props: true,
        meta: {
          onSuccessRoute: "TicketAgent",
          parent: "TicketsAgent",
        },
      },
      {
        path: "tickets/:ticketId",
        name: "TicketAgent",
        component: () =>
          import(`@/pages/ticket/${handleMobileView("TicketAgent")}.vue`),
        props: true,
      },
      {
        path: "kb",
        name: "AgentKnowledgeBase",
        component: () =>
          import("@/pages/knowledge-base/KnowledgeBaseAgent.vue"),
      },
      {
        path: "kb/articles/:articleId",
        name: "Article",
        component: () => import("@/pages/knowledge-base/Article.vue"),
        props: true,
      },
      {
        path: "articles/new/:id",
        name: "NewArticle",
        component: () => import("@/pages/knowledge-base/NewArticle.vue"),
        props: true,
      },
      {
        path: "customers",
        name: AGENT_PORTAL_CUSTOMER_LIST,
        component: () => import("@/pages/desk/customer/Customers.vue"),
      },
      {
        path: "contacts",
        name: AGENT_PORTAL_CONTACT_LIST,
        component: () => import("@/pages/desk/contact/Contacts.vue"),
      },
      {
        path: "agents",
        name: AGENT_PORTAL_AGENT_LIST,
        component: () => import("@/pages/desk/agent/Agents.vue"),
      },
      {
        path: "teams",
        name: AGENT_PORTAL_TEAM_LIST,
        component: () => import("@/pages/desk/team/Teams.vue"),
      },
      {
        path: "teams/:teamId",
        name: AGENT_PORTAL_TEAM_SINGLE,
        component: () => import("@/pages/desk/team/TeamSingle.vue"),
        props: true,
      },
      {
        path: "canned-responses",
        name: "CannedResponses",
        component: () => import("@/pages/CannedResponses.vue"),
      },
    ],
  },
  // Additonal routes
  {
    path: "/:pathMatch(.*)*",
    name: "Invalid Page",
    component: () => import("@/pages/InvalidPage.vue"),
  },
];

const handleMobileView = (componentName) => {
  return isMobileView.value ? `Mobile${componentName}` : componentName;
};

export const router = createRouter({
  history: createWebHistory("/helpdesk/"),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();
  isCustomerPortal.value = to.meta.public;
  if (authStore.isLoggedIn) {
    await authStore.init();
  }

  if (!authStore.isLoggedIn) {
    window.location.href = REDIRECT_PAGE;
  } else {
    next();
  }
});

router.afterEach(async (to) => {
  if (to.meta.public) return;
  const userStore = useUserStore();
  await userStore.users.fetch();
});
