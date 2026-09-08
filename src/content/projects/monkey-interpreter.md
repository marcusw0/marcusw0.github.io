---
title: monkey-interpreter
description: A Go implementation of Monkey exploring lexing, parsing, evaluation, and a growing bytecode compiler and virtual machine.
date: 2026-09-07
tech: ["Go", "Pratt parsing", "ASTs", "Bytecode"]
github: "https://github.com/marcusw0/monkey-interpreter"
featured: true
order: 3
focus: Language implementation
status: ongoing
role: Developer · book-based learning project
outcomes:
  - Implemented lexing, parsing, and evaluation with functions, arrays, hashes, and macros.
  - Added an interactive REPL and execution of Monkey source files.
  - Extended the project with bytecode compilation and a stack VM for arithmetic, comparisons, and conditionals.
---

## Why Build a Language?

I am working through Thorsten Ball's *Writing an Interpreter in Go* and *Writing a Compiler in Go* to understand how source code becomes executable behavior. This is a book-based learning project, with attribution to the original work in the repository.

## The Interpreter

The lexer produces tokens, and a Pratt parser turns them into an abstract syntax tree while accounting for operator precedence. An evaluator walks that tree using environments to resolve bindings and function scope.

The interpreter handles functions, strings, arrays, hashes, and built-ins. Macro expansion transforms the AST before evaluation. A REPL supports interactive exploration, and the command also accepts `.mky` files.

## Moving Toward Bytecode

The compiler emits instructions and stores constants separately. A stack-based virtual machine executes the resulting bytecode. The current compiler and VM cover integer arithmetic, booleans, comparisons, and conditionals, including patching jump targets after compiling branches.

The compiler is still in progress; it does not yet cover the full interpreter feature set.

## Try the Interpreter

```bash
go run ./cmd/monkey-interpreter
```

At the prompt:

```text
let twice = fn(x) { x * 2; };
twice(21);
```

The expression evaluates to `42`.

## Engineering Evidence

Tests cover tokenization, operator precedence, evaluation, macro expansion, instruction encoding, compiler output, and VM execution. They let me examine the same language behavior at different stages of the implementation.

- [Parser and precedence tests](https://github.com/marcusw0/monkey-interpreter/tree/main/parser)
- [Evaluator and macro tests](https://github.com/marcusw0/monkey-interpreter/tree/main/evaluator)
- [Compiler tests](https://github.com/marcusw0/monkey-interpreter/tree/main/compiler)
- [Virtual machine tests](https://github.com/marcusw0/monkey-interpreter/tree/main/vm)

The project gives me practice with data structures, recursive evaluation, binary instruction formats, and keeping each stage independently testable.
