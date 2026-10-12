# storage

The primary goal of storage is to load documents quickly in/out of persistent
browser storage (currently OPFS or IndexedDB).

Storage should be sympathetic to Wordgard deserialization. Wordgard can only
deserialize HTML or JSON and it stores a tree structure. It's the storage
layer's job to provide Wordgard with that as fast as possible.

## JSON vs HTML
