
export interface PaymentSchedule{
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
	/**	Payment Term : Link - Payment Term	*/
	payment_term?: string
	/**	Description : Small Text	*/
	description?: string
	/**	Due Date : Date	*/
	due_date: string
	/**	Invoice Portion : Percent	*/
	invoice_portion?: number
	/**	Mode of Payment : Link - Mode of Payment	*/
	mode_of_payment?: string
	/**	Due Date Based On : Select	*/
	due_date_based_on?: "" | "Day(s) after invoice date" | "Day(s) after the end of the invoice month" | "Month(s) after the end of the invoice month"
	/**	Credit Days : Int	*/
	credit_days?: number
	/**	Credit Months : Int	*/
	credit_months?: number
	/**	Discount Date : Date	*/
	discount_date?: string
	/**	Discount : Float	*/
	discount?: number
	/**	Discount Type : Select	*/
	discount_type?: "Percentage" | "Amount"
	/**	Discount Validity Based On : Select	*/
	discount_validity_based_on?: "" | "Day(s) after invoice date" | "Day(s) after the end of the invoice month" | "Month(s) after the end of the invoice month"
	/**	Discount Validity : Int	*/
	discount_validity?: number
	/**	Payment Amount : Currency	*/
	payment_amount: number
	/**	Outstanding : Currency	*/
	outstanding?: number
	/**	Paid Amount : Currency	*/
	paid_amount?: number
	/**	Discounted Amount : Currency	*/
	discounted_amount?: number
	/**	Payment Amount (Company Currency) : Currency	*/
	base_payment_amount?: number
}