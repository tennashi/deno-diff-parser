# diff-parser
Parse unified diff format

## Usage

```ts
import { parse } from "https://deno.land/x/diff_parser/mod.ts";

const process = Deno.run({
  cmd: ["git", "diff", "--no-color"]
  stdout: "piped",
});

const output = await process.output();
const diffText = new TextDecoder().decode(output);
process.close();

parse(diffText);
```
