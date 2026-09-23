from app.services.data_loader import DataLoader
from app.services.data_processor import DataProcessor
import pandas as pd
import numpy as np

class DataCache:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataCache, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
        
    def _initialize(self):
        self.raw_data = None
        self.analytical_data = None
        self.report_lines = []
        self.last_updated = None
        
    def load_and_process(self):
        loader = DataLoader()
        self.raw_data = loader.load_data()
        
        processor = DataProcessor(self.raw_data)
        self.analytical_data, self.report_lines = processor.process()
        
        import os
        import datetime
        if os.path.exists(loader.live_file):
            mtime = os.path.getmtime(loader.live_file)
            self.last_updated = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
            
    def get_data(self):
        if self.raw_data is None or self.analytical_data is None:
            self.load_and_process()
        return {
            "raw": self.raw_data,
            "analytical": self.analytical_data,
            "last_updated": self.last_updated,
            "report_lines": self.report_lines
        }
        
    def invalidate(self):
        self._initialize()

# Helper function to serialize numpy/pandas types to standard python types for JSON
def serialize_for_api(obj):
    if isinstance(obj, pd.DataFrame):
        return obj.replace({np.nan: None}).to_dict(orient="records")
    if isinstance(obj, pd.Series):
        return obj.replace({np.nan: None}).tolist()
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    if isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: serialize_for_api(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [serialize_for_api(i) for i in obj]
    return obj
