<template>
  <div>
    <LayoutHeader>
      <template #left-header>
        <ViewBreadcrumbs
          :options="dropdownOptions"
          :route-name="isCustomerPortal ? 'TicketsCustomer' : 'TicketsAgent'"
          label="Tickets"
          :current-view="currentView"
        />
      </template>
      <template #right-header>
        <RouterLink
          :to="{ name: isCustomerPortal ? 'TicketNew' : 'TicketAgentNew' }"
        >
          <Button label="Create" theme="gray" variant="solid">
            <template #prefix>
              <LucidePlus class="h-4 w-4" />
            </template>
          </Button>
        </RouterLink>
      </template>
    </LayoutHeader>
    <ListViewBuilder
      ref="listViewRef"
      :options="options"
      @empty-state-action="
        () =>
          $router.push({
            name: isCustomerPortal ? 'TicketNew' : 'TicketAgentNew',
          })
      "
      @row-click="
        (row) =>
          $router.push({
            name: isCustomerPortal ? 'TicketCustomer' : 'TicketAgent',
            params: { ticketId: row },
          })
      "
    />
    <ExportModal
      v-model="showExportModal"
      :rowCount="$refs.listViewRef?.list?.data?.total_count ?? 0"
      @update="
        ({ export_type, export_all }) => exportRows(export_type, export_all)
      "
    />
    <ViewModal
      v-if="viewDialog"
      v-model="viewDialog"
      @update="(view) => handleCreateView(view)"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from "vue";
import { Badge, Tooltip, confirmDialog, call, usePageMeta } from "frappe-ui";
import { IndicatorIcon } from "@/components/icons";
import { LayoutHeader, ListViewBuilder } from "@/components";
import ExportModal from "@/components/ticket/ExportModal.vue";
import ViewBreadcrumbs from "@/components/ViewBreadcrumbs.vue";
import ViewModal from "@/components/ViewModal.vue";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import { dayjs } from "@/dayjs";
import { createToast, isCustomerPortal } from "@/utils";
import { capture } from "@/telemetry";
import { TicketIcon } from "@/components/icons";
import useView from "@/composables/useView";
import { View } from "@/types";

const listViewRef = ref(null);
const showExportModal = ref(false);

const { textColorMap } = useTicketStatusStore();

const listSelections = ref(new Set());
const selectBannerActions = [
  {
    label: "Export",
    icon: "download",
    onClick: (selections: Set<string>) => {
      listSelections.value = new Set(selections);
      showExportModal.value = true;
    },
  },
  {
    label: "Delete",
    icon: "trash-2",
    onClick: (selections: Set<string>) => {
      listSelections.value = new Set(selections);
      confirmDialog({
        title: "Delete Ticket(s)?",
        message: `Are you sure you want to delete these these?`,
        onConfirm: ({ hideDialog }: { hideDialog: Function }) => {
          hideDialog();
          handleTicketDelete(hideDialog);
        },
      });
    },
    condition: () => !isCustomerPortal.value,
  },
];

function handleTicketDelete(hide: Function) {
  capture("bulk_delete");
  call("frappe.desk.reportview.delete_items", {
    items: JSON.stringify(Array.from(listSelections.value)),
    doctype: "HD Ticket",
  }).then(() => {
    createToast({
      title: "Deleted successfully",
      icon: "check",
      iconClasses: "text-ink-green-3",
    });
    hide();
    reset(true);
  });
}

const options = {
  doctype: "HD Ticket",
  columnConfig: {
    status: {
      prefix: ({ row }) => {
        return h(IndicatorIcon, {
          class: textColorMap[row.status],
        });
      },
    },
    agreement_status: {
      custom: ({ item }) => {
        return h(Badge, {
          label: item,
          theme: slaStatusColorMap[item],
          variant: "outline",
        });
      },
    },
    response_by: {
      custom: ({ row, item }) => handle_response_by_field(row, item),
    },
    resolution_by: {
      custom: ({ row, item }) => handle_resolution_by_field(row, item),
    },
  },
  isCustomerPortal: isCustomerPortal.value,
  selectable: true,
  showSelectBanner: true,
  selectBannerActions,
  emptyState: {
    title: "No Tickets Found",
    icon: h(TicketIcon, {
      class: "h-10 w-10",
    }),
  },
  hideColumnSetting: false,
};

function handle_response_by_field(row: any, item: string) {
  if (!row.first_responded_on && dayjs(item).isBefore(new Date())) {
    return h(Badge, {
      label: "Failed",
      theme: "red",
      variant: "outline",
    });
  }
  if (row.first_responded_on && dayjs(row.first_responded_on).isBefore(item)) {
    return h(Badge, {
      label: "Fulfilled",
      theme: "green",
      variant: "outline",
    });
  } else if (dayjs(row.first_responded_on).isAfter(item)) {
    return h(Badge, {
      label: "Failed",
      theme: "red",
      variant: "outline",
    });
  } else {
    return h(
      Tooltip,
      {
        text: dayjs(item).long(),
      },
      () => dayjs.tz(item).fromNow()
    );
  }
}

function handle_resolution_by_field(row: any, item: string) {
  if (row.resolution_date && dayjs(row.resolution_date).isBefore(item)) {
    return h(Badge, {
      label: "Fulfilled",
      theme: "green",
      variant: "outline",
    });
  } else if (dayjs(row.resolution_date).isAfter(item)) {
    return h(Badge, {
      label: "Failed",
      theme: "red",
      variant: "outline",
    });
  } else {
    return h(
      Tooltip,
      {
        text: dayjs(item).long(),
      },
      () => dayjs.tz(item).fromNow()
    );
  }
}

async function exportRows(
  export_type: "CSV" | "Excel" = "Excel",
  export_all: boolean = false
) {
  const list = listViewRef.value?.list;
  if (!list) return;

  const fields = JSON.stringify(list.data.columns.map((f) => f.key));
  const order_by = list.params.order_by;

  let filters = { ...list.params.filters };
  let pageLength: number;

  if (export_all) {
    filters = JSON.stringify(filters);
    pageLength = list.data.total_count;
  } else {
    pageLength = listSelections.value.size;
    filters["name"] = ["in", Array.from(listSelections.value)];
    filters = JSON.stringify(filters);
  }

  window.location.href = `/api/method/frappe.desk.reportview.export_query?file_format_type=${export_type}&title=HD Ticket&doctype=HD Ticket&fields=${fields}&filters=${filters}&order_by=${order_by}&page_length=${pageLength}&start=0&view=Report&with_comment_count=1`;
  reset();
  showExportModal.value = false;
}

function reset(reload = false) {
  listViewRef.value?.unselectAll();
  listSelections.value?.clear();
  if (reload) listViewRef.value.reload();
}

const slaStatusColorMap = {
  Fulfilled: "green",
  Failed: "red",
  "Resolution Due": "orange",
  "First Response Due": "orange",
  Paused: "blue",
};

const currentView = ref({
  label: "List View",
  icon: "lucide:align-justify",
});

const viewDialog = ref(false);
const { getViews, createView, findView } = useView("HD Ticket");

const dropdownOptions = computed(() => {
  const items = [];
  // Saved Views
  if (getViews.value?.length !== 0) {
    items.push({
      group: "Saved Views",
      items: getViews.value,
    });
  }

  items.push({
    label: "Create View",
    icon: "plus",
    onClick: () => {
      viewDialog.value = true;
    },
  });

  items.push({
    label: "Get View",
    icon: "user",
    onClick: () => {
      let x = findView("VIEW-HD Ticket-001");
      console.log(x.value);
    },
  });
  return items;
});

function handleCreateView(viewInfo) {
  const view: View = {
    dt: "HD Ticket",
    type: "list",
    label: viewInfo.label ?? "List View",
    icon: viewInfo.icon ?? "",
    route_name: "TicketsAgent",
    order_by: listViewRef.value?.list?.params.order_by,
    filters: JSON.stringify(listViewRef.value?.list?.params.filters),
    columns: JSON.stringify(listViewRef.value?.list?.params.columns),
    rows: JSON.stringify(listViewRef.value?.list?.data?.rows),
  };
  createView(view, handleSuccess);
}

function handleSuccess() {
  createToast({
    title: "View created successfully",
    icon: "check",
    iconClasses: "text-green-600",
  });
  viewDialog.value = false;
}

usePageMeta(() => {
  return {
    title: "Tickets",
  };
});
</script>
