# Event Driven Architecture
- Producer -> Broker -> Consumer

## When To Use ?
- Auditing - User Actions
- Backend Process - Sending Email
- Data Processing - Training ML

## Advantages
- Decouples Components - Producer Doesn't Need to Anything About Subscriber
- Dependency Inversion - Producer Doesn't Depend On Consumer, Consumer Doesn't Depend On Producer - Both Depend On Abstraction(Events) - Reuse
- Scalability - Add More Subscribers, Add More Processes


## Disadvantages
- Eventual Consistency
- Duplicate Messages - Service Goes Down, And Comes Up, it may read old message Again - Overcome By UUID
- More Complex - Harder To Debug