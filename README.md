# c2spwn
Converts C/C++ files to SPWN at compile-time and runtime (only simple programs)

Note that this uses a sevice called "WASM Explorer` to gain cleaner results + so the end user does not have to install anything.

# What do I do with the output?
Use [SPWASM](https://github.com/RealSput/SPWASM) to run the C code.

Example:
```ts
import "runtime_spwasm_input.spwn"

let vm = @stack_vm::create();

vm.run(/* result from c2spwn here.. */)
```
