/**
 * Simple health check script to verify the site is up after deployment.
 */
async function checkHealth() {
    const url = process.env.APP_URL || 'http://localhost:3000';
    console.log(`🚀 Starting health check for: ${url}`);

    try {
        const response = await fetch(url);
        if (response.ok) {
            console.log('✅ Health check passed! Site is responding with 200 OK.');
            process.exit(0);
        } else {
            console.error(`❌ Health check failed. Site returned status: ${response.status}`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Health check failed. Could not reach the site:', error.message);
        process.exit(1);
    }
}

checkHealth();
