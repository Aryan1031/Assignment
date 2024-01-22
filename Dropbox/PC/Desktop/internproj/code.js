const { parse } = require('date-fns');
const fs = require('fs');
const csv = require('csv-parser');

function cleanData(data) {
  return data.filter(row => (
    row['Time'] && row['Time Out'] && row['Timecard Hours (as Time)'] && row['Employee Name']
  ));
}

function calculateTimeDifference(startTime, endTime) {
  const start = parse(startTime, 'MM/dd/yyyy hh:mm a', new Date());
  const end = parse(endTime, 'MM/dd/yyyy hh:mm a', new Date());
  return Math.abs(end - start) / 36e5; // Convert milliseconds to hours
}

function analyzeData(data) {
  const results = [];

  let consecutiveDaysCount = 0;
  let prevEmployee = null;
  let prevTimeOut = null;

  data.forEach(row => {
    if (!prevEmployee || row['Employee Name'] !== prevEmployee) {
      consecutiveDaysCount = 0;
    } else {
      // Check consecutive days
      const timeDiff = calculateTimeDifference(prevTimeOut, row['Time']);
      if (timeDiff >= 24) {
        consecutiveDaysCount += 1;
        results.push({
          'Employee Name': row['Employee Name'],
          'Event': 'Consecutive Days',
          'Event Time': row['Time'],
        });
      } else {
        consecutiveDaysCount = 0;
      }

      // Check time between shifts
      if (timeDiff > 1 && timeDiff < 10) {
        results.push({
          'Employee Name': row['Employee Name'],
          'Event': 'Less Than 10 Hours Between Shifts',
          'Event Time': row['Time'],
        });
      }
    }

    // Check for more than 14 hours in a single shift
    const shiftHours = parseFloat(row['Timecard Hours (as Time)'].split(':')[0]);
    if (shiftHours > 14) {
      results.push({
        'Employee Name': row['Employee Name'],
        'Event': 'More Than 14 Hours in a Shift',
        'Event Time': row['Time'],
      });
    }

    // Check for 7 consecutive days
    if (consecutiveDaysCount === 7) {
      results.push({
        'Employee Name': row['Employee Name'],
        'Event': '7 Consecutive Days',
        'Event Time': row['Time'],
      });
    }

    prevEmployee = row['Employee Name'];
    prevTimeOut = row['Time Out'];
  });

  return results;
}
  

function writeResultsToFile(results) {
  // Write the results to a file (output.txt)
  const outputFileName = 'output.txt';
  const outputData = results.map(result => {
    return `${result['Employee Name']},${result['Event']},${result['Event Time']}`;
  }).join('\n');

  fs.writeFileSync(outputFileName, outputData);
}

// Read the CSV file
const inputFileName = 'data.csv'; // Replace with the actual file path
const data = [];

fs.createReadStream(inputFileName)
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    // Clean the data
    const cleanedData = cleanData(data);

    // Analyze the data
    const results = analyzeData(cleanedData);

    // Write results to output.txt
    writeResultsToFile(results);
  });
