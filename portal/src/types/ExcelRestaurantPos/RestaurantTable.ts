export interface RestaurantTable {
  name?: string;
  creation?: string;
  modified?: string;
  owner?: string;
  modified_by?: string;
  docstatus?: 0 | 1 | 2;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  idx?: number;
  /**	Company : Link - Company	*/
  company: string;
  /**	Floor : Link - Restaurant Floor	*/
  restaurant_floor: string;
  /**	Seat : Int	*/
  seat: number | null;
  /**	Type : Select	*/
  type: "" | "Rectangle" | "Circle" | "Road";
  /**	Bg Color : Data	*/
  bg_color?: string;
  /**	Position : JSON	*/
  position: any;
  /**	Width : Data	*/
  length: string;
  /**	Breadth : Data	*/
  breadth: string;
  /**	File Path : Data	*/
  file_path?: string;

  //   rotation
  rotation: number;
}
