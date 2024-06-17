SOLID
S - Single Responsibility Principle
O - Open Close Principle
L - Liskov Substitution Principle
I - Interface Segreggatoin
D - Dependency Inversion Principle


Single Responsibility Principle - One Purpose
- Class A has multiple methods, calculate, persist(get connection and insert)
Each should be separate class, a class should have only one Responsibility
A(calculate), ADAO(Insert), ConnectionDAO(Connection)

Open Closed Principle - Separate Class For Calculation By common Interface
Calculator Class - Which will calculate based on type in switch case, separate separate methods.
Next time if we add one more type, one more method should be added. This should be overcome by using
open closed principle. 3 types means 3 classes created with one common interface
So closed for modification, logic open for extension

Liskov Substitution Principle - Manager Class (Composition)
2 class extending one parent class, class 1 should not call both methods, class 2 can call both methods. so in class 1 if method called, throw error,
this is overcome by creating separate separate. So common class manager can be used

I - Interface Segreggation - Separate Interfaces - incase 1 of methods not called in one class. Same like liskov but handled with interface
instead of Composition

D - Dependency Inversion
- When we have common interface, called code also should be managed to call interface instead of class
- Between modules also same interface shared


