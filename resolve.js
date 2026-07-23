async function run() {
    try {
        const res = await fetch('https://dns.google/resolve?name=_mongodb._tcp.neuracart.5jvh0by.mongodb.net&type=SRV');
        const json = await res.json();
        console.log("SRV Data:", JSON.stringify(json));
    } catch (e) {
        console.error(e);
    }
}
run();
