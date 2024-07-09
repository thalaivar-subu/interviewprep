# Normalization
- Easier to understand
- Easier to enhance and extend
- Protects form insertion, deletion and updation anomalies
- https://www.youtube.com/watch?v=GFQaEYEc8_8

## 1NF
### V1 - Row Order
Maintaing Tall by order of rows
- Subu
- Bala
- Anand
- Karthi
There is no such thing as row order, so add separate column for height
### V2 - Mixed Data Types
Height must not be different data types like, `170 centimenetr` and `150`
### V3 - Table without Primary Key
No Primary Key
### V4 - Repeating Groups Not permitted
Storing comma separated items in single row. 
Using separate columns like item1, item2, item3 is not feasible when 1000 items
So we create column, `item_type, item _qty`

## 2NF
### Each Non Key Attribute must depend on primary key. If not move it out
Player Rating deserves its own table. If we add it in item qty table and qty removed, player rating is gone

## 3NF
### Every non key attribute must depend on the key, the whole key and nothing but the key
Player ID -> Player Skill Level -> Player Rating - Transitive dependency

## BCNF
### Every attribute must depend on the key, the whole key and nothing but the key

BCNF Similar 3NF

## 4NF
### Multivalued dependencies on the table must be multivalued dependencies on the key
Model, Clour, Styles - split into 2 tables -> model, colour && model, style

## 5NF
###
Person, Brand, Flavour -> Suzy, Softys, Chocolate. Split into separate tables. We can just query specific table to get persons favourite brand.
Without joining get result, 5NF. 4NF top is 5NF
