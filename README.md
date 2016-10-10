This project is an experiment in functional languages for me.  I would like to play with a number of compiler building 
concepts:

- How to use parser combinators
- How to parse a language based on its layout
- How to parse a language that supports operator overloading - dynamic precedence and dynamic associativity
- How to implement an inference type system using Hindley-Milner
- How to implement Haskell's type classes
- How to implement a pattern matching 

I have certainly read much about the above concepts but, as I have discovered, knowledge is gained by reading whilst
insight is gained through doing.


## Philosophy

When Java arrived Sun presented it using the slogan

> Write Once, Run Everywhere

This moniker became the philosophy behind Java's evolution and the language's eventual success.  The moniker that has
caught my imagination is

> Run Once, Run Always

Too often I have found that something I have written stops working when the contained environment is changed.  An example
of this from the Java world is if I upgrade a library in my Maven POM file and find that the library's semantic has 
subtly changed and something that was previously working does not work any more.  Sadly, in my career, these defects have
not been picked up through testing and have resulted in defects slipping through into production environments.
This has resulted in a general reluctance to upgrade third party libraries.

So in this experiment I would like to experiment with language ideas captured by the `Run Once, Run Always` philosophy and
see whether or not these ideas are improvements and should be promoted either idiomatically or as language extensions. 
A number of these ideas are:

- How to make testing a core of the language rather than an idiomatic addendum to the language
- How to pack all dependencies into a program rather than relying on a companion build configuration file to define and
manage these dependencies.

I am certain that as I work through this experiment more ideas will pop out to be tested.


## Decisions

- The target language will be JavaScript
- The language's heritage will be Standard ML/Caml-light/Haskell
- The language will attempt to identify the maximum number of errors at compile-time


## Approach

The approach that I am going to take is to bootstrap this language using a JavaScript compiler using a minimal feature
set and then, through subsequent versions, implement the entire language.
 
| Category | Features                          | v1 | v2 | v3 | v4 | v5 | v6 | v7 | v8 | v9 |
|----------|-----------------------------------|----|----|----|----|----|----|----|----|----|
| Lexical  | Layout based                      |    |    |    |    |    |    |    |    | *  |
| Syntax   | module/imports                    | *  |    |    |    |    |    |    |    |    |
|          | if-then-else                      | *  |    |    |    |    |    |    |    |    |
|          | let ... in                        |    | *  |    |    |    |    |    |    |    |
|          | ... where                         |    |    | *  |    |    |    |    |    |    |
|          | ... assumption ...                | *  |    |    |    |    |    |    |    |    |
|          | match                             |    |    |    |    |    | *  |    |    |    |
|          | Pattern matching on definition    |    |    |    |    |    | *  |    |    |    |
|          | Operator overloading              |    |    |    |    |    |    | *  |    |    |
| Typing   | Int, String, Char, Boolean, Float | *  |    |    |    |    |    |    |    |    |
|          | Long, Double                      |    |    | *  |    |    |    |    |    |    |
|          | Lists                             | *  |    |    |    |    |    |    |    |    |
|          | String as a list of Char          |    |    |    |    |    |    | *  |    |    |
|          | Dictionary                        | *  |    |    |    |    |    |    |    |    |
|          | n-tuple                           |    |    |    |    | *  |    |    |    |    |
|          | Records                           |    |    |    |    | *  |    |    |    |    |
|          | Type inference                    |    |    |    | *  |    |    |    |    |    |
|          | Abstract Data Types               |    |    |    | *  |    |    |    |    |    |
|          | Type classes                      |    |    |    |    |    |    |    | *  |    |
| General  | Use native JavaScript libraries   | *  |    |    |    |    |    |    |    |    |
