# Multimodal Evaluations - CORD-v2 Dataset

This project provides tools for loading and working with the CORD-v2 dataset for multimodal evaluation tasks.

## Overview

CORD-v2 is a dataset for document understanding and OCR (Optical Character Recognition) containing receipt images with structured annotations. It includes:

- **1,000 receipt images** (864x1296 pixels)
- **Structured annotations** with menu items, prices, and totals
- **Coordinate information** for text bounding boxes
- **3 splits**: train (800), validation (100), test (100)

## Quick Start

### 1. Download and Setup Everything

Run this single command to download the complete dataset and save it in all formats:

```bash
uv run python load_cord_dataset.py
```

This will:
- Download the full CORD-v2 dataset (~2.2GB)
- Save all 1,000 images as individual PNG files
- Extract metadata as JSON files
- Create Parquet files for efficient data loading
- Show progress and statistics

### 2. Use in Your Code

```python
from load_cord_dataset import load_cord_dataset, CordDatasetLoader

# Quick loading
dataset = load_cord_dataset()

# Access data
train_data = dataset['train']
first_image = train_data[0]['image']  # PIL Image object
first_metadata = train_data[0]['ground_truth']  # Structured JSON

# Advanced usage
loader = CordDatasetLoader(base_dir="./my_data")
dataset = loader.load_dataset()
info = loader.get_dataset_info(dataset)
```

## Dataset Structure

Each example contains:

### Image Data
- **Format**: PNG (864x1296 pixels)
- **Content**: Receipt/invoice photos
- **Type**: PIL Image object when loaded


## Performance Notes

- **Initial download**: ~2.2GB, may take several minutes
- **Subsequent loads**: Fast (uses cached Arrow files)
- **Individual files**: Good for inspection and manual review
- **Parquet files**: Optimal for batch processing and ML training
- **JSON metadata**: Human-readable, good for analysis

## Use Cases

This dataset is perfect for:
- **Document understanding** research
- **OCR model training** and evaluation
- **Multimodal AI** development
- **Receipt/invoice processing** systems
- **Structured information extraction** tasks

## Troubleshooting

### Large File Sizes
The dataset is ~2.2GB. Ensure you have sufficient disk space.

### Network Issues
If download fails, the loader will resume from cache on retry.

### Memory Usage
For large-scale processing, consider using the Parquet files with chunked loading.

### Custom Paths
Use `CordDatasetLoader(base_dir="your_path")` to specify custom storage locations.

## Citation

If you use this dataset in research, please cite:
```
@article{park2019cord,
  title={CORD: A Consolidated Receipt Dataset for Post-OCR Parsing},
  author={Park, Seunghyun and Shin, Seung and Lee, Bado and Lee, Junyeop and Surh, Jaeheung and Seo, Minjoon and Lee, Hwalsuk},
  journal={Document Intelligence Workshop at NeurIPS 2019},
  year={2019}
}
```

## License

This project follows the CORD-v2 dataset license terms. See the dataset repository for details.
