import os
from engine.ai_manager import NNManager

def test_ai_manager_save():
    model_path = "SAVED/test_surrogate.pth"
    if os.path.exists(model_path):
        os.remove(model_path)
    if os.path.exists(model_path + ".tmp"):
        os.remove(model_path + ".tmp")
        
    ai = NNManager(model_path=model_path)
    
    # Save the model
    success = ai.save_model()
    assert success is True
    assert os.path.exists(model_path)
    
    # Load the model
    ai.load_model()
    
    # Invalid model
    with open(model_path, "w") as f:
        f.write("invalid")
    ai.load_model()  # Should not raise exception
    
    # Save failure test by passing invalid path where makedirs fails
    ai2 = NNManager(model_path="X:/invalid_volume/test.pth")
    assert ai2.save_model() is False
    
    if os.path.exists(model_path):
        os.remove(model_path)
