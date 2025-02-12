<template>
  <!-- View Controls -->
  <div
    class="flex items-center justify-between gap-2 px-5 pb-4 pt-3"
    v-if="showViewControls"
  >
    <QuickFilters v-if="!isMobileView" />
    <div class="flex items-center gap-2" v-if="!isMobileView">
      <Reload @click="reload" :loading="list.loading" />
      <Filter :default_filters="defaultParams.filters" />
      <SortBy :hide-label="isMobileView" />
      <ColumnSettings
        :hide-label="isMobileView"
        v-if="!options.hideColumnSetting"
      />
    </div>
    <div v-else class="flex justify-between items-center w-full">
      <Filter :default_filters="defaultParams.filters" />
      <div class="flex items-center gap-2">
        <Reload @click="reload" :loding="list.loading" />
        <SortBy :hide-label="isMobileView" />
      </div>
    </div>
  </div>

  <!-- List View -->
  <ListView
    v-if="list.data?.data.length > 0"
    class="flex-1"
    :columns="columns"
    :rows="rows"
    row-key="name"
    :options="{
      selectable: options.selectable,
      showTooltip: false,
      resizeColumn: false,
      onRowClick: () => {},
      emptyState,
    }"
  >
    <ListHeader class="sm:mx-5 mx-3">
      <ListHeaderItem
        v-for="column in columns"
        :key="column.key"
        :item="column"
        @columnWidthUpdated="(width) => console.log(width)"
      />
    </ListHeader>
    <ListRows
      :rows="rows"
      v-slot="{ idx, column, item, row }"
      :group-by-actions="options.groupByActions"
    >
      <ListRowItem
        :item="item"
        :column="column"
        :row="row"
        @click="(e) => handleFieldClick(e, column, row, item)"
      >
        <component :is="listCell(column, row, item, idx)" :key="column.key" />
      </ListRowItem>
    </ListRows>
    <ListSelectBanner v-if="options.showSelectBanner">
      <template #actions="{ selections, unselectAll }">
        <Dropdown :options="selectBannerOptions(selections, unselectAll)">
          <Button icon="more-horizontal" variant="ghost" />
        </Dropdown>
      </template>
    </ListSelectBanner>
  </ListView>

  <!-- List Footer -->
  <div
    class="p-20 border-t sm:px-5 px-3 py-2"
    v-if="list.data?.data.length > 0"
  >
    <ListFooter
      :options="{
        rowCount: list?.data?.row_count,
        totalCount: list?.data?.total_count,
      }"
      :pageLengthCount="defaultParams.page_length_count"
      @loadMore="handlePageLength(defaultParams.page_length_count, true)"
      v-model="defaultParams.page_length_count"
      @update:modelValue="
        (count) => {
          handlePageLength(count);
        }
      "
    />
  </div>
  <!-- Empty State -->
  <EmptyState
    v-else
    :title="emptyState.title"
    :icon="emptyState.icon"
    @emptyStateAction="emit('emptyStateAction')"
  />
</template>

<script setup lang="ts">
import { reactive, provide, computed, h, ref, watch, VNode } from "vue";
import { useRoute } from "vue-router";
import {
  createResource,
  ListView,
  ListFooter,
  ListRowItem,
  ListHeader,
  ListHeaderItem,
  ListSelectBanner,
  FeatherIcon,
  Dropdown,
} from "frappe-ui";
import {
  Filter,
  SortBy,
  QuickFilters,
  Reload,
  ColumnSettings,
} from "@/components/view-controls";
import { MultipleAvatar, StarRating } from "@/components";
import ListRows from "./ListRows.vue";
import EmptyState from "./EmptyState.vue";
import { useScreenSize } from "@/composables/screen";
import { dayjs } from "@/dayjs";
import { ViewType } from "@/types";
import useView from "@/composables/useView";

interface P {
  options: {
    doctype: string;
    defaultFilters?: Record<string, any>;
    columnConfig?: Record<string, any>;
    emptyState?: {
      // type of a h componnt
      icon?: string | VNode;
      title: string;
    };
    hideViewControls?: boolean;
    hideColumnSetting?: boolean;
    selectable?: boolean;
    view?: ViewType;
    groupByActions?: Array<any>;
    showSelectBanner?: boolean;
    selectBannerActions?: Record<string, any>;
    default_page_length?: number;
    isCustomerPortal?: boolean;
  };
}

interface E {
  (event: "emptyStateAction"): void;
  (event: "rowClick", row: any): void;
}
const props = defineProps<P>();
const emit = defineEmits<E>();
const route = useRoute();

const defaultOptions = {
  doctype: "",
  hideViewControls: false,
  selectable: false,
  view: {
    view_type: "list",
    group_by_field: "owner",
  },
  groupByActions: [],
  default_page_length: 20,
  isCustomerPortal: false,
  hideColumnSetting: true,
};

const options = computed(() => {
  return {
    ...defaultOptions,
    ...props.options,
  };
});

const { isMobileView } = useScreenSize();

const defaultEmptyState = {
  icon: "",
  title: "No Data Found",
};

const defaultParams = reactive({
  doctype: options.value.doctype,
  filters: options.value.defaultFilters || {},
  order_by: "modified desc",
  page_length: options.value.default_page_length,
  page_length_count: options.value.default_page_length,
  view: options.value.view,
  columns: [],
  show_customer_portal_fields: options.value.isCustomerPortal,
});

const emptyState = computed(() => {
  return options.value?.emptyState || defaultEmptyState;
});

const list = createResource({
  url: "helpdesk.api.doc.get_list_data",
  params: defaultParams,
  auto: true,
  transform: (data) => {
    data.columns.forEach((column) => {
      handleFetchFromField(column);
      handleColumnConfig(column);
    });
    if (options.value.doctype === "HD Ticket") {
      data.data.forEach((row) => {
        if (
          defaultParams.show_customer_portal_fields &&
          row.status === "Replied"
        ) {
          row.status = "Awaiting Response";
        }
      });
    }
    return data;
  },
  onSuccess: (data) => {
    list.params = defaultParams;
    columns.value = data.columns;
  },
});

const exposeFunctions = {
  list,
  reload,
};
function selectBannerOptions(selections: Set<string>, unselectAll = () => {}) {
  exposeFunctions["unselectAll"] = unselectAll;
  return options.value.selectBannerActions.map((action) => {
    return {
      ...action,
      onClick: () => action.onClick(selections),
    };
  });
}

const rows = computed(() => {
  if (!list.data?.data) return [];
  if (list.data.view_type === "group_by") {
    if (!list.data?.group_by_field?.name) return [];
    return getGroupedByRows(list.data.data, list.data.group_by_field);
  }
  return list.data?.data;
});
const columns = ref([]);

function getGroupedByRows(listRows, groupByField) {
  let groupedRows = [];
  groupByField.options?.forEach((option) => {
    let filteredRows = [];

    if (!option.value) {
      filteredRows = listRows.filter((row) => !row[groupByField.name]);
    } else {
      filteredRows = listRows.filter(
        (row) => row[groupByField.name] == option.value
      );
    }

    let groupDetail = {
      group: option || " ",
      collapsed: false,
      rows: filteredRows,
      icon: h(FeatherIcon, {
        name: "folder",
        class: "h-4 w-4 flex-shrink-0 text-ink-gray-6",
      }),
    };
    groupedRows.push(groupDetail);
  });
  return groupedRows || listRows;
}

function handleFetchFromField(column) {
  if (!column.hasOwnProperty("key")) return column;
  const regex = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/;
  const isFetchFromField = column.key.match(regex);
  column.key = isFetchFromField ? isFetchFromField[2] : column.key;
}

function handleColumnConfig(column) {
  if (!options.value?.columnConfig) return column;
  const columnConfig = options.value.columnConfig;
  if (!columnConfig.hasOwnProperty(column.key)) return column;
  column.prefix = columnConfig[column.key]?.prefix;

  return column;
}

const filterableFields = createResource({
  url: "helpdesk.api.doc.get_filterable_fields",
  cache: ["DocField", options.value.doctype],
  auto: !options.value.hideViewControls,
  params: {
    doctype: options.value.doctype,
    append_assign: true,
    show_customer_portal_fields: defaultParams.show_customer_portal_fields,
  },
  transform: (data) => {
    data = data.map((field) => {
      return {
        label: field.label,
        value: field.fieldname,
        ...field,
      };
    });
    return data;
  },
});

const sortableFields = createResource({
  url: "helpdesk.api.doc.sort_options",
  auto: !options.value.hideViewControls,
  params: {
    doctype: options.value.doctype,
    show_customer_portal_fields: defaultParams.show_customer_portal_fields,
  },
});

const quickFilters = createResource({
  url: "helpdesk.api.doc.get_quick_filters",
  auto: !options.value.hideViewControls,
  params: {
    doctype: options.value.doctype,
  },
  transform: (data) => {
    if (Boolean(data.length)) return;
    data = [{ name: "name", label: "Name", fieldtype: "Data" }];
    return data;
  },
});

function listCell(column: any, row: any, item: any, idx: number) {
  const columnConfig = options.value.columnConfig;
  if (columnConfig && columnConfig[column.key]?.custom) {
    return columnConfig[column.key]?.custom({ column, row, item, idx });
  }
  if (idx === 0) {
    return h("span", {
      class: "truncate text-base text-ink-gray-6",
      innerHTML: item,
    });
  }
  if (column.type === "Datetime") {
    return h("span", {
      class: "text-base",
      innerHTML: dayjs.tz(item).fromNow(),
    });
  }
  if (column.type === "MultipleAvatar") {
    return h(MultipleAvatar, {
      avatars: item,
      class: "flex items-center",
    });
  }
  if (column.type === "Rating") {
    return h(StarRating, {
      rating: item || 0,
      class: "truncate",
    });
  }
  return h("span", {
    class: "truncate",
    innerHTML: item,
  });
}

function handleFieldClick(e: MouseEvent, column, row, item) {
  if (item == "Awaiting Response") {
    item = "Replied";
  }
  const noFilterFields = ["Data", "Datetime", "Rating", "Int", "Float"];
  if (noFilterFields.includes(column.type)) {
    emit("rowClick", row.name);
    return;
  }
  if (column.type === "MultipleAvatar") {
    if (item.length > 1) {
      let target = e.target as HTMLElement;
      target = target.closest(".user-avatar");
      if (target) {
        item = target.getAttribute("data-name");
      }
    } else {
      item = item[0].name;
    }
    applyFilters({ ...defaultParams.filters, [column.key]: item });
    return;
  }
  applyFilters({ ...defaultParams.filters, [column.key]: item });
}

const showViewControls = computed(() => {
  return (
    !options.value.hideViewControls &&
    filterableFields.data &&
    sortableFields.data &&
    quickFilters.data
  );
});

const listViewData = reactive({
  list,
  filterableFields,
  quickFilters,
  sortableFields,
});

provide("listViewData", listViewData);

provide("listViewActions", {
  applyFilters,
  applySort,
  updateColumns,
  reload,
});

function applyFilters(filters) {
  defaultParams.filters = { ...filters };
  list.submit({ ...defaultParams });
}

function applySort(order_by: string) {
  defaultParams.order_by = order_by;
  list.submit({ ...defaultParams, order_by });
}

function updateColumns(obj) {
  const { columns: _columns, isDefault, reload, reset } = obj;
  _columns?.forEach((column) => {
    handleFetchFromField(column);
    handleColumnConfig(column);
  });
  columns.value = defaultParams.columns = isDefault ? "" : _columns;
  list.reload({ ...defaultParams });
}

function reload() {
  list.reload({ ...defaultParams });
}

function handlePageLength(count: number, loadMore: boolean = false) {
  defaultParams.page_length_count = count;
  if (loadMore) {
    defaultParams.page_length += count;
  } else {
    if (
      count === defaultParams.page_length &&
      count === defaultParams.page_length_count
    ) {
      return;
    }
    defaultParams.page_length = count;
    defaultParams.page_length_count = count;
  }
  list.reload();
}

const { findView } = useView(options.value.doctype);

watch(
  () => route.query.view,
  (val: string) => {
    const v = findView(val);
    console.log(v.value);
  },
  { immediate: true }
);

defineExpose(exposeFunctions);
</script>
