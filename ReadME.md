# OpenLoop Decentralized bandwidth

## OpenLoop Network is a decentralized wireless network built to enhance Internet service delivery, making it more efficient, accessible, and rewarding for everyone. 🤩

- Website [https://openloop.so/](https://openloop.so/)
- Twitter [@openloop_so](https://x.com/openloop_so)
- Telegram [@openloop_updates](https://t.me/openloop_updates)
- discord [https://discord.com/invite/75qBRaUczN](https://discord.com/invite/75qBRaUczN)

## **Features**

- **Register Accounts**
- **Load Existing Tokens**: Load pre-existing tokens if you already have account.
- **Auto Ping**
- **Auto Reff**
- **Support Multy Accounts**
- **Support Proxy**

## **Requirements**

- **Node.js**: Ensure you have Node.js installed.
- **npm**: Ensure you have npm installed.

## **make sure you have same number account and proxy**

if you already have account you can put `access-token` to `token.txt`,

put your proxy in file `proxy.txt` format `http://username:pass@ip:port`

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/Zlkcyber/openloop.git
   cd openloop
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup to create accounts and get Tokens:
   ```bash
   npm run setup
   ```
4. Run The Script:
   ```bash
   npm run start
   ```
5. Auto reff using temp mail
   ```bash
   npm run autoreff
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).

## docker 版

1.  proxy.txt 按照如下格式填写代理 ip,数量需要与 token.txt 数量保持一致

```bash
http://用户名:密码@ip:端口
```

2.  token.txt 按照如下格式填写 token,数量需要与 proxy.txt 保持一致

```bash
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiPlbWlseS5qb2huc29uMTk5NjA0MTJAZ21haWwuY29tIiwiZXhwIjoxNzUwMDU0MzYyLCJqdGkiOiI4NzFlMDUwZC02YWY5LTRlYWMtOTE5ZC02MzA0ZTNkNDY4ZWMiLCJpYXQiOjE3MzQ1MDIzNjIsImlzcyI6Im9wZW5sb29wIiwic3ViIjoiYXV0aCIsInVzZXJfaWQiOjg5NjQ4OCwidXNlcm5hbWUiOiJlbWlseS5qb2huc29uMTk5NjA0MTJAZ21haWwuY29tIn0.PlYh25XKSQfokj7zsAvwpIXpXdjhs-sHTWjHHjlRYjg
```

3. 将填写好的 token.txt 和 proxy.txt 放入根目录的 data 目录下面去

   ```bash
   http://用户名:密码@ip:端口
   ```

4. 运行 docker-compose up 启动运行
