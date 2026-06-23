# Tracking Image Loading

## Module Purpose

Owns the backend capability for creating tracking image URLs, recording tracking image load events, and summarizing whether loading has been detected for a tracked email.

## Owned Responsibilities

- Create a tracking token and tracking image URL for a Gmail compose draft.
- Store tracking token metadata using a hashed token.
- Record tracking image loaded events without storing raw IP addresses or raw user agents.
- Return an open-detected summary based only on tracking image load counts.
- Serve HTTP routes for the tracking-token, tracking-image, and event-summary API contract.

## Responsibilities Not Owned

- Chrome extension UI, Gmail DOM parsing, and tracking image insertion are owned by `extension/`.
- Firebase application initialization and environment reading are owned by backend startup/configuration.
- Dashboard behavior is not currently in scope.

## Public Operations

- `create_tracking_token`
  - Request contract: `TrackingTokenCreationRequest`
  - Result contract: `TrackingTokenCreationResponse`
  - Side effects: stores token metadata in the configured repository.
  - Security: returns the raw tracking token only at creation time; stores only token hashes.
- `record_tracking_image_loaded`
  - Request contract: `TrackingImageLoadRecordingRequest`
  - Result: `None` or `TrackingTokenNotFoundError`
  - Side effects: stores a tracking image load event and increments the load count.
  - Security: hashes user agent and network address signals before persistence.
- `summarize_tracking_events`
  - Request contract: `TrackingEventSummaryRequest`
  - Result contract: `TrackingEventSummaryResponse`
  - Side effects: reads the stored load count.

## Internal Responsibility Map

- `public_interface.py`: public construction and operation surface for callers.
- `contracts.py`: API and workflow request/result contracts plus typed business errors.
- `application_workflows/`: use case coordination.
- `persistence/`: repository interface and Firestore implementation.
- `security/`: tracking token and signal hashing.
- `token_generation/`: random tracking token generation.
- `transport/`: FastAPI route adapters and transparent GIF response creation.
- `tests/`: public behavior tests.

## Dependencies

- Firestore stores token metadata and tracking image load events.
- FastAPI adapts HTTP requests and responses.
- The configured tracking base URL builds tracking image URLs.
- The clock is used when creating token and event records.

## Allowed Callers

- Backend application startup may construct the module router.
- Tests may call public operations directly.
- Other modules should use `public_interface.py` rather than internal files.

## Invariants

- Do not store raw tracking tokens as document identifiers.
- Do not store raw IP addresses or raw user agents.
- Do not claim that an email was read; use open-detected or tracking-image-loaded language.
- Keep Gmail and extension-specific parsing outside this backend module.

## Tests

- `tests/test_tracking_image_loading_public_interface.py`
