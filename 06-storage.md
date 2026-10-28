# storage

It's the storage layer's job to be a filesystem for Git.

There are only two persistent options in the browser for >5MB of data: OPFS and
IndexedDB.

OPFS is used because it has a synchronous API that may be used from WASM. Its
API also maps better to filesystem operations than an IndexedDB shim. Finally,
it's usually faster.

I considered a bunch of SQL databases which promised collaborative features.
Unfortunately, they all failed:

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

[1]: https://github.com/dolthub/doltlite
[2]: https://github.com/tursodatabase/turso
[3]: https://github.com/rhashimoto/wa-sqlite/

## custom

I considered building a novel custom database. I started reading and quickly
learned that's a bad idea:
- https://cstack.github.io/db_tutorial/parts/part7.html
- https://github.com/cstack/db_tutorial/blob/master/db.c
- https://blobs.duckdb.org/slides/DiDi.pdf
- https://arpitbhayani.me/blogs/join-algorithms
