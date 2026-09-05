import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../lib/generated/prisma/client";

import {
  UserRole,
  TicketStatus,
  AssetType,
  AssetStatus,
} from "../lib/generated/prisma/enums";

const prisma = new PrismaClient();

/**
 * Returns a date X days ago at the given hour.
 *
 * Example:
 * daysAgo(2, 10)
 * -> two days ago at 10:00
 */
function daysAgo(days: number, hour = 10) {
  const date = new Date();

  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return date;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear old development data.
  //
  // RESTART IDENTITY resets assetNumber so
  // assets start at ASSET-0001 again.
  await prisma.$executeRaw`
    TRUNCATE TABLE "Ticket", "Asset", "User"
    RESTART IDENTITY CASCADE
  `;

  // ----------------------------------------------------------------
  // PASSWORD
  // ----------------------------------------------------------------

  const password = await bcrypt.hash("Password123!", 10);

  // ----------------------------------------------------------------
  // USERS
  // ----------------------------------------------------------------

  await prisma.user.createMany({
    data: [
      {
        name: "Alice Becker",
        email: "alice@example.com",
        password,
        room: "A-201",
        role: UserRole.USER,
      },
      {
        name: "Ben Fischer",
        email: "ben@example.com",
        password,
        room: "B-104",
        role: UserRole.USER,
      },
      {
        name: "Sophia Wagner",
        email: "sophia@example.com",
        password,
        room: "C-305",
        role: UserRole.USER,
      },
      {
        name: "Lucas Meyer",
        email: "lucas@example.com",
        password,
        room: "A-105",
        role: UserRole.USER,
      },
      {
        name: "Mia Schulz",
        email: "mia@example.com",
        password,
        room: "B-203",
        role: UserRole.USER,
      },
      {
        name: "Noah Weber",
        email: "noah@example.com",
        password,
        room: "C-110",
        role: UserRole.USER,
      },
      {
        name: "Laura Neumann",
        email: "laura@example.com",
        password,
        room: "A-302",
        role: UserRole.USER,
      },
      {
        name: "Jonas Krüger",
        email: "jonas@example.com",
        password,
        room: "B-208",
        role: UserRole.USER,
      },
      {
        name: "Daniel Hoffmann",
        email: "daniel.support@example.com",
        password,
        room: "IT-101",
        role: UserRole.SUPPORT,
      },
      {
        name: "Emma Schneider",
        email: "emma.support@example.com",
        password,
        room: "IT-102",
        role: UserRole.SUPPORT,
      },
      {
        name: "Paul Richter",
        email: "paul.support@example.com",
        password,
        room: "IT-103",
        role: UserRole.SUPPORT,
      },
      {
        name: "System Administrator",
        email: "admin@example.com",
        password,
        room: "IT-100",
        role: UserRole.ADMIN,
      },
    ],
  });

  // Get the users we need for relations.
  const alice = await prisma.user.findUniqueOrThrow({
    where: { email: "alice@example.com" },
  });

  const ben = await prisma.user.findUniqueOrThrow({
    where: { email: "ben@example.com" },
  });

  const sophia = await prisma.user.findUniqueOrThrow({
    where: { email: "sophia@example.com" },
  });

  const lucas = await prisma.user.findUniqueOrThrow({
    where: { email: "lucas@example.com" },
  });

  const mia = await prisma.user.findUniqueOrThrow({
    where: { email: "mia@example.com" },
  });

  const noah = await prisma.user.findUniqueOrThrow({
    where: { email: "noah@example.com" },
  });

  const laura = await prisma.user.findUniqueOrThrow({
    where: { email: "laura@example.com" },
  });

  const jonas = await prisma.user.findUniqueOrThrow({
    where: { email: "jonas@example.com" },
  });

  const daniel = await prisma.user.findUniqueOrThrow({
    where: {
      email: "daniel.support@example.com",
    },
  });

  const emma = await prisma.user.findUniqueOrThrow({
    where: {
      email: "emma.support@example.com",
    },
  });

  const paul = await prisma.user.findUniqueOrThrow({
    where: {
      email: "paul.support@example.com",
    },
  });

  // ----------------------------------------------------------------
  // ASSETS
  // ----------------------------------------------------------------

  const aliceLaptop = await prisma.asset.create({
    data: {
      type: AssetType.LAPTOP,
      manufacturer: "Lenovo",
      model: "ThinkPad T14 Gen 4",
      serialNumber: "LNV-T14-001",
      status: AssetStatus.IN_USE,
      assignedToId: alice.id,
    },
  });

  const benDesktop = await prisma.asset.create({
    data: {
      type: AssetType.DESKTOP,
      manufacturer: "Dell",
      model: "OptiPlex 7010",
      serialNumber: "DELL-OPT-001",
      status: AssetStatus.IN_USE,
      assignedToId: ben.id,
    },
  });

  const benMonitor = await prisma.asset.create({
    data: {
      type: AssetType.MONITOR,
      manufacturer: "Dell",
      model: "P2422H",
      serialNumber: "DELL-MON-001",
      status: AssetStatus.IN_USE,
      assignedToId: ben.id,
    },
  });

  const sophiaLaptop = await prisma.asset.create({
    data: {
      type: AssetType.LAPTOP,
      manufacturer: "HP",
      model: "EliteBook 840 G10",
      serialNumber: "HP-840-001",
      status: AssetStatus.IN_USE,
      assignedToId: sophia.id,
    },
  });

  const lucasLaptop = await prisma.asset.create({
    data: {
      type: AssetType.LAPTOP,
      manufacturer: "Dell",
      model: "Latitude 5440",
      serialNumber: "DELL-LAT-002",
      status: AssetStatus.IN_USE,
      assignedToId: lucas.id,
    },
  });

  const brokenLaptop = await prisma.asset.create({
    data: {
      type: AssetType.LAPTOP,
      manufacturer: "Dell",
      model: "Latitude 5420",
      serialNumber: "DELL-LAT-001",
      status: AssetStatus.REPAIR,
      assignedToId: mia.id,
    },
  });

  const brokenMonitor = await prisma.asset.create({
    data: {
      type: AssetType.MONITOR,
      manufacturer: "LG",
      model: "27UP850-W",
      serialNumber: "LG-MON-001",
      status: AssetStatus.REPAIR,
      assignedToId: noah.id,
    },
  });

  await prisma.asset.createMany({
    data: [
      {
        type: AssetType.LAPTOP,
        manufacturer: "HP",
        model: "ProBook 450 G10",
        serialNumber: "HP-PRO-001",
        status: AssetStatus.AVAILABLE,
      },
      {
        type: AssetType.MONITOR,
        manufacturer: "Dell",
        model: "P2422H",
        serialNumber: "DELL-MON-002",
        status: AssetStatus.AVAILABLE,
      },
      {
        type: AssetType.PRINTER,
        manufacturer: "Brother",
        model: "HL-L5210DW",
        serialNumber: "BROTHER-001",
        status: AssetStatus.AVAILABLE,
      },
      {
        type: AssetType.PHONE,
        manufacturer: "Apple",
        model: "iPhone 15",
        serialNumber: "APPLE-IP15-001",
        status: AssetStatus.IN_USE,
        assignedToId: laura.id,
      },
      {
        type: AssetType.DESKTOP,
        manufacturer: "HP",
        model: "EliteDesk 800 G6",
        serialNumber: "HP-DESK-001",
        status: AssetStatus.IN_USE,
        assignedToId: jonas.id,
      },
      {
        type: AssetType.OTHER,
        manufacturer: "Logitech",
        model: "Rally Bar Mini",
        serialNumber: "LOGI-RALLY-001",
        status: AssetStatus.RETIRED,
      },
    ],
  });

  // ----------------------------------------------------------------
  // TICKETS
  // ----------------------------------------------------------------
  //
  // Dates are intentionally spread across the last 7 days
  // so the dashboard chart contains realistic data.
  // ----------------------------------------------------------------

  await prisma.ticket.createMany({
    data: [
      // --------------------------------------------------------------
      // 6 DAYS AGO
      // --------------------------------------------------------------

      {
        title: "Password reset",
        description:
          "I forgot my password and cannot access my company account.",

        status: TicketStatus.CLOSED,

        createdById: sophia.id,
        assignedToId: emma.id,

        createdAt: daysAgo(6, 9),
        closedAt: daysAgo(6, 11),
      },

      {
        title: "Laptop battery drains very quickly",
        description:
          "The battery only lasts around 45 minutes even after being fully charged.",

        status: TicketStatus.IN_PROGRESS,

        createdById: alice.id,
        assignedToId: daniel.id,
        relatedAssetId: aliceLaptop.id,

        createdAt: daysAgo(6, 14),
      },

      // --------------------------------------------------------------
      // 5 DAYS AGO
      // --------------------------------------------------------------

      {
        title: "Outlook does not synchronize emails",
        description:
          "New emails are not appearing in Outlook unless the application is restarted.",

        status: TicketStatus.CLOSED,

        createdById: laura.id,
        assignedToId: paul.id,

        createdAt: daysAgo(5, 8),
        closedAt: daysAgo(5, 13),
      },

      {
        title: "Access to finance shared folder",
        description:
          "I need access to the finance shared folder for my current project.",

        status: TicketStatus.OPEN,

        createdById: sophia.id,

        createdAt: daysAgo(5, 15),
      },

      // --------------------------------------------------------------
      // 4 DAYS AGO
      // --------------------------------------------------------------

      {
        title: "Windows crashes during startup",
        description:
          "Windows shows a blue screen shortly after the computer is turned on.",

        status: TicketStatus.CLOSED,

        createdById: mia.id,
        assignedToId: daniel.id,
        relatedAssetId: brokenLaptop.id,

        createdAt: daysAgo(4, 9),
        closedAt: daysAgo(3, 10),
      },

      {
        title: "Install Microsoft Visio",
        description:
          "I need Microsoft Visio installed on my company laptop for a project.",

        status: TicketStatus.IN_PROGRESS,

        createdById: alice.id,
        assignedToId: emma.id,
        relatedAssetId: aliceLaptop.id,

        createdAt: daysAgo(4, 11),
      },

      {
        title: "Printer cannot connect to Wi-Fi",
        description:
          "The office printer is no longer visible on the wireless network.",

        status: TicketStatus.CLOSED,

        createdById: jonas.id,
        assignedToId: paul.id,

        createdAt: daysAgo(4, 14),
        closedAt: daysAgo(4, 16),
      },

      // --------------------------------------------------------------
      // 3 DAYS AGO
      // --------------------------------------------------------------

      {
        title: "Request for a second monitor",
        description:
          "I would like a second monitor for my workstation to work with multiple applications.",

        status: TicketStatus.OPEN,

        createdById: alice.id,

        createdAt: daysAgo(3, 8),
      },

      {
        title: "Monitor flickers intermittently",
        description:
          "The monitor flickers several times every hour and sometimes briefly loses the signal.",

        status: TicketStatus.IN_PROGRESS,

        createdById: noah.id,
        assignedToId: daniel.id,
        relatedAssetId: brokenMonitor.id,

        createdAt: daysAgo(3, 10),
      },

      {
        title: "Teams microphone not detected",
        description:
          "Microsoft Teams does not recognize the connected headset microphone.",

        status: TicketStatus.CLOSED,

        createdById: ben.id,
        assignedToId: emma.id,

        createdAt: daysAgo(3, 13),
        closedAt: daysAgo(2, 9),
      },

      // --------------------------------------------------------------
      // 2 DAYS AGO
      // --------------------------------------------------------------

      {
        title: "VPN connection fails from home",
        description:
          "The VPN client fails during authentication when I try to work remotely.",

        status: TicketStatus.OPEN,

        createdById: lucas.id,

        createdAt: daysAgo(2, 8),
      },

      {
        title: "Cannot open PDF attachments",
        description:
          "PDF attachments downloaded from Outlook cannot be opened on my laptop.",

        status: TicketStatus.CLOSED,

        createdById: sophia.id,
        assignedToId: paul.id,
        relatedAssetId: sophiaLaptop.id,

        createdAt: daysAgo(2, 9),
        closedAt: daysAgo(1, 10),
      },

      {
        title: "Laptop becomes very hot",
        description:
          "The laptop fan runs constantly and the device becomes very hot during normal office work.",

        status: TicketStatus.IN_PROGRESS,

        createdById: lucas.id,
        assignedToId: emma.id,
        relatedAssetId: lucasLaptop.id,

        createdAt: daysAgo(2, 14),
      },

      // --------------------------------------------------------------
      // YESTERDAY
      // --------------------------------------------------------------

      {
        title: "Unable to connect to network drive",
        description:
          "The department network drive shows as unavailable after logging into Windows.",

        status: TicketStatus.IN_PROGRESS,

        createdById: ben.id,
        assignedToId: daniel.id,
        relatedAssetId: benDesktop.id,

        createdAt: daysAgo(1, 8),
      },

      {
        title: "Software installation no longer needed",
        description:
          "The requested software is no longer required because the project was canceled.",

        status: TicketStatus.CANCELED,

        createdById: laura.id,

        createdAt: daysAgo(1, 11),
      },

      {
        title: "Second monitor not detected",
        description:
          "Windows only detects one of the two monitors connected to my workstation.",

        status: TicketStatus.CLOSED,

        createdById: ben.id,
        assignedToId: emma.id,
        relatedAssetId: benMonitor.id,

        createdAt: daysAgo(1, 13),
        closedAt: daysAgo(0, 9),
      },

      // --------------------------------------------------------------
      // TODAY
      // --------------------------------------------------------------

      {
        title: "Account locked after failed login attempts",
        description:
          "My company account is locked after several failed login attempts this morning.",

        status: TicketStatus.OPEN,

        createdById: mia.id,

        createdAt: daysAgo(0, 8),
      },

      {
        title: "Request for project software",
        description:
          "I need access to the project planning software used by the engineering team.",

        status: TicketStatus.OPEN,

        createdById: noah.id,

        createdAt: daysAgo(0, 10),
      },

      {
        title: "Laptop docking station not working",
        description:
          "The docking station no longer detects the external displays or Ethernet connection.",

        status: TicketStatus.IN_PROGRESS,

        createdById: alice.id,
        assignedToId: paul.id,
        relatedAssetId: aliceLaptop.id,

        createdAt: daysAgo(0, 12),
      },
    ],
  });

  // ----------------------------------------------------------------
  // DONE
  // ----------------------------------------------------------------

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("Test accounts:");
  console.log("USER:    alice@example.com");
  console.log("SUPPORT: daniel.support@example.com");
  console.log("ADMIN:   admin@example.com");
  console.log("");
  console.log("Password for all accounts: Password123!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
