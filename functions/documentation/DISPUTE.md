# Dispute System Documentation
## Dispute Types

### DISP100: MISSING
**Code:** DISP100  
**Type:** MISSING  
**Description:** Item was not included in the delivery  
**Use Case:** Product listed in order but not physically received

### DISP101: SPOILED
**Code:** DISP101  
**Type:** SPOILED  
**Description:** Item arrived spoiled or contaminated  
**Use Case:** Product shows signs of spoilage, mold, or contamination upon delivery

### DISP102: DAMAGED
**Code:** DISP102  
**Type:** DAMAGED  
**Description:** Item arrived damaged or in poor condition  
**Use Case:** Packaging broken, product physically damaged during transport

### DISP103: WRONG_ITEM
**Code:** DISP103  
**Type:** WRONG_ITEM  
**Description:** Incorrect item was delivered  
**Use Case:** Received different product than what was ordered

### DISP104: QUANTITY_MISMATCH
**Code:** DISP104  
**Type:** QUANTITY_MISMATCH  
**Description:** Delivered quantity does not match ordered quantity  
**Use Case:** Received less than ordered (e.g., ordered 10kg, received 8kg)

## Filing Rules

### Timing Constraints
- Disputes must be filed within **1 hour** of delivery confirmation (OR104 status)
- After the 1-hour window expires, disputes cannot be filed
- Window is calculated from the `changed_at` timestamp in order_history for OR104 status

### Quantity Constraints
- Each disputed quantity must not exceed the ordered quantity for that product
- **Multiple disputes** are tracked across the same order
- Total disputed quantity (all disputes combined) cannot exceed ordered quantity
- Example:
  - Ordered: 10kg Product A
  - Dispute 1: 3kg MISSING
  - Dispute 2: Maximum 7kg remaining for any issue type
  - Attempting to dispute 8kg in Dispute 2 will be rejected