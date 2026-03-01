# AI-Assisted Teleophthalmology

This repository contains code and datasets for an AI-assisted teleophthalmology project focused on detecting glaucoma from retinal images. The main components include data preprocessing scripts, a trained model, and a Jupyter notebook for experimentation.

## Project Structure

- `main.ipynb` – Primary Jupyter notebook demonstrating data loading, preprocessing, model training, and evaluation.
- `best_model.pth` – Saved PyTorch model weights achieving the best validation performance.
- `datasets/` – Directory holding several public retinal image datasets used for training and testing.
- `output/` – Folder for generated logs, results, or output images during experiments.

## Datasets

The project uses a combination of publicly available retinal datasets, organized under `datasets/`. Below is a brief description of each:

### ACRIMA
- Contains images categorized into `Glaucoma` and `Non Glaucoma` classes.
- Split into `train/` and `test/` subfolders, each with separate class directories.

### Drishti-GS1
- Retinal fundus images with ground truth segmentations.
- Structured into `Training` and `Test` sets.
- Images and GT masks are organized by patient ID (e.g., `drishtiGS_001`).

### HRF (High-Resolution Fundus)
- Includes `images/` of retinal scans and corresponding `manual1/` segmentations.
- `mask/` folder contains additional binary masks.

### RIM-ONE and Rim-One-R2
- Datasets collected from different hospitals.
- Contain both raw images and masks for segmentation tasks.
- Partitioned into training and test splits, sometimes randomly or by hospital.

Each dataset can be further explored by navigating into its respective directory. Preprocessing scripts in the notebook handle resizing, normalization, and optional augmentation.

## 🧠 Main Notebook (`main.ipynb`)

The Jupyter notebook is the central code file and includes the following sections:

1. **Data Loading:** Custom loaders for each dataset that read images and labels/masks.
2. **Preprocessing:** Image resizing, normalization, and optional augmentation pipelines using PyTorch transforms.
3. **Model Definition:** Convolutional neural network architecture (e.g., ResNet-based classifier) for glaucoma detection.
4. **Training & Validation:** Loss computation, optimizer setup, and training loops with checkpointing.
5. **Evaluation:** Metrics such as accuracy, recall, precision, and confusion matrix plotted.
6. **Inference & Visualization:** Running the trained model on new images and displaying results.

The notebook provides an end-to-end workflow, making it easy to reproduce experiments and adapt the code for additional datasets or models.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ai_assisted_teleopthalmology
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt  # if provided
   ```
3. **Open the notebook:**
   ```bash
   jupyter notebook main.ipynb
   ```
4. **Run cells sequentially to train or evaluate the model.**

> 💡 You can replace the dataset paths or add new images as needed. The notebook is modular and designed for experimentation.

## 📌 Notes
- The `best_model.pth` file stores the highest-performing model weights; load it in PyTorch using `torch.load()`.
- Ensure that dataset directories follow the same structure as described above for the notebook to locate files correctly.

---

Feel free to contact the project maintainer for questions or contributions.