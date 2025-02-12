# Copyright (c) 2021, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import cint

from helpdesk.utils import capture_event


class HDArticle(Document):
    def validate(self):
        self.validate_article_category()

    def validate_article_category(self):
        if self.has_value_changed("category") and not self.is_new():
            old_category = self.get_doc_before_save().get("category")
            self.check_category_length(old_category)

    def before_insert(self):
        self.author = frappe.session.user

    def before_save(self):
        self.capture_telemetry()
        # set published date of the hd_article
        if self.status == "Published" and not self.published_on:
            self.published_on = frappe.utils.now()
        elif self.status == "Draft" and self.published_on:
            self.published_on = None

        if self.status == "Archived" and self.category != None:
            self.category = None

        # index is only set if its not set already, this allows defining index
        # at the time of creation itself if not set the index is set to the
        # last index + 1, i.e. the hd_article is added at the end
        if self.status == "Published" and self.idx == -1:
            self.idx = cint(
                frappe.db.count(
                    "HD Article",
                    {"category": self.category, "status": "Published"},
                )
            )

    def capture_telemetry(self):
        if self.is_new():
            capture_event("article_created")

    def on_trash(self):
        self.check_category_length()

    def check_category_length(self, category=None):
        category = category or self.get("category")
        if not category:
            return
        category_articles = frappe.db.count("HD Article", {"category": category})
        if category_articles == 1:
            frappe.throw(_("Category must have atleast one article"))

    @staticmethod
    def default_list_data():
        columns = [
            {
                "label": "Title",
                "type": "Data",
                "key": "title",
                "width": "20rem",
            },
            {
                "label": "Status",
                "type": "status",
                "key": "status",
                "width": "10rem",
            },
            {
                "label": "Author",
                "type": "Link",
                "key": "author",
                "width": "17rem",
            },
            {
                "label": "Last Modified",
                "type": "Datetime",
                "key": "modified",
                "width": "8rem",
            },
        ]
        return {"columns": columns}

    @frappe.whitelist()
    def set_feedback(self, value):
        # 0 empty, 1 like, 2 dislike
        user = frappe.session.user
        feedback = frappe.db.exists(
            "HD Article Feedback", {"user": user, "article": self.name}
        )
        if feedback:
            frappe.db.set_value("HD Article Feedback", feedback, "feedback", value)
            return

        frappe.new_doc(
            "HD Article Feedback", user=user, article=self.name, feedback=value
        ).insert()

    @property
    def title_slug(self) -> str:
        """
        Generate slug from article title.
        Example: "Introduction to Frappe Helpdesk" -> "introduction-to-frappe-helpdesk"

        :return: Generated slug
        """
        return self.title.lower().replace(" ", "-")
