# search

Search should be:
1. correct
2. flexible
3. fast

## lexical
Q: jordan river
	- A: jordan NEAR 1 river, jordan, river
Q: jordan riv*
	- A: jordan NEAR 1 riv*, jordan, riv*
Q: jordan -river
	- A: jordan NOT ENCLOSES river
Q: speaking
	- A: speaking, speak, spoke, spoken, (archaic) spake, speakest, speaketh, spokest
Q: quickly went
	-A: quickly NEAR 1 went, quick NEAR 2 went

## typos
Q: speking, speakign
	- A: speaking

## phonetic
Q: youfraytees
	- A: Euphrates

## semantic
Q: kids go
	- A: Let the little **children** **come** to me
Q: blew up
	- A: exploded, destroy, maim, kill, inflate, exeaggerate, enlarge, become popular, lose temper, get angry, got fat

## language
- https://planetscale.com/blog/anatomy-of-a-postgres-search-engine#postings-lists

## zig
- faster to run
- enables server search
- need html parser OR to use JSON
	- browser serialization/deserialization woes
- need wordgard parser (ugh...) to map positions
	- https://github.com/github/rust-gems/tree/main/crates/string-offsets/src
	- https://git.sr.ht/~alva/zig-varint/tree/trunk/item/src/varint.zig
	- https://git.sr.ht/~alva/zig-bare/tree/trunk/item/src/bare.zig

