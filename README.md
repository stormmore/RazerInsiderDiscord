# RazerInsider Discord

This project sends new Razer Insider posts from the Chroma Thread to the #razer-chroma Discord channel.  
It's based on webtask.io

As discord.js is based on Node 8 and webtask.io is based on Node 4 this Task only works on the new node8 cluster.
https://tomasz.janczuk.org/2017/09/auth0-webtasks-and-node-8.html

An example to schedule this task with the secret bot token every 5 minutes:
```
 wt cron create --schedule 5m index.js -p node8 --secret botToken=SECRETBOTTOKEN
 ```
