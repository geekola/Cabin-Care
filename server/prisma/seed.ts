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

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
