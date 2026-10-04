import { AVATAR_STYLES } from "./avatarStyles";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

const RAW_COMPANIES = [
  {
    id: "CMP-1098",
    name: "CloudStack",
    initials: "CS",
    status: "pending",
    email: "ops@cloudstack.io",
    phone: "+20 100 555 0123",
    createdAgo: 2 * HOUR,
    updatedAgo: 41 * MIN,
  },
  {
    id: "CMP-1095",
    name: "Aqua Digital",
    initials: "AQ",
    status: "pending",
    email: "hello@aquadigital.com",
    phone: "+20 122 888 4410",
    createdAgo: 1 * DAY,
    updatedAgo: 1 * DAY,
  },
  {
    id: "CMP-0881",
    name: "BrightPath Inc.",
    initials: "BP",
    status: "verified",
    email: "hr@brightpath.io",
    phone: "+20 101 234 5678",
    createdAgo: 41 * DAY,
    updatedAgo: 2 * DAY,
  },
  {
    id: "CMP-1042",
    name: "Nexus Labs",
    initials: "NX",
    status: "verified",
    email: "talent@nexuslabs.co",
    phone: "+20 111 987 6543",
    createdAgo: 12 * DAY,
    updatedAgo: 2 * MIN,
  },
  {
    id: "CMP-0912",
    name: "Volt Agency",
    initials: "VL",
    status: "not-verified",
    email: "contact@voltagency.net",
    phone: null,
    createdAgo: 81 * DAY,
    updatedAgo: 81 * DAY,
  },
  {
    id: "CMP-0755",
    name: "Horizon Digital",
    initials: "HD",
    status: "verified",
    email: "careers@horizondigital.eg",
    phone: "+20 155 321 0099",
    createdAgo: 96 * DAY,
    updatedAgo: 7 * DAY,
  },
  {
    id: "CMP-1101",
    name: "Spark Labs",
    initials: "SP",
    status: "pending",
    email: "team@sparklabs.dev",
    phone: "+20 106 444 7788",
    createdAgo: 3 * HOUR,
    updatedAgo: 3 * HOUR,
  },
  {
    id: "CMP-0620",
    name: "Terra Media",
    initials: "TM",
    status: "verified",
    email: "jobs@terramedia.com",
    phone: "+20 100 777 2233",
    createdAgo: 143 * DAY,
    updatedAgo: 4 * DAY,
  },
];

export const COMPANIES = RAW_COMPANIES.map((company, index) => ({
  ...company,
  avatarClass: AVATAR_STYLES[index % AVATAR_STYLES.length],
  createdAt: new Date(now - company.createdAgo),
  updatedAt: new Date(now - company.updatedAgo),
}));
