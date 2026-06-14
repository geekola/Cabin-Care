import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const checklists = [
  {
    name: 'Pre-Guest Arrival',
    category: 'Guest Readiness',
    description: 'Ensure the property is clean, stocked, and fully ready before a guest checks in. Covers linens, amenities, appliances, and exterior.',
    basePrice: 149,
    estimatedMinutes: 60,
    items: [
      { sectionName: 'Exterior', itemText: 'Exterior walkways clear and clean', itemType: 'pass_fail', sortOrder: 1 },
      { sectionName: 'Exterior', itemText: 'Trash bins empty and returned', itemType: 'pass_fail', sortOrder: 2 },
      { sectionName: 'Exterior', itemText: 'Entry lights functioning', itemType: 'pass_fail', sortOrder: 3 },
      { sectionName: 'Interior', itemText: 'All rooms vacuumed and mopped', itemType: 'pass_fail', sortOrder: 4 },
      { sectionName: 'Interior', itemText: 'Bathrooms cleaned and stocked', itemType: 'pass_fail', sortOrder: 5 },
      { sectionName: 'Interior', itemText: 'Linens clean and properly made', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'Kitchen', itemText: 'Dishes clean and stored', itemType: 'pass_fail', sortOrder: 7 },
      { sectionName: 'Kitchen', itemText: 'Refrigerator cleaned and stocked per host instructions', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Kitchen', itemText: 'Coffee maker clean and ready', itemType: 'pass_fail', sortOrder: 9 },
      { sectionName: 'Supplies', itemText: 'Toilet paper rolls remaining', itemType: 'number', sortOrder: 10 },
      { sectionName: 'Supplies', itemText: 'Paper towels remaining', itemType: 'number', sortOrder: 11 },
      { sectionName: 'Notes', itemText: 'Additional notes', itemType: 'text', sortOrder: 12, required: false },
    ],
  },
  {
    name: 'Safety Compliance',
    category: 'Safety',
    description: 'Comprehensive safety audit covering smoke detectors, CO detectors, fire extinguishers, egress, and structural concerns.',
    basePrice: 199,
    estimatedMinutes: 90,
    items: [
      { sectionName: 'Fire Safety', itemText: 'Smoke detectors present and tested', itemType: 'pass_fail', sortOrder: 1 },
      { sectionName: 'Fire Safety', itemText: 'CO detectors present and tested', itemType: 'pass_fail', sortOrder: 2 },
      { sectionName: 'Fire Safety', itemText: 'Fire extinguisher present, charged, and accessible', itemType: 'pass_fail', sortOrder: 3 },
      { sectionName: 'Fire Safety', itemText: 'Fire extinguisher expiration date', itemType: 'text', sortOrder: 4 },
      { sectionName: 'Egress', itemText: 'All exits clear and operable', itemType: 'pass_fail', sortOrder: 5 },
      { sectionName: 'Egress', itemText: 'Emergency exit signage visible', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'Structural', itemText: 'No visible water damage or mold', itemType: 'pass_fail', sortOrder: 7 },
      { sectionName: 'Structural', itemText: 'Deck/porch railings secure', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Electrical', itemText: 'No exposed wiring observed', itemType: 'pass_fail', sortOrder: 9 },
      { sectionName: 'Electrical', itemText: 'GFCI outlets in bathrooms and kitchen', itemType: 'pass_fail', sortOrder: 10 },
      { sectionName: 'Notes', itemText: 'Safety concerns noted', itemType: 'text', sortOrder: 11, required: false },
    ],
  },
  {
    name: 'Seasonal Cabin',
    category: 'Seasonal',
    description: 'Opening or closing checklist for seasonal cabins. Covers winterization, plumbing, HVAC, and exterior weatherproofing.',
    basePrice: 249,
    estimatedMinutes: 120,
    items: [
      { sectionName: 'Plumbing', itemText: 'Water supply turned on/off', itemType: 'pass_fail', sortOrder: 1 },
      { sectionName: 'Plumbing', itemText: 'No visible pipe leaks', itemType: 'pass_fail', sortOrder: 2 },
      { sectionName: 'Plumbing', itemText: 'Water heater operational', itemType: 'pass_fail', sortOrder: 3 },
      { sectionName: 'HVAC', itemText: 'Heating system tested', itemType: 'pass_fail', sortOrder: 4 },
      { sectionName: 'HVAC', itemText: 'Filter replaced', itemType: 'pass_fail', sortOrder: 5 },
      { sectionName: 'HVAC', itemText: 'Fireplace/flue inspected', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'Exterior', itemText: 'Roof condition checked', itemType: 'pass_fail', sortOrder: 7 },
      { sectionName: 'Exterior', itemText: 'Gutters clear of debris', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Exterior', itemText: 'Windows and doors sealed', itemType: 'pass_fail', sortOrder: 9 },
      { sectionName: 'Interior', itemText: 'No signs of pest intrusion', itemType: 'pass_fail', sortOrder: 10 },
      { sectionName: 'Notes', itemText: 'Seasonal notes', itemType: 'text', sortOrder: 11, required: false },
    ],
  },
  {
    name: 'Inventory',
    category: 'Inventory',
    description: 'Full inventory count of furnishings, appliances, linens, kitchenware, and amenities. Flags missing or damaged items.',
    basePrice: 129,
    estimatedMinutes: 75,
    items: [
      { sectionName: 'Bedroom', itemText: 'Number of pillows', itemType: 'number', sortOrder: 1 },
      { sectionName: 'Bedroom', itemText: 'Number of blankets', itemType: 'number', sortOrder: 2 },
      { sectionName: 'Bedroom', itemText: 'Number of sheet sets', itemType: 'number', sortOrder: 3 },
      { sectionName: 'Bathroom', itemText: 'Number of bath towels', itemType: 'number', sortOrder: 4 },
      { sectionName: 'Bathroom', itemText: 'Number of hand towels', itemType: 'number', sortOrder: 5 },
      { sectionName: 'Kitchen', itemText: 'All listed cookware present', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'Kitchen', itemText: 'Number of place settings', itemType: 'number', sortOrder: 7 },
      { sectionName: 'Kitchen', itemText: 'Small appliances present and working', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Living', itemText: 'TV and remotes present', itemType: 'pass_fail', sortOrder: 9 },
      { sectionName: 'Living', itemText: 'Missing or damaged items noted', itemType: 'text', sortOrder: 10, required: false },
    ],
  },
  {
    name: 'Move-Out Inspection',
    category: 'Tenant',
    description: 'Detailed move-out inspection for long-term rental tenants. Documents property condition, damage, and cleanliness at vacancy.',
    basePrice: 179,
    estimatedMinutes: 90,
    items: [
      { sectionName: 'Walls & Floors', itemText: 'Walls free of damage beyond normal wear', itemType: 'pass_fail', sortOrder: 1 },
      { sectionName: 'Walls & Floors', itemText: 'Floors in acceptable condition', itemType: 'pass_fail', sortOrder: 2 },
      { sectionName: 'Walls & Floors', itemText: 'Carpet condition', itemType: 'text', sortOrder: 3 },
      { sectionName: 'Kitchen', itemText: 'Appliances clean and functional', itemType: 'pass_fail', sortOrder: 4 },
      { sectionName: 'Kitchen', itemText: 'Cabinets and drawers clean', itemType: 'pass_fail', sortOrder: 5 },
      { sectionName: 'Bathrooms', itemText: 'Fixtures clean and undamaged', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'Bathrooms', itemText: 'Grout and caulk condition', itemType: 'text', sortOrder: 7 },
      { sectionName: 'Windows & Doors', itemText: 'All windows operable', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Windows & Doors', itemText: 'All keys returned', itemType: 'yes_no', sortOrder: 9 },
      { sectionName: 'Overall', itemText: 'Property left broom-clean', itemType: 'yes_no', sortOrder: 10 },
      { sectionName: 'Overall', itemText: 'Damage or deduction notes', itemType: 'text', sortOrder: 11, required: false },
    ],
  },
  {
    name: 'General Maintenance',
    category: 'Maintenance',
    description: 'Routine maintenance walkthrough covering plumbing, electrical, HVAC, appliances, and exterior. Flags items needing repair.',
    basePrice: 159,
    estimatedMinutes: 75,
    items: [
      { sectionName: 'Plumbing', itemText: 'No dripping faucets or leaks', itemType: 'pass_fail', sortOrder: 1 },
      { sectionName: 'Plumbing', itemText: 'All drains flowing freely', itemType: 'pass_fail', sortOrder: 2 },
      { sectionName: 'Plumbing', itemText: 'Water heater condition', itemType: 'text', sortOrder: 3 },
      { sectionName: 'Electrical', itemText: 'All outlets and switches functional', itemType: 'pass_fail', sortOrder: 4 },
      { sectionName: 'Electrical', itemText: 'Circuit breaker panel accessible and labeled', itemType: 'pass_fail', sortOrder: 5 },
      { sectionName: 'HVAC', itemText: 'HVAC operational', itemType: 'pass_fail', sortOrder: 6 },
      { sectionName: 'HVAC', itemText: 'Filter condition', itemType: 'text', sortOrder: 7 },
      { sectionName: 'Appliances', itemText: 'All appliances operational', itemType: 'pass_fail', sortOrder: 8 },
      { sectionName: 'Exterior', itemText: 'Exterior in good condition', itemType: 'pass_fail', sortOrder: 9 },
      { sectionName: 'Exterior', itemText: 'Gutters and drainage clear', itemType: 'pass_fail', sortOrder: 10 },
      { sectionName: 'Repairs', itemText: 'Items requiring repair', itemType: 'text', sortOrder: 11, required: false },
    ],
  },
]

// ---------------------------------------------------------------------------
// Demo data: property owner, staff, properties, bookings, assignments, repairs
// ---------------------------------------------------------------------------

function resultValueFor(item: { itemType: string; itemText: string }, fail = false): string {
  switch (item.itemType) {
    case 'pass_fail':
      return fail ? 'fail' : 'pass'
    case 'yes_no':
      return fail ? 'no' : 'yes'
    case 'number':
      return '6'
    case 'text':
      return fail ? 'Noted an issue — see flagged repair.' : 'All good, nothing to report.'
    default:
      return 'pass'
  }
}

async function seedDemoData() {
  console.log('\nSeeding demo data (properties, bookings, assignments, repairs)...')

  // 1. Property owner — reuse Christine's synced account if it exists, otherwise
  //    fall back to any existing customer, otherwise create a placeholder.
  let owner = await prisma.user.findFirst({ where: { email: 'geekola@gmail.com' } })
  if (!owner) owner = await prisma.user.findFirst({ where: { role: 'customer' } })

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        clerkId: 'REPLACE_WITH_YOUR_CLERK_USER_ID',
        name: 'Christine',
        email: 'geekola@gmail.com',
        role: 'customer',
        status: 'active',
      },
    })
    console.log('  No existing customer user found — created a placeholder owner (geekola@gmail.com).')
    console.log('  Log into the app once so your Clerk account syncs, then either delete this')
    console.log('  placeholder user and re-run "npm run db:seed", or update its clerkId to your')
    console.log('  real Clerk user ID so the seeded properties show up under your account.')
  } else {
    console.log(`  Using existing user as property owner: ${owner.email} (${owner.id})`)
  }

  // 2. Demo staff & repair tech accounts
  const staff1 = await prisma.user.upsert({
    where: { clerkId: 'seed_staff_jordan' },
    create: {
      clerkId: 'seed_staff_jordan',
      name: 'Jordan Reyes',
      email: 'jordan.reyes@cabincare.test',
      role: 'staff',
      status: 'active',
    },
    update: {},
  })
  const staff2 = await prisma.user.upsert({
    where: { clerkId: 'seed_staff_morgan' },
    create: {
      clerkId: 'seed_staff_morgan',
      name: 'Morgan Lee',
      email: 'morgan.lee@cabincare.test',
      role: 'staff',
      status: 'active',
    },
    update: {},
  })
  const repairTech = await prisma.user.upsert({
    where: { clerkId: 'seed_repairtech_alex' },
    create: {
      clerkId: 'seed_repairtech_alex',
      name: 'Alex Carter',
      email: 'alex.carter@cabincare.test',
      role: 'repair_tech',
      status: 'active',
    },
    update: {},
  })

  // 3. Properties
  const propertiesData = [
    {
      propertyName: 'Pine Ridge Cabin',
      address: '142 Pine Ridge Rd, Breckenridge, CO 80424',
      accessInstructions: 'Lockbox on the front porch railing. Driveway gate code: 4471#.',
      lockboxCode: '3920',
      notes: 'Well water — check pressure tank each visit. Propane tank is behind the shed.',
    },
    {
      propertyName: 'Lakeside Retreat',
      address: '88 Shoreline Dr, Tahoe City, CA 96145',
      accessInstructions: 'Keyless entry on the front door. Garage remote is inside the lockbox.',
      lockboxCode: '7741',
      notes: 'Dock needs seasonal removal each fall. Check hot tub cover ties after storms.',
    },
    {
      propertyName: 'Aspen Grove House',
      address: '210 Aspen Grove Ln, Park City, UT 84060',
      accessInstructions: 'Smart lock on the front door. Side gate is unlocked for crawlspace shutoff access.',
      lockboxCode: '5582',
      notes: 'New roof installed in 2025. HOA requires the driveway cleared within 24 hrs of snowfall.',
    },
  ]

  const properties: Record<string, { id: string; propertyName: string }> = {}
  for (const data of propertiesData) {
    let property = await prisma.property.findFirst({
      where: { ownerId: owner.id, propertyName: data.propertyName },
    })
    if (!property) {
      property = await prisma.property.create({ data: { ...data, ownerId: owner.id } })
      console.log(`  Created property "${data.propertyName}"`)
    } else {
      console.log(`  Skipping property "${data.propertyName}" (already exists)`)
    }
    properties[data.propertyName] = property
  }

  // 4. Look up seeded checklists with their items
  const checklistNames = ['Pre-Guest Arrival', 'Safety Compliance', 'Seasonal Cabin', 'General Maintenance']
  const checklistsByName: Record<string, any> = {}
  for (const name of checklistNames) {
    checklistsByName[name] = await prisma.checklist.findFirst({
      where: { name },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  }

  const now = new Date()
  const daysFrom = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000)

  async function createBooking({
    property,
    checklistNames: names,
    status,
    scheduledDate,
    backupDate,
    paymentStatus = 'paid',
  }: {
    property: { id: string; propertyName: string }
    checklistNames: string[]
    status: string
    scheduledDate: Date
    backupDate?: Date
    paymentStatus?: string
  }) {
    const existing = await prisma.booking.findFirst({
      where: { customerId: owner!.id, propertyId: property.id, scheduledDate },
    })
    if (existing) {
      console.log(`  Skipping booking for "${property.propertyName}" on ${scheduledDate.toDateString()} (already exists)`)
      return existing
    }

    const selected = names.map((n) => checklistsByName[n]).filter(Boolean)
    const totalPrice = selected.reduce((sum: number, c: any) => sum + c.basePrice, 0)

    const booking = await prisma.booking.create({
      data: {
        customerId: owner!.id,
        propertyId: property.id,
        totalPrice,
        paymentStatus: paymentStatus as any,
        status: status as any,
        scheduledDate,
        backupDate,
        bookingChecklists: {
          create: selected.map((c: any) => ({ checklistId: c.id, price: c.basePrice })),
        },
      },
    })
    console.log(`  Created booking for "${property.propertyName}" (${status}, ${scheduledDate.toDateString()})`)
    return booking
  }

  // Booking 1 — completed, ~18 days ago, with a pending repair flagged
  const booking1 = await createBooking({
    property: properties['Pine Ridge Cabin'],
    checklistNames: ['Seasonal Cabin'],
    status: 'completed',
    scheduledDate: daysFrom(-18),
  })

  // Booking 2 — assigned, upcoming in 4 days
  const booking2 = await createBooking({
    property: properties['Lakeside Retreat'],
    checklistNames: ['Pre-Guest Arrival', 'Safety Compliance'],
    status: 'assigned',
    scheduledDate: daysFrom(4),
  })

  // Booking 3 — pending, awaiting confirmation, in 12 days
  const booking3 = await createBooking({
    property: properties['Aspen Grove House'],
    checklistNames: ['General Maintenance'],
    status: 'pending',
    scheduledDate: daysFrom(12),
    backupDate: daysFrom(14),
    paymentStatus: 'pending',
  })

  // Booking 4 — completed ~35 days ago, with an approved repair + work order
  const booking4 = await createBooking({
    property: properties['Pine Ridge Cabin'],
    checklistNames: ['General Maintenance'],
    status: 'completed',
    scheduledDate: daysFrom(-35),
  })

  // 5. Assignments + results + repairs

  // Booking 1 → completed assignment with a pending (unreviewed) repair
  {
    const existing = await prisma.assignment.findFirst({ where: { bookingId: booking1.id } })
    if (!existing) {
      const items = checklistsByName['Seasonal Cabin']?.items ?? []
      await prisma.assignment.create({
        data: {
          bookingId: booking1.id,
          assignedStaffId: staff1.id,
          status: 'completed',
          startedAt: daysFrom(-18),
          completedAt: daysFrom(-18),
          results: {
            create: items.slice(0, 4).map((item: any, idx: number) => ({
              checklistItemId: item.id,
              resultValue: resultValueFor(item, idx === 2),
              notes: idx === 2 ? 'Water heater pilot light would not stay lit.' : undefined,
            })),
          },
          repairItems: {
            create: [
              {
                title: 'Water heater pilot light keeps going out',
                description: 'Pilot light extinguished twice during inspection. Likely a faulty thermocouple — recommend replacement before next guest stay.',
                estimatedHours: 1.5,
                hourlyRate: 85,
                materialCost: 40,
                subtotal: 1.5 * 85 + 40,
                status: 'pending',
                customerApproved: false,
              },
            ],
          },
        },
      })
      console.log(`  Created completed assignment for "Pine Ridge Cabin" (${booking1.scheduledDate.toDateString()}) with a pending repair`)
    } else {
      console.log('  Skipping assignment for booking 1 (already exists)')
    }
  }

  // Booking 2 → pending assignment (work not started yet)
  {
    const existing = await prisma.assignment.findFirst({ where: { bookingId: booking2.id } })
    if (!existing) {
      await prisma.assignment.create({
        data: {
          bookingId: booking2.id,
          assignedStaffId: staff1.id,
          status: 'pending',
        },
      })
      console.log(`  Created pending assignment for "Lakeside Retreat" (${booking2.scheduledDate.toDateString()})`)
    } else {
      console.log('  Skipping assignment for booking 2 (already exists)')
    }
  }

  // Booking 3 → no assignment yet (booking still pending confirmation)
  void booking3

  // Booking 4 → completed assignment with an approved repair + scheduled work order
  {
    const existing = await prisma.assignment.findFirst({ where: { bookingId: booking4.id } })
    if (!existing) {
      const items = checklistsByName['General Maintenance']?.items ?? []
      const assignment = await prisma.assignment.create({
        data: {
          bookingId: booking4.id,
          assignedStaffId: staff2.id,
          status: 'completed',
          startedAt: daysFrom(-35),
          completedAt: daysFrom(-35),
          results: {
            create: items.slice(0, 4).map((item: any, idx: number) => ({
              checklistItemId: item.id,
              resultValue: resultValueFor(item, idx === 3),
              notes: idx === 3 ? 'Cracked window pane in the guest bedroom.' : undefined,
            })),
          },
        },
      })

      const repairItem = await prisma.repairItem.create({
        data: {
          assignmentId: assignment.id,
          title: 'Replace cracked window pane — guest bedroom',
          description: 'Double-pane window in the east guest bedroom has a crack in the outer pane. Recommend replacement before winter.',
          estimatedHours: 2,
          hourlyRate: 75,
          materialCost: 120,
          subtotal: 2 * 75 + 120,
          status: 'approved',
          customerApproved: true,
        },
      })

      await prisma.workOrder.create({
        data: {
          repairItemId: repairItem.id,
          assignedTo: repairTech.id,
          status: 'scheduled',
          scheduledDate: daysFrom(3),
        },
      })

      console.log(`  Created completed assignment for "Pine Ridge Cabin" (${booking4.scheduledDate.toDateString()}) with an approved repair + scheduled work order`)
    } else {
      console.log('  Skipping assignment for booking 4 (already exists)')
    }
  }
}

async function main() {
  console.log('Seeding checklists...')

  for (const checklist of checklists) {
    const { items, ...checklistData } = checklist

    const existing = await prisma.checklist.findFirst({ where: { name: checklistData.name } })
    if (existing) {
      console.log(`  Skipping "${checklistData.name}" (already exists)`)
      continue
    }

    await prisma.checklist.create({
      data: {
        ...checklistData,
        items: {
          create: items.map((item) => ({
            sectionName: item.sectionName,
            itemText: item.itemText,
            itemType: item.itemType as any,
            required: item.required ?? true,
            sortOrder: item.sortOrder,
          })),
        },
      },
    })
    console.log(`  Created "${checklistData.name}"`)
  }

  await seedDemoData()

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
