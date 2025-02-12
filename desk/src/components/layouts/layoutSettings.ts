import LucideBookOpen from "~icons/lucide/book-open";
import LucideCloudLightning from "~icons/lucide/cloud-lightning";
import LucideContact2 from "~icons/lucide/contact-2";
import LucideTicket from "~icons/lucide/ticket";
import LucideUser from "~icons/lucide/user";
import { OrganizationsIcon } from "../icons";
import LucideUsers from "~icons/lucide/users";
import {
  AGENT_PORTAL_AGENT_LIST,
  AGENT_PORTAL_CONTACT_LIST,
  AGENT_PORTAL_CUSTOMER_LIST,
  AGENT_PORTAL_TEAM_LIST,
  AGENT_PORTAL_TICKET_LIST,
  AGENT_PORTAL_KNOWLEDGE_BASE,
} from "@/router";

export const agentPortalSidebarOptions = [
  {
    label: "Tickets",
    icon: LucideTicket,
    to: AGENT_PORTAL_TICKET_LIST,
  },
  {
    label: "Knowledge Base",
    icon: LucideBookOpen,
    to: "AgentKnowledgeBase",
  },
  {
    label: "Agents",
    icon: LucideUser,
    to: AGENT_PORTAL_AGENT_LIST,
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
    icon: OrganizationsIcon,
    to: AGENT_PORTAL_CUSTOMER_LIST,
  },
  {
    label: "Contacts",
    icon: LucideContact2,
    to: AGENT_PORTAL_CONTACT_LIST,
  },
];

export const customerPortalSidebarOptions = [
  {
    label: "Tickets",
    icon: LucideTicket,
    to: "TicketsCustomer",
  },
  {
    label: "Knowledge Base",
    icon: LucideBookOpen,
    to: "CustomerKnowledgeBase",
  },
];
