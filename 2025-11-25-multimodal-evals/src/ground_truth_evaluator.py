"""
Ground Truth Evaluator Module

This module provides functionality to compare AI-extracted receipt data against
ground truth data from CORD-v2 metadata files.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from difflib import SequenceMatcher

from baml_client.types import ReceiptData, Transaction


@dataclass
class GroundTruthComparison:
    """Represents a comparison between extracted and ground truth values for a specific field."""
    field_name: str
    extracted_value: Any
    ground_truth_value: Any
    matches: bool
    similarity_score: float = 0.0  # For fuzzy matching (0.0 to 1.0)
    error_type: Optional[str] = None  # Type of error if any


@dataclass
class ReceiptGroundTruthResult:
    """Represents the complete ground truth comparison result for a single receipt."""
    receipt_id: str
    has_ground_truth: bool
    field_comparisons: List[GroundTruthComparison] = field(default_factory=list)
    overall_accuracy: float = 0.0
    extracted_data: Optional[ReceiptData] = None
    ground_truth_data: Optional[Dict[str, Any]] = None
    
    @property
    def matching_fields_count(self) -> int:
        """Returns the number of fields that match exactly."""
        return sum(1 for comp in self.field_comparisons if comp.matches)
    
    @property
    def total_fields_count(self) -> int:
        """Returns the total number of fields compared."""
        return len(self.field_comparisons)


class GroundTruthEvaluator:
    """Main class for comparing extracted receipt data against ground truth."""
    
    def __init__(self):
        """Initialize the ground truth evaluator."""
        pass
    
    def load_ground_truth_metadata(self, metadata_path: str) -> Optional[Dict[str, Any]]:
        """Load ground truth data from CORD-v2 metadata file."""
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
                # The CORD-v2 metadata files contain JSON as a string literal
                # First parse to get the string, then parse the string as JSON
                if content.startswith('"') and content.endswith('"'):
                    # Parse the outer JSON to get the string
                    json_string = json.loads(content)
                    # Parse the inner JSON string to get the actual data
                    return json.loads(json_string)
                else:
                    # Direct JSON parsing
                    return json.loads(content)
        except Exception as e:
            print(f"Error loading ground truth metadata from {metadata_path}: {e}")
            return None
    
    def normalize_price_string(self, price_str: str) -> float:
        """Convert price string to float, handling various formats."""
        if not price_str:
            return 0.0
        
        # Remove currency symbols and whitespace
        cleaned = re.sub(r'[^\d,.-]', '', str(price_str))
        
        # Handle comma as thousands separator (e.g., "1,346,000")
        if ',' in cleaned and '.' not in cleaned:
            cleaned = cleaned.replace(',', '')
        elif ',' in cleaned and '.' in cleaned:
            # Handle cases like "1,346.50" vs "1.346,50"
            if cleaned.rfind(',') > cleaned.rfind('.'):
                # European format: 1.346,50
                cleaned = cleaned.replace('.', '').replace(',', '.')
            else:
                # US format: 1,346.50
                cleaned = cleaned.replace(',', '')
        
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    
    def normalize_item_name(self, name: str) -> str:
        """Normalize item name for comparison."""
        if not name:
            return ""
        
        # Convert to lowercase and remove extra whitespace
        normalized = re.sub(r'\s+', ' ', str(name).lower().strip())
        
        # Remove common variations
        normalized = re.sub(r'[^\w\s]', '', normalized)
        
        return normalized
    
    def calculate_string_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity between two strings using sequence matching."""
        if not str1 and not str2:
            return 1.0
        if not str1 or not str2:
            return 0.0
        
        # Normalize both strings
        norm1 = self.normalize_item_name(str1)
        norm2 = self.normalize_item_name(str2)
        
        return SequenceMatcher(None, norm1, norm2).ratio()
    
    def convert_ground_truth_to_receipt_data(self, ground_truth: Dict[str, Any]) -> ReceiptData:
        """Convert CORD-v2 ground truth format to ReceiptData structure."""
        gt_parse = ground_truth.get('gt_parse', {})
        
        # Convert menu items to transactions
        transactions = []
        menu_items = gt_parse.get('menu', [])
        
        # Handle both list and dict formats for menu items
        if isinstance(menu_items, dict):
            # If menu_items is a dict, convert it to a list of its values
            menu_items = list(menu_items.values())
        
        for item in menu_items:
            # Skip items that are not dictionaries (some metadata files have inconsistent formats)
            if not isinstance(item, dict):
                continue
                
            # Extract quantity from count string (e.g., "1 x" -> 1)
            count_str = item.get('cnt', '1')
            quantity = 1
            try:
                # Extract number from strings like "1 x", "2x", "3 x"
                quantity_match = re.search(r'(\d+)', count_str)
                if quantity_match:
                    quantity = int(quantity_match.group(1))
            except:
                quantity = 1
            
            # Parse price
            price = self.normalize_price_string(item.get('price', '0'))
            unit_price = price / quantity if quantity > 0 else price
            
            transaction = Transaction(
                item_name=item.get('nm', ''),
                quantity=quantity,
                unit_price=unit_price,
                unit_discount=0.0,  # Not typically in CORD-v2
                total_price=price
            )
            transactions.append(transaction)
        
        # Extract totals
        sub_total_data = gt_parse.get('sub_total', {})
        total_data = gt_parse.get('total', {})
        
        subtotal = self.normalize_price_string(sub_total_data.get('subtotal_price', '0'))
        service_charge = self.normalize_price_string(sub_total_data.get('service_price', '0'))
        tax = self.normalize_price_string(sub_total_data.get('tax_price', '0'))
        rounding = self.normalize_price_string(sub_total_data.get('etc', '0'))
        grand_total = self.normalize_price_string(total_data.get('total_price', '0'))
        
        return ReceiptData(
            transactions=transactions,
            subtotal=subtotal if subtotal > 0 else None,
            service_charge=service_charge if service_charge > 0 else None,
            tax=tax if tax > 0 else None,
            rounding=rounding if rounding != 0 else None,
            discount_on_total=None,  # Not typically in CORD-v2
            grand_total=grand_total
        )
    
    def compare_transactions(self, extracted: List[Transaction], ground_truth: List[Transaction]) -> List[GroundTruthComparison]:
        """Compare extracted transactions with ground truth transactions."""
        comparisons = []
        
        # Compare transaction counts
        comparisons.append(GroundTruthComparison(
            field_name="transaction_count",
            extracted_value=len(extracted),
            ground_truth_value=len(ground_truth),
            matches=len(extracted) == len(ground_truth),
            similarity_score=1.0 if len(extracted) == len(ground_truth) else 0.0,
            error_type="count_mismatch" if len(extracted) != len(ground_truth) else None
        ))
        
        # For detailed transaction comparison, we'll use a simple approach:
        # Match transactions by best similarity score
        used_gt_indices = set()
        
        for i, ext_transaction in enumerate(extracted):
            best_match_idx = -1
            best_similarity = 0.0
            
            # Find best matching ground truth transaction
            for j, gt_transaction in enumerate(ground_truth):
                if j in used_gt_indices:
                    continue
                
                name_similarity = self.calculate_string_similarity(
                    ext_transaction.item_name, 
                    gt_transaction.item_name
                )
                
                if name_similarity > best_similarity:
                    best_similarity = name_similarity
                    best_match_idx = j
            
            if best_match_idx >= 0:
                used_gt_indices.add(best_match_idx)
                gt_transaction = ground_truth[best_match_idx]
                
                # Compare item name
                name_matches = best_similarity > 0.8  # 80% similarity threshold
                comparisons.append(GroundTruthComparison(
                    field_name=f"transaction_{i}_item_name",
                    extracted_value=ext_transaction.item_name,
                    ground_truth_value=gt_transaction.item_name,
                    matches=name_matches,
                    similarity_score=best_similarity,
                    error_type="name_mismatch" if not name_matches else None
                ))
                
                # Compare quantity
                qty_matches = ext_transaction.quantity == gt_transaction.quantity
                comparisons.append(GroundTruthComparison(
                    field_name=f"transaction_{i}_quantity",
                    extracted_value=ext_transaction.quantity,
                    ground_truth_value=gt_transaction.quantity,
                    matches=qty_matches,
                    similarity_score=1.0 if qty_matches else 0.0,
                    error_type="quantity_mismatch" if not qty_matches else None
                ))
                
                # Compare total price (with tolerance)
                price_diff = abs(ext_transaction.total_price - gt_transaction.total_price)
                price_tolerance = max(1.0, gt_transaction.total_price * 0.01)  # 1% tolerance or 1.0, whichever is larger
                price_matches = price_diff <= price_tolerance
                
                comparisons.append(GroundTruthComparison(
                    field_name=f"transaction_{i}_total_price",
                    extracted_value=ext_transaction.total_price,
                    ground_truth_value=gt_transaction.total_price,
                    matches=price_matches,
                    similarity_score=1.0 - min(1.0, price_diff / max(1.0, gt_transaction.total_price)),
                    error_type="price_mismatch" if not price_matches else None
                ))
        
        return comparisons
    
    def compare_totals(self, extracted: ReceiptData, ground_truth: ReceiptData) -> List[GroundTruthComparison]:
        """Compare extracted totals with ground truth totals."""
        comparisons = []
        
        # Helper function to compare numerical values with tolerance
        def compare_amounts(field_name: str, extracted_val: Optional[float], gt_val: Optional[float]) -> GroundTruthComparison:
            if extracted_val is None and gt_val is None:
                return GroundTruthComparison(
                    field_name=field_name,
                    extracted_value=None,
                    ground_truth_value=None,
                    matches=True,
                    similarity_score=1.0
                )
            
            if extracted_val is None or gt_val is None:
                return GroundTruthComparison(
                    field_name=field_name,
                    extracted_value=extracted_val,
                    ground_truth_value=gt_val,
                    matches=False,
                    similarity_score=0.0,
                    error_type="missing_value"
                )
            
            diff = abs(extracted_val - gt_val)
            tolerance = max(1.0, gt_val * 0.01)  # 1% tolerance or 1.0, whichever is larger
            matches = diff <= tolerance
            
            return GroundTruthComparison(
                field_name=field_name,
                extracted_value=extracted_val,
                ground_truth_value=gt_val,
                matches=matches,
                similarity_score=1.0 - min(1.0, diff / max(1.0, abs(gt_val))),
                error_type="amount_mismatch" if not matches else None
            )
        
        # Compare all total fields
        comparisons.append(compare_amounts("subtotal", extracted.subtotal, ground_truth.subtotal))
        comparisons.append(compare_amounts("service_charge", extracted.service_charge, ground_truth.service_charge))
        comparisons.append(compare_amounts("tax", extracted.tax, ground_truth.tax))
        comparisons.append(compare_amounts("rounding", extracted.rounding, ground_truth.rounding))
        comparisons.append(compare_amounts("grand_total", extracted.grand_total, ground_truth.grand_total))
        
        return comparisons
    
    def evaluate_against_ground_truth(
        self, 
        extracted_data: ReceiptData, 
        metadata_path: str,
        receipt_id: str
    ) -> ReceiptGroundTruthResult:
        """Evaluate extracted receipt data against ground truth."""
        
        # Load ground truth metadata
        ground_truth_raw = self.load_ground_truth_metadata(metadata_path)
        
        if not ground_truth_raw:
            return ReceiptGroundTruthResult(
                receipt_id=receipt_id,
                has_ground_truth=False,
                extracted_data=extracted_data
            )
        
        # Convert ground truth to ReceiptData format
        ground_truth_data = self.convert_ground_truth_to_receipt_data(ground_truth_raw)
        
        # Perform comparisons
        comparisons = []
        
        # Compare transactions
        transaction_comparisons = self.compare_transactions(
            extracted_data.transactions, 
            ground_truth_data.transactions
        )
        comparisons.extend(transaction_comparisons)
        
        # Compare totals
        total_comparisons = self.compare_totals(extracted_data, ground_truth_data)
        comparisons.extend(total_comparisons)
        
        # Calculate overall accuracy
        if comparisons:
            matching_count = sum(1 for comp in comparisons if comp.matches)
            overall_accuracy = matching_count / len(comparisons)
        else:
            overall_accuracy = 0.0
        
        return ReceiptGroundTruthResult(
            receipt_id=receipt_id,
            has_ground_truth=True,
            field_comparisons=comparisons,
            overall_accuracy=overall_accuracy,
            extracted_data=extracted_data,
            ground_truth_data=ground_truth_raw
        )
