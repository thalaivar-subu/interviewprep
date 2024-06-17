Patterns
- Creational
-- Factory
CreatGuestUser, CreateValidUser - new UserFactory().createGuestUser();
-- Builder
```
User
UserBuilder {
    constructor(){ this.user = new User();}
    addName(this.user.setName("subu")); return this
    build() return this
}
UserBuilder().addName("Subu").build();
```
-- Singleton
```
AppState{
    instance = none
    init() this.isLoggedIn = true
    static getAppState() if instance not none return instance else return application.instance
}
```

- Behavioral - Pub/Sub
-- Pub Sub Pattern - Youtube Subscriber, YT User Send Notification - Common INterface
-- Iterator Pattern - LinkedList 
-- Strategy Pattern - `Values.filter(RemoveNegativeStrategy())`

- Structural
-- Adapter
-- Facade - Example HTTP Clients - Dynamic Arrays(Vector)