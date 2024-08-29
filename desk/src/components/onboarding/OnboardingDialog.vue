<template>
  <Dialog
    v-model="showOnboardingDialog"
    :options="{
      title: 'Help',
      size: 'lg',
    }"
  >
    <template #body-content>
      <!-- section 1 -->
      <div class="flex flex-1 flex-col gap-2 py-2.5">
        <!-- heading and button -->
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">Popular Topics</span>
          <Button
            theme="gray"
            variant="subtle"
            label="View All"
            icon-right="arrow-up-right"
            @click="openDocumentation"
          />
        </div>
        <!-- list of articles -->
        <div>
          <p v-for="i in 4" :key="i">Article {{ i }}</p>
        </div>
        <div />
      </div>
      <!-- section 2 -->
      <div class="flex flex-1 flex-col gap-2 py-2.5">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">Get Started</span>
          <Badge
            label="60% Progress"
            theme="green"
            variant="subtle"
            class="p-0.5"
          />
        </div>
        <!-- list of articles -->
        <ul>
          <OnboardingStep
            v-for="step in steps"
            :key="step.title"
            :title="step.title"
            :is-completed="step.isCompleted"
            :action="step.action"
          />
        </ul>
        <div />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ModelRef, reactive } from "vue";
import OnboardingStep from "./OnboardingStep.vue";
import { router } from "@/router";
const showOnboardingDialog: ModelRef<boolean> = defineModel();

function openDocumentation() {
  const URL = "https://docs.frappe.io/helpdesk";
  window.open(URL, "_blank");
}

const steps = reactive([
  {
    title: "Create a Ticket",
    action: () => {
      router.push({ name: "TicketAgentNew", query: { onboardingStep: 1 } });
      showOnboardingDialog.value = false;
    },
    isCompleted: false,
  },
  {
    title: "Create an Agent",
    action: () => {
      router.push({ name: "AgentList", query: { onboardingStep: 2, new: 1 } });
      showOnboardingDialog.value = false;
    },
    isCompleted: true,
  },
  {
    title: "Create a Ticket from Customer Portal",
    action: () => console.log("clicked 3"),
    isCompleted: true,
  },
  {
    title: "Setup Email Account",
    action: () => console.log("clicked 4"),
    isCompleted: false,
  },
]);
</script>

<style scoped></style>
