---
title: monkey-interpreter
description: A Go implementation of Monkey exploring lexing, parsing, evaluation, and a growing bytecode compiler and virtual machine.
date: 2026-09-18
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
  - Added bytecode compilation and a stack VM for arithmetic, conditionals, collections, and basic function calls.
---

## Why Build a Language?

I am working through Thorsten Ball's *Writing an Interpreter in Go* and *Writing a Compiler in Go* to understand how a programming language works. I started with the interpreter and am now building the compiler and virtual machine. The repository credits the books and their original source code.

## The Interpreter

The lexer produces tokens, and a Pratt parser turns them into an abstract syntax tree while accounting for operator precedence. An evaluator walks that tree using environments to resolve bindings and function scope.

The interpreter handles functions, strings, arrays, hashes, and built-ins. Macro expansion transforms the AST before evaluation. Running a `.mky` file uses this evaluator; the interactive REPL now uses the compiler and VM.

## Moving Toward Bytecode

The compiler emits instructions and stores constants separately. A stack-based virtual machine executes the resulting bytecode. It now handles integer arithmetic, booleans, comparisons, conditionals, global bindings, strings, arrays, hashes, indexing, and basic function calls without arguments.

The compiler is still in progress. Function arguments, local bindings, and closures are among the pieces I still need to finish before it covers the interpreter’s feature set.

## Try the REPL

```bash
go run ./cmd/monkey-interpreter
```

At the prompt:

```text
let answer = 21 * 2;
answer;
```

The expression evaluates to `42`.

## Tests and Source

Tests cover tokenization, operator precedence, evaluation, macro expansion, instruction encoding, compiler output, and VM execution. They let me examine the same language behavior at different stages of the implementation.

- [Parser and precedence tests](https://github.com/marcusw0/monkey-interpreter/tree/main/parser)
- [Evaluator and macro tests](https://github.com/marcusw0/monkey-interpreter/tree/main/evaluator)
- [Compiler tests](https://github.com/marcusw0/monkey-interpreter/tree/main/compiler)
- [Virtual machine tests](https://github.com/marcusw0/monkey-interpreter/tree/main/vm)

I like being able to follow an expression from its tokens through the parser and then see how the evaluator and VM arrive at the same result. Building both has given me more practice with data structures, recursion, and bytecode.
