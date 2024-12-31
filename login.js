const fs = require('fs');
const fetch = require('node-fetch');
const randomUserAgent = require('random-user-agent'); // 用于生成随机的 User-Agent

const logger = (message, level = 'info', value = '') => {
    const now = new Date().toISOString();
    const colors = {
        'info': '\x1b[32m', // green
        'warn': '\x1b[33m', // yellow
        'error': '\x1b[31m', // red
        'success': '\x1b[34m', // blue
    };
    const color = colors[level] || '\x1b[37m'; // default to white
    console.log(`${color}[${now}] [${level.toUpperCase()}]: ${message}\x1b[0m ${value}`);
};

// 生成随机的 Accept-Language
const getRandomAcceptLanguage = () => {
    const languages = [
        'en-US,en;q=0.9',  // English (US)
        'fr-FR,fr;q=0.9',  // French
        'es-ES,es;q=0.9',  // Spanish
        'de-DE,de;q=0.9',  // German
        'it-IT,it;q=0.9',  // Italian
        'ja-JP,ja;q=0.9',  // Japanese
        'zh-CN,zh;q=0.9',  // Chinese
        'ko-KR,ko;q=0.9',  // Korean
        'pt-PT,pt;q=0.9',  // Portuguese
        'ru-RU,ru;q=0.9',  // Russian
    ];
    return languages[Math.floor(Math.random() * languages.length)];
};

const getAccounts = () => {
    if (!fs.existsSync('email.txt')) {
        logger('Account file email.txt not found!', 'error');
        return [];
    }

    const accounts = fs.readFileSync('email.txt', 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.includes(':'))
        .map(line => {
            const [email, password] = line.split(':');
            return { email: email.trim(), password: password.trim() };
        });

    return accounts;
};

const getProxies = () => {
    if (!fs.existsSync('proxy.txt')) {
        logger('Proxy file proxy.txt not found!', 'error');
        return [];
    }

    const proxies = fs.readFileSync('proxy.txt', 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.includes(':'))
        .map(line => {
            const [ip, port, username, password] = line.split(':');
            return { ip: ip.trim(), port: port.trim(), username: username.trim(), password: password.trim() };
        });

    return proxies;
};

const loginUser = async (email, password) => {
    const maxRetries = 5;
    let attempt = 0;

    const accounts = getAccounts();
    const proxies = getProxies();

    if (accounts.length === 0 || proxies.length === 0) {
        logger('No accounts or proxies available, aborting...', 'error');
        return;
    }

    for (const { email, password } of accounts) {
        let proxy = proxies[attempt % proxies.length]; // Rotate proxies
        let userAgent = randomUserAgent();
        let acceptLanguage = getRandomAcceptLanguage(); // Generate a random Accept-Language

        while (attempt < maxRetries) {
            try {
                const loginPayload = { username: email, password };
                const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
                const loginResponse = await fetch('https://api.openloop.so/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': userAgent,
                        'Accept-Language': acceptLanguage,
                    },
                    body: JSON.stringify(loginPayload),
                    proxy: proxyUrl, // Use proxy
                });

                if (!loginResponse.ok) {
                    throw new Error(`Login failed! Status: ${loginResponse.status}`);
                }

                const loginData = await loginResponse.json();
                const accessToken = loginData.data.accessToken;

                logger('Login successful, got Token:', 'success', accessToken);

                // Save to token.txt in the format: token:proxy:user-agent:accept-language
                const tokenInfo = `${accessToken}:${proxy.ip}:${proxy.username}:${proxy.port}:${userAgent}:${acceptLanguage}\n`;
                fs.appendFileSync('token.txt', tokenInfo, 'utf8');
                logger('Access token and proxy information saved to token.txt');

                return; // Exit once successfully logged in
            } catch (error) {
                attempt++;
                logger(`Login attempt ${attempt} failed for email: ${email}. Error: ${error.message}`, 'error');

                if (attempt >= maxRetries) {
                    logger('Max retries reached for login. Aborting...', 'error');
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay before retry
            }
        }
    }
};

const main = async () => {
    const accounts = getAccounts();
    for (const account of accounts) {
        await loginUser(account.email, account.password);
    }
};

main();
