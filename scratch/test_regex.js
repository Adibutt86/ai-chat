const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const testText = `Our official Business Working Hours (Timezone: UTC):
- Thursday: 09:00 to 17:00
- Friday: 09:00 to 17:00
- Saturday: 09:00 to 17:00
- Sunday: 09:00 to 17:00
- Monday: 10:00 to 17:00
- Tuesday: 09:00 to 17:00
- Wednesday: 09:00 to 17:00`;

const lines = testText.split('\n');
let headerText = '';
let footerText = '';
let hoursHtml = '';
let hasHours = false;

lines.forEach(line => {
  const match = line.match(/(?:-|\*|\s)*\s*(?:\*\*)?([a-zA-Z]+)(?:\*\*)?:\s*(.*)/);
  console.log(`Line: "${line}"`);
  if (match) {
    console.log(`  Match 1: "${match[1]}", Match 2: "${match[2]}"`);
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(match[1].toLowerCase())) {
      hasHours = true;
      const day = match[1];
      const hours = match[2].trim();
      hoursHtml += `  [Day: ${day}, Hours: ${hours}]\n`;
    } else {
      console.log(`  Not a weekday: "${match[1]}"`);
    }
  } else {
    console.log('  No match');
  }
});

console.log('\n--- OUTPUT HOURS ---');
console.log(hoursHtml);
