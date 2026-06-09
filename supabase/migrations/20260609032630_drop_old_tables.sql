/*
# Drop old tables to rebuild schema for AdvutAI

Drops the old conversations and messages tables from the simple chat prototype
so the full AdvutAI schema can be created with the correct columns.
*/

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
