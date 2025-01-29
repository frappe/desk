// Copyright (c) 2023, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("HD Ticket", {
	refresh(frm) {
      const ticket_path = "/helpdesk/tickets/"+ frm.doc.name
      frm.add_web_link(ticket_path, "See on Helpdesk")
	},
});
