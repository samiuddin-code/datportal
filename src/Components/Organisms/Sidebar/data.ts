export const projectsDrop = [
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
];

export const organizationDrop = [
  {
    src: "",
    text: "Account",
    to: "/account",
    params: ""
  },
  {
    src: "",
    text: "Tax Rate",
    to: "/tax-rate",
    params: ""
  },
  {
    src: "",
    text: "Product",
    to: "/product",
    params: ""
  },
  {
    src: "",
    text: "Branding Theme",
    to: "/branding-theme",
    params: ""
  },
  {
    src: "",
    text: "Public Holidays",
    to: "/public-holiday",
    params: ""
  },
];

export const requestsDrop = [
  {
    src: "/images/request.svg",
    text: "All",
    to: "/employee-requests/?all",
    params: ""
  },
  {
    src: "/images/money-flow.svg",
    text: "Reimbursement",
    to: "/employee-requests/reimbursement-requests",
    params: ""
  },
  {
    src: "/images/calendar-2.svg",
    text: "Leave",
    to: "/employee-requests/leave-requests",
    params: ""
  },
  {
    src: "/images/car.svg",
    text: "Car Reservation",
    to: "/employee-requests/car-reservation-requests",
    params: ""
  },
  {
    src: "/images/dollar-bill.svg",
    text: "Cash Advance",
    to: "/employee-requests/cash-advance-requests",
    params: ""
  },
];