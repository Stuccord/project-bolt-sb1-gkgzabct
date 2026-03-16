# BearGuard Transaction & Commission Flow

## Current System Overview

### Commission Structure
- **Flat Rate**: GHS 200 per completed referral case
- **Payment Trigger**: When referral status changes to 'paid'
- **Automatic Calculation**: Database trigger sets commission_amount to 200.00

---

## Current Transaction Flow

### 1. REP/USER (Agent Role)
**What They Do:**
- Submit new referral cases through the system
- Track referral progress through various stages
- View pending and completed referrals
- Monitor commission earnings

**What They See:**
- Personal referral dashboard
- List of their submitted cases with status
- Pending commissions (unpaid)
- Paid commissions history
- Monthly/yearly earnings totals

**Limitations:**
- Cannot mark their own commissions as paid
- Cannot change referral status to 'paid'
- View-only access to commission amounts

---

### 2. MANAGER (Manager Role)
**What They Do:**
- Oversee team of reps
- View all team referrals
- Monitor team performance
- Track team commission totals

**What They See:**
- Team overview dashboard
- All team members' referrals
- Team performance metrics
- Total pending and paid commissions

**Limitations:**
- Cannot directly pay commissions
- Cannot mark commissions as paid (read-only)
- Monitoring and reporting role only

---

### 3. ADMIN (Admin Role)
**What They Do:**
- Manage all referrals across the system
- Update referral status from any stage to 'paid'
- Approve commission payments
- Oversee entire operation

**What They Can Do:**
- Change referral status to 'paid' (triggers commission)
- View all referrals from all reps
- Access full system reports
- Manage agent accounts
- Set payment dates

**Current Process:**
1. Admin reviews completed referral case
2. Admin changes status to 'paid'
3. System automatically sets commission_amount = 200.00
4. Admin marks commission_paid = true
5. Admin sets payment_date
6. Rep sees updated commission in their dashboard

---

## Database Tables Involved

### `referrals` Table
```
- case_number (unique identifier)
- rep_id (which rep submitted)
- status (awaiting_police_report → paid)
- commission_amount (auto-set to 200.00)
- commission_paid (boolean)
- payment_date (when paid)
```

### `commissions` Table (Old System - Still Present)
```
- agent_id
- amount
- status (pending/paid)
- month/year tracking
- commission_type (referral/renewal/bonus)
```

---

## Current Issues & Gaps

### 1. **Dual System Confusion**
- Both `referrals` and `commissions` tables track payments
- `referrals.commission_amount` is used for new cases
- Old `commissions` table still exists but not integrated

### 2. **No Payment Tracking**
- No record of WHO paid the commission
- No payment method tracking (bank transfer, mobile money, cash)
- No batch payment system

### 3. **No Financial Audit Trail**
- Can't easily generate payment reports
- No monthly payout summaries
- Missing transaction IDs or reference numbers

### 4. **Manual Payment Process**
- Admin must manually mark each commission as paid
- No bulk payment functionality
- No payment approval workflow

### 5. **No Manager Payment Authority**
- Managers can view but not process payments
- All payment power concentrated with Admin

---

## Recommended Improvements

### Phase 1: Payment Processing System

**Add `payments` Table:**
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY,
  payment_batch_number text UNIQUE,
  referral_id uuid REFERENCES referrals(id),
  rep_id uuid REFERENCES agents(id),
  amount decimal(12,2),
  payment_method text, -- 'bank_transfer', 'mobile_money', 'cash'
  payment_reference text,
  bank_name text,
  account_number text,
  mobile_money_number text,
  processed_by uuid REFERENCES agents(id), -- Admin/Manager who paid
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  notes text,
  processed_date timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Phase 2: Payment Workflow

**Monthly Payment Cycle:**
1. System generates monthly payment batch
2. Admin/Manager reviews all unpaid commissions
3. Bulk select reps for payment
4. Enter payment details (method, reference)
5. Mark batch as processed
6. Reps receive notification
7. System records full audit trail

### Phase 3: Role Permissions

**Manager Enhancements:**
- Allow managers to process payments for their team
- Require admin approval for payments > GHS 5,000
- Full payment history for their team

**Rep Enhancements:**
- View payment history with references
- Download payment receipts
- See expected payment date
- Track payment status (pending → processing → completed)

### Phase 4: Financial Reporting

**Admin Dashboard:**
- Total commissions pending
- Total paid this month/year
- Payment by method breakdown
- Rep earnings leaderboard
- Export financial reports

**Manager Dashboard:**
- Team total commissions
- Team payment schedule
- Individual rep earnings
- Payment status tracking

**Rep Dashboard:**
- Total earned (all time)
- Total pending payment
- Last payment details
- Next expected payment date
- Payment history with references

---

## Implementation Priority

### HIGH PRIORITY (Do First):
1. ✅ Add payment tracking fields to referrals
2. ✅ Create payment processing workflow for admins
3. ✅ Add payment method selection
4. ✅ Create payment history view for reps

### MEDIUM PRIORITY:
5. Add batch payment functionality
6. Create payment notifications
7. Add payment receipts/invoices
8. Manager payment approval system

### LOW PRIORITY:
9. Auto-generate monthly payment batches
10. Integration with mobile money APIs
11. Automated payment scheduling
12. Advanced financial analytics

---

## Quick Wins (Can Implement Now)

### 1. Add Payment Method to Referrals
- Add `payment_method` column
- Add `payment_reference` column
- Add `processed_by` column

### 2. Enhanced Commission View
- Show payment status clearly
- Display payment method used
- Show who processed payment
- Include payment reference

### 3. Admin Payment Interface
- Filter unpaid commissions
- Bulk select for payment
- Enter payment details
- One-click mark as paid

---

## Questions to Consider

1. **Payment Schedule**: Weekly, bi-weekly, or monthly payments?
2. **Payment Methods**: Bank transfer, mobile money (MTN/Vodafone), cash?
3. **Minimum Payout**: Should there be a minimum (e.g., GHS 500) before payment?
4. **Manager Authority**: Can managers process payments or only recommend?
5. **Payment Approval**: Single approval (admin) or dual approval required?
6. **Tax Handling**: Should system track taxes or handle separately?
7. **Payment Failures**: How to handle failed mobile money transfers?

---

## Next Steps

Would you like me to implement:
1. **Basic payment tracking** - Add fields to track how commissions were paid
2. **Full payment system** - Complete workflow with payment batches and history
3. **Manager capabilities** - Allow managers to process team payments
4. **Financial reporting** - Comprehensive reports and analytics

Please advise which improvements to prioritize.
