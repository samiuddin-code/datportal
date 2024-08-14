export const navigationGroups = [
  {
    name: "Projects",
    links: [
      {
        src: "/images/all_properties.svg",
        text: "All Projects",
        to: "/projects",
        params: "all=true",
      },
      {
        src: "/images/active_properties.svg",
        text: "Active Projects",
        to: "/projects",
        params: "isClosed=false",
      },
      {
        src: "/images/pending_properties.svg",
        text: "Closed Projects",
        to: "/projects",
        params: "isClosed=true",
      },
      {
        src: "/images/rejected_properties.svg",
        text: "Cancelled Projects",
        to: "/projects",
        params: "isCancelled=true",
      },
      {
        src: "/images/pause.svg",
        text: "On hold Projects",
        to: "/projects",
        params: "onHold=true",
      },
    ],
  },
  {
    name: "Employee Requests",
    links: [
      {
        src: "/images/request.svg",
        text: "All",
        to: "/employee-requests/?all",
        params: "",
      },
      {
        src: "/images/money-flow.svg",
        text: "Reimbursement",
        to: "/employee-requests/reimbursement-requests",
        params: "",
      },
      {
        src: "/images/calendar-2.svg",
        text: "Leave",
        to: "/employee-requests/leave-requests",
        params: "",
      },
      {
        src: "/images/car.svg",
        text: "Car Reservation",
        to: "/employee-requests/car-reservation-requests",
        params: "",
      },
      {
        src: "/images/dollar-bill.svg",
        text: "Cash Advance",
        to: "/employee-requests/cash-advance-requests",
        params: "",
      },
      {
        src: "/images/credit-card.svg",
        text: "Leave Requests",
        to: "/leave-requests",
        params: "",
      },
    ],
  },
  {
    name: "Task Management",
    links: [
      {
        text: "My Tasks",
        to: "/my-tasks",
      },
      {
        text: "Team Tasks",
        to: "/team-tasks",
      },
    ],
  },
  {
    name: "Employee Management",
    links: [
      {
        text: "Employees",
        to: "/employees",
      },
      {
        text: "Employee Reports",
        to: "/employee-reports",
      },
    ],
  },
  {
    name: "Customer Management",
    links: [
      {
        text: "Clients",
        to: "/clients",
      },
      {
        text: "Leads",
        to: "/leads",
      },
      {
        text: "Enquiries",
        to: "/enquiries",
      },
      {
        text: "Quotations",
        to: "/quotations",
      },
      {
        text: "Invoices",
        to: "/invoice",
      },
    ],
  },
  {
    name: "Resource Management",
    links: [
      {
        text: "Company Assets",
        to: "/company-assets",
      },
      {
        text: "Biometrics",
        to: "/biometrics",
      },
      {
        text: "Attendance",
        to: "/attendance",
      },
      {
        text: "Permits",
        to: "/permits",
      },
    ],
  },
  {
    name: "Other",
    links: [
      {
        text: "Announcements",
        to: "/notifications",
      },
      {
        text: "Help Center",
        to: "/help-center",
      },
    ],
  },
];