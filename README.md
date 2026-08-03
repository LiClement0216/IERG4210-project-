# Backend setup and run steps

Configure the secret keys for backend and paypal.
Use the following commands from the project root.

## Commands

```bash
cd backend
npm install
node src/init-db.js
npm start
```

## Notes

- `cd backend/src` is not needed if `init-db.js` is inside `backend/src` and you run it as `node src/init-db.js` from `backend`.
- `cd ../` is also not needed in that case, because all commands can be run from the `backend` directory.
- If your project instead expects `npm install` from the repository root, keep that step at the root and only run the database initialization inside `backend`.

## Alternative form

If you specifically want to run the script from `src`, use:

```bash
cd backend
npm install
cd src
node init-db.js
cd ..
npm start
```
