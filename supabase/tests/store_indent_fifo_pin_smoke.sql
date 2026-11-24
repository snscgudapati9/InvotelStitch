-- InvotelStitch V2: Store -> Stock -> Indent -> PIN collection smoke test
-- Run manually in Supabase SQL Editor on a non-production test project, or during
-- a controlled maintenance window. Uses one DO statement; on any assertion/error,
-- PostgreSQL rolls back the complete statement. On success, temporary test rows
-- are explicitly removed before the statement ends.
--
-- The test uses the approved owner identity only to exercise the current owner-only
-- RPC guards. It does NOT enable staff access or change persistent business data.

do $$
declare
  v_item uuid;
  v_unit text;
  v_dept uuid;
  v_vendor uuid;
  v_receipt uuid;
  v_grn_line uuid;
  v_indent uuid;
  v_indent_line uuid;
  v_pin text;
  v_bad text;
  v_result jsonb;
  v_after numeric;
begin
  perform set_config(
    'request.jwt.claims',
    '{"email":"saichandgudapati@gmail.com","role":"authenticated"}',
    true
  );

  select id, coalesce(nullif(unit, ''), 'EA')
    into v_item, v_unit
  from public.items
  where active_status = 'ACTIVE'
  order by item_code nulls last, item_name
  limit 1;

  if v_item is null then
    raise exception 'TEST BLOCKED: no active Item Master record';
  end if;

  select id into v_dept
  from public.departments
  where department_name = 'Kitchen'
    and active_status = 'ACTIVE'
  limit 1;

  if v_dept is null then
    raise exception 'TEST BLOCKED: Kitchen department is missing or inactive';
  end if;

  insert into public.vendors(vendor_name)
  values ('ROLLBACK TEST VENDOR')
  returning id into v_vendor;

  insert into public.goods_receipts(
    grn_number, vendor_id, received_at, status, notes
  )
  values (
    'TEST-GRN-' || substr(gen_random_uuid()::text, 1, 8),
    v_vendor, now(), 'DRAFT', 'Automated rollback test'
  )
  returning id into v_receipt;

  insert into public.goods_receipt_lines(
    goods_receipt_id, item_id, received_qty, purchase_uom,
    base_qty, base_uom, unit_cost_ex_tax, gst_rate,
    gst_treatment, unit_cost_inc_tax
  )
  values (
    v_receipt, v_item, 5, v_unit,
    5, v_unit, 10, 0, 'EXEMPT', 10
  )
  returning id into v_grn_line;

  perform public.post_goods_receipt(v_receipt);

  if (
    select remaining_qty
    from public.stock_batches
    where goods_receipt_line_id = v_grn_line
  ) <> 5 then
    raise exception 'FAIL: goods receipt did not create the expected 5-unit stock batch';
  end if;

  insert into public.indents(
    indent_number, department_id, status, requested_by, notes
  )
  values (
    'TEST-IND-' || substr(gen_random_uuid()::text, 1, 8),
    v_dept, 'PICKING', 'rollback-test', 'Automated rollback test'
  )
  returning id into v_indent;

  insert into public.indent_lines(
    indent_id, item_id, requested_qty, base_uom
  )
  values (v_indent, v_item, 2, v_unit)
  returning id into v_indent_line;

  v_pin := public.store_mark_indent_ready(
    v_indent,
    jsonb_build_array(
      jsonb_build_object('line_id', v_indent_line, 'quantity', 2)
    )
  );

  if v_pin !~ '^[0-9]{6}$' then
    raise exception 'FAIL: generated collection PIN is not six digits';
  end if;

  v_bad := case when v_pin = '000000' then '000001' else '000000' end;
  v_result := public.department_collect_indent(
    v_indent, v_bad, 'Rollback Test Receiver'
  );

  if coalesce((v_result ->> 'success')::boolean, true) then
    raise exception 'FAIL: incorrect PIN was accepted';
  end if;

  if (
    select pin_attempts
    from public.indent_collections
    where indent_id = v_indent
  ) <> 1 then
    raise exception 'FAIL: incorrect PIN attempt was not recorded';
  end if;

  v_result := public.department_collect_indent(
    v_indent, v_pin, 'Rollback Test Receiver'
  );

  if coalesce((v_result ->> 'success')::boolean, false) is not true then
    raise exception 'FAIL: valid PIN collection failed: %', v_result;
  end if;

  select remaining_qty into v_after
  from public.stock_batches
  where goods_receipt_line_id = v_grn_line;

  if v_after <> 3 then
    raise exception 'FAIL: expected 3 units remaining after FIFO issue, got %', v_after;
  end if;

  if (
    select issued_qty from public.indent_lines where id = v_indent_line
  ) <> 2 then
    raise exception 'FAIL: issued quantity does not equal 2';
  end if;

  if (
    select count(*) from public.fifo_issue_allocations
    where indent_line_id = v_indent_line
  ) <> 1 then
    raise exception 'FAIL: expected exactly one FIFO allocation';
  end if;

  if (
    select status from public.indents where id = v_indent
  ) <> 'COLLECTED' then
    raise exception 'FAIL: indent did not reach COLLECTED status';
  end if;

  if (
    select status from public.indent_reservations
    where indent_line_id = v_indent_line
  ) <> 'CONSUMED' then
    raise exception 'FAIL: stock reservation was not consumed';
  end if;

  -- Clean up all test-only rows. Any cleanup error rolls back this entire DO statement.
  delete from public.stock_movements
  where reference_id in (v_receipt, v_indent);

  delete from public.fifo_issue_allocations
  where indent_line_id = v_indent_line;

  delete from public.indent_reservations
  where indent_line_id = v_indent_line;

  delete from public.indent_collections
  where indent_id = v_indent;

  delete from public.indent_status_history
  where indent_id = v_indent;

  delete from public.indent_lines
  where indent_id = v_indent;

  delete from public.indents
  where id = v_indent;

  delete from public.stock_batches
  where goods_receipt_line_id = v_grn_line;

  delete from public.goods_receipt_lines
  where id = v_grn_line;

  delete from public.goods_receipts
  where id = v_receipt;

  delete from public.vendors
  where id = v_vendor;

  raise notice
    'PASS: receipt -> stock batch -> reservation -> wrong PIN attempt -> valid PIN -> FIFO allocation/deduction -> COLLECTED. Test rows cleaned.';
end
$$;
