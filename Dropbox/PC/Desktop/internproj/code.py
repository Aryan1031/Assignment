import pandas as pd
from datetime import datetime, timedelta

def clean_data(df):
    # Fill null values with appropriate defaults
    df['Time'] = pd.to_datetime(df['Time'], errors='coerce')
    df['Time Out'] = pd.to_datetime(df['Time Out'], errors='coerce')
    df['Timecard Hours (as Time)'] = pd.to_datetime(df['Timecard Hours (as Time)'], errors='coerce', format='%H:%M')

    # Remove rows with missing essential data
    df = df.dropna(subset=['Time', 'Time Out', 'Timecard Hours (as Time)', 'Employee Name'])

    return df

def analyze_data(df):
    # Sort the DataFrame by employee name and time
    df = df.sort_values(by=['Employee Name', 'Time'])

    # Initialize variables for consecutive days and time between shifts
    consecutive_days_count = 0
    prev_employee = None
    prev_time_out = None

    # Create a list to store the results
    results_list = []

    for index, row in df.iterrows():
        if prev_employee is None or row['Employee Name'] != prev_employee:
            consecutive_days_count = 0
        else:
            # Check consecutive days
            time_diff = row['Time'] - prev_time_out
            if time_diff.days == 1:
                consecutive_days_count += 1
                results_list.append({'Employee Name': row['Employee Name'], 'Event': 'Consecutive Days',
                                     'Event Time': row['Time']})
            else:
                consecutive_days_count = 0

            # Check time between shifts
            hours_between_shifts = time_diff.total_seconds() / 3600
            if 1 < hours_between_shifts < 10:
                results_list.append({'Employee Name': row['Employee Name'], 'Event': 'Less Than 10 Hours Between Shifts',
                                     'Event Time': row['Time']})

        # Check for more than 14 hours in a single shift
        shift_hours = row['Timecard Hours (as Time)'].hour + row['Timecard Hours (as Time)'].minute / 60
        if shift_hours > 14:
            results_list.append({'Employee Name': row['Employee Name'], 'Event': 'More Than 14 Hours in a Shift',
                                 'Event Time': row['Time']})

        # Check for 7 consecutive days
        if consecutive_days_count == 7:
            results_list.append({'Employee Name': row['Employee Name'], 'Event': '7 Consecutive Days',
                                 'Event Time': row['Time']})

        prev_employee = row['Employee Name']
        prev_time_out = row['Time Out']

    # Convert the list to a DataFrame
    results_df = pd.DataFrame(results_list)

    # Write the results DataFrame to a CSV file
    results_df.to_csv('output.txt', index=False)

if __name__ == "__main__":
    # Read the input file
    file_path = 'data.csv'  # Replace with the actual file path
    df = pd.read_csv(file_path)

    # Clean the data
    df = clean_data(df)

    # Analyze the data and write results to output.txt
    analyze_data(df)
