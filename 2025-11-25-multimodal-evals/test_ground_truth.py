#!/usr/bin/env python3
"""
Simple test script to verify ground truth evaluator functionality.
"""

import sys
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from src.ground_truth_evaluator import GroundTruthEvaluator
from baml_client.types import ReceiptData, Transaction


def test_ground_truth_evaluator():
    """Test the ground truth evaluator with sample data."""
    
    evaluator = GroundTruthEvaluator()
    
    # Test metadata loading
    metadata_path = project_root / "data" / "cord-v2" / "images_and_metadata" / "larger_training_wheels" / "train_000_metadata.json"
    
    if metadata_path.exists():
        print(f"Testing with metadata file: {metadata_path}")
        
        # Load ground truth
        ground_truth = evaluator.load_ground_truth_metadata(str(metadata_path))
        
        if ground_truth:
            print("✅ Successfully loaded ground truth metadata")
            
            # Convert to ReceiptData
            gt_receipt_data = evaluator.convert_ground_truth_to_receipt_data(ground_truth)
            print(f"✅ Converted ground truth to ReceiptData with {len(gt_receipt_data.transactions)} transactions")
            print(f"   Grand total: {gt_receipt_data.grand_total}")
            
            # Create sample extracted data for comparison
            sample_extracted = ReceiptData(
                transactions=[
                    Transaction(
                        item_name="Nasi Campur Bali",
                        quantity=1,
                        unit_price=75000.0,
                        unit_discount=0.0,
                        total_price=75000.0
                    ),
                    Transaction(
                        item_name="Bbk Bengil Nasi",
                        quantity=1,
                        unit_price=125000.0,
                        unit_discount=0.0,
                        total_price=125000.0
                    )
                ],
                subtotal=1346000.0,
                service_charge=100950.0,
                tax=144695.0,
                rounding=-45.0,
                grand_total=1591600.0
            )
            
            # Perform comparison
            result = evaluator.evaluate_against_ground_truth(
                sample_extracted, 
                str(metadata_path), 
                "train_000"
            )
            
            print(f"✅ Ground truth comparison completed")
            print(f"   Overall accuracy: {result.overall_accuracy:.2%}")
            print(f"   Matching fields: {result.matching_fields_count}/{result.total_fields_count}")
            
            # Show some field comparisons
            print("\n📋 Sample field comparisons:")
            for i, comp in enumerate(result.field_comparisons[:5]):  # Show first 5
                status = "✅" if comp.matches else "❌"
                print(f"   {status} {comp.field_name}: {comp.extracted_value} vs {comp.ground_truth_value}")
            
            if len(result.field_comparisons) > 5:
                print(f"   ... and {len(result.field_comparisons) - 5} more comparisons")
            
        else:
            print("❌ Failed to load ground truth metadata")
    else:
        print(f"❌ Metadata file not found: {metadata_path}")
        print("Make sure you have run the dataset loader first:")
        print("uv run python load_cord_dataset.py")


if __name__ == "__main__":
    test_ground_truth_evaluator()
