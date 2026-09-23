import os
import shutil
import pandas as pd

class DataLoader:
    def __init__(self, data_dir=None):
        if data_dir is None:
            # We use the local backend/data directory for self-contained deployment
            current_dir = os.path.dirname(os.path.abspath(__file__))
            base_dir = os.path.abspath(os.path.join(current_dir, "../../"))
            self.data_dir = os.path.join(base_dir, "data")
        else:
            self.data_dir = data_dir
            
        self.original_file = os.path.join(self.data_dir, "CampusPulse_Academic_Dataset_Original.xlsx")
        self.live_file = os.path.join(self.data_dir, "CampusPulse_Live_Data.xlsx")
        self.required_sheets = ['Students', 'Programs', 'Courses', 'Enrollments', 'Learning_Activity']
        
        # In an ephemeral cloud environment, Live dataset might not exist on boot.
        # Initialize it from Original if it's missing.
        if not os.path.exists(self.live_file):
            self.reset_live_dataset()
        
    def reset_live_dataset(self):
        """Restores the live dataset from the original baseline."""
        if not os.path.exists(self.original_file):
            raise FileNotFoundError(f"CRITICAL ERROR: Original dataset missing at {self.original_file}")
            
        print("Resetting live dataset to original baseline...")
        shutil.copy2(self.original_file, self.live_file)
        print("Live dataset reset successfully.")

    def ensure_live_dataset(self):
        """Creates the live dataset from the original if it doesn't exist."""
        if not os.path.exists(self.original_file):
            raise FileNotFoundError(f"CRITICAL ERROR: Original dataset missing at {self.original_file}")
            
        if not os.path.exists(self.live_file):
            print("Live dataset not found. Creating from original...")
            shutil.copy2(self.original_file, self.live_file)
            print("Live dataset created successfully.")
            
    def load_data(self):
        """Loads all sheets from the live dataset into a dictionary of DataFrames."""
        self.ensure_live_dataset()
        
        try:
            print(f"Loading live dataset from {self.live_file}...")
            # Load all sheets
            excel_data = pd.read_excel(self.live_file, sheet_name=None)
            
            # Check for required sheets
            missing_sheets = [sheet for sheet in self.required_sheets if sheet not in excel_data]
            if missing_sheets:
                raise ValueError(f"Missing required sheets in dataset: {missing_sheets}")
                
            # Filter only required sheets to avoid processing unnecessary data
            dataframes = {sheet: excel_data[sheet] for sheet in self.required_sheets}
            print("Data loaded successfully.")
            return dataframes
            
        except Exception as e:
            raise RuntimeError(f"Failed to load data: {e}")
