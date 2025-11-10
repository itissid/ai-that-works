#!/usr/bin/env python3
"""
Run a new evaluation with ground truth comparison enabled.

This script will run evaluations on the larger_training_wheels dataset
and include ground truth comparison data in the results.
"""

import sys
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from src.receipt_evaluator import ReceiptEvaluator


def main():
    """Run evaluation with ground truth comparison."""
    print("🚀 Running Receipt Evaluation with Ground Truth Comparison")
    print("=" * 60)
    
    # Initialize evaluator
    data_dir = project_root / "data"
    evaluator = ReceiptEvaluator(str(data_dir))
    
    print(f"📁 Data directory: {data_dir}")
    print(f"📊 Results directory: {evaluator.results_dir}")
    
    # Check if we have receipt files
    receipt_files = evaluator.get_receipt_files()
    print(f"📋 Found {len(receipt_files)} receipt files")
    
    if not receipt_files:
        print("❌ No receipt files found!")
        print("Make sure you have downloaded the CORD-v2 dataset:")
        print("uv run python load_cord_dataset.py")
        return
    
    # Count files with metadata
    files_with_metadata = sum(1 for _, metadata_path in receipt_files if metadata_path)
    print(f"🎯 Files with ground truth metadata: {files_with_metadata}")
    
    if files_with_metadata == 0:
        print("⚠️  No metadata files found - ground truth comparison will not be available")
    
    print("\n🔄 Starting evaluation...")
    
    # Run evaluations
    try:
        results = evaluator.evaluate_all_receipts()
        print(f"✅ Completed evaluation of {len(results)} receipts")
        
        # Count results with ground truth
        gt_results = [r for r in results if r.ground_truth_result and r.ground_truth_result.has_ground_truth]
        print(f"🎯 Receipts with ground truth comparison: {len(gt_results)}")
        
        if gt_results:
            avg_accuracy = sum(r.ground_truth_result.overall_accuracy for r in gt_results) / len(gt_results)
            print(f"📊 Average ground truth accuracy: {avg_accuracy:.1%}")
        
        # Save results
        run_id = evaluator.save_results(results, run_name="Ground Truth Evaluation")
        print(f"💾 Results saved with run ID: {run_id}")
        
        print("\n✅ Evaluation complete!")
        print("You can now view the ground truth comparison in the Streamlit dashboard:")
        print("uv run streamlit run src/streamlit_app.py")
        
    except Exception as e:
        print(f"❌ Error during evaluation: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
