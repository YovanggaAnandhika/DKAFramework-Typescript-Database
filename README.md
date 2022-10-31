<h1 style="text-align:center">DKA DATABASE MODULE</h1>
<p style="text-align:center">this is a part module componen from or to DKAFramework</p>
<br>

## Status

![GitHub last commit](https://img.shields.io/github/last-commit/YovanggaAnandhika/DKAFramework-Typescript-Database)
![GitHub contributors](https://img.shields.io/github/contributors/YovanggaAnandhika/DKAFramework-Typescript-Database)
![GitHub pull requests](https://img.shields.io/github/issues-pr/YovanggaAnandhika/DKAFramework-Typescript-Database)
![GitHub issues](https://img.shields.io/github/issues/YovanggaAnandhika/DKAFramework-Typescript-Database)
![GitHub repo size](https://img.shields.io/github/repo-size/YovanggaAnandhika/DKAFramework-Typescript-Database)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
---

## Installing DKA MariaDB Module

Simple Installation

with npm
``` npm install @dkaframework/database@<version>```<br/>
with yarn install
``` yarn add -D @dkaframework/database@<version> ```


Read More About [Installation Guide](https://github.com/YovanggaAnandhika/MariaDB/blob/master/INSTALL.md) On the Website
Us For More Information.

## Use DKA Framework

Simple Used Module

with ESCMA SCRIPT
```typescript

   import Database, { MariaDB, Sqlite } from "@dkaframework/database";
   
   (async () => {
        /** ... another code ... **/
            // let instance = await new Database.MariaDB(MariaDBConfig);
            // let instance = await new Database.Sqlite(SqliteDBConfig);
        let instance = await new Database.MariaDB(MariaDBConfig | SqliteConfig);
        await instance.Read(tableName, Rules)
            .then(async (result) => {
                console.log(result);
            })
            .catch(async (error) => {
                console.log(error);
            });
        /** .. another code ... **/
   })();
    
```

Read More About [How To Use](https://github.com/YovanggaAnandhika/MariaDB/blob/master/USAGE.md) For How To Details Use.

## Benefit

**Flexible:** System opens and closes the function of loading the required modules because the framework module is
unloading Install it.

**Fast:** Optimizes Servers with Low RAM, and the Fastest Combination of Frameworks, and Compression Technologies The
good one.

## Feature

* **Structured.** Easily Comprehensible and Neat Code and Callable Like a Modulation Pack.
* **No Interface Blocking.** Can Run Without Interfering With Other Functions.
* **Complete Documentation.** Complete and Included Documentation and Sample Code.
* **Free from Error.** There is an Error Detection so that Finding Errors Can be Easily Done.
* **Without Installing WebServer.** Using the main JS language that is suitable in terms of data efficiency.
* **More Other Features.** 🐈

**I'm a Night 🦉**

```text
🌞 Morning    147 commits    ██░░░░░░░░░░░░░░░░░░░░░░░   9.16% 
🌆 Daytime    605 commits    █████████░░░░░░░░░░░░░░░░   37.72% 
🌃 Evening    533 commits    ████████░░░░░░░░░░░░░░░░░   33.23% 
🌙 Night      319 commits    █████████████░░░░░░░░░░░░   19.89%

```

📅 **I'm Most Productive on Monday**

```text
Monday       352 commits    █████░░░░░░░░░░░░░░░░░░░░   21.95% 
Tuesday      259 commits    ████░░░░░░░░░░░░░░░░░░░░░   16.15% 
Wednesday    275 commits    ████░░░░░░░░░░░░░░░░░░░░░   17.14% 
Thursday     167 commits    ██░░░░░░░░░░░░░░░░░░░░░░░   10.41% 
Friday       207 commits    ███░░░░░░░░░░░░░░░░░░░░░░   12.91% 
Saturday     193 commits    ███░░░░░░░░░░░░░░░░░░░░░░   12.03% 
Sunday       151 commits    ██░░░░░░░░░░░░░░░░░░░░░░░   9.41%

```

📊 **This Week I Spent My Time On**

```text
⌚︎ Time Zone: Asia/Makassar

💬 Programming Languages: 
YAML                     1 hr 54 mins        ████████████░░░░░░░░░░░░░   47.6% 
Python                   1 hr 23 mins        ████████░░░░░░░░░░░░░░░░░   34.73% 
C++                      24 mins             ██████████████░░░░░░░░░░░   50.29% 
CMake                    10 mins             █░░░░░░░░░░░░░░░░░░░░░░░░   4.27% 
XML                      4 mins              ░░░░░░░░░░░░░░░░░░░░░░░░░   1.72%

```

<p style="text-align:center">
<a href="https://www.buymeacoffee.com/celiduba" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-red.png" alt="Buy Me A Coffee" height="40" width="170" ></a>
</p>

## About Copyright

Read About : </b>[LICENCE](https://github.com/YovanggaAnandhika/MariaDB/blob/master/LICENSE.md)

## Team

| [@yovangga](https://github.com/yovanggaanandhika)                                                                       | [@DKAResearchCenter](https://github.com/DKAResearchCenter)                                                    |
|-------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| <img align="center" src="https://avatars.githubusercontent.com/yovanggaanandhika?s=100&v=1" width="100" height="100" /> | <img align="center" src="https://avatars.githubusercontent.com/DKAResearchCenter?s" width="100" height="100"> |
| Full Stack Development                                                                                                  | DKA Research Center                                                                                           |

## Kredit

Thanks To [DKA Research Center](https://github.com/YovanggaAnandhika) To Donate a Package Name!
