const mongoose = require('mongoose');
require('dotenv').config()

const clientPromise = (async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (uri.startsWith('mongodb+srv://')) {
            console.log("Resolving MongoDB SRV via Google DoH...");
            const urlObj = new URL(uri);
            const srvDomain = `_mongodb._tcp.${urlObj.hostname}`;
            
            const https = require('https');
            const fetchDoH = (url, hostHeader) => new Promise((resolve, reject) => {
                const req = https.get(url, {
                    headers: hostHeader ? { 'Host': hostHeader, 'accept': 'application/dns-json' } : { 'accept': 'application/dns-json' },
                    rejectUnauthorized: false // In case direct IP SSL cert verification fails
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                });
                req.on('error', reject);
            });

            let dnsJson = null;
            try {
                dnsJson = await fetchDoH(`https://1.1.1.1/dns-query?name=${srvDomain}&type=SRV`, null);
            } catch (err1) {
                console.log("Cloudflare DoH failed, trying Google DoH via IP...");
                dnsJson = await fetchDoH(`https://8.8.8.8/resolve?name=${srvDomain}&type=SRV`, 'dns.google');
            }
            
            if (dnsJson && dnsJson.Answer && dnsJson.Answer.length > 0) {
                const hosts = dnsJson.Answer.map(ans => {
                    const parts = ans.data.split(' ');
                    let target = parts[parts.length - 1];
                    if (target.endsWith('.')) target = target.slice(0, -1);
                    return `${target}:${parts[2]}`;
                });
                const credentials = urlObj.password ? `${urlObj.username}:${urlObj.password}@` : '';
                const path = urlObj.pathname || '/test';
                uri = `mongodb://${credentials}${hosts.join(',')}${path}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
            }
        }

        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection.getClient();
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
})();

module.exports = clientPromise;
