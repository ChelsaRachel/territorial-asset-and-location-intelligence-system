# TALIS Audit Stub

SPRINT-08 exports write PoC audit entries to `console.log("[talis.audit]", ...)` and to the browser localStorage ring buffer `talis.audit_log.v1`.

SPRINT-07 alert lifecycle transitions currently use direct `console.log` calls. An optional retrofit for TASK-007 or TASK-013 is to replace those lifecycle logs with `audit.log(action, payload)` while preserving the existing transition behavior and labels.
