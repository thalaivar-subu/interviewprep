
@SpringBootApplication includes @EnableAutoConfiguration.
How spring boot loadsa auto configuration - @EnableAutoConfiguration
Automatically configures beans based on the libraries on the classpath and your configuration.

// Volatile vs Transient
- transient prevents a variable from being saved during object serialization
- volatile ensures visibile

Easy way to remember
REQUIRED → Join or create.
REQUIRES_NEW → Always new.
SUPPORTS → Transaction is optional.
NOT_SUPPORTED → Never use a transaction.
MANDATORY → Transaction is mandatory.
NEVER → Transaction is forbidden.
NESTED → Savepoint within a transaction.s

IoC (most likely ✅)

Inversion of Control
Spring container creates and manages objects instead of you using new.