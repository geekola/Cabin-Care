import { prisma } from '../lib/prisma'
import { resend, FROM_ADDRESS } from '../lib/resend'

// ---------------------------------------------------------------------------
// Season detection
// ---------------------------------------------------------------------------

type Season = 'spring' | 'summer' | 'fall' | 'winter'

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1–12
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

// ---------------------------------------------------------------------------
// Seasonal content
// ---------------------------------------------------------------------------

interface SeasonalContent {
  subject: string
  preheader: string
  headline: string
  intro: string
  tips: { title: string; body: string }[]
  closing: string
}

const SEASONAL_CONTENT: Record<Season, SeasonalContent> = {
  spring: {
    subject: 'Spring Property Care Tips from Cabin Care',
    preheader: 'Time to shake off winter — here's your spring checklist.',
    headline: 'Spring Is Here — Time for a Post-Winter Walkthrough',
    intro:
      'Winter can be hard on properties. Now that the snow has cleared, it's the perfect time to assess any damage and get your cabin ready for the busy season ahead.',
    tips: [
      {
        title: 'Inspect the Roof & Gutters',
        body: 'Check for missing shingles, ice-dam damage, and debris-clogged gutters. Clear gutters prevent water intrusion as spring rains pick up.',
      },
      {
        title: 'Service Your HVAC System',
        body: 'Schedule an annual HVAC tune-up before summer heat arrives. Replace filters and confirm the system is cooling correctly.',
      },
      {
        title: 'Check for Pest Entry Points',
        body: 'Animals and insects seek shelter over winter. Inspect crawl spaces, attics, and foundation vents for signs of intrusion or new gaps.',
      },
      {
        title: 'Test Safety Equipment',
        body: 'Test smoke detectors, CO detectors, and fire extinguishers. Replace batteries in any low-power devices.',
      },
      {
        title: 'Exterior Touch-Up',
        body: 'Look for cracked caulking around windows and doors. A fresh coat of exterior stain or paint on wood surfaces protects against summer UV and moisture.',
      },
    ],
    closing:
      'Need an inspection before the season kicks off? Book one anytime through your Cabin Care dashboard.',
  },

  summer: {
    subject: 'Summer Property Care Tips from Cabin Care',
    preheader: 'Keep your cabin cool, safe, and guest-ready all summer.',
    headline: 'Summer Checklist — Keep Your Property at Its Best',
    intro:
      'Summer brings higher occupancy, hotter temperatures, and increased wear. Here's what to stay on top of to keep your cabin comfortable and protected.',
    tips: [
      {
        title: 'Monitor HVAC Performance',
        body: 'High temperatures put extra strain on cooling systems. If guests report warm rooms, address it quickly — a service call now is cheaper than an emergency repair mid-season.',
      },
      {
        title: 'Deck & Patio Safety',
        body: 'Inspect deck boards, railings, and stairs for rot, loose fasteners, or splintering. Summer foot traffic accelerates wear on outdoor surfaces.',
      },
      {
        title: 'Wildfire Preparedness (if applicable)',
        body: 'Clear dry brush and debris within 30 feet of the structure. Confirm you have an updated defensible-space plan if you're in a fire-prone area.',
      },
      {
        title: 'Pest & Bug Control',
        body: 'Warm months bring ants, wasps, and mosquitoes. Check eaves for wasp nests and seal gaps around plumbing and utility lines.',
      },
      {
        title: 'Water Heater & Plumbing',
        body: 'Flush your water heater to remove sediment buildup. Check under sinks and around toilets for slow leaks that are easy to miss between visits.',
      },
    ],
    closing:
      'Heading into peak season? Schedule a mid-summer inspection to catch small issues before they affect guests.',
  },

  fall: {
    subject: 'Fall Maintenance Tips from Cabin Care',
    preheader: 'Get ahead of winter — your fall property checklist.',
    headline: 'Fall Is the Best Time to Winterize',
    intro:
      'A little preparation in fall saves a lot of headaches in winter. Here are the most important steps to protect your property before temperatures drop.',
    tips: [
      {
        title: 'Heating System Service',
        body: 'Have your furnace or boiler inspected and serviced before the first cold snap. Replace filters and stock up on any fuel or supplies needed for the season.',
      },
      {
        title: 'Winterize Outdoor Plumbing',
        body: 'Shut off and drain outdoor hose bibs and irrigation systems. Burst pipes from freezing water are one of the most expensive and preventable cabin issues.',
      },
      {
        title: 'Gutter & Downspout Cleaning',
        body: 'Clear leaves and debris after trees have dropped for the season. Clogged gutters lead to ice dams that damage roofs and siding through winter.',
      },
      {
        title: 'Roof Inspection',
        body: 'Identify and repair any compromised shingles or flashing before snow load and freeze-thaw cycles worsen the damage.',
      },
      {
        title: 'Seal Drafts & Gaps',
        body: 'Check weatherstripping on doors and windows. A well-sealed cabin is significantly cheaper to heat and far more comfortable for winter guests.',
      },
    ],
    closing:
      'Book your fall inspection now — slots fill up fast as property owners get ready for winter.',
  },

  winter: {
    subject: 'Winter Property Care Tips from Cabin Care',
    preheader: 'Protect your cabin through the coldest months.',
    headline: 'Winter Property Care — Stay Ahead of the Cold',
    intro:
      'Winter is when preventable problems become expensive ones. Staying proactive now protects your investment and keeps your guests comfortable.',
    tips: [
      {
        title: 'Prevent Frozen Pipes',
        body: 'Keep the thermostat set to at least 55°F even when unoccupied. Open cabinet doors under sinks on exterior walls to let warm air circulate.',
      },
      {
        title: 'Monitor Remotely',
        body: 'Consider a smart thermostat or water leak sensor if you don't already have one. Remote monitoring gives you early warning on temperature drops or leaks.',
      },
      {
        title: 'Snow & Ice Management',
        body: 'Arrange for regular snow removal from driveways and decks. Ice buildup on roof edges (ice dams) can force water under shingles — remove it early.',
      },
      {
        title: 'Check in After Storms',
        body: 'After major weather events, a quick check confirms the property is intact — especially rooflines, entry points, and utility connections.',
      },
      {
        title: 'Fireplace & Wood Stove Safety',
        body: 'If your cabin has a fireplace or wood stove, ensure the chimney was cleaned this season. Creosote buildup is a fire hazard and should be inspected annually.',
      },
    ],
    closing:
      'A winter inspection gives you peace of mind through the off-season. Book one anytime from your dashboard.',
  },
}

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function buildEmailHtml(content: SeasonalContent, ownerName: string): string {
  const tipRows = content.tips
    .map(
      (tip) => `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color: #F5E9D3; border-left: 4px solid #D9A441; border-radius: 4px; padding: 14px 16px;">
                <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1F4D3A; font-family: Roboto, Arial, sans-serif;">
                  ${tip.title}
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #2C3A32; font-family: Roboto, Arial, sans-serif;">
                  ${tip.body}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8ECEB; font-family: Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8ECEB; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1F4D3A; border-radius: 8px 8px 0 0; padding: 28px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #D9A441; font-family: Roboto, Arial, sans-serif;">
                CABIN CARE
              </p>
              <p style="margin: 0; font-size: 11px; letter-spacing: 2px; color: #D9A441; font-family: Roboto, Arial, sans-serif;">
                — SERVICES —
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px 24px 32px; border-radius: 0 0 8px 8px;">

              <p style="margin: 0 0 8px 0; font-size: 13px; color: #8BBBD9; letter-spacing: 1px; font-family: Roboto, Arial, sans-serif; text-transform: uppercase;">
                Monthly Property Care
              </p>
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1F4D3A; font-family: Roboto, Arial, sans-serif; line-height: 1.3;">
                ${content.headline}
              </h1>
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.7; color: #2C3A32; font-family: Roboto, Arial, sans-serif;">
                Hi ${ownerName},<br/><br/>${content.intro}
              </p>

              <!-- Tips -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${tipRows}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 28px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #2C3A32; font-family: Roboto, Arial, sans-serif;">
                      ${content.closing}
                    </p>
                    <a href="${process.env.APP_URL ?? 'https://app.cabincare.com'}/bookings"
                       style="display: inline-block; background-color: #1F4D3A; color: #ffffff; font-size: 14px; font-weight: 700; font-family: Roboto, Arial, sans-serif; padding: 12px 24px; border-radius: 6px; text-decoration: none; letter-spacing: 0.5px;">
                      Book an Inspection
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #E8ECEB; margin: 0 0 20px 0;" />

              <p style="margin: 0; font-size: 13px; color: #8BBBD9; line-height: 1.6; font-family: Roboto, Arial, sans-serif;">
                You're receiving this because you're a Cabin Care property owner.<br/>
                <a href="${process.env.APP_URL ?? 'https://app.cabincare.com'}" style="color: #8BBBD9;">cabincare.com</a>
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Send to all active owners
// ---------------------------------------------------------------------------

export async function sendSeasonalEmails(): Promise<{ sent: number; failed: number; season: Season }> {
  const season = getCurrentSeason()
  const content = SEASONAL_CONTENT[season]

  const owners = await prisma.user.findMany({
    where: { role: 'customer', status: 'active' },
    select: { id: true, name: true, email: true },
  })

  let sent = 0
  let failed = 0

  for (const owner of owners) {
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: owner.email,
        subject: content.subject,
        html: buildEmailHtml(content, owner.name.split(' ')[0] ?? owner.name),
      })
      sent++
    } catch (err) {
      console.error(`Failed to send seasonal email to ${owner.email}:`, err)
      failed++
    }
  }

  console.log(`Seasonal email (${season}): ${sent} sent, ${failed} failed`)
  return { sent, failed, season }
}
