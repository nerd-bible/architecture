# philosophy

Users should be fully in control of rich text documents:
- from a website
	- in >99% of active browsers
- offline
- easily referenceable
- quickly searchable
- shareable

## implementation

> - from a website
> 	- in >99% of active browsers

Use a reactive web framework and target the earliest possible date.

> - offline

Use a service worker that caches assets.

> - easily referenceable

Support indexing documents by headers/verses.

> - quickly searchable

Support various indexing schemes. Support partial loading for snippets.

> - shareable

Store user content in Git and make it as transparent as possible.

To share the app and content, code is BSD0 and content is CC0 or CC-BY.
