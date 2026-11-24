# InvotelStitch V2 — Store, Purchasing & Item Master Architecture

## Confirmed operating rules
- FIFO (First In, First Out) is the stock valuation method.
- FEFO (First Expiry, First Out) is the issue-picking recommendation for dated batches; it is separate from FIFO valuation.
- Daily indents are internal issues from Store to Kitchen, Bar, Housekeeping and Administration. They are not purchase requisitions.
- Daily purchases are vendor-to-Store transactions owned by the Purchasing Department.
- The existing V1 `main` branch is out of scope. Work is isolated to `v2-development`.

## Central Item Master
`public.items` remains the central item identity table. Existing 337 rows and item-change history are preserved. Added controls: reorder level, safety stock, lead time, shelf-life days and expiry tracking. Vendor-specific names, pack/UOM and price history live in `vendor_item_prices`, allowing one item to be sourced from multiple vendors.

## Purchasing workflow
Vendor → vendor item price / quote → purchase order → goods receipt → invoice details → FIFO stock batch.
- GST treatment is stored as INCLUSIVE, EXCLUSIVE, EXEMPT or NIL.
- Each vendor price has pack size, purchase UOM, GST rate and effective dates.
- Comparisons must normalize to the same base UOM and compare the same tax basis before declaring the lowest vendor.
- Goods receipt posting creates stock batches and stock movement records.

## Store workflow
Department indent → approval → FIFO issue allocations → stock movement.
- Departments seeded: Kitchen, Bar, Housekeeping and Administration.
- Indents and line items capture requested, approved and issued quantities.
- `issue_indent_fifo(uuid)` consumes oldest receipt batches first, records batch allocations and the FIFO issue value in one transaction.
- Physical stock counts and variance are stored separately; posting adjustments must be an explicit approval action.

## Inventory and notifications
- Stock batches retain received quantity, remaining quantity, unit cost, batch number and expiry date.
- Notifications support reorder, non-moving, near expiry, expired, price changes, vendor supply, overdue PO, stock variance and excess stock.
- Forecasting should use actual issue history, current usable stock, confirmed incoming stock, safety stock and supplier lead time. Do not hardcode a fixed catalogue size.

## Database objects created
Tables: `vendors`, `vendor_item_prices`, `departments`, `purchase_orders`, `purchase_order_lines`, `goods_receipts`, `goods_receipt_lines`, `stock_batches`, `indents`, `indent_lines`, `stock_movements`, `fifo_issue_allocations`, `stock_counts`, `stock_count_lines`, `inventory_notifications`, `app_user_roles`.

Functions: `post_goods_receipt(uuid)`, `issue_indent_fifo(uuid)`.

## Security and current limitations
- RLS is enabled on all new public tables.
- Current database access is owner-only for `saichandgudapati@gmail.com`. Staff roles are represented in `app_user_roles`, but role-specific policies and staff onboarding must be implemented before giving Purchasing Manager, Store Manager or department users access.
- No vendor, purchase, opening-stock, indent or receipt transactions were imported from the reference workbook. Existing 337 Item Master rows are untouched.
- FIFO posting functions are created but have not yet been exercised against sample receipt/indent transactions. Do not treat the live stock balance as operational until those test cases and UI flows are completed.
- Stock valuation currently uses the receipt line's tax-inclusive unit cost. Confirm recoverable input-GST accounting treatment before production financial valuation.
- The November workbook is a reference only; it was not edited.
