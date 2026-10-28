
# format

The format's primary job is to deserialize documents and their decorations as fast as
possible.
Its secondary job is to query documents as fast as possible.


RFC 8785's canonical JSON is currently used.

A custom binary format should be developed to:
- be trivially canonical
- take less space
- enable faster searching via a language model
- support partial loads

## JSON vs HTML

HTML diffs look better in Git, but it is non-canonical and Wordgard loads it
2x slower than JSON. For this reason JSON was selected.

## Custom

Ideally we'd use a compressed custom binary format sympathetic to search.

