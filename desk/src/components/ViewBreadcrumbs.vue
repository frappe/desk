<template>
  <div class="flex items-center">
    <router-link
      :to="{ name: routeName }"
      class="px-0.5 py-1 text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 text-ink-gray-5 hover:text-ink-gray-7"
    >
      {{ label }}
    </router-link>
    <span class="mx-0.5 text-base text-ink-gray-4" aria-hidden="true"> / </span>
    <Dropdown :options="options">
      <template #default="{ open }">
        <Button
          variant="ghost"
          class="text-lg font-medium text-nowrap"
          :label="currentView.label"
        >
          <template #prefix>
            <Icon :icon="currentView.icon" class="h-4" />
          </template>
          <template #suffix>
            <FeatherIcon
              :name="open ? 'chevron-up' : 'chevron-down'"
              class="h-4 text-ink-gray-8"
            />
          </template>
        </Button>
      </template>
      <template #body></template>
    </Dropdown>
  </div>
</template>

<script setup>
import { Dropdown } from "frappe-ui";
import { Icon } from "@iconify/vue";
const props = defineProps({
  routeName: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  currentView: {
    type: Object,
    required: true,
  },
});
</script>
