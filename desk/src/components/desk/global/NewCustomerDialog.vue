<template>
  <div>
    <FDialog
      v-model="open"
      :options="{ title: 'Add New Customer', size: 'sm' }"
    >
      <template #body-content>
        <div class="space-y-4">
          <div class="space-y-1">
            <FInput
              v-model="customer"
              label="Customer Name"
              type="text"
              placeholder="Tesla Inc."
            />
          </div>
          <div class="space-y-1">
            <FInput
              v-model="domain"
              label="Domain"
              type="text"
              placeholder="eg: tesla.com, mycompany.com"
            />
          </div>
          <div
            v-for="field in visibleFields"
            :key="field.fieldname"
            class="space-y-1"
          >
            <UniInput
              :field="field"
              :value="customerFields[field.fieldname]"
              @change="customerFields[field.fieldname] = $event.value"
            />
          </div>
          <div class="float-right flex space-x-2">
            <Button
              label="Add"
              theme="gray"
              variant="solid"
              @click="
                () => {
                  addCustomer();
                  close();
                  $router.go();
                }
              "
            />
          </div>
        </div>
      </template>
    </FDialog>
  </div>
</template>

<script>
import { Input as FInput, Dialog as FDialog, createResource } from "frappe-ui";
// To avoid vue/no-reserved-component-names
import { computed, reactive } from "vue";
import { UniInput } from "@/components";

const custom_fields = createResource({
  url: "helpdesk.helpdesk.doctype.hd_customer.api.get_customer_fields",
  auto: true,
});

export default {
  name: "NewCustomerDialog",
  components: {
    FDialog,
    FInput,
    UniInput,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    let open = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
        if (!val) {
          emit("close");
        }
      },
    });
    return {
      open,
    };
  },
  data() {
    return {
      customer: "",
      domain: "",
      customerFields: reactive({}),
    };
  },
  computed: {
    visibleFields() {
      return custom_fields.data || [];
    },
  },
  methods: {
    addCustomer() {
      const inputParams = {
        customer_name: this.customer,
        domain: this.domain,
        ...this.customerFields,
      };
      this.$resources.newCustomer.submit({
        doc: {
          doctype: "HD Customer",
          ...inputParams,
        },
      });
    },
    close() {
      this.customer = "";
      this.domain = "";
      this.customerFields = reactive({});
      this.$emit("close");
    },
  },
  resources: {
    newCustomer() {
      return {
        url: "frappe.client.insert",
        onSuccess: () => {
          this.$router.push(`/customers`);
        },
      };
    },
  },
};
</script>
