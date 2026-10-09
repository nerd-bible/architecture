# use a sql database

SQL databases [dolt](1) and [Turso](2) were attempted which promised
collaborative features. Unfortunately, they failed at them.

## sqlite

Doesn't support collaboration, so needs at the minimum a sync solution and
preferably a branching solution that isn't just "copy the whole database."

## dolt

Dolt is a SQLite fork with git features. It's built using Prolly trees.

It doesn't have a WASM build compatible with [wa-sqlite](3), but I was able to
fork it and get one working.

Most commits are small (<100 bytes), but each requires at least a 4KB write to
disk. This 40x write amplification is unacceptable.

It also has stability issues. Its sloppy vibe coded C is not human-readable
which leaves us at the mercy of the vendor.

## turso

Turso started as a SQLite rewrite in Rust. Then they rewrote everything except
the storage engine in a project called "Limbo," later renamed "Turso." These
are both open source.

Turso provides a server-authoratative sync solution and sells cloud services
based around that. Unfortunately its server implementation is closed-source.
It's currently hardcoded to a last-write-wins strategy (2026-10), which is
unacceptable.

It does have a partial server implementation that is open-source, but the plain
SQLite fork is unstable and the final nail in the coffin is that it was
recently acquired by a Postgres SaaS company which wants to focus Turso on
Agentic databases. Thankfully, our users aren't agents.

# conclusion

SQL databases

[1]: https://github.com/dolthub/doltlite
[2]: https://github.com/tursodatabase/turso
[3]: https://github.com/rhashimoto/wa-sqlite/
