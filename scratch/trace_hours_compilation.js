const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const agentId = 'cmrqieu7v000njp04z0m2n4wy';
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { organization: true }
  });

  if (!agent) {
    console.log('Agent not found');
    return;
  }

  // 1. Fetch business hours context
  const businessHoursList = await prisma.businessHours.findMany({
    where: { organizationId: agent.organizationId }
  });

  console.log(`Number of Business Hours records: ${businessHoursList.length}`);

  let hoursContext = '';
  if (businessHoursList.length > 0) {
    const tz = businessHoursList[0].timezone;
    hoursContext = `Our official Business Working Hours (Timezone: ${tz}):\n`;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedHoursList = [...businessHoursList].sort((a, b) => {
      const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
      const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
      return dayA - dayB;
    });
    sortedHoursList.forEach(bh => {
      const dayName = weekdays[bh.dayOfWeek];
      if (bh.isEnabled) {
        hoursContext += `- ${dayName}: ${bh.startTime} to ${bh.endTime}\n`;
      } else {
        hoursContext += `- ${dayName}: Closed / Unavailable\n`;
      }
    });
  } else {
    hoursContext = `Our official Business Working Hours: Monday to Friday from 09:00 to 17:00 (UTC). Weekends are Closed.`;
  }

  console.log('--- GENERATED HOURS CONTEXT ---');
  console.log(hoursContext);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
