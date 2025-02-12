import { createResource } from "frappe-ui";
import { Resource, Ticket } from "@/types";

export function useTicket(
  id?: number | string,
  isCustomerPortal: boolean = false,
  transformCB?: (data: any) => any,
  successCB?: (data: any) => any,
  errorCB?: (err: any) => any
): Resource<Ticket> {
  const t = createResource({
    url: "helpdesk.helpdesk.doctype.hd_ticket.api.get_one",
    cache: ["Ticket", id],
    params: {
      name: id,
      is_customer_portal: isCustomerPortal,
    },
    auto: true,
    transform: (data) => {
      transformCB && transformCB(data);
    },
    onSuccess: (data) => {
      successCB && successCB(data);
    },
    onError: (err) => {
      errorCB && errorCB(err);
    },
  });
  return t;
}
