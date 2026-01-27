
export interface RestaurantCoupon{
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
	/**	Coupon Code : Data	*/
	coupon_code: string
	/**	Is Active : Check	*/
	is_active?: 0 | 1
	/**	Discount Type : Select	*/
	discount_type?: "percentage" | "flat amount"
	/**	Amount : Int	*/
	amount: number
	/**	Is Public : Check	*/
	is_public?: 0 | 1
}