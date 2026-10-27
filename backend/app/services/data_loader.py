import os
import shutil
import threading
import pandas as pd

class DataLoader:
    _lock = threading.RLock()

    def __init__(self, data_dir=None):
        if data_dir is not None:
            self.data_dir = data_dir
            self.live_data_dir = data_dir
        else:
            # Check environment variables for custom data locations (e.g. Render persistent disk)
            env_data_dir = os.environ.get("DATA_DIR")
            env_persistent_dir = os.environ.get("PERSISTENT_DATA_DIR") or os.environ.get("LIVE_DATA_DIR")
            
            current_dir = os.path.dirname(os.path.abspath(__file__))
            default_base_dir = os.path.abspath(os.path.join(current_dir, "../../"))
            default_data_dir = os.path.join(default_base_dir, "data")
            
            self.data_dir = env_data_dir if (env_data_dir and os.path.exists(env_data_dir)) else default_data_dir
            self.live_data_dir = env_persistent_dir if (env_persistent_dir and os.path.exists(env_persistent_dir)) else self.data_dir

        self.original_file = os.environ.get(
            "ORIGINAL_DATASET_PATH",
            os.path.join(self.data_dir, "CampusPulse_Academic_Dataset_Original.xlsx")
        )
        self.live_file = os.environ.get(
            "LIVE_DATASET_PATH",
            os.path.join(self.live_data_dir, "CampusPulse_Live_Data.xlsx")
        )
        self.required_sheets = ['Students', 'Programs', 'Courses', 'Enrollments', 'Learning_Activity']
        
        # Verify the original dataset exists and is readable
        self.validate_original_dataset()
        
        # Initialize live dataset if missing
        self.ensure_live_dataset()

    def validate_original_dataset(self):
        """Validates that the authoritative original dataset exists and has the required sheets."""
        if not os.path.exists(self.original_file):
            raise FileNotFoundError(
                f"CRITICAL ERROR: Original dataset missing at {self.original_file}. "
                "Ensure the original Excel file is packaged with the deployment or configured via ORIGINAL_DATASET_PATH."
            )
        try:
            excel_file = pd.ExcelFile(self.original_file)
            missing = [s for s in self.required_sheets if s not in excel_file.sheet_names]
            if missing:
                raise ValueError(f"CRITICAL ERROR: Original dataset missing required worksheets: {missing}")
        except Exception as e:
            raise RuntimeError(f"CRITICAL ERROR: Failed to read authoritative original dataset at {self.original_file}: {e}")

    def reset_live_dataset(self):
        """Restores the live working dataset from the original baseline under a thread lock."""
        with self._lock:
            self.validate_original_dataset()
            print(f"Resetting live dataset from {self.original_file} to {self.live_file}...")
            # Ensure target directory exists
            os.makedirs(os.path.dirname(os.path.abspath(self.live_file)), exist_ok=True)
            # Use atomic copy
            temp_target = self.live_file + ".tmp"
            shutil.copy2(self.original_file, temp_target)
            if os.path.exists(self.live_file):
                os.replace(temp_target, self.live_file)
            else:
                shutil.move(temp_target, self.live_file)
            print("Live dataset reset successfully to authoritative baseline.")

    def ensure_live_dataset(self):
        """Creates the live dataset from the original if it does not yet exist."""
        with self._lock:
            if not os.path.exists(self.live_file):
                print(f"Live dataset not found at {self.live_file}. Initializing from original baseline...")
                self.reset_live_dataset()

    def load_data(self):
        """Loads all required sheets from the live dataset into a dictionary of DataFrames."""
        self.ensure_live_dataset()
        
        with self._lock:
            try:
                print(f"Loading live dataset from {self.live_file}...")
                excel_data = pd.read_excel(self.live_file, sheet_name=None)
                
                missing_sheets = [sheet for sheet in self.required_sheets if sheet not in excel_data]
                if missing_sheets:
                    # Attempt safe recovery from original if live file is corrupt
                    print(f"Warning: Live dataset missing sheets {missing_sheets}. Recovering from baseline...")
                    self.reset_live_dataset()
                    excel_data = pd.read_excel(self.live_file, sheet_name=None)
                    
                dataframes = {sheet: excel_data[sheet] for sheet in self.required_sheets}
                print("Live dataset loaded successfully.")
                return dataframes
                
            except Exception as e:
                # Attempt automatic recovery if corrupted
                print(f"Failed to read live dataset ({e}). Attempting recovery from original baseline...")
                try:
                    self.reset_live_dataset()
                    excel_data = pd.read_excel(self.live_file, sheet_name=None)
                    return {sheet: excel_data[sheet] for sheet in self.required_sheets}
                except Exception as recover_err:
                    raise RuntimeError(f"Failed to load dataset after recovery attempt: {recover_err}")

    def get_diagnostics(self):
        """Returns metadata about the active data configuration and persistence mode."""
        is_custom_live = os.path.dirname(os.path.abspath(self.live_file)) != os.path.dirname(os.path.abspath(self.original_file))
        return {
            "original_file": os.path.abspath(self.original_file),
            "original_exists": os.path.exists(self.original_file),
            "live_file": os.path.abspath(self.live_file),
            "live_exists": os.path.exists(self.live_file),
            "storage_mode": "persistent_disk" if is_custom_live else "packaged_local",
            "required_sheets": self.required_sheets
        }

