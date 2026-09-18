import ballerina/os;

// macro-db (postgres-cnpg) wiring — env var names come verbatim from
// design.json's dependencies[].wiring.envBindings. Never renamed, never
// defaulted.
configurable string macroDbHost = os:getEnv("MACRO_DB_HOST");
configurable string macroDbPort = os:getEnv("MACRO_DB_PORT");
configurable string macroDbName = os:getEnv("MACRO_DB_DBNAME");
configurable string macroDbUser = os:getEnv("MACRO_DB_USER");
configurable string macroDbPassword = os:getEnv("MACRO_DB_PASSWORD");
