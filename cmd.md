# Migration Management

# Generation
npx typeorm-ts-node-commonjs migration:generate src/database/migrations/1774189062827-InitSchema -d src/database/data-source.migration.ts

# RUN
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.migration.ts

# REVERT
npx typeorm-ts-node-commonjs migration:revert -d src/database/data-source.migration.ts

# SEEDING MANAGEMENT
yarn seed
