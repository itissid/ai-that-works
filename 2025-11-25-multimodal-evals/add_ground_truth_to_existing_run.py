#!/usr/bin/env python3
"""
Add ground truth comparison to existing evaluation runs.

This script can retroactively add ground truth comparison data to existing
evaluation runs without re-running the expensive AI extraction process.
"""

import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from src.receipt_evaluator import ReceiptEvaluator
from src.ground_truth_evaluator import GroundTruthEvaluator


def add_ground_truth_to_run(evaluator: ReceiptEvaluator, run_id: str) -> bool:
    """Add ground truth comparison to an existing evaluation run."""
    
    print(f"🔄 Processing run: {run_id}")
    
    try:
        # Load existing results
        results, summary = evaluator.load_results(run_id)
        print(f"📋 Loaded {len(results)} existing results")
        
        # Check if ground truth data already exists
        existing_gt_count = sum(1 for r in results if r.ground_truth_result and r.ground_truth_result.has_ground_truth)
        if existing_gt_count > 0:
            print(f"✅ Run already has ground truth data for {existing_gt_count} receipts")
            return True
        
        # Initialize ground truth evaluator
        gt_evaluator = GroundTruthEvaluator()
        
        # Add ground truth comparison to each result
        updated_count = 0
        for result in results:
            # Only process results with successful extraction
            if not result.extraction_successful or not result.extracted_data:
                continue
            
            # Find corresponding metadata file
            receipt_id = result.receipt_id
            metadata_path = evaluator.training_wheels_dir / f"{receipt_id}_metadata.json"
            
            if metadata_path.exists():
                # Perform ground truth comparison
                gt_result = gt_evaluator.evaluate_against_ground_truth(
                    result.extracted_data, 
                    str(metadata_path), 
                    receipt_id
                )
                
                # Add to the result
                result.ground_truth_result = gt_result
                updated_count += 1
        
        print(f"🎯 Added ground truth comparison to {updated_count} receipts")
        
        if updated_count > 0:
            # Save the updated results back to the same run
            run_dir = evaluator.results_dir / run_id
            
            # Prepare data for serialization (reuse the save logic)
            results_data = []
            for result in results:
                result_dict = {
                    "receipt_id": result.receipt_id,
                    "image_path": result.image_path,
                    "extraction_successful": result.extraction_successful,
                    "extraction_error": result.extraction_error,
                    "overall_passed": result.overall_passed,
                    "pass_rate": result.pass_rate,
                    "evaluations": [
                        {
                            "check_name": e.check_name,
                            "passed": e.passed,
                            "message": e.message,
                            "expected_value": e.expected_value,
                            "actual_value": e.actual_value
                        } for e in result.evaluations
                    ]
                }
                
                # Add extracted data if available
                if result.extracted_data:
                    result_dict["extracted_data"] = {
                        "transactions": [
                            {
                                "item_name": t.item_name,
                                "quantity": t.quantity,
                                "unit_price": t.unit_price,
                                "unit_discount": t.unit_discount,
                                "total_price": t.total_price
                            } for t in result.extracted_data.transactions
                        ],
                        "subtotal": result.extracted_data.subtotal,
                        "service_charge": result.extracted_data.service_charge,
                        "tax": result.extracted_data.tax,
                        "rounding": result.extracted_data.rounding,
                        "discount_on_total": result.extracted_data.discount_on_total,
                        "grand_total": result.extracted_data.grand_total
                    }
                
                # Add ground truth result if available
                if result.ground_truth_result:
                    gt_result = result.ground_truth_result
                    result_dict["ground_truth_result"] = {
                        "receipt_id": gt_result.receipt_id,
                        "has_ground_truth": gt_result.has_ground_truth,
                        "overall_accuracy": gt_result.overall_accuracy,
                        "field_comparisons": [
                            {
                                "field_name": comp.field_name,
                                "extracted_value": comp.extracted_value,
                                "ground_truth_value": comp.ground_truth_value,
                                "matches": comp.matches,
                                "similarity_score": comp.similarity_score,
                                "error_type": comp.error_type
                            } for comp in gt_result.field_comparisons
                        ],
                        "ground_truth_data": gt_result.ground_truth_data
                    }
                
                results_data.append(result_dict)
            
            # Save updated detailed results
            results_file = run_dir / "detailed_results.json"
            with open(results_file, 'w') as f:
                json.dump(results_data, f, indent=2, default=str)
            
            # Update summary with ground truth statistics
            if updated_count > 0:
                gt_results = [r for r in results if r.ground_truth_result and r.ground_truth_result.has_ground_truth]
                if gt_results:
                    avg_accuracy = sum(r.ground_truth_result.overall_accuracy for r in gt_results) / len(gt_results)
                    summary['ground_truth_statistics'] = {
                        'receipts_with_ground_truth': len(gt_results),
                        'average_accuracy': avg_accuracy,
                        'total_field_comparisons': sum(len(r.ground_truth_result.field_comparisons) for r in gt_results),
                        'matching_fields': sum(r.ground_truth_result.matching_fields_count for r in gt_results)
                    }
            
            # Save updated summary
            summary_file = run_dir / "summary.json"
            with open(summary_file, 'w') as f:
                json.dump(summary, f, indent=2, default=str)
            
            print(f"💾 Updated run {run_id} with ground truth data")
            return True
        else:
            print("⚠️  No receipts were eligible for ground truth comparison")
            return False
            
    except Exception as e:
        print(f"❌ Error processing run {run_id}: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main function to add ground truth to existing runs."""
    print("🎯 Add Ground Truth Comparison to Existing Evaluation Runs")
    print("=" * 65)
    
    # Initialize evaluator
    data_dir = project_root / "data"
    evaluator = ReceiptEvaluator(str(data_dir))
    
    # Get available runs
    available_runs = evaluator.list_available_runs()
    
    if not available_runs:
        print("❌ No evaluation runs found.")
        print("Run an evaluation first:")
        print("uv run python src/receipt_evaluator.py")
        return
    
    print(f"📋 Found {len(available_runs)} evaluation runs:")
    for i, run in enumerate(available_runs):
        run_id = run['run_id']
        run_name = run.get('run_name', 'Unnamed')
        timestamp = run.get('timestamp', 'Unknown')
        total_receipts = run.get('total_receipts', 'Unknown')
        print(f"  {i+1}. {run_id} - {run_name} ({timestamp}) - {total_receipts} receipts")
    
    # Process runs
    if len(sys.argv) > 1:
        # Process specific run ID from command line
        target_run_id = sys.argv[1]
        if any(run['run_id'] == target_run_id for run in available_runs):
            print(f"\n🎯 Processing specific run: {target_run_id}")
            success = add_ground_truth_to_run(evaluator, target_run_id)
            if success:
                print(f"✅ Successfully added ground truth data to run {target_run_id}")
            else:
                print(f"❌ Failed to add ground truth data to run {target_run_id}")
        else:
            print(f"❌ Run ID '{target_run_id}' not found")
    else:
        # Process all runs
        print(f"\n🔄 Processing all {len(available_runs)} runs...")
        success_count = 0
        
        for run in available_runs:
            run_id = run['run_id']
            if add_ground_truth_to_run(evaluator, run_id):
                success_count += 1
            print()  # Add spacing between runs
        
        print(f"✅ Successfully processed {success_count}/{len(available_runs)} runs")
    
    print("\n🎉 Ground truth comparison is now available in the Streamlit dashboard!")
    print("uv run streamlit run src/streamlit_app.py")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        print("Usage:")
        print("  python add_ground_truth_to_existing_run.py              # Process all runs")
        print("  python add_ground_truth_to_existing_run.py <run_id>     # Process specific run")
        print("  python add_ground_truth_to_existing_run.py --help       # Show this help")
    else:
        main()
