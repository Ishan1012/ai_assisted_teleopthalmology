class AnalyticsController:
    def get_analytics_data(self):
        metrics = [
            {
                "model": "MultiNet-ANFIS",
                "auc": 0.974,
                "accuracy": 0.940,
                "sensitivity": 0.957,
                "specificity": 0.928,
                "ap": 0.973
            },
            {
                "model": "MobileNetV2",
                "auc": 0.588,
                "accuracy": 0.570,
                "sensitivity": 0.470,
                "specificity": 0.610,
                "ap": 0.533
            },
            {
                "model": "DenseNet121",
                "auc": 0.486,
                "accuracy": 0.450,
                "sensitivity": 0.940,
                "specificity": 0.380,
                "ap": 0.428
            },
            {
                "model": "ResNet18",
                "auc": 0.451,
                "accuracy": 0.430,
                "sensitivity": 0.880,
                "specificity": 0.340,
                "ap": 0.441
            }
        ]

        confusion_matrix = {
            "tn": 180,
            "fp": 14,
            "fn": 16,
            "tp": 146,
            "labels": ["Normal", "Glaucoma"]
        }

        dataset_summary = [
            {"dataset": "ACRIMA", "total_images": "705", "normal": "309", "glaucoma": "396", "characteristics": "Cropped optic disc images emphasizing structural cupping"},
            {"dataset": "RIM-ONE DL", "total_images": "485", "normal": "313", "glaucoma": "172", "characteristics": "High-res images from Spanish hospitals with expert consensus"},
            {"dataset": "Drishti-GS1", "total_images": "101", "normal": "31", "glaucoma": "70", "characteristics": "Indian clinical settings with optic nerve segmentation masks"},
            {"dataset": "G1020", "total_images": "1020", "normal": "724", "glaucoma": "296", "characteristics": "Large-scale dataset with diverse glaucoma degrees"},
            {"dataset": "HRF", "total_images": "45", "normal": "15", "glaucoma": "15", "characteristics": "High-resolution fundus captures (Normal, Glaucoma, DR)"}
        ]

        return {
            "metrics": metrics,
            "confusion_matrix": confusion_matrix,
            "dataset_summary": dataset_summary
        }

analytics_controller = AnalyticsController()
