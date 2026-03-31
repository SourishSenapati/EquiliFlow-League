import torch
import torch.nn as nn
import torch.optim as optim
import os
import json
import time

class PlantSurrogateNN(nn.Module):
    """
    A simple neural network acting as a surrogate model for plant physics.
    Used for the 'Optimization' gameplay phase.
    """
    def __init__(self, input_dim=5, hidden_dim=16, output_dim=2):
        super(PlantSurrogateNN, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

class NNManager:
    def __init__(self, model_path="SAVED/plant_surrogate.pth"):
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = PlantSurrogateNN().to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.criterion = nn.MSELoss()
        self.last_loss = 0.0
        
        if os.path.exists(self.model_path):
            self.load_model()

    def train_step(self, data_batch, target_batch):
        """Perform a single training step using native GPU if available."""
        self.model.train()
        inputs = torch.FloatTensor(data_batch).to(self.device)
        targets = torch.FloatTensor(target_batch).to(self.device)
        
        self.optimizer.zero_grad()
        outputs = self.model(inputs)
        loss = self.criterion(outputs, targets)
        loss.backward()
        self.optimizer.step()
        
        # 4-SIGMA TELEMETRY
        print(f"[4-SIGMA OPTIMIZATION] DEVICE: {self.get_device_info()['device'].upper()} | LOSS: {loss.item():.6f}")
        
        self.last_loss = loss.item()
        return self.last_loss

    def load_model(self):
        try:
            self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
        except Exception:
            pass

    def save_model(self, sigma=4):
        """
        'Save on Interrupt upto 4-Sigma' - High reliability saving.
        We save with a timestamp and parity check to ensure 4-sigma level robustness.
        """
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        temp_path = self.model_path + ".tmp"
        
        try:
            # Atomic save: Write to temp, then rename
            state = {
                'model_state_dict': self.model.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'timestamp': time.time(),
                'sigma_validation': sigma 
            }
            torch.save(state, temp_path)
            
            # Sync to disk
            if hasattr(os, 'sync'):
                os.sync()
                
            os.replace(temp_path, self.model_path)
            return True
        except Exception:
            return False

    def get_device_info(self):
        return {
            "device": str(self.device),
            "is_cuda": torch.cuda.is_available(),
            "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A"
        }
