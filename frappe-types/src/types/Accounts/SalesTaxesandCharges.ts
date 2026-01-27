
export interface SalesTaxesandCharges{
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Type : Select	*/
	charge_type: "" | "Actual" | "On Net Total" | "On Previous Row Amount" | "On Previous Row Total" | "On Item Quantity"
	/**	Reference Row # : Data	*/
	row_id?: string
	/**	Account Head : Link - Account	*/
	account_head: string
	/**	Is Tax? : Check	*/
	custom_is_tax?: 0 | 1
	/**	Description : Small Text	*/
	description: string
	/**	Is this Tax included in Basic Rate? : Check - If checked, the tax amount will be considered as already included in the Print Rate / Print Amount	*/
	included_in_print_rate?: 0 | 1
	/**	Considered In Paid Amount : Check - If checked, the tax amount will be considered as already included in the Paid Amount in Payment Entry	*/
	included_in_paid_amount?: 0 | 1
	/**	Excel Product Team : Link - Excel Product Team	*/
	excel_product_team?: string
	/**	Excel Short Term Loan : Link - Excel Short Term Loan	*/
	excel_short_term_loan?: string
	/**	Excel Short Term Investments : Link - Excel Short Term Investments	*/
	excel_short_term_investments?: string
	/**	Excel Other Loans and Advances : Link - Excel Other Loans and Advances	*/
	excel_other_loans_and_advances?: string
	/**	Cost Center : Link - Cost Center	*/
	cost_center?: string
	/**	Excel LC No : Link - Excel LC No	*/
	excel_lc_no?: string
	/**	Excel Dream Project : Link - Excel Dream Project	*/
	excel_dream_project?: string
	/**	Excel Long Term Loans : Link - Excel Long Term Loans	*/
	excel_long_term_loans?: string
	/**	Excel Office Locations : Link - Excel Office Locations	*/
	excel_office_locations?: string
	/**	Excel Securities Deposits and Prepayment : Link - Excel Securities Deposits and Prepayment	*/
	excel_securities_deposits_and_prepayment?: string
	/**	Tax Rate : Float	*/
	rate?: number
	/**	Account Currency : Link - Currency	*/
	account_currency?: string
	/**	Amount : Currency	*/
	tax_amount?: number
	/**	Total : Currency	*/
	total?: number
	/**	Tax Amount After Discount Amount : Currency	*/
	tax_amount_after_discount_amount?: number
	/**	Amount (Company Currency) : Currency	*/
	base_tax_amount?: number
	/**	Total (Company Currency) : Currency	*/
	base_total?: number
	/**	Tax Amount After Discount Amount (Company Currency) : Currency	*/
	base_tax_amount_after_discount_amount?: number
	/**	Item Wise Tax Detail : Code	*/
	item_wise_tax_detail?: string
	/**	Dont Recompute tax : Check	*/
	dont_recompute_tax?: 0 | 1
}