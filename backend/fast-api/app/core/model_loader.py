import torch
import torch.nn as nn
from torchvision import models
import os
from app.core.config import settings

class ANFIS(nn.Module):
    def __init__(self, input_dim=16, num_rules=8):
        super().__init__()
        self.centers = nn.Parameter(torch.randn(num_rules, input_dim))
        self.sigmas = nn.Parameter(torch.ones(num_rules, input_dim))
        self.coeff = nn.Parameter(torch.randn(num_rules, input_dim))
        self.bias = nn.Parameter(torch.randn(num_rules, 1))

    def forward(self, x):
        x_exp = x.unsqueeze(1)
        mu = torch.exp(-((x_exp - self.centers)**2) / (2 * (self.sigmas**2) + 1e-6))
        w = torch.prod(mu, dim=2)
        w_norm = w / (torch.sum(w, dim=1, keepdim=True) + 1e-6)
        f = torch.matmul(x, self.coeff.t()) + self.bias.squeeze(-1)
        out = torch.sum(w_norm * f, dim=1)
        return out.unsqueeze(1), mu, w_norm, f


class ANFISCNN(nn.Module):
    def __init__(self, num_rules=8, anfis_dim=16):
        super().__init__()
        self.resnet = models.resnet50(weights=None)
        self.densenet = models.densenet121(weights=None)
        self.mobilenet = models.mobilenet_v2(weights=None)

        rf = self.resnet.fc.in_features
        df = self.densenet.classifier.in_features
        mf = self.mobilenet.classifier[1].in_features

        self.resnet.fc = nn.Identity()
        self.densenet.classifier = nn.Identity()
        self.mobilenet.classifier = nn.Identity()

        self.feature_reduction = nn.Sequential(
            nn.Linear(rf + df + mf, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, anfis_dim),
            nn.BatchNorm1d(anfis_dim),
            nn.Tanh()
        )

        self.anfis = ANFIS(input_dim=anfis_dim, num_rules=num_rules)

    def forward(self, x):
        f1 = self.resnet(x)
        f2 = self.densenet(x)
        f3 = self.mobilenet(x)
        fused = torch.cat([f1, f2, f3], dim=1)

        reduced_features = self.feature_reduction(fused)
        logits, mu, w_norm, rule_outputs = self.anfis(reduced_features)
        
        return {
            "logits": logits,
            "fused_dim": fused.shape[1],
            "reduced_features": reduced_features,
            "membership_degrees": mu,
            "rule_firing_strengths": w_norm,
            "rule_outputs": rule_outputs
        }


# Singleton model instance loader
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None

def get_model() -> ANFISCNN:
    global _model
    if _model is None:
        model = ANFISCNN(num_rules=settings.NUM_RULES, anfis_dim=settings.ANFIS_DIM)
        if settings.MODEL_PATH.exists():
            print(f"[ModelLoader] Loading trained weights from {settings.MODEL_PATH}")
            try:
                state_dict = torch.load(settings.MODEL_PATH, map_location=device)
                model.load_state_dict(state_dict)
            except Exception as e:
                print(f"[ModelLoader] Warning: Could not load state dict: {e}")
        else:
            print(f"[ModelLoader] Warning: {settings.MODEL_PATH} not found. Running with initialized weights.")
        model.to(device)
        model.eval()
        _model = model
    return _model
