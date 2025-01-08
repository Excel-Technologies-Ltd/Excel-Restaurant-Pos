

# Restaurant POS System

## Introduction

The **Restaurant POS System** is a robust and user-friendly point-of-sale solution tailored for the needs of modern restaurants. It simplifies operations by managing orders, tracking inventory, and generating insightful reports, all in one platform.

## Key Features
- **Order Management**: Seamlessly handle both dine-in and takeout orders.
- **Inventory Management**: Monitor stock levels and prevent shortages.
- **Real-Time Reporting**: Generate sales reports and track business performance.
- **Role-Based Access**: Assign custom roles for chef, such as cashiers and managers.


## Benefits
- Enhance operational efficiency and reduce errors.
- Improve customer service with faster order processing.
- Gain valuable insights into sales trends and performance metrics.
- Scale your system to match your business growth.

## Technology Stack
- **Frontend**: [Framework/Library name] ( React)
- **Backend**: [Backend technology] (Python)
- **Database**: [Database used] (MariaDB, Redis)
- **Others**: [Any additional technologies] ( Frappe )






### Installation

Using bench, [install ERPNext](https://github.com/frappe/bench#installation) as mentioned here.

Once ERPNext is installed, add health app to your bench by running

```sh
$ bench get-app --branch master https://github.com/Excel-Technologies-Ltd/Excel-Restaurant-Pos.git
```

After that, you can install health app on required site by running

```sh
$ bench --site demo.com install-app excel_restaurant_pos && bench --site demo.com migrate skip-faiiling

```






