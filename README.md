# tools

[![Actions Status](https://github.com/xx7y7xx/tools/workflows/Build%20&%20deploy/badge.svg)](https://github.com/xx7y7xx/tools/actions)
![Sentry](https://img.shields.io/badge/Sentry-2ea44f?logo=sentry&link=https%3A%2F%2Fxx7y7xx.sentry.io%2F)
![]()

## Local development

```
npm i
npm start # start web
npm run dev # start server
```

- http://localhost:3000/tools?tool=setting&folderId=<gdrive_dir_id>&date=20241121 - Load data from google drive, save to indexedDB
- http://localhost:3000/tools?tool=trainSearch - Load data from indexedDB, search by train number
- http://localhost:3000/tools?tool=pocsagSignalViewer

## Production

https://xx7y7xx.github.io/tools/?tool=trainSearch
