/**
 * Socket.IO server for token-only authentication.
 * Same behavior as Frappe realtime (doctype/doc subscribe, Redis events)
 * but accepts only Authorization: Bearer <token> (no cookie/sid).
 */
require("./realtime_token");
