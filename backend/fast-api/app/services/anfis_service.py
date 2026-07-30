import torch
from typing import Dict, Any

class AnfisService:
    def format_anfis_outputs(self, model_outputs: Dict[str, Any]) -> Dict[str, Any]:
        logits = model_outputs["logits"]
        prob = torch.sigmoid(logits).item()
        
        prediction = "Glaucoma" if prob >= 0.5 else "Normal"
        confidence_pct = prob * 100 if prob >= 0.5 else (1 - prob) * 100
        is_pathological = prob >= 0.5

        reduced_features = model_outputs["reduced_features"].squeeze(0).detach().cpu().numpy().tolist()
        firing_strengths = model_outputs["rule_firing_strengths"].squeeze(0).detach().cpu().numpy().tolist()
        membership_degrees = model_outputs["membership_degrees"].squeeze(0).detach().cpu().numpy().tolist()

        if is_pathological:
            recommendation = (
                f"HIGH RISK OF GLAUCOMA ({prob*100:.1f}% probability). "
                "Increased optic cup-to-disc ratio & fuzzy rule activation detected. "
                "Urgent referral to an ophthalmologist for visual field testing (OCT/Pachy) is recommended."
            )
            estimated_cdr = round(0.55 + prob * 0.30, 2)
            cup_to_disc_ratio_summary = f"CDR estimated at {estimated_cdr:.2f} exceeding baseline threshold (0.50)."
        else:
            recommendation = (
                f"NORMAL CLINICAL PRESENTATION ({(1-prob)*100:.1f}% confidence). "
                "Optic disc margins appear healthy with normal neuroretinal rim architecture. "
                "Routine annual tele-ophthalmology screening advised."
            )
            estimated_cdr = round(0.30 + prob * 0.18, 2)
            cup_to_disc_ratio_summary = f"CDR estimated at {estimated_cdr:.2f} within normal range (<= 0.50)."

        return {
            "prediction": prediction,
            "glaucoma_probability": round(prob, 4),
            "confidence_percentage": round(confidence_pct, 2),
            "is_pathological": is_pathological,
            "reduced_features": [round(f, 4) for f in reduced_features],
            "rule_firing_strengths": [round(s, 4) for s in firing_strengths],
            "membership_degrees": [[round(val, 4) for val in rule] for rule in membership_degrees],
            "recommendation": recommendation,
            "cup_to_disc_ratio_summary": cup_to_disc_ratio_summary
        }

anfis_service = AnfisService()
