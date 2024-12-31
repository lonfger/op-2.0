import chalk from 'chalk';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import { banner } from './utils/banner.js';
import { logger } from './utils/logger.js';

const getRandomQuality = () => {
    return Math.floor(Math.random() * (99 - 60 + 1)) + 60;
};

const getTokens = () => {
    return fs.readFileSync('token.txt', 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
};

async function sleep(duration) {
 return new Promise((resolve) => setTimeout(resolve, duration * 1000)); 
}

const shareBandwidth = async (token, proxy, useragent, language) => {
    const quality = getRandomQuality(); 
    const proxyAgent = new HttpsProxyAgent(proxy);
    const maxRetries = 5; 
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await fetch('https://api.openloop.so/bandwidth/share', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "User-Agent": useragent, 
                    "Accept-language": language
                },
                body: JSON.stringify({ quality }),
                // agent: proxyAgent,
            });

            if (!response.ok) {
                throw new Error(`Failed to share bandwidth! Status: ${response.statusText}`);
            }

            const data = await response.json();

            const logBandwidthShareResponse = (response) => {
                if (response && response.data && response.data.balances) {
                    const balance = response.data.balances.POINT;
                    logger(
                        `Bandwidth shared Message: ${chalk.yellow(response.message)} | Score: ${chalk.yellow(quality)} | Total Earnings: ${chalk.yellow(balance)}`
                    );
                }
            };

            logBandwidthShareResponse(data);
            return; 
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
                logger(`Max retries reached. Skipping.`, 'error');
            } else {
              await sleep(10)
            }
        }
    }
};

const shareBandwidthForAllTokens = async () => {
    const tokens = getTokens();

    for (let i = 0; i < tokens.length; i++) {
        const [token, proxy, useragent, language] = tokens[i].split('__');
        try {
            const response = await checkMissions(token, proxy, useragent, language);
            await sleep(15)
            if (response && Array.isArray(response.missions)) {
                const availableMissionIds = response.missions
                    .filter(mission => mission.status === 'available')
                    .map(mission => mission.missionId);

                logger('Available Missions:', 'info', availableMissionIds.length);
                for (const missionId of availableMissionIds) {
                    logger(`Do and complete mission Id: ${missionId}`, 'info');
                    const completeMission = await doMissions(missionId, token, proxy, useragent, language)
                    await sleep(25)

                    logger(`Mission Id: ${missionId} Complete: ${completeMission.message}`)
                }
            }
        } catch (error) {
            logger('Error checking missions:', 'error', error);
        };

        try {
            await sleep(18)
            await shareBandwidth(token, proxy, useragent, language);
        } catch (error) {
            logger(`Error processing token: ${token}, Error: ${error.message}`, 'error');
        }
    }
};
const checkMissions = async (token, proxy, useragent, language) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);

        const response = await fetch('https://api.openloop.so/missions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                "User-Agent": useragent, 
                "Accept-language": language
            },
            agent: proxyAgent,  
        });

        if (!response.ok) {
            throw new Error(`Failed to Fetch Missions! Status: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        logger('Error Fetch Missions!', 'error', error.message);
    }
};
const doMissions = async (missionId, token, proxy, useragent, language) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);

        const response = await fetch(`https://api.openloop.so/missions/${missionId}/complete`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                "User-Agent": useragent, 
                "Accept-language": language
            },
            agent: proxyAgent,  
        });

        if (!response.ok) {
            throw new Error(`Failed to Complete Missions! Status: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        logger('Error Complete Missions!', 'error', error.message);
    }
};
const main = () => {
    logger(banner, 'debug');
    logger('Starting bandwidth sharing each minute...');
    shareBandwidthForAllTokens(); 
    setInterval(shareBandwidthForAllTokens, 60 * 1000); 
};

main();
