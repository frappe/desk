# Copyright (c) 2023, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe


@frappe.whitelist()
def get_customer_fields():
	"""Return customer fields"""
	meta = frappe.get_meta("HD Customer")
	return meta.get("fields", {"reqd": 1, "fieldname": ["not in", ["customer", "domain"]]})
