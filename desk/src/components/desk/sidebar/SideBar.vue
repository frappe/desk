<template>
  <div
    class="z-0 flex select-none flex-col border-r border-gray-200 bg-gray-50 p-2 text-base duration-300 ease-in-out"
    :style="{
      'min-width': width,
      'max-width': width,
    }"
  >
    <UserMenu class="mb-2 ml-0.5" :options="profileSettings" />
    <SidebarLink
      label="Search"
      class="mb-1"
      :icon="LucideSearch"
      :on-click="() => openCommandPalette()"
      :is-expanded="isExpanded"
    >
      <template #right>
        <span class="flex items-center gap-0.5 font-medium text-gray-600">
          <component :is="device.modifierIcon" class="h-3 w-3" />
          <span>K</span>
        </span>
      </template>
    </SidebarLink>
    <span class="mb-4">
      <div
        v-if="notificationStore.unread"
        class="absolute z-20 h-1.5 w-1.5 translate-x-6 translate-y-1 rounded-full bg-gray-800"
        theme="gray"
        variant="solid"
      />
      <SidebarLink
        class="relative"
        label="Notifications"
        :icon="LucideInbox"
        :on-click="() => notificationStore.toggle()"
        :is-expanded="isExpanded"
      >
        <template #right>
          <Badge
            v-if="isExpanded && notificationStore.unread"
            :label="notificationStore.unread"
            theme="gray"
            variant="subtle"
          />
        </template>
      </SidebarLink>
    </span>
    <div class="mb-4 flex flex-col gap-1">
      <SidebarLink
        v-for="option in menuOptions"
        v-bind="option"
        :key="option.label"
        :is-expanded="isExpanded"
        :is-active="option.to?.includes(route.name.toString())"
      />
    </div>
    <div class="grow" />
    <!-- onboarding circle  -->
    <div class="flex cursor-pointer items-center gap-2" @click="openSidePanel">
      <CircularProgressBar
        :step="step"
        :total-steps="totalSteps"
        :is-outer-circle-filled-on-complete="false"
        :class="{
          'w-full ': isExpanded,
          'w-8 shrink-0': !isExpanded,
        }"
        :ring-size="'2rem'"
        :ring-bar-width="'10px'"
      />
      <div
        class="duration-400 text-sm text-gray-600 ease-in-out"
        :class="{
          'opacity-100': isExpanded,
          'opacity-0 -z-50 ': !isExpanded,
        }"
      >
        {{ step }}/{{ totalSteps }} steps completed
      </div>
    </div>

    <SidebarLink
      :icon="isExpanded ? LucideArrowLeftFromLine : LucideArrowRightFromLine"
      :is-active="false"
      :is-expanded="isExpanded"
      :label="isExpanded ? 'Collapse' : 'Expand'"
      :on-click="() => (isExpanded = !isExpanded)"
    />
    <SettingsModal v-if="authStore.isAdmin" v-model="showSettingsModal" />
  </div>
  <!-- side panel -->
  <div v-if="showOnboardingDialog">
    <OnboardingDialog v-model="showOnboardingDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useSidebarStore } from "@/stores/sidebar";
import {
  AGENT_PORTAL_AGENT_LIST,
  AGENT_PORTAL_CONTACT_LIST,
  AGENT_PORTAL_CUSTOMER_LIST,
  AGENT_PORTAL_TEAM_LIST,
  AGENT_PORTAL_TICKET_LIST,
  CUSTOMER_PORTAL_LANDING,
} from "@/router";
import { useDevice } from "@/composables";
import { SidebarLink } from "@/components";
import { CircularProgressBar } from "@/components";
import UserMenu from "./UserMenu.vue";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog.vue";
import LucideArrowLeftFromLine from "~icons/lucide/arrow-left-from-line";
import LucideArrowRightFromLine from "~icons/lucide/arrow-right-from-line";
import LucideBookOpen from "~icons/lucide/book-open";
import LucideCloudLightning from "~icons/lucide/cloud-lightning";
import LucideContact2 from "~icons/lucide/contact-2";
import LucideInbox from "~icons/lucide/inbox";
import LucideTicket from "~icons/lucide/ticket";
import LucideUser from "~icons/lucide/user";
import LucideUserCircle2 from "~icons/lucide/user-circle-2";
import LucideUsers from "~icons/lucide/users";
import LucideSearch from "~icons/lucide/search";
import SettingsModal from "@/components/Settings/SettingsModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { isExpanded, width } = storeToRefs(useSidebarStore());
const device = useDevice();
const showSettingsModal = ref(false);

const menuOptions = computed(() => [
  {
    label: "Tickets",
    icon: LucideTicket,
    to: AGENT_PORTAL_TICKET_LIST,
  },
  {
    label: "Agents",
    icon: LucideUser,
    to: AGENT_PORTAL_AGENT_LIST,
  },
  {
    label: "Knowledge base",
    icon: LucideBookOpen,
    to: "DeskKBHome",
  },
  {
    label: "Teams",
    icon: LucideUsers,
    to: AGENT_PORTAL_TEAM_LIST,
  },
  {
    label: "Canned responses",
    icon: LucideCloudLightning,
    to: "CannedResponses",
  },
  {
    label: "Customers",
    icon: LucideUserCircle2,
    to: AGENT_PORTAL_CUSTOMER_LIST,
  },
  {
    label: "Contacts",
    icon: LucideContact2,
    to: AGENT_PORTAL_CONTACT_LIST,
  },
]);

const step = ref(3);
const totalSteps = ref(10);

const showOnboardingDialog = ref(false);
function openSidePanel() {
  showOnboardingDialog.value = !showOnboardingDialog.value;
}

const profileSettings = [
  {
    icon: "corner-up-left",
    label: "Switch to Desk",
    onClick: () => window.open("/app"),
  },
  {
    label: "Customer portal",
    icon: "users",
    onClick: () => {
      const path = router.resolve({ name: CUSTOMER_PORTAL_LANDING });
      window.open(path.href);
    },
  },
  {
    icon: "life-buoy",
    label: "Support",
    onClick: () => window.open("https://t.me/frappedesk"),
  },
  {
    icon: "book-open",
    label: "Docs",
    onClick: () => window.open("https://docs.frappe.io/helpdesk"),
  },
  {
    label: "Settings",
    icon: "settings",
    onClick: () => (showSettingsModal.value = true),
    condition: () => authStore.isAdmin,
  },
  {
    label: "Log out",
    icon: "log-out",
    onClick: () => authStore.logout(),
  },
];

function openCommandPalette() {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true })
  );
}
</script>
