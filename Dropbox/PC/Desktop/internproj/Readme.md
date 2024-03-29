Data Format Assumption:
It is assumed that the input CSV file has columns named 'Time', 'Time Out', 'Timecard Hours (as Time)', and 'Employee Name'.
The 'Time' and 'Time Out' columns are assumed to be in a datetime format.
The 'Timecard Hours (as Time)' column is assumed to be in the format '%H:%M', representing hours and minutes.

Handling Null Values:
The code assumes that missing or null values in essential columns ('Time', 'Time Out', 'Timecard Hours (as Time)', 'Employee Name') will be handled during the data cleaning process.

Event Detection Assumption:
The code assumes that if an employee works for 7 consecutive days, the event is labeled as '7 Consecutive Days'.
If an employee has less than 10 hours between shifts but greater than 1 hour, the event is labeled as 'Less Than 10 Hours Between Shifts'.
If an employee works for more than 14 hours in a single shift, the event is labeled as 'More Than 14 Hours in a Shift'.
Consecutive days are determined based on the difference between consecutive 'Time' and 'Time Out' values.

Output Format Assumption:
The results are printed as a DataFrame containing columns 'Employee Name', 'Event', and 'Event Time'.
The DataFrame is printed to the console.

