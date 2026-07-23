const fs = require('fs');
async function run() {
    try {
        const res = await fetch('https://8.8.8.8/resolve?name=neuracart.5jvh0by.mongodb.net&type=TXT', { headers: { 'Host': 'dns.google' } });
        const json = await res.json();
        fs.writeFileSync('dns-out.json', JSON.stringify(json));
        
        const res2 = await fetch('https://8.8.8.8/resolve?name=_mongodb._tcp.neuracart.5jvh0by.mongodb.net&type=SRV', { headers: { 'Host': 'dns.google' } });
        const json2 = await res2.json();
        fs.writeFileSync('dns-srv.json', JSON.stringify(json2));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
run();
